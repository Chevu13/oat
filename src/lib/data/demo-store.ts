import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { createHash, randomUUID, randomBytes } from "node:crypto";
import { seedCategories, seedProducts, DEMO_MISSING } from "./seed";
import { bestsellersFrom, computeDashboard, matchesFilter } from "./shared";
import { effectivePrice } from "@/lib/format";
import { shippingFor } from "@/lib/config";
import { OrderError, type Category, type Inquiry, type Order, type Product } from "@/lib/types";
import type { Store } from "./store";
import { redis, redisEnabled } from "./redis";

// DEMO STORAGE — no database. Two backends behind the same load/persist pair:
//  • Upstash Redis (when configured, e.g. on Vercel): shared by every serverless function/instance.
//    Catalog lives in one key; each order is its own hash field, so concurrent orders never overwrite each other.
//  • Local JSON file (development): .data/demo-db.json.
const DIR = process.env.VERCEL ? "/tmp/oatbomb" : path.join(process.cwd(), ".data");
const FILE = path.join(DIR, "demo-db.json");
export const UPLOAD_DIR = path.join(DIR, "uploads");
const K_CATALOG = "oatbomb:catalog";
const K_ORDERS = "oatbomb:orders";
const K_INQUIRIES = "oatbomb:inquiries";
export const imageKey = (name: string) => `oatbomb:img:${name}`;

type DB = { categories: Category[]; products: Product[]; orders: Order[]; inquiries: Inquiry[] };

/** Same key → same UUID on every server/instance, so carts keep working across restarts and deploys. */
function stableId(key: string) {
  const h = createHash("sha1").update(`oatbomb:${key}`).digest();
  h[6] = (h[6] & 0x0f) | 0x50; // version 5
  h[8] = (h[8] & 0x3f) | 0x80; // RFC 4122 variant
  const x = h.subarray(0, 16).toString("hex");
  return `${x.slice(0, 8)}-${x.slice(8, 12)}-${x.slice(12, 16)}-${x.slice(16, 20)}-${x.slice(20)}`;
}

function seed(): DB {
  const categories = seedCategories.map((c) => ({ id: stableId(`cat:${c.slug}`), ...c }));
  const products = seedProducts.map((p, i) => {
    const id = stableId(`product:${p.slug}`);
    return {
      id,
      slug: p.slug,
      name: p.name,
      tagline: p.tagline,
      description: p.description,
      category_id: categories.find((c) => c.slug === p.category)!.id,
      images: p.images,
      accent: p.accent,
      ingredients: null,
      allergens: null,
      weight: null,
      missing_info: DEMO_MISSING,
      is_active: true,
      is_featured: Boolean(p.featured),
      sort: i,
      created_at: new Date(Date.now() - i * 60_000).toISOString(),
      variants: p.variants.map((v, j) => ({
        id: stableId(`variant:${p.slug}:${v.name}`),
        product_id: id,
        name: v.name,
        price: v.price,
        sale_price: v.sale_price ?? null,
        sort: j,
      })),
    };
  });
  return { categories, products, orders: [], inquiries: [] };
}

// File mode keeps one in-memory copy per process (on globalThis so every route bundle shares it).
const g = globalThis as typeof globalThis & { __oatbomb?: { db: DB | null; queue: Promise<unknown> } };
const state = (g.__oatbomb ??= { db: null, queue: Promise.resolve() });

async function load(): Promise<DB> {
  if (redisEnabled) {
    // Always fresh: other instances may have written since.
    const [catalog, orders, inquiries] = await Promise.all([
      redis<string | null>("GET", K_CATALOG),
      redis<string[]>("HVALS", K_ORDERS),
      redis<string[]>("HVALS", K_INQUIRIES),
    ]);
    if (!catalog) {
      const db = seed();
      await redis("SET", K_CATALOG, JSON.stringify({ categories: db.categories, products: db.products }), "NX");
      return load();
    }
    return {
      ...(JSON.parse(catalog) as Pick<DB, "categories" | "products">),
      orders: orders.map((o) => JSON.parse(o) as Order),
      inquiries: inquiries.map((i) => JSON.parse(i) as Inquiry),
    };
  }
  if (state.db) return state.db;
  try {
    state.db = JSON.parse(await fs.readFile(FILE, "utf8")) as DB;
    state.db.inquiries ??= []; // files created before the contact form existed
  } catch {
    state.db = seed();
    await persist(state.db);
  }
  return state.db;
}

async function persist(db: DB) {
  if (redisEnabled) {
    // ponytail: last-writer-wins on the catalog (fine for one admin); orders are per-field so new orders never collide.
    await redis("SET", K_CATALOG, JSON.stringify({ categories: db.categories, products: db.products }));
    if (db.orders.length) await redis("HSET", K_ORDERS, ...db.orders.flatMap((o) => [o.id, JSON.stringify(o)]));
    if (db.inquiries.length) await redis("HSET", K_INQUIRIES, ...db.inquiries.flatMap((i) => [i.id, JSON.stringify(i)]));
    return;
  }
  await fs.mkdir(DIR, { recursive: true });
  const tmp = `${FILE}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(db, null, 2));
  await fs.rename(tmp, FILE); // atomic replace: a crash mid-write can't corrupt the DB
}

// Serialize writes within a process.
function write<T>(fn: (db: DB) => T | Promise<T>): Promise<T> {
  const run = state.queue.then(async () => {
    const db = await load();
    const res = await fn(db);
    await persist(db);
    return res;
  });
  state.queue = run.catch(() => {});
  return run;
}

const clone = <T>(x: T): T => structuredClone(x);
const bySort = <T extends { sort: number }>(a: T, b: T) => a.sort - b.sort;

function orderNumber(db: DB) {
  const d = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Belgrade" }).replace(/-/g, "").slice(2);
  let n: string;
  do n = `OB-${d}-${randomBytes(3).toString("hex").slice(0, 5).toUpperCase()}`;
  while (db.orders.some((o) => o.number === n));
  return n;
}

export const demoStore: Store = {
  async listCategories() {
    return clone((await load()).categories).sort(bySort);
  },

  async listProducts(opts) {
    const db = await load();
    return clone(db.products.filter((p) => opts?.includeInactive || p.is_active))
      .map((p) => ({ ...p, variants: p.variants.sort(bySort) }))
      .sort(bySort);
  },

  async bestsellerIds(limit) {
    return bestsellersFrom((await load()).orders, limit);
  },

  placeOrder(input) {
    return write((db) => {
      // Merge duplicate lines, then price everything from the DB — never from the client.
      const qty = new Map<string, number>();
      for (const i of input.items) qty.set(i.variant_id, (qty.get(i.variant_id) ?? 0) + i.quantity);

      const lines = [...qty].map(([variantId, quantity]) => {
        const product = db.products.find((p) => p.is_active && p.variants.some((v) => v.id === variantId));
        const variant = product?.variants.find((v) => v.id === variantId);
        if (!product || !variant) throw new OrderError("Jedan od proizvoda iz korpe više nije dostupan.");
        return { product, variant, quantity };
      });

      const subtotal = lines.reduce((s, l) => s + effectivePrice(l.variant) * l.quantity, 0);
      const shipping = shippingFor(subtotal, input.delivery_method);

      const order: Order = {
        id: randomUUID(),
        number: orderNumber(db),
        status: "nova",
        customer_name: input.customer_name,
        email: input.email,
        phone: input.phone,
        street: input.street,
        city: input.city,
        postal_code: input.postal_code,
        note: input.note,
        delivery_method: input.delivery_method,
        subtotal,
        shipping,
        total: subtotal + shipping,
        created_at: new Date().toISOString(),
        items: lines.map((l) => ({
          id: randomUUID(),
          product_id: l.product.id,
          variant_id: l.variant.id,
          product_name: l.product.name,
          variant_name: l.variant.name,
          unit_price: effectivePrice(l.variant),
          quantity: l.quantity,
          line_total: effectivePrice(l.variant) * l.quantity,
        })),
      };
      db.orders.push(order);
      return { id: order.id, number: order.number };
    });
  },

  async getOrderPublic(id) {
    return this.getOrder(id);
  },

  async listOrders(filter) {
    const db = await load();
    return clone(db.orders.filter((o) => matchesFilter(o, filter))).sort((a, b) => b.created_at.localeCompare(a.created_at));
  },

  async getOrder(id) {
    const o = (await load()).orders.find((x) => x.id === id);
    return o ? clone(o) : null;
  },

  updateOrderStatus(id, status) {
    return write((db) => {
      const o = db.orders.find((x) => x.id === id);
      if (!o) throw new Error("Porudžbina nije pronađena.");
      o.status = status;
    });
  },

  async getProductById(id) {
    const p = (await load()).products.find((x) => x.id === id);
    return p ? clone(p) : null;
  },

  saveProduct(input) {
    return write((db) => {
      if (db.products.some((p) => p.slug === input.slug && p.id !== input.id))
        throw new Error("Proizvod sa ovim URL nazivom (slug) već postoji.");
      const existing = input.id ? db.products.find((p) => p.id === input.id) : undefined;
      if (input.id && !existing) throw new Error("Proizvod nije pronađen.");
      const id = existing?.id ?? randomUUID();
      const { variants, ...fields } = input;
      const product: Product = {
        ...fields,
        id,
        created_at: existing?.created_at ?? new Date().toISOString(),
        variants: variants.map((v, i) => ({ ...v, id: v.id ?? randomUUID(), product_id: id, sort: i })),
      };
      if (existing) db.products[db.products.indexOf(existing)] = product;
      else db.products.push(product);
      return clone(product);
    });
  },

  deleteProduct(id) {
    return write((db) => {
      db.products = db.products.filter((p) => p.id !== id);
    });
  },

  saveCategory(input) {
    return write((db) => {
      if (db.categories.some((c) => c.slug === input.slug && c.id !== input.id))
        throw new Error("Kategorija sa ovim URL nazivom već postoji.");
      const c = input.id && db.categories.find((x) => x.id === input.id);
      if (c) Object.assign(c, { slug: input.slug, name: input.name, description: input.description });
      else
        db.categories.push({
          id: randomUUID(),
          slug: input.slug,
          name: input.name,
          description: input.description,
          sort: Math.max(0, ...db.categories.map((x) => x.sort)) + 1,
        });
    });
  },

  deleteCategory(id) {
    return write((db) => {
      db.categories = db.categories.filter((c) => c.id !== id);
      for (const p of db.products) if (p.category_id === id) p.category_id = null;
    });
  },

  reorderCategories(ids) {
    return write((db) => {
      ids.forEach((id, i) => {
        const c = db.categories.find((x) => x.id === id);
        if (c) c.sort = i + 1;
      });
    });
  },

  async uploadImage(file) {
    const ext = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" }[file.type];
    if (!ext) throw new Error("Dozvoljeni formati: JPG, PNG, WEBP, AVIF.");
    if (redisEnabled) {
      // Shrink to a web-sized WebP so it fits comfortably in one Redis value (~100–300 KB).
      const { default: sharp } = await import("sharp");
      const webp = await sharp(Buffer.from(await file.arrayBuffer())).rotate().resize({ width: 1400, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
      const name = `${randomUUID()}.webp`;
      await redis("SET", imageKey(name), webp.toString("base64"));
      return `/api/uploads/${name}`;
    }
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const name = `${randomUUID()}.${ext}`;
    await fs.writeFile(path.join(UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));
    return `/api/uploads/${name}`;
  },

  async dashboard() {
    const db = await load();
    return computeDashboard(clone(db.orders), clone(db.inquiries));
  },

  saveInquiry(input) {
    return write((db) => {
      db.inquiries.push({ ...input, id: randomUUID(), created_at: new Date().toISOString(), done: false });
    });
  },

  async listInquiries() {
    return clone((await load()).inquiries).sort((a, b) => b.created_at.localeCompare(a.created_at));
  },

  setInquiryDone(id, done) {
    return write((db) => {
      const i = db.inquiries.find((x) => x.id === id);
      if (!i) throw new Error("Upit nije pronađen.");
      i.done = done;
    });
  },
};
