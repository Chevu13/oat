"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useCart } from "./cart-context";
import { QtyStepper } from "./qty-stepper";
import { formatRSD } from "@/lib/format";
import { FREE_DELIVERY_FROM, shippingFor } from "@/lib/config";
import { ArrowIcon, CheckIcon, CloseIcon } from "@/components/ui/icons";

const ease = [0.16, 1, 0.3, 1] as const;

export function CartDrawer() {
  const { open, setOpen, lines, subtotal, setQty, remove, count } = useCart();
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    document.documentElement.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      // Keep keyboard focus inside the drawer.
      if (e.key === "Tab" && panelRef.current) {
        const f = panelRef.current.querySelectorAll<HTMLElement>("a[href],button:not([disabled]),input");
        const first = f[0], last = f[f.length - 1];
        const wrapTo = e.shiftKey ? (document.activeElement === first ? last : null) : document.activeElement === last ? first : null;
        if (wrapTo) {
          e.preventDefault();
          wrapTo.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
      prev?.focus();
    };
  }, [open, setOpen]);

  const shipping = shippingFor(subtotal);
  const toFree = Math.max(0, FREE_DELIVERY_FROM - subtotal);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.button
            type="button"
            aria-label="Zatvori korpu"
            tabIndex={-1}
            className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Korpa"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.55, ease }}
            className="absolute inset-y-0 right-0 flex w-full max-w-[460px] flex-col bg-paper shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <p className="display text-2xl">
                Korpa <span className="align-top text-sm font-bold tabular-nums">({count})</span>
              </p>
              <button ref={closeRef} type="button" onClick={() => setOpen(false)} className="grid h-11 w-11 place-items-center rounded-full hover:bg-ink/5" aria-label="Zatvori korpu">
                <CloseIcon />
              </button>
            </div>

            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
                <p className="hand text-5xl leading-none">Korpa je prazna…</p>
                <p className="max-w-xs text-ink-soft">…ali to je lako popraviti. Dvanaest ukusa čeka da izabereš svoj.</p>
                <Link href="/prodavnica" onClick={() => setOpen(false)} className="btn btn-ink">
                  Izaberi ukus <ArrowIcon />
                </Link>
              </div>
            ) : (
              <>
                <div className="px-5 pt-4">
                  <p className="text-sm font-medium">
                    {toFree > 0 ? (
                      <>
                        Još <b>{formatRSD(toFree)}</b> do besplatne dostave
                      </>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-ok">
                        <CheckIcon width={16} /> Ostvarili ste besplatnu dostavu
                      </span>
                    )}
                  </p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/10">
                    <motion.div
                      className="h-full rounded-full bg-ink"
                      animate={{ width: `${Math.min(100, (subtotal / FREE_DELIVERY_FROM) * 100)}%` }}
                      transition={{ duration: 0.6, ease }}
                    />
                  </div>
                </div>

                <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
                  <AnimatePresence initial={false}>
                    {lines.map((l) => (
                      <motion.li
                        key={l.variantId}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 40, transition: { duration: 0.25 } }}
                        className="flex gap-4 py-4"
                      >
                        <Link href={`/proizvod/${l.slug}`} onClick={() => setOpen(false)} className="relative h-28 w-22 shrink-0 overflow-hidden rounded-xl" style={{ background: l.accent }}>
                          <Image src={l.image} alt={l.name} fill sizes="88px" className="object-cover" />
                        </Link>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex justify-between gap-3">
                            <div className="min-w-0">
                              <Link href={`/proizvod/${l.slug}`} onClick={() => setOpen(false)} className="block truncate font-bold [font-stretch:112%]">
                                {l.name}
                              </Link>
                              <p className="text-sm text-ink-soft">{l.variantName}</p>
                            </div>
                            <p className="shrink-0 font-semibold tabular-nums">{formatRSD(l.price * l.qty)}</p>
                          </div>
                          <div className="mt-auto flex items-center justify-between">
                            <QtyStepper value={l.qty} onChange={(q) => setQty(l.variantId, q)} label={l.name} small />
                            <button type="button" onClick={() => remove(l.variantId)} className="text-sm text-ink-soft underline underline-offset-4 hover:text-berry">
                              Ukloni
                            </button>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>

                <div className="border-t border-line bg-paper-2/60 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
                  <dl className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-ink-soft">Međuzbir</dt>
                      <dd className="tabular-nums">{formatRSD(subtotal)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-ink-soft">Dostava</dt>
                      <dd className="tabular-nums">{shipping === 0 ? "Besplatna" : formatRSD(shipping)}</dd>
                    </div>
                    <div className="flex justify-between pt-1 text-lg font-bold">
                      <dt>Ukupno</dt>
                      <dd className="tabular-nums">{formatRSD(subtotal + shipping)}</dd>
                    </div>
                  </dl>
                  <Link href="/placanje" onClick={() => setOpen(false)} className="btn btn-ink mt-4 w-full">
                    Nastavi na plaćanje <ArrowIcon />
                  </Link>
                  <p className="mt-2 text-center text-xs text-ink-soft">Pouzećem ili pri preuzimanju · cena se proverava pri porudžbini</p>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function CartToast() {
  const { toast, setOpen } = useCart();
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex justify-center px-4">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ y: 30, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.4, ease }}
            className="pointer-events-auto flex items-center gap-3 rounded-full bg-ink py-2 pl-4 pr-2 text-sm text-paper shadow-xl"
          >
            <CheckIcon width={18} />
            <span className="font-medium">{toast.text}</span>
            <button type="button" onClick={() => setOpen(true)} className="rounded-full bg-paper px-3 py-1.5 font-bold text-ink">
              Pogledaj korpu
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
