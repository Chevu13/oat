import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { store } from "@/lib/data";
import { formatDate, formatRSD } from "@/lib/format";
import { Card } from "@/components/admin/ui";
import { StatusBadge } from "@/components/admin/status-badge";

export default async function Dashboard() {
  await requireAdmin();
  const [s, products] = await Promise.all([store.dashboard(), store.listProducts({ includeInactive: true })]);
  const incomplete = products.filter((p) => p.missing_info.length > 0);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ink-soft">Dobro došli 👋</p>
          <h1 className="text-3xl font-extrabold [font-stretch:115%] md:text-4xl">Pregled prodavnice</h1>
        </div>
        <Link href="/admin/proizvodi/novi" className="btn btn-ink !min-h-11 text-sm">
          + Novi proizvod
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="Ukupno porudžbina" value={String(s.totalOrders)} />
        <Kpi label="Nove porudžbine" value={String(s.newOrders)} highlight={s.newOrders > 0} href="/admin/porudzbine?status=nova" />
        <Kpi label="Vrednost porudžbina" value={formatRSD(s.totalValue)} hint="bez otkazanih" />
        <Kpi label="Aktivni proizvodi" value={`${products.filter((p) => p.is_active).length} / ${products.length}`} href="/admin/proizvodi" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Card title="Poslednje porudžbine" action={<Link href="/admin/porudzbine" className="text-sm font-semibold underline underline-offset-4">Sve porudžbine</Link>}>
          {s.recentOrders.length === 0 ? (
            <Empty text="Još nema porudžbina. Napravite test porudžbinu u prodavnici." />
          ) : (
            <ul className="divide-y divide-line">
              {s.recentOrders.map((o) => (
                <li key={o.id}>
                  <Link href={`/admin/porudzbine/${o.id}`} className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-3 hover:bg-ink/[0.03]">
                    <div className="min-w-0">
                      <p className="font-bold">
                        {o.number} <span className="font-normal text-ink-soft">· {o.customer_name}</span>
                      </p>
                      <p className="text-xs text-ink-soft">
                        {formatDate(o.created_at)} · {o.city}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="hidden font-semibold tabular-nums sm:inline">{formatRSD(o.total)}</span>
                      <StatusBadge status={o.status} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="space-y-4">
          <Card title="Najprodavanije">
            {s.bestsellers.length === 0 ? (
              <Empty text="Prikazaće se nakon prvih porudžbina." />
            ) : (
              <ol className="space-y-3">
                {s.bestsellers.map((b, i) => (
                  <li key={b.product_name} className="flex items-center gap-3">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-ink text-xs font-bold text-paper">{i + 1}</span>
                    <span className="flex-1 font-semibold">{b.product_name}</span>
                    <span className="text-sm text-ink-soft">{b.quantity} kom</span>
                  </li>
                ))}
              </ol>
            )}
          </Card>
          <Card title="Nisko stanje">
            {s.lowStock.length === 0 ? (
              <Empty text="Svi proizvodi imaju dovoljno zaliha." />
            ) : (
              <ul className="space-y-2">
                {s.lowStock.map((l) => (
                  <li key={l.product_id + l.variant_name}>
                    <Link href={`/admin/proizvodi/${l.product_id}`} className="flex items-center justify-between gap-3 rounded-lg hover:underline">
                      <span className="text-sm font-semibold">
                        {l.product_name}
                        {l.variant_name !== "Standardna čaša" && <span className="text-ink-soft"> · {l.variant_name}</span>}
                      </span>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${l.stock === 0 ? "bg-berry text-white" : "bg-amber-100 text-amber-900"}`}>{l.stock === 0 ? "Rasprodato" : `${l.stock} kom`}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      {incomplete.length > 0 && (
        <Card className="mt-4 bg-amber-50 ring-amber-200" title={`Podaci koje treba dopuniti pre lansiranja (${incomplete.length} proizvoda)`}>
          <p className="text-sm text-ink-soft">
            Cene su trenutno demo vrednosti, a sastav, alergeni i gramaža nisu javno dostupni. Otvorite proizvod, unesite podatke i uklonite oznaku kada je informacija potvrđena.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {incomplete.map((p) => (
              <Link key={p.id} href={`/admin/proizvodi/${p.id}`} className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold ring-1 ring-amber-200 hover:ring-ink">
                {p.name} <span className="text-amber-700">· {p.missing_info.length}</span>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </>
  );
}

function Kpi({ label, value, hint, highlight, href }: { label: string; value: string; hint?: string; highlight?: boolean; href?: string }) {
  const body = (
    <div className={`h-full rounded-2xl p-4 ring-1 md:p-5 ${highlight ? "bg-ink text-paper ring-ink" : "bg-white ring-line"}`}>
      <p className={`text-xs font-semibold uppercase tracking-wider ${highlight ? "text-paper/70" : "text-ink-soft"}`}>{label}</p>
      <p className="mt-2 text-2xl font-extrabold tabular-nums [font-stretch:110%] md:text-3xl">{value}</p>
      {hint && <p className="mt-1 text-xs opacity-60">{hint}</p>}
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

const Empty = ({ text }: { text: string }) => <p className="rounded-xl bg-paper-2/60 p-4 text-sm text-ink-soft">{text}</p>;
