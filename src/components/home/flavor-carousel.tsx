"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useCart } from "@/components/cart/cart-context";
import { ArrowIcon } from "@/components/ui/icons";
import { effectivePrice, formatRSD, onAccent } from "@/lib/format";
import type { Product } from "@/lib/types";

const ease = [0.16, 1, 0.3, 1] as const;

export function FlavorCarousel({ products }: { products: Product[] }) {
  const [[i, dir], setState] = useState<[number, number]>([0, 1]);
  const { add } = useCart();
  const p = products[i];
  const fg = onAccent(p.accent);
  const v = p.variants[0];
  const go = (d: number) => setState(([cur]) => [(cur + d + products.length) % products.length, d]);
  const jump = (n: number) => setState(([cur]) => [n, n >= cur ? 1 : -1]);

  return (
    <section
      id="ukusi"
      aria-roledescription="karusel"
      aria-label="Ukusi"
      className="relative overflow-hidden transition-colors duration-700 ease-[var(--ease-out-expo)]"
      style={{ background: p.accent, color: fg }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(1);
        if (e.key === "ArrowLeft") go(-1);
      }}
    >
      <div className="relative mx-auto max-w-[1440px] px-4 py-14 md:px-8 md:py-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow opacity-70">Izaberi svoj ukus</p>
            <h2 className="display mt-2 text-4xl md:text-6xl">Ukusi</h2>
          </div>
          <p className="display text-2xl tabular-nums md:text-4xl" aria-live="polite">
            {String(i + 1).padStart(2, "0")}
            <span className="opacity-40"> / {String(products.length).padStart(2, "0")}</span>
          </p>
        </div>

        <div className="relative mt-6 grid min-h-[min(105vw,520px)] place-items-center md:min-h-[480px]">
          {/* giant name behind the cup */}
          <AnimatePresence mode="popLayout" initial={false} custom={dir}>
            <motion.p
              key={p.id + "-name"}
              custom={dir}
              initial={{ x: `${dir * 30}%`, opacity: 0 }}
              animate={{ x: 0, opacity: 0.16 }}
              exit={{ x: `${dir * -30}%`, opacity: 0 }}
              transition={{ duration: 0.8, ease }}
              className="display pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none whitespace-nowrap text-center text-[22vw] leading-none md:text-[15vw]"
              aria-hidden
            >
              {p.name}
            </motion.p>
          </AnimatePresence>

          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.25}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60) go(1);
              else if (info.offset.x > 60) go(-1);
            }}
            className="relative z-10 w-[min(60vw,330px)] cursor-grab touch-pan-y active:cursor-grabbing"
          >
            <AnimatePresence mode="popLayout" initial={false} custom={dir}>
              <motion.div
                key={p.id}
                custom={dir}
                initial={{ x: dir * 120, rotate: dir * 8, opacity: 0, scale: 0.9 }}
                animate={{ x: 0, rotate: 0, opacity: 1, scale: 1 }}
                exit={{ x: dir * -120, rotate: dir * -8, opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.7, ease }}
                className="relative aspect-[4/5] overflow-hidden rounded-t-full rounded-b-[2rem] shadow-[0_40px_80px_-30px_rgb(0_0_0/0.55)]"
              >
                <Image src={p.images[0]} alt={`${p.name} proteinska kaša`} fill sizes="(min-width:768px) 330px, 60vw" className="pointer-events-none object-cover" draggable={false} />
              </motion.div>
            </AnimatePresence>
          </motion.div>

          <button type="button" onClick={() => go(-1)} className="absolute left-0 top-1/2 z-20 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border-2 border-current transition-transform hover:scale-110 md:h-16 md:w-16" aria-label="Prethodni ukus">
            <ArrowIcon className="rotate-180" />
          </button>
          <button type="button" onClick={() => go(1)} className="absolute right-0 top-1/2 z-20 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border-2 border-current transition-transform hover:scale-110 md:h-16 md:w-16" aria-label="Sledeći ukus">
            <ArrowIcon />
          </button>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={p.id + "-info"}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease }}
            className="mx-auto mt-6 flex max-w-2xl flex-col items-center text-center"
          >
            <h3 className="display text-4xl md:text-6xl">{p.name}</h3>
            <p className="hand mt-2 text-2xl md:text-3xl">{p.tagline}</p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    add({ variantId: v.id, productId: p.id, slug: p.slug, name: p.name, variantName: v.name, price: effectivePrice(v), image: p.images[0], accent: p.accent })
                  }
                  className="btn"
                  style={{ background: fg, color: p.accent }}
                >
                  Dodaj u korpu · {formatRSD(effectivePrice(v))}
                </button>
              <Link href={`/proizvod/${p.slug}`} className="btn btn-line" style={{ color: fg }}>
                Detaljnije
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="-mx-4 mt-10 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:px-0">
          <ul className="flex w-max gap-2 md:mx-auto md:w-auto md:flex-wrap md:justify-center">
            {products.map((x, n) => (
              <li key={x.id}>
                <button
                  type="button"
                  onClick={() => jump(n)}
                  aria-current={n === i}
                  className={`rounded-full border-[1.5px] border-current px-4 py-2 text-sm font-bold transition-all ${n === i ? "" : "opacity-55 hover:opacity-100"}`}
                  style={n === i ? { background: fg, color: p.accent, borderColor: fg } : undefined}
                >
                  {x.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
