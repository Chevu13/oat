"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { OrderReceipt } from "./order-receipt";
import type { Order } from "@/lib/types";

export const orderSnapshotKey = (id: string) => `oatbomb-order:${id}`;

const noop = () => () => {};

export function OrderFromBrowser({ id }: { id: string }) {
  const raw = useSyncExternalStore(
    noop,
    () => {
      try {
        return sessionStorage.getItem(orderSnapshotKey(id));
      } catch {
        return null;
      }
    },
    () => undefined,
  );
  if (raw === undefined) return <div className="h-[60vh] animate-pulse rounded-3xl bg-paper-2" />;
  if (!raw)
    return (
      <div className="py-20 text-center">
        <meta name="robots" content="noindex" />
        <p className="hand text-4xl">Porudžbina nije pronađena.</p>
        <p className="mt-3 text-ink-soft">Proveri link ili nas pozovi, rado ćemo pomoći.</p>
        <Link href="/prodavnica" className="btn btn-ink mt-6">
          Nazad u prodavnicu
        </Link>
      </div>
    );
  return <OrderReceipt o={JSON.parse(raw) as Order} />;
}
