import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { store } from "@/lib/data";
import { formatDate, formatRSD } from "@/lib/format";
import { site } from "@/lib/config";
import { STATUS_LABEL } from "@/lib/types";

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
  if (!o) notFound();

  return (
    <>
      <div className="text-center">
        <p className="anim-pop mx-auto grid h-20 w-20 place-items-center rounded-full bg-ink text-4xl text-paper">✓</p>
        <p className="hand mt-6 text-3xl">Hvala, {o.customer_name.split(" ")[0]}!</p>
        <h1 className="display mt-2 text-[9.6vw] md:text-8xl">Porudžbina je primljena</h1>
        <p className="mx-auto mt-4 max-w-md text-ink-soft">
          Kontaktiraćemo te na <b className="text-ink">{o.phone}</b> radi potvrde porudžbine. Sačuvaj broj porudžbine ispod.
        </p>
      </div>

      <div className="mt-10 rounded-[1.75rem] bg-white/70 p-6 ring-1 ring-line md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-5">
          <div>
            <p className="eyebrow text-ink-soft">Broj porudžbine</p>
            <p className="display mt-1 whitespace-nowrap text-2xl sm:text-3xl">{o.number}</p>
          </div>
          <div className="text-right text-sm">
            <p className="text-ink-soft">{formatDate(o.created_at)}</p>
            <p className="mt-1 inline-block rounded-full bg-ink px-3 py-1 font-bold text-paper">{STATUS_LABEL[o.status]}</p>
          </div>
        </div>
        <ul className="divide-y divide-line">
          {o.items.map((i) => (
            <li key={i.id} className="flex justify-between gap-4 py-3">
              <span>
                <b>{i.quantity}×</b> {i.product_name} <span className="text-ink-soft">· {i.variant_name}</span>
              </span>
              <span className="shrink-0 whitespace-nowrap tabular-nums">{formatRSD(i.line_total)}</span>
            </li>
          ))}
        </ul>
        <dl className="space-y-1.5 border-t border-line pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-soft">Međuzbir</dt>
            <dd className="tabular-nums">{formatRSD(o.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-soft">Dostava</dt>
            <dd className="tabular-nums">{o.shipping ? formatRSD(o.shipping) : "Besplatna"}</dd>
          </div>
          <div className="flex justify-between pt-2 text-xl font-extrabold">
            <dt>Za plaćanje pouzećem</dt>
            <dd className="tabular-nums">{formatRSD(o.total)}</dd>
          </div>
        </dl>
        <div className="mt-6 grid gap-4 rounded-2xl bg-paper-2 p-5 text-sm sm:grid-cols-2">
          <div>
            <p className="eyebrow mb-1 text-ink-soft">Dostava na adresu</p>
            <p>
              {o.customer_name}
              <br />
              {o.street}
              <br />
              {o.postal_code} {o.city}
            </p>
          </div>
          <div>
            <p className="eyebrow mb-1 text-ink-soft">Plaćanje</p>
            <p>Pouzećem, gotovinom kuriru</p>
            {o.note && (
              <>
                <p className="eyebrow mb-1 mt-3 text-ink-soft">Napomena</p>
                <p>{o.note}</p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/prodavnica" className="btn btn-ink">
          Nastavi kupovinu
        </Link>
        <a href={site.phoneHref} className="btn btn-line">
          Pozovi nas: {site.phone}
        </a>
      </div>
    </>
  );
}
