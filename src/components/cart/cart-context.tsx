"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

export type CartLine = {
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  variantName: string;
  price: number; // display only — the server re-prices at checkout
  image: string;
  accent: string;
  qty: number;
};

type Toast = { id: number; text: string };

type CartCtx = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  ready: boolean;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (line: Omit<CartLine, "qty">, qty?: number, opts?: { openDrawer?: boolean }) => void;
  setQty: (variantId: string, qty: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
  toast: Toast | null;
};

const KEY = "oatbomb-cart-v1";
export const MAX_QTY = 20;
const Ctx = createContext<CartCtx | null>(null);

function read(): CartLine[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((l) => l && typeof l.variantId === "string" && l.qty > 0) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Hydrate after mount (localStorage isn't available during SSR) and stay in sync across tabs.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from browser storage
    setLines(read());
    setReady(true);
    const onStorage = (e: StorageEvent) => e.key === KEY && setLines(read());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const commit = useCallback((fn: (prev: CartLine[]) => CartLine[]) => {
    setLines((prev) => {
      const next = fn(prev);
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* private mode — cart still works for this tab */
      }
      return next;
    });
  }, []);

  const add: CartCtx["add"] = useCallback(
    (line, qty = 1, opts) => {
      commit((prev) => {
        const hit = prev.find((l) => l.variantId === line.variantId);
        if (hit) return prev.map((l) => (l === hit ? { ...l, ...line, qty: Math.min(MAX_QTY, l.qty + qty) } : l));
        return [...prev, { ...line, qty: Math.min(MAX_QTY, qty) }];
      });
      if (opts?.openDrawer) setOpen(true);
      else {
        clearTimeout(toastTimer.current);
        setToast({ id: Date.now(), text: `${line.name} je u korpi` });
        toastTimer.current = setTimeout(() => setToast(null), 2600);
      }
    },
    [commit],
  );

  const value = useMemo<CartCtx>(
    () => ({
      lines,
      ready,
      open,
      setOpen,
      toast,
      add,
      count: lines.reduce((s, l) => s + l.qty, 0),
      subtotal: lines.reduce((s, l) => s + l.qty * l.price, 0),
      setQty: (id, qty) =>
        commit((prev) =>
          qty <= 0 ? prev.filter((l) => l.variantId !== id) : prev.map((l) => (l.variantId === id ? { ...l, qty: Math.min(MAX_QTY, qty) } : l)),
        ),
      remove: (id) => commit((prev) => prev.filter((l) => l.variantId !== id)),
      clear: () => commit(() => []),
    }),
    [lines, ready, open, toast, add, commit],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart outside CartProvider");
  return c;
}
