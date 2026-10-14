import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { store } from "@/lib/data";
import { formatDate, formatRSD } from "@/lib/format";
import { Card } from "@/components/admin/ui";
import { StatusBadge } from "@/components/admin/status-badge";
import { StatusForm } from "@/components/admin/status-form";

export const metadata: Metadata = { title: "Porudžbina" };

export default async function OrderDetail({ params }: PageProps<"/admin/porudzbine/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const o = await store.getOrder(id);
  if (!o) notFound();

  return (
    <>
      <Link href="/admin/porudzbine" className="text-sm font-semibold text-ink-soft hover:text-ink">
        ← Sve porudžbine
      </Link>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold [font-stretch:115%] md:text-4xl">{o.number}</h1>
          <p className="mt-1 text-sm text-ink-soft">Primljena {formatDate(o.created_at)}</p>
        </div>
        <StatusBadge status={o.status} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Card title="Stavke">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-ink-soft">
                <tr>
                  <th className="pb-2">Proizvod</th>
                  <th className="pb-2 text-right">Cena</th>
                  <th className="pb-2 text-right">Kol.</th>
                  <th className="pb-2 text-right">Ukupno</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {o.items.map((i) => (
                  <tr key={i.id}>
                    <td className="py-3">
                      <p className="font-semibold">{i.product_name}</p>
                      <p className="text-xs text-ink-soft">{i.variant_name}</p>
                    </td>
                    <td className="py-3 text-right tabular-nums">{formatRSD(i.unit_price)}</td>
                    <td className="py-3 text-right font-bold tabular-nums">{i.quantity}</td>
                    <td className="py-3 text-right font-semibold tabular-nums">{formatRSD(i.line_total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <dl className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-soft">Međuzbir</dt>
              <dd className="tabular-nums">{formatRSD(o.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-soft">Dostava</dt>
              <dd className="tabular-nums">{o.shipping ? formatRSD(o.shipping) : "Besplatna"}</dd>
            </div>
            <div className="flex justify-between pt-1 text-lg font-extrabold">
              <dt>Ukupno (pouzećem)</dt>
              <dd className="tabular-nums">{formatRSD(o.total)}</dd>
            </div>
          </dl>
        </Card>

        <div className="space-y-4">
          <Card title="Status porudžbine">
            <StatusForm id={o.id} status={o.status} />
          </Card>
          <Card title="Kupac">
            <dl className="space-y-3 text-sm">
              <Field k="Ime i prezime" v={o.customer_name} />
              <Field k="Telefon" v={<a href={`tel:${o.phone.replace(/[^\d+]/g, "")}`} className="font-semibold underline underline-offset-2">{o.phone}</a>} />
              <Field k="E-mail" v={<a href={`mailto:${o.email}`} className="underline underline-offset-2">{o.email}</a>} />
              <Field k="Adresa za dostavu" v={<>{o.street}<br />{o.postal_code} {o.city}</>} />
              <Field k="Plaćanje" v="Pouzećem" />
              {o.note && <Field k="Napomena" v={<span className="whitespace-pre-line">{o.note}</span>} />}
            </dl>
          </Card>
        </div>
      </div>
    </>
  );
}

const Field = ({ k, v }: { k: string; v: React.ReactNode }) => (
  <div>
    <dt className="text-xs font-semibold uppercase tracking-wider text-ink-soft">{k}</dt>
    <dd className="mt-0.5">{v}</dd>
  </div>
);
