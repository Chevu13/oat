import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopBrowser, ShopGridStatic } from "@/components/shop/shop-browser";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { getCatalog } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Prodavnica — svi ukusi",
  description: "Sve OAT BOMB proteinske ovsene kaše na jednom mestu: čokoladne, voćne, desertne, posne i mini kaše za događaje. Poruči online, plaćanje pouzećem.",
  alternates: { canonical: "/prodavnica" },
};

export default async function ShopPage() {
  const { products, categories } = await getCatalog();
  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-10 pt-6 md:px-8 md:pt-10">
      <Breadcrumbs items={[{ name: "Prodavnica", href: "/prodavnica" }]} />
      <header className="mb-8 mt-4 grid gap-4 md:mb-10 md:grid-cols-[1fr_18rem] md:items-end">
        <h1 className="display text-[9.6vw] md:text-[9rem]">Prodavnica</h1>
        <p className="max-w-sm text-ink-soft md:pb-3 md:text-right">
          <span className="hand block text-2xl text-ink">Probaj naše proteinske kaše.</span>
          {products.length} proizvoda, slojevito spremljenih. Izaberi ukus i poruči online.
        </p>
      </header>
      <Suspense fallback={<ShopGridStatic products={products} categories={categories} />}>
        <ShopBrowser products={products} categories={categories} />
      </Suspense>
    </div>
  );
}
