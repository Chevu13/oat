"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDeferredValue, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ProductCard } from "@/components/product/product-card";
import { CloseIcon, SearchIcon } from "@/components/ui/icons";
import { effectivePrice } from "@/lib/format";
import type { Category, Product } from "@/lib/types";

const SORTS = {
  preporuceno: "Preporučeno",
  "cena-rastuce": "Cena: od najniže",
  "cena-opadajuce": "Cena: od najviše",
  "naziv-az": "Naziv: A–Z",
  "naziv-za": "Naziv: Z–A",
} as const;
type Sort = keyof typeof SORTS;

const norm = (s: string) => s.toLowerCase().replace(/đ/g, "dj").normalize("NFD").replace(/[̀-ͯ]/g, "");
const price = (p: Product) => Math.min(...p.variants.map(effectivePrice));

export function ShopBrowser({ products, categories }: { products: Product[]; categories: Category[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const cat = params.get("kategorija") ?? "";
  const sort = (params.get("sort") ?? "preporuceno") as Sort;
  const [q, setQ] = useState(params.get("q") ?? "");
  const dq = useDeferredValue(q);

  const update = (next: Record<string, string | null>) => {
    const sp = new URLSearchParams(params);
    for (const [k, v] of Object.entries(next)) {
      if (v) sp.set(k, v);
      else sp.delete(k);
    }
    router.replace(`${pathname}${sp.size ? `?${sp}` : ""}`, { scroll: false });
  };

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of products) if (p.category_id) m.set(p.category_id, (m.get(p.category_id) ?? 0) + 1);
    return m;
  }, [products]);

  const list = useMemo(() => {
    const activeCat = categories.find((c) => c.slug === cat);
    const needle = norm(dq.trim());
    const r = products.filter(
      (p) =>
        (!activeCat || p.category_id === activeCat.id) &&
        (!needle || norm(`${p.name} ${p.tagline ?? ""} ${p.description ?? ""}`).includes(needle)),
    );
    const by: Record<Sort, (a: Product, b: Product) => number> = {
      preporuceno: (a, b) => a.sort - b.sort,
      "cena-rastuce": (a, b) => price(a) - price(b),
      "cena-opadajuce": (a, b) => price(b) - price(a),
      "naziv-az": (a, b) => a.name.localeCompare(b.name, "sr"),
      "naziv-za": (a, b) => b.name.localeCompare(a.name, "sr"),
    };
    return r.sort(by[sort] ?? by.preporuceno);
  }, [products, categories, cat, dq, sort]);

  const catName = (id: string | null) => categories.find((c) => c.id === id)?.name;

  return (
    <div>
      <div className="sticky top-16 z-20 -mx-4 border-b border-line bg-paper/[0.97] px-4 py-3 backdrop-blur-md md:top-20 md:mx-0 md:rounded-2xl md:border md:px-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] lg:mx-0 lg:px-0" role="group" aria-label="Kategorije">
            <div className="flex w-max gap-2">
              {[{ id: "", slug: "", name: "Sve", count: products.length }, ...categories.map((c) => ({ ...c, count: counts.get(c.id) ?? 0 }))]
                .filter((c) => c.slug === "" || c.count > 0)
                .map((c) => {
                  const active = cat === c.slug;
                  return (
                    <button
                      key={c.slug || "all"}
                      type="button"
                      aria-pressed={active}
                      onClick={() => update({ kategorija: c.slug || null })}
                      className={`relative h-10 rounded-full px-4 text-sm font-bold transition-colors ${active ? "text-paper" : "bg-white/60 hover:bg-white"}`}
                    >
                      {active && <motion.span layoutId="cat-pill" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
                      <span className="relative">
                        {c.name} <span className="opacity-50">{c.count}</span>
                      </span>
                    </button>
                  );
                })}
            </div>
          </div>
          <div className="flex gap-2">
            <label className="relative flex-1 lg:w-64 lg:flex-none">
              <span className="sr-only">Pretraga proizvoda</span>
              <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onBlur={() => update({ q: q.trim() || null })}
                placeholder="Pretraži ukuse…"
                className="h-10 w-full rounded-full border-[1.5px] border-line bg-white/70 pl-10 pr-9 text-[16px] outline-none focus:border-ink"
              />
              {q && (
                <button type="button" onClick={() => (setQ(""), update({ q: null }))} className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full hover:bg-ink/5" aria-label="Obriši pretragu">
                  <CloseIcon width={14} />
                </button>
              )}
            </label>
            <label className="relative">
              <span className="sr-only">Sortiranje</span>
              <select
                value={sort}
                onChange={(e) => update({ sort: e.target.value === "preporuceno" ? null : e.target.value })}
                className="h-10 appearance-none rounded-full border-[1.5px] border-line bg-white/70 pl-4 pr-9 text-sm font-semibold outline-none focus:border-ink"
              >
                {Object.entries(SORTS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs">▾</span>
            </label>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between text-sm">
        <p className="text-ink-soft" aria-live="polite">
          {list.length} {list.length % 10 === 1 && list.length % 100 !== 11 ? "proizvod" : "proizvoda"}
        </p>
      </div>

      {list.length === 0 ? (
        <div className="flex flex-col items-center py-24 text-center">
          <p className="hand text-5xl">Ništa za „{q || "ovaj filter"}“…</p>
          <p className="mt-3 text-ink-soft">Probaj drugi ukus ili pogledaj celu ponudu.</p>
          <button type="button" className="btn btn-ink mt-6" onClick={() => (setQ(""), router.replace(pathname, { scroll: false }))}>
            Prikaži sve
          </button>
        </div>
      ) : (
        <motion.ul layout className="mt-6 grid grid-cols-2 gap-x-3 gap-y-9 md:grid-cols-3 md:gap-x-5 xl:grid-cols-4">
          <AnimatePresence mode="popLayout" initial={false}>
            {list.map((p, n) => (
              <motion.li
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <ProductCard product={p} categoryName={catName(p.category_id)} priority={n < 4} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </div>
  );
}

/** Server-rendered, unfiltered grid: crawlable fallback shown until URL filters are read on the client. */
export function ShopGridStatic({ products, categories }: { products: Product[]; categories: Category[] }) {
  return (
    <ul className="mt-24 grid grid-cols-2 gap-x-3 gap-y-9 md:grid-cols-3 md:gap-x-5 xl:grid-cols-4">
      {products.map((p, n) => (
        <li key={p.id}>
          <ProductCard product={p} categoryName={categories.find((c) => c.id === p.category_id)?.name} priority={n < 4} />
        </li>
      ))}
    </ul>
  );
}
