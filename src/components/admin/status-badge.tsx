import { STATUS_LABEL, type OrderStatus } from "@/lib/types";

const TONE: Record<OrderStatus, string> = {
  nova: "bg-berry text-white",
  u_obradi: "bg-amber-100 text-amber-900",
  poslata: "bg-sky-100 text-sky-900",
  isporucena: "bg-emerald-100 text-emerald-900",
  otkazana: "bg-ink/10 text-ink/60 line-through",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${TONE[status]}`}>{STATUS_LABEL[status]}</span>;
}
