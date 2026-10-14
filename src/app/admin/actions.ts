"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { checkCredentials, createSession, destroySession, requireAdmin } from "@/lib/auth";
import { CATALOG } from "@/lib/catalog";
import { store } from "@/lib/data";
import { slugify } from "@/lib/format";
import { ORDER_STATUSES } from "@/lib/types";

export type ActionResult = { ok: true; message: string; id?: string } | { ok: false; error: string };
const fail = (error: string): ActionResult => ({ ok: false, error });
const errMsg = (e: unknown) => (e instanceof Error ? e.message : "Došlo je do greške.");

// ---------- auth ----------
export async function login(_: unknown, form: FormData): Promise<{ error?: string }> {
  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");
  // Flat delay blunts online guessing without extra infrastructure.
  await new Promise((r) => setTimeout(r, 400));
  if (!checkCredentials(email, password)) return { error: "Pogrešan e-mail ili lozinka." };
  await createSession();
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/prijava");
}

// ---------- orders ----------
export async function setOrderStatus(id: string, status: string): Promise<ActionResult> {
  await requireAdmin();
  const s = z.enum(ORDER_STATUSES).safeParse(status);
  if (!s.success || !z.uuid().safeParse(id).success) return fail("Neispravan status.");
  try {
    await store.updateOrderStatus(id, s.data);
    updateTag(CATALOG); // cancelled orders drop out of bestsellers
    return { ok: true, message: "Status porudžbine je ažuriran." };
  } catch (e) {
    return fail(errMsg(e));
  }
}

// ---------- products ----------
const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Boja mora biti u formatu #RRGGBB.");
const opt = z
  .string()
  .trim()
  .max(4000)
  .nullish()
  .transform((v) => v || null);
const imageUrl = z.string().refine((v) => /^\/(images|api\/uploads)\/[\w\-./]+$/.test(v) || /^https:\/\/[\w.-]+\/[\w\-./%]+$/.test(v), "Neispravna adresa slike.");

const productSchema = z
  .object({
    id: z.uuid().optional(),
    name: z.string().trim().min(1, "Unesite naziv.").max(120),
    slug: z.string().trim().max(120).optional(),
    tagline: opt,
    description: opt,
    category_id: z.uuid().nullish().or(z.literal("")).transform((v) => v || null),
    images: z.array(imageUrl).max(12),
    accent: hex,
    ingredients: opt,
    allergens: opt,
    weight: opt,
    missing_info: z.array(z.string().trim().min(1).max(60)).max(20),
    is_active: z.boolean(),
    is_featured: z.boolean(),
    sort: z.coerce.number().int().min(0).max(9999),
    variants: z
      .array(
        z.object({
          id: z.uuid().optional(),
          name: z.string().trim().min(1, "Svaka varijanta mora imati naziv.").max(80),
          price: z.coerce.number({ error: "Unesite cenu za svaku varijantu." }).int("Cena mora biti ceo broj.").min(0, "Cena ne može biti negativna.").max(1_000_000),
          sale_price: z.coerce.number().int().min(0).nullable(),
        }),
      )
      .min(1, "Proizvod mora imati bar jednu varijantu (cenu)."),
  })
  .superRefine((p, ctx) => {
    p.variants.forEach((v, i) => {
      if (v.sale_price != null && v.sale_price >= v.price)
        ctx.addIssue({ code: "custom", path: ["variants", i, "sale_price"], message: `Akcijska cena (${v.name}) mora biti manja od redovne.` });
    });
  });

export async function saveProduct(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Proverite unete podatke.");
  const d = parsed.data;
  const slug = slugify(d.slug || d.name);
  if (!slug) return fail("URL naziv (slug) nije ispravan.");
  try {
    const saved = await store.saveProduct({ ...d, slug });
    updateTag(CATALOG);
    return { ok: true, message: d.id ? "Izmene su sačuvane." : "Proizvod je kreiran.", id: saved.id };
  } catch (e) {
    return fail(errMsg(e));
  }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!z.uuid().safeParse(id).success) return fail("Neispravan proizvod.");
  await store.deleteProduct(id);
  updateTag(CATALOG);
  return { ok: true, message: "Proizvod je obrisan." };
}

export async function toggleProduct(id: string, field: "is_active" | "is_featured", value: boolean): Promise<ActionResult> {
  await requireAdmin();
  const p = await store.getProductById(id);
  if (!p) return fail("Proizvod nije pronađen.");
  await store.saveProduct({ ...p, [field]: value });
  updateTag(CATALOG);
  return { ok: true, message: field === "is_active" ? (value ? "Proizvod je uključen." : "Proizvod je isključen.") : value ? "Označen kao istaknut." : "Uklonjen iz istaknutih." };
}

const MAX_UPLOAD = 5 * 1024 * 1024;
export async function uploadImages(form: FormData): Promise<{ ok: true; urls: string[] } | { ok: false; error: string }> {
  await requireAdmin();
  const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (!files.length) return { ok: false, error: "Izaberite bar jednu sliku." };
  if (files.length > 8) return { ok: false, error: "Najviše 8 slika odjednom." };
  for (const f of files) if (f.size > MAX_UPLOAD) return { ok: false, error: `${f.name} je veća od 5 MB.` };
  try {
    return { ok: true, urls: await Promise.all(files.map((f) => store.uploadImage(f))) };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}

// ---------- categories ----------
const categorySchema = z.object({
  id: z.uuid().optional(),
  name: z.string().trim().min(1, "Unesite naziv kategorije.").max(80),
  description: opt,
});

export async function saveCategory(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Neispravni podaci.");
  try {
    await store.saveCategory({ ...parsed.data, slug: slugify(parsed.data.name) });
    updateTag(CATALOG);
    return { ok: true, message: parsed.data.id ? "Kategorija je izmenjena." : "Kategorija je dodata." };
  } catch (e) {
    return fail(errMsg(e));
  }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!z.uuid().safeParse(id).success) return fail("Neispravna kategorija.");
  await store.deleteCategory(id);
  updateTag(CATALOG);
  return { ok: true, message: "Kategorija je obrisana." };
}

export async function reorderCategories(ids: string[]): Promise<ActionResult> {
  await requireAdmin();
  if (!z.array(z.uuid()).max(200).safeParse(ids).success) return fail("Neispravan redosled.");
  await store.reorderCategories(ids);
  updateTag(CATALOG);
  return { ok: true, message: "Redosled je sačuvan." };
}
