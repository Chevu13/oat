import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { store } from "@/lib/data";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = { title: "Novi proizvod" };

export default async function NewProduct() {
  await requireAdmin();
  const categories = await store.listCategories();
  return (
    <>
      <Link href="/admin/proizvodi" className="text-sm font-semibold text-ink-soft hover:text-ink">
        ← Proizvodi
      </Link>
      <h1 className="mb-6 mt-3 text-3xl font-extrabold [font-stretch:115%] md:text-4xl">Novi proizvod</h1>
      <ProductForm categories={categories} />
    </>
  );
}
