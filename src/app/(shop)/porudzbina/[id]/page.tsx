import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { store } from "@/lib/data";
import { OrderReceipt } from "@/components/checkout/order-receipt";
import { OrderFromBrowser } from "@/components/checkout/order-from-browser";

export const metadata: Metadata = { title: "Porudžbina primljena", robots: { index: false } };

export default function OrderPage({ params }: PageProps<"/porudzbina/[id]">) {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-10 pt-10 md:pt-16">
      <Suspense fallback={<div className="h-[60vh] animate-pulse rounded-3xl bg-paper-2" />}>
        <Order params={params} />
      </Suspense>
    </div>
  );
}

async function Order({ params }: Pick<PageProps<"/porudzbina/[id]">, "params">) {
  await connection();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const o = await store.getOrderPublic(id);
  // Not visible to this server instance yet (e.g. demo storage without Redis): show the copy the browser kept.
  return o ? <OrderReceipt o={o} /> : <OrderFromBrowser id={id} />;
}
