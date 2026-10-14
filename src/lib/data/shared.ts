import type { DashboardStats, Order, OrderFilter } from "@/lib/types";

// ponytail: aggregates in JS over all orders; move to SQL views once order volume is in the tens of thousands.
export function computeDashboard(orders: Order[]): DashboardStats {
  const live = orders.filter((o) => o.status !== "otkazana");
  const sales = new Map<string, { product_name: string; quantity: number; revenue: number }>();
  for (const o of live)
    for (const i of o.items) {
      const key = i.product_id ?? i.product_name;
      const s = sales.get(key) ?? { product_name: i.product_name, quantity: 0, revenue: 0 };
      s.quantity += i.quantity;
      s.revenue += i.line_total;
      sales.set(key, s);
    }
  return {
    totalOrders: orders.length,
    newOrders: orders.filter((o) => o.status === "nova").length,
    totalValue: live.reduce((s, o) => s + o.total, 0),
    recentOrders: [...orders].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 6),
    bestsellers: [...sales.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 5),
  };
}

export function bestsellersFrom(orders: Order[], limit: number) {
  const qty = new Map<string, number>();
  for (const o of orders)
    if (o.status !== "otkazana")
      for (const i of o.items) if (i.product_id) qty.set(i.product_id, (qty.get(i.product_id) ?? 0) + i.quantity);
  return [...qty.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([id]) => id);
}

const dayFmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Belgrade" });
/** YYYY-MM-DD in shop-local time, so date filters match what the owner sees. */
export const belgradeDay = (iso: string) => dayFmt.format(new Date(iso));

export function matchesFilter(o: Order, f: OrderFilter) {
  if (f.status && o.status !== f.status) return false;
  const day = belgradeDay(o.created_at);
  if (f.from && day < f.from) return false;
  if (f.to && day > f.to) return false;
  if (f.q) {
    const q = f.q.toLowerCase();
    if (![o.number, o.customer_name, o.email, o.phone, o.city].some((s) => s.toLowerCase().includes(q))) return false;
  }
  return true;
}
