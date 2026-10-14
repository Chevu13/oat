"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckIcon, CloseIcon } from "@/components/ui/icons";

type T = { id: number; text: string; tone: "ok" | "error" };

/** Fire-and-forget notifications: toast("Sačuvano") from anywhere in admin. */
export function toast(text: string, tone: T["tone"] = "ok") {
  window.dispatchEvent(new CustomEvent<Omit<T, "id">>("admin-toast", { detail: { text, tone } }));
}

export function Toaster() {
  const [items, setItems] = useState<T[]>([]);
  useEffect(() => {
    const on = (e: Event) => {
      const t = { ...(e as CustomEvent<Omit<T, "id">>).detail, id: Date.now() + Math.random() };
      setItems((x) => [...x.slice(-2), t]);
      setTimeout(() => setItems((x) => x.filter((i) => i.id !== t.id)), 3500);
    };
    window.addEventListener("admin-toast", on);
    return () => window.removeEventListener("admin-toast", on);
  }, []);
  return (
    <div aria-live="polite" className="pointer-events-none fixed bottom-20 right-4 z-[70] flex flex-col items-end gap-2 md:bottom-6">
      <AnimatePresence>
        {items.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40 }}
            className={`pointer-events-auto flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow-xl ${t.tone === "ok" ? "bg-ink text-paper" : "bg-berry text-white"}`}
          >
            {t.tone === "ok" ? <CheckIcon width={18} /> : <CloseIcon width={18} />} {t.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/** Button that asks for confirmation in a modal before running a (server) action. */
export function ConfirmButton({
  children,
  title,
  body,
  confirmLabel = "Obriši",
  onConfirm,
  className = "",
}: {
  children: React.ReactNode;
  title: string;
  body?: React.ReactNode;
  confirmLabel?: string;
  onConfirm: () => Promise<void> | void;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [pending, start] = useTransition();
  return (
    <>
      <button type="button" className={className} onClick={() => ref.current?.showModal()}>
        {children}
      </button>
      <dialog ref={ref} className="m-auto w-[min(92vw,420px)] rounded-2xl bg-paper p-0 text-ink shadow-2xl backdrop:bg-ink/50 backdrop:backdrop-blur-sm" onClick={(e) => e.target === ref.current && ref.current?.close()}>
        <div className="p-6">
          <p className="text-xl font-extrabold [font-stretch:115%]">{title}</p>
          {body && <div className="mt-2 text-sm text-ink-soft">{body}</div>}
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" className="btn btn-line !min-h-11 text-sm" onClick={() => ref.current?.close()} autoFocus>
              Odustani
            </button>
            <button
              type="button"
              disabled={pending}
              className="btn !min-h-11 bg-berry text-sm text-white hover:bg-berry/90"
              onClick={() =>
                start(async () => {
                  await onConfirm();
                  ref.current?.close();
                })
              }
            >
              {pending ? "Brisanje…" : confirmLabel}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}

export function Card({ title, action, children, className = "" }: { title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl bg-white p-5 ring-1 ring-line md:p-6 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="text-lg font-extrabold [font-stretch:112%]">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
