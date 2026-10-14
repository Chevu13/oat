"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart/cart-context";
import { PlusIcon } from "@/components/ui/icons";
import { effectivePrice, formatRSD, onAccent } from "@/lib/format";
import type { Product } from "@/lib/types";

export function ProductCard({ product, categoryName, priority = false, sizes = "(min-width:1024px) 25vw, 50vw" }: { product: Product; categoryName?: string; priority?: boolean; sizes?: string }) {
  const { add } = useCart();
  const single = product.variants.length === 1;
  const v = product.variants[0];
  const price = Math.min(...product.variants.map(effectivePrice));
  const sale = product.variants.find((x) => x.sale_price != null);
  const [img1, img2] = product.images;

  return (
    <article className="group relative">
      <Link href={`/proizvod/${product.slug}`} className="block" aria-label={`${product.name}, ${formatRSD(price)}`}>
        <div className="relative aspect-[4/5] overflow-hidden rounded-[1.4rem] bg-paper-2">
          {img1 && (
            <Image
              src={img1}
              alt={`${product.name} — OAT BOMB proteinska ovsena kaša`}
              fill
              sizes={sizes}
              priority={priority}
              className={`object-cover transition-[transform,opacity] duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.045] ${img2 ? "group-hover:opacity-0" : ""}`}
            />
          )}
          {img2 && (
            <Image src={img2} alt="" fill sizes={sizes} className="scale-[1.08] object-cover opacity-0 transition-[transform,opacity] duration-700 ease-[var(--ease-out-expo)] group-hover:scale-100 group-hover:opacity-100" />
          )}
          {/* flavor color sweep */}
          <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1.5 origin-left transition-[height] duration-500 ease-[var(--ease-out-expo)] group-hover:h-3" style={{ background: product.accent }} />

          <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
            {sale && <span className="rounded-full bg-berry px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-wider text-white">Akcija</span>}
          </div>
        </div>
      </Link>

      {single ? (
          <button
            type="button"
            onClick={() =>
              add({ variantId: v.id, productId: product.id, slug: product.slug, name: product.name, variantName: v.name, price: effectivePrice(v), image: img1, accent: product.accent })
            }
            className="absolute right-3 top-3 flex h-11 items-center gap-0 overflow-hidden rounded-full px-3 text-sm font-bold shadow-lg transition-all duration-500 ease-[var(--ease-out-expo)] hover:gap-1.5 hover:pr-4 active:scale-95 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
            style={{ background: product.accent, color: onAccent(product.accent) }}
            aria-label={`Dodaj ${product.name} u korpu`}
          >
            <PlusIcon width={18} />
            <span className="max-w-0 overflow-hidden whitespace-nowrap transition-[max-width] duration-500 ease-[var(--ease-out-expo)] group-hover:max-w-24">Dodaj</span>
          </button>
        ) : (
          <Link
            href={`/proizvod/${product.slug}`}
            className="absolute right-3 top-3 flex h-11 items-center rounded-full px-4 text-sm font-bold shadow-lg md:opacity-0 md:group-hover:opacity-100"
            style={{ background: product.accent, color: onAccent(product.accent) }}
            tabIndex={-1}
          >
            Izaberi
          </Link>
        )}

      <div className="mt-3 flex flex-col gap-1 px-0.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-[0.95rem] font-extrabold uppercase leading-tight tracking-tight [font-stretch:112%] sm:text-[1.05rem] md:text-lg">
            <Link href={`/proizvod/${product.slug}`}>{product.name}</Link>
          </h3>
          {categoryName && <p className="mt-0.5 text-xs text-ink-soft md:text-sm">{categoryName}</p>}
        </div>
        <p className="shrink-0 text-sm font-bold tabular-nums sm:text-right md:text-base">
          {!single && <span className="font-medium text-ink-soft">od </span>}
          {formatRSD(price)}
          {sale && <s className="ml-1.5 text-xs font-medium text-ink-soft sm:ml-0 sm:block">{formatRSD(sale.price)}</s>}
        </p>
      </div>
    </article>
  );
}
