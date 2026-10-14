import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { store } from "@/lib/data";
import { formatDate, formatRSD } from "@/lib/format";
import { ORDER_STATUSES, STATUS_LABEL, type OrderFilter, type OrderStatus } from "@/lib/types";
import { StatusBadge } from "@/components/admin/status-badge";

export const metadata: Metadata = { title: "Porudžbine" };

const date = (v: unknown) => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : undefined);

export default async function OrdersPage({ searchParams }: PageProps<"/admin/porudzbine">) {
  await requireAdmin();
  const sp = await searchParams;
  const filter: OrderFilter = {
    q: typeof sp.q === "string" ? sp.q.slice(0, 100) : undefined,
    status: ORDER_STATUSES.includes(sp.status as OrderStatus) ? (sp.status as OrderStatus) : undefined,
    from: date(sp.od),
    to: date(sp.do),
  };
  const orders = await store.listOrders(filter);
  const hasFilter = Boolean(filter.q || filter.status || filter.from || filter.to);

  return (
    <>
      <h1 className="text-3xl font-extrabold [font-stretch:115%] md:text-4xl">Porudžbine</h1>

      <form className="mt-6 grid gap-3 rounded-2xl bg-white p-4 ring-1 ring-line md:grid-cols-[2fr_1fr_1fr_1fr_auto]" role="search">
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-soft">Pretraga</span>
          <input name="q" defaultValue={filter.q} placeholder="Broj, ime, telefon, e-mail, grad" className="field !min-h-11" />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-soft">Status</span>
          <select name="status" defaultValue={filter.status ?? ""} className="field !min-h-11">
            <option value="">Svi statusi</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-soft">Od datuma</span>
          <input type="date" name="od" defaultValue={filter.from} className="field !min-h-11" />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-ink-soft">Do datuma</span>
          <input type="date" name="do" defaultValue={filter.to} className="field !min-h-11" />
        </label>
        <div className="flex items-end gap-2">
          <button className="btn btn-ink !min-h-11 flex-1 text-sm">Filtriraj</button>
          {hasFilter && (
            <Link href="/admin/porudzbine" className="btn btn-line !min-h-11 text-sm">
              Reset
            </Link>
          )}
        </div>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        {ORDER_STATUSES.map((s) => (
          <Link key={s} href={`/admin/porudzbine?status=${s}`} className={`rounded-full px-3 py-1.5 text-xs font-bold ring-1 ${filter.status === s ? "bg-ink text-paper ring-ink" : "bg-white ring-line hover:ring-ink"}`}>
            {STATUS_LABEL[s]}
          </Link>
        ))}
      </div>

      <p className="mt-6 text-sm text-ink-soft">{orders.length} porudžbina</p>

      {orders.length === 0 ? (
        <p className="mt-3 rounded-2xl bg-white p-10 text-center text-ink-soft ring-1 ring-line">{hasFilter ? "Nema porudžbina za izabrane filtere." : "Još nema porudžbina."}</p>
      ) : (
        <>
          {/* desktop table */}
          <div className="mt-3 hidden overflow-hidden rounded-2xl bg-white ring-1 ring-line md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-paper-2/50 text-xs uppercase tracking-wider text-ink-soft">
                <tr>
                  <th className="px-4 py-3">Broj</th>
                  <th className="px-4 py-3">Datum</th>
                  <th className="px-4 py-3">Kupac</th>
                  <th className="px-4 py-3">Telefon</th>
                  <th className="px-4 py-3">Preuzimanje</th>
                  <th className="px-4 py-3 text-right">Iznos</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {orders.map((o) => (
                  <tr key={o.id} className="relative hover:bg-ink/[0.025]">
                    <td className="px-4 py-3 font-bold">
                      <Link href={`/admin/porudzbine/${o.id}`} className="after:absolute after:inset-0">
                        {o.number}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink-soft">{formatDate(o.created_at)}</td>
                    <td className="px-4 py-3">{o.customer_name}</td>
                    <td className="whitespace-nowrap px-4 py-3">{o.phone}</td>
                    <td className="px-4 py-3">{o.delivery_method === "preuzimanje" ? "U radnji" : o.city}</td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">{formatRSD(o.total)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={o.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* mobile cards */}
          <ul className="mt-3 space-y-2 md:hidden">
            {orders.map((o) => (
              <li key={o.id}>
                <Link href={`/admin/porudzbine/${o.id}`} className="block rounded-2xl bg-white p-4 ring-1 ring-line">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold">{o.number}</p>
                    <StatusBadge status={o.status} />
                  </div>
                  <p className="mt-1 text-sm">
                    {o.customer_name} · {o.delivery_method === "preuzimanje" ? "preuzimanje u radnji" : o.city}
                  </p>
                  <div className="mt-2 flex justify-between text-sm">
                    <span className="text-ink-soft">{formatDate(o.created_at)}</span>
                    <span className="font-bold tabular-nums">{formatRSD(o.total)}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
