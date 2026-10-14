import type { MetadataRoute } from "next";
import { getCatalog } from "@/lib/catalog";
import { site } from "@/lib/config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { products } = await getCatalog();
  const pages = ["", "/prodavnica", "/o-nama", "/kontakt", "/dostava", "/cesta-pitanja", "/privatnost", "/uslovi"];
  return [
    ...pages.map((p) => ({ url: `${site.url}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : p === "/prodavnica" ? 0.9 : 0.5 })),
    ...products.map((p) => ({ url: `${site.url}/proizvod/${p.slug}`, changeFrequency: "weekly" as const, priority: 0.8, images: p.images.map((i) => `${site.url}${i}`) })),
  ];
}
