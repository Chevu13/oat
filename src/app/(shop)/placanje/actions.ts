"use server";

import { updateTag } from "next/cache";
import { store } from "@/lib/data";
import { CATALOG } from "@/lib/catalog";
import { shippingFor } from "@/lib/config";
import { effectivePrice } from "@/lib/format";
import { OrderError } from "@/lib/types";
import { customerSchema, fieldErrors, itemsSchema, type FieldErrors } from "@/lib/validation";

export type QuoteLine = { variant_id: string; name: string; variant: string; unit_price: number; quantity: number; stock: number; available: boolean };
export type Quote = { lines: QuoteLine[]; subtotal: number; shipping: number; total: number; issues: string[] };

/** Authoritative cart pricing from the database, shown on the checkout page before submitting. */
export async function quoteCart(raw: unknown): Promise<Quote> {
  const parsed = itemsSchema.safeParse(raw);
  if (!parsed.success) return { lines: [], subtotal: 0, shipping: 0, total: 0, issues: [] };
  const products = await store.listProducts();
  const issues: string[] = [];
  const lines: QuoteLine[] = [];
  for (const it of parsed.data) {
    const p = products.find((x) => x.variants.some((v) => v.id === it.variant_id));
    const v = p?.variants.find((x) => x.id === it.variant_id);
    if (!p || !v) {
      issues.push("Jedan proizvod iz korpe više nije u ponudi i biće uklonjen.");
      continue;
    }
    const available = v.stock >= it.quantity;
    if (!available) issues.push(v.stock === 0 ? `${p.name} je rasprodat.` : `${p.name}: na stanju je još ${v.stock} kom.`);
    lines.push({ variant_id: v.id, name: p.name, variant: v.name, unit_price: effectivePrice(v), quantity: it.quantity, stock: v.stock, available });
  }
  const subtotal = lines.reduce((s, l) => s + l.unit_price * l.quantity, 0);
  const shipping = shippingFor(subtotal);
  return { lines, subtotal, shipping, total: subtotal + shipping, issues };
}

export type PlaceOrderResult = { ok: true; id: string } | { ok: false; error: string; fields?: FieldErrors };

export async function placeOrder(form: Record<string, unknown>, items: unknown): Promise<PlaceOrderResult> {
  // Honeypot: real users never fill this hidden field.
  if (typeof form.website === "string" && form.website) return { ok: false, error: "Porudžbina nije prihvaćena." };

  const customer = customerSchema.safeParse(form);
  if (!customer.success) return { ok: false, error: "Proverite označena polja.", fields: fieldErrors(customer.error) };
  const cart = itemsSchema.safeParse(items);
  if (!cart.success) return { ok: false, error: "Korpa je prazna ili neispravna." };

  try {
    // Prices, stock and totals are computed by the store from the database, never taken from the client.
    const order = await store.placeOrder({ ...customer.data, items: cart.data });
    updateTag(CATALOG); // stock + bestsellers changed
    return { ok: true, id: order.id };
  } catch (e) {
    if (e instanceof OrderError) return { ok: false, error: e.message };
    console.error("placeOrder failed", e);
    return { ok: false, error: "Došlo je do greške. Pokušajte ponovo ili nas pozovite." };
  }
}
