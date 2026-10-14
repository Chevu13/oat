import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { store } from "@/lib/data";
import { effectivePrice, formatRSD } from "@/lib/format";
import { ProductRowActions } from "@/components/admin/product-row-actions";

export const metadata: Metadata = { title: "Proizvodi" };

export default async function ProductsAdmin() {
  await requireAdmin();
  const [products, categories] = await Promise.all([store.listProducts({ includeInactive: true }), store.listCategories()]);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold [font-stretch:115%] md:text-4xl">Proizvodi</h1>
        <Link href="/admin/proizvodi/novi" className="btn btn-ink !min-h-11 text-sm">
          + Novi proizvod
        </Link>
      </div>
      <p className="mt-2 text-sm text-ink-soft">Kliknite na proizvod da izmenite naziv, cenu, slike, stanje ili varijante. Izmene su odmah vidljive u prodavnici.</p>

      <ul className="mt-6 space-y-2">
        {products.map((p) => {
          const prices = p.variants.map(effectivePrice);
          const stock = p.variants.reduce((s, v) => s + v.stock, 0);
          const sale = p.variants.some((v) => v.sale_price != null);
          return (
            <li key={p.id} className={`flex flex-wrap items-center gap-4 rounded-2xl bg-white p-3 ring-1 ring-line md:flex-nowrap md:p-4 ${p.is_active ? "" : "opacity-60"}`}>
              <Link href={`/admin/proizvodi/${p.id}`} className="flex min-w-0 flex-1 items-center gap-4">
                <div className="relative h-16 w-13 shrink-0 overflow-hidden rounded-lg bg-paper-2" style={{ background: p.accent }}>
                  {p.images[0] && <Image src={p.images[0]} alt="" fill sizes="52px" className="object-cover" />}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-bold">
                    {p.name}
                    {!p.is_active && <span className="ml-2 rounded bg-ink/10 px-1.5 py-0.5 text-xs font-semibold">Isključen</span>}
                    {p.is_featured && <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-semibold text-amber-900">★ Istaknut</span>}
                  </p>
                  <p className="text-sm text-ink-soft">
                    {categories.find((c) => c.id === p.category_id)?.name ?? "Bez kategorije"} · {p.variants.length} {p.variants.length === 1 ? "varijanta" : "varijante"}
                  </p>
                </div>
              </Link>
              <div className="w-28 text-right text-sm">
                <p className="font-bold tabular-nums">
                  {Math.min(...prices) === Math.max(...prices) ? formatRSD(prices[0]) : `${formatRSD(Math.min(...prices))}+`}
                </p>
                {sale && <p className="text-xs font-semibold text-berry">Akcija</p>}
              </div>
              <div className="w-24 text-right text-sm">
                <p className={`font-semibold ${stock === 0 ? "text-berry" : stock <= 5 ? "text-amber-700" : ""}`}>{stock} kom</p>
                <p className="text-xs text-ink-soft">na stanju</p>
              </div>
              <ProductRowActions id={p.id} name={p.name} active={p.is_active} featured={p.is_featured} />
            </li>
          );
        })}
      </ul>
    </>
  );
}
