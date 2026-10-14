"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MAX_QTY, useCart } from "@/components/cart/cart-context";
import { QtyStepper } from "@/components/cart/qty-stepper";
import { BagIcon } from "@/components/ui/icons";
import { effectivePrice, formatRSD, onAccent } from "@/lib/format";
import type { Product } from "@/lib/types";

export function BuyBox({ product }: { product: Product }) {
  const { add, lines } = useCart();
  const [variantId, setVariantId] = useState(product.variants[0].id);
  const [qty, setQty] = useState(1);
  const [stuck, setStuck] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const v = product.variants.find((x) => x.id === variantId) ?? product.variants[0];
  const inCart = lines.find((l) => l.variantId === v.id)?.qty ?? 0;
  const maxQty = Math.max(0, MAX_QTY - inCart);
  const fg = onAccent(product.accent);

  // Mobile: show a sticky buy bar once the main button scrolls away.
  useEffect(() => {
    const el = btnRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setStuck(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const addToCart = () => {
    add(
      { variantId: v.id, productId: product.id, slug: product.slug, name: product.name, variantName: v.name, price: effectivePrice(v), image: product.images[0], accent: product.accent },
      Math.min(qty, maxQty),
      { openDrawer: true },
    );
    setQty(1);
  };

  const full = maxQty === 0;

  return (
    <div>
      <div className="flex items-baseline gap-3">
        <p className="display text-4xl tabular-nums md:text-5xl">{formatRSD(effectivePrice(v) * qty)}</p>
        {v.sale_price != null && <s className="text-lg text-ink-soft">{formatRSD(v.price * qty)}</s>}
        {v.sale_price != null && <span className="rounded-full bg-berry px-2.5 py-1 text-xs font-bold uppercase text-white">−{Math.round((1 - v.sale_price / v.price) * 100)}%</span>}
      </div>
      {qty > 1 && <p className="mt-1 text-sm text-ink-soft">{formatRSD(effectivePrice(v))} / kom</p>}

      {product.variants.length > 1 && (
        <fieldset className="mt-7">
          <legend className="eyebrow mb-3">Izaberi ukus</legend>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((x) => (
              <label key={x.id}>
                <input type="radio" name="variant" value={x.id} checked={x.id === v.id} onChange={() => (setVariantId(x.id), setQty(1))} className="peer sr-only" />
                <span className="block rounded-full border-[1.5px] border-ink/20 px-4 py-2.5 text-sm font-bold transition-colors peer-checked:border-ink peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink">
                  {x.name}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div className="mt-7 flex flex-wrap items-center gap-3">
        <QtyStepper value={qty} onChange={setQty} label={product.name} min={1} max={Math.max(1, maxQty)} />
        <button ref={btnRef} type="button" onClick={addToCart} disabled={full} className="btn min-h-12 flex-1 text-base" style={{ background: product.accent, color: fg }}>
          <BagIcon /> {full ? "Maksimalna količina je u korpi" : "Dodaj u korpu"}
        </button>
      </div>

      <AnimatePresence>
        {stuck && !full && (
          <motion.div
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            exit={{ y: "110%" }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-line bg-paper/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md lg:hidden"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-extrabold uppercase [font-stretch:115%]">{product.name}</p>
              <p className="text-sm tabular-nums text-ink-soft">{formatRSD(effectivePrice(v))}</p>
            </div>
            <button type="button" onClick={addToCart} className="btn" style={{ background: product.accent, color: fg }}>
              <BagIcon /> Dodaj
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
