import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { store } from "@/lib/data";
import type { Product } from "@/lib/types";

/** Storefront reads. Admin mutations and new orders call updateTag(CATALOG) so changes show immediately. */
export const CATALOG = "catalog";

export async function getCatalog() {
  "use cache";
  cacheTag(CATALOG);
  cacheLife("hours");
  const [categories, products] = await Promise.all([store.listCategories(), store.listProducts()]);
  return { categories, products };
}

export async function getProductBySlug(slug: string) {
  const { products, categories } = await getCatalog();
  const product = products.find((p) => p.slug === slug);
  if (!product) return null;
  return { product, category: categories.find((c) => c.id === product.category_id) ?? null };
}

export async function getBestsellers(limit = 4): Promise<Product[]> {
  "use cache";
  cacheTag(CATALOG);
  cacheLife("hours");
  const [{ products }, ids] = await Promise.all([getCatalog(), store.bestsellerIds(limit)]);
  const ranked = ids.map((id) => products.find((p) => p.id === id)).filter((p): p is Product => Boolean(p));
  // Until real sales exist, fill with featured products.
  for (const p of products) if (ranked.length < limit && p.is_featured && !ranked.includes(p)) ranked.push(p);
  return ranked.slice(0, limit);
}

export const minPrice = (p: Product) => Math.min(...p.variants.map((v) => v.sale_price ?? v.price));
export const onSale = (p: Product) => p.variants.some((v) => v.sale_price != null);
