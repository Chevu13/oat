import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { store } from "@/lib/data";
import { CategoryManager } from "@/components/admin/category-manager";

export const metadata: Metadata = { title: "Kategorije" };

export default async function CategoriesPage() {
  await requireAdmin();
  const [categories, products] = await Promise.all([store.listCategories(), store.listProducts({ includeInactive: true })]);
  const counts: Record<string, number> = {};
  for (const p of products) if (p.category_id) counts[p.category_id] = (counts[p.category_id] ?? 0) + 1;
  return (
    <>
      <h1 className="mb-6 text-3xl font-extrabold [font-stretch:115%] md:text-4xl">Kategorije</h1>
      <CategoryManager categories={categories} counts={counts} />
    </>
  );
}
