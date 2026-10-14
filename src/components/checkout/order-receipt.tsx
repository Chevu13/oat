import Link from "next/link";
import { FitTitle } from "@/components/site/fit-title";
import { formatDate, formatRSD } from "@/lib/format";
import { site } from "@/lib/config";
import { DELIVERY_LABEL, PAYMENT_LABEL, STATUS_LABEL, type Order } from "@/lib/types";

/** Order confirmation view; shared by the server page and the browser-snapshot fallback. */
export function OrderReceipt({ o }: { o: Order }) {
  const method = o.delivery_method ?? "dostava";

  return (
    <>
      <div className="text-center">
        <p className="anim-pop mx-auto grid h-20 w-20 place-items-center rounded-full bg-ink text-4xl text-paper">✓</p>
        <p className="hand mt-6 text-3xl">Hvala, {o.customer_name.split(" ")[0]}!</p>
        <FitTitle text="Porudžbina je primljena" max="6rem" maxWidth={768} className="mt-2" />
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
            <dt className="text-ink-soft">Proizvodi</dt>
            <dd className="tabular-nums">{formatRSD(o.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-soft">{method === "dostava" ? "Dostava" : "Preuzimanje"}</dt>
            <dd className="tabular-nums">{o.shipping ? formatRSD(o.shipping) : "Besplatno"}</dd>
          </div>
          <div className="flex justify-between pt-2 text-xl font-extrabold">
            <dt>{method === "dostava" ? "Za plaćanje pouzećem" : "Za plaćanje u radnji"}</dt>
            <dd className="tabular-nums">{formatRSD(o.total)}</dd>
          </div>
        </dl>
        <div className="mt-6 grid gap-4 rounded-2xl bg-paper-2 p-5 text-sm sm:grid-cols-2">
          <div>
            <p className="eyebrow mb-1 text-ink-soft">{DELIVERY_LABEL[method]}</p>
            {method === "dostava" ? (
              <p>
                {o.customer_name}
                <br />
                {o.street}
                <br />
                {o.postal_code} {o.city}
              </p>
            ) : (
              <p>
                {o.customer_name}
                <br />
                {site.pickup}
              </p>
            )}
          </div>
          <div>
            <p className="eyebrow mb-1 text-ink-soft">Plaćanje</p>
            <p>{PAYMENT_LABEL[method]}</p>
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
