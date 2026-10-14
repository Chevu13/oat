"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useCart } from "@/components/cart/cart-context";
import { ArrowIcon, CheckIcon } from "@/components/ui/icons";
import { formatRSD } from "@/lib/format";
import { customerSchema, fieldErrors, type FieldErrors } from "@/lib/validation";
import { placeOrder, quoteCart, type Quote } from "@/app/(shop)/placanje/actions";

type Field = keyof FieldErrors;
const FIELDS: { name: Field; label: string; type?: string; autoComplete: string; inputMode?: "tel" | "numeric" | "email"; half?: boolean; placeholder?: string }[] = [
  { name: "customer_name", label: "Ime i prezime", autoComplete: "name", placeholder: "Marko Marković" },
  { name: "email", label: "E-mail", type: "email", autoComplete: "email", inputMode: "email", half: true, placeholder: "ime@primer.rs" },
  { name: "phone", label: "Telefon", type: "tel", autoComplete: "tel", inputMode: "tel", half: true, placeholder: "06x xxx xxxx" },
  { name: "street", label: "Ulica i broj", autoComplete: "street-address", placeholder: "Knez Mihailova 1, stan 4" },
  { name: "city", label: "Grad", autoComplete: "address-level2", half: true, placeholder: "Beograd" },
  { name: "postal_code", label: "Poštanski broj", autoComplete: "postal-code", inputMode: "numeric", half: true, placeholder: "11000" },
];

export function CheckoutForm() {
  const { lines, ready, clear, remove, setOpen } = useCart();
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>({ customer_name: "", email: "", phone: "", street: "", city: "", postal_code: "", note: "", payment_method: "pouzece", website: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [pending, start] = useTransition();
  const [placed, setPlaced] = useState(false);

  const items = lines.map((l) => ({ variant_id: l.variantId, quantity: l.qty }));
  const itemsKey = JSON.stringify(items);

  // Re-price the cart on the server whenever it changes.
  useEffect(() => {
    if (!ready || !items.length) return;
    let live = true;
    quoteCart(JSON.parse(itemsKey)).then((q) => {
      if (!live) return;
      setQuote(q);
      // Drop lines for products that no longer exist.
      for (const it of JSON.parse(itemsKey) as { variant_id: string }[]) if (!q.lines.some((l) => l.variant_id === it.variant_id)) remove(it.variant_id);
    });
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- itemsKey captures items
  }, [itemsKey, ready, remove]);

  const validateField = (name: Field, value: string) => {
    const r = customerSchema.shape[name].safeParse(value);
    setErrors((e) => ({ ...e, [name]: r.success ? undefined : r.error.issues[0]?.message }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const parsed = customerSchema.safeParse(values);
    if (!parsed.success) {
      const fe = fieldErrors(parsed.error);
      setErrors(fe);
      document.getElementsByName(Object.keys(fe)[0])[0]?.focus();
      return;
    }
    if (!accepted) return setFormError("Potrebno je da prihvatite uslove korišćenja.");
    start(async () => {
      const res = await placeOrder(values, items);
      if (res.ok) {
        setPlaced(true);
        clear();
        router.push(`/porudzbina/${res.id}`);
      } else {
        setFormError(res.error);
        if (res.fields) setErrors(res.fields);
        quoteCart(items).then(setQuote);
      }
    });
  };

  if (!ready) return <div className="h-96 animate-pulse rounded-3xl bg-paper-2" />;

  if (!lines.length && !placed)
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <p className="hand text-5xl">Korpa je prazna</p>
        <p className="mt-3 text-ink-soft">Dodaj bar jedan ukus da bi nastavio na plaćanje.</p>
        <Link href="/prodavnica" className="btn btn-ink mt-6">
          Idi u prodavnicu <ArrowIcon />
        </Link>
      </div>
    );

  const blocked = quote?.lines.some((l) => !l.available) ?? false;
  const total = quote?.total;

  return (
    <form onSubmit={submit} noValidate className="grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-14">
      <div className="space-y-10">
        <fieldset>
          <legend className="display mb-5 flex items-center gap-3 text-2xl md:text-3xl">
            <Step n={1} /> Podaci za dostavu
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            {FIELDS.map((f) => (
              <label key={f.name} className={f.half ? "" : "sm:col-span-2"}>
                <span className="mb-1.5 block text-sm font-semibold">
                  {f.label} <span className="text-berry">*</span>
                </span>
                <input
                  name={f.name}
                  type={f.type ?? "text"}
                  autoComplete={f.autoComplete}
                  inputMode={f.inputMode}
                  placeholder={f.placeholder}
                  value={values[f.name] ?? ""}
                  onChange={(e) => {
                    setValues((v) => ({ ...v, [f.name]: e.target.value }));
                    if (errors[f.name]) validateField(f.name, e.target.value);
                  }}
                  onBlur={(e) => e.target.value && validateField(f.name, e.target.value)}
                  aria-invalid={Boolean(errors[f.name])}
                  aria-describedby={errors[f.name] ? `${f.name}-err` : undefined}
                  required
                  className="field"
                />
                {errors[f.name] && (
                  <span id={`${f.name}-err`} className="mt-1.5 block text-sm font-medium text-berry">
                    {errors[f.name]}
                  </span>
                )}
              </label>
            ))}
            <label className="sm:col-span-2">
              <span className="mb-1.5 block text-sm font-semibold">Napomena za dostavu</span>
              <textarea
                name="note"
                rows={3}
                maxLength={1000}
                placeholder="Sprat, interfon, vreme kada ste kod kuće…"
                value={values.note}
                onChange={(e) => setValues((v) => ({ ...v, note: e.target.value }))}
                className="field resize-y"
              />
            </label>
            {/* honeypot */}
            <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" value={values.website} onChange={(e) => setValues((v) => ({ ...v, website: e.target.value }))} />
          </div>
        </fieldset>

        <fieldset>
          <legend className="display mb-5 flex items-center gap-3 text-2xl md:text-3xl">
            <Step n={2} /> Plaćanje
          </legend>
          <label className="flex cursor-pointer items-start gap-4 rounded-2xl border-2 border-ink bg-white/70 p-5">
            <input type="radio" name="payment_method" value="pouzece" checked readOnly className="mt-1 h-5 w-5 accent-ink" />
            <span>
              <span className="block font-bold">Plaćanje pouzećem</span>
              <span className="mt-1 block text-sm text-ink-soft">Plaćate gotovinom kuriru prilikom preuzimanja. Bez kartica, bez rizika.</span>
            </span>
          </label>
        </fieldset>
      </div>

      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-[1.75rem] bg-white/70 p-5 ring-1 ring-line md:p-7">
          <h2 className="display flex items-center gap-3 text-2xl">
            <Step n={3} /> Porudžbina
          </h2>
          <ul className="mt-5 divide-y divide-line">
            {lines.map((l) => {
              const q = quote?.lines.find((x) => x.variant_id === l.variantId);
              return (
                <li key={l.variantId} className="flex items-center gap-3 py-3">
                  <div className="relative h-16 w-13 shrink-0 overflow-hidden rounded-lg" style={{ background: l.accent }}>
                    <Image src={l.image} alt="" fill sizes="52px" className="object-cover" />
                    <span className="absolute -right-0 -top-0 grid h-5 min-w-5 place-items-center rounded-bl-lg bg-ink px-1 text-[0.7rem] font-bold text-paper">{l.qty}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{l.name}</p>
                    <p className="text-xs text-ink-soft">{l.variantName}</p>
                    {q && !q.available && <p className="text-xs font-semibold text-berry">{q.stock === 0 ? "Rasprodato" : `Dostupno: ${q.stock} kom`}</p>}
                  </div>
                  <p className="text-sm font-semibold tabular-nums">{q ? formatRSD(q.unit_price * q.quantity) : "…"}</p>
                </li>
              );
            })}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
            <Row k="Međuzbir" v={quote ? formatRSD(quote.subtotal) : "…"} />
            <Row k="Dostava" v={quote ? (quote.shipping === 0 ? "Besplatna" : formatRSD(quote.shipping)) : "…"} />
            <div className="flex justify-between pt-2 text-xl font-extrabold">
              <dt>Ukupno</dt>
              <dd className="tabular-nums">{total != null ? formatRSD(total) : "…"}</dd>
            </div>
          </dl>

          {quote?.issues.length ? (
            <ul className="mt-4 space-y-1 rounded-xl bg-berry/10 p-3 text-sm font-medium text-berry" role="alert">
              {quote.issues.map((i) => (
                <li key={i}>{i}</li>
              ))}
              <li className="text-ink-soft">
                Prilagodite količine u korpi da biste nastavili.{" "}
                <button type="button" onClick={() => setOpen(true)} className="font-bold text-ink underline underline-offset-2">
                  Izmeni korpu
                </button>
              </li>
            </ul>
          ) : null}

          <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm">
            <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-ink" />
            <span>
              Prihvatam{" "}
              <Link href="/uslovi" target="_blank" className="underline underline-offset-2">
                uslove korišćenja
              </Link>{" "}
              i{" "}
              <Link href="/privatnost" target="_blank" className="underline underline-offset-2">
                politiku privatnosti
              </Link>
              .
            </span>
          </label>

          {formError && (
            <p role="alert" className="mt-4 rounded-xl bg-berry/10 p-3 text-sm font-semibold text-berry">
              {formError}
            </p>
          )}

          <button type="submit" disabled={pending || blocked || !quote} className="btn btn-ink mt-5 w-full text-base">
            {pending ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-paper/30 border-t-paper" /> Šaljemo porudžbinu…
              </>
            ) : (
              <>
                <CheckIcon /> Poruči{total != null ? ` · ${formatRSD(total)}` : ""}
              </>
            )}
          </button>
          <p className="mt-3 text-center text-xs text-ink-soft">Cene i dostupnost se proveravaju na serveru u trenutku porudžbine.</p>
        </div>
      </aside>
    </form>
  );
}

const Step = ({ n }: { n: number }) => <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-base text-paper [font-stretch:100%]">{n}</span>;
const Row = ({ k, v }: { k: string; v: string }) => (
  <div className="flex justify-between">
    <dt className="text-ink-soft">{k}</dt>
    <dd className="tabular-nums">{v}</dd>
  </div>
);
