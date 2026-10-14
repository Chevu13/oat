import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { store } from "@/lib/data";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = { title: "Izmena proizvoda" };

export default async function EditProduct({ params }: PageProps<"/admin/proizvodi/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const [product, categories] = await Promise.all([store.getProductById(id), store.listCategories()]);
  if (!product) notFound();
  return (
    <>
      <Link href="/admin/proizvodi" className="text-sm font-semibold text-ink-soft hover:text-ink">
        ← Proizvodi
      </Link>
      <h1 className="mb-6 mt-3 text-3xl font-extrabold [font-stretch:115%] md:text-4xl">{product.name}</h1>
      <ProductForm key={`${product.id}-${product.variants.map((v) => v.id).join()}`} product={product} categories={categories} />
    </>
  );
}
