import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { createHash, randomUUID, randomBytes } from "node:crypto";
import { seedCategories, seedProducts, DEMO_MISSING } from "./seed";
import { bestsellersFrom, computeDashboard, matchesFilter } from "./shared";
import { effectivePrice } from "@/lib/format";
import { shippingFor } from "@/lib/config";
import { OrderError, type Category, type Order, type Product } from "@/lib/types";
import type { Store } from "./store";

// DEMO MODE: a JSON file stands in for the database so the whole shop works without Supabase.
// It is NOT a production database: single process, no backups. On Vercel the filesystem is read-only
// except /tmp, so data there is per-instance and resets on cold starts — fine for a presentation.
const DIR = process.env.VERCEL ? "/tmp/oatbomb" : path.join(process.cwd(), ".data");
const FILE = path.join(DIR, "demo-db.json");
export const UPLOAD_DIR = path.join(DIR, "uploads");

type DB = { categories: Category[]; products: Product[]; orders: Order[] };

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
  return { categories, products, orders: [] };
}

// Next bundles each route separately; keeping state on globalThis gives every bundle in the
// process the same in-memory DB and write queue (otherwise admin edits could miss the storefront).
const g = globalThis as typeof globalThis & { __oatbomb?: { db: DB | null; loading: Promise<DB> | null; queue: Promise<unknown> } };
const state = (g.__oatbomb ??= { db: null, loading: null, queue: Promise.resolve() });

async function load(): Promise<DB> {
  if (state.db) return state.db;
  state.loading ??= (async () => {
    try {
      state.db = JSON.parse(await fs.readFile(FILE, "utf8")) as DB;
    } catch {
      state.db = seed();
      await persist();
    }
    return state.db;
  })();
  return state.loading;
}
async function persist() {
  await fs.mkdir(DIR, { recursive: true });
  const tmp = `${FILE}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(state.db, null, 2));
  await fs.rename(tmp, FILE); // atomic replace: a crash mid-write can't corrupt the DB
}

// Serialize writes so concurrent orders can't oversell (single-process demo only).
function write<T>(fn: (db: DB) => T | Promise<T>): Promise<T> {
  const run = state.queue.then(async () => {
    const db = await load();
    const res = await fn(db);
    await persist();
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
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const name = `${randomUUID()}.${ext}`;
    await fs.writeFile(path.join(UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));
    return `/api/uploads/${name}`;
  },

  async dashboard() {
    const db = await load();
    return computeDashboard(clone(db.orders));
  },
};
