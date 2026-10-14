"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { deleteProduct, saveProduct, uploadImages } from "@/app/admin/actions";
import { formatRSD, onAccent, slugify } from "@/lib/format";
import type { Category, Product } from "@/lib/types";
import { Card, ConfirmButton, toast } from "./ui";

type V = { id?: string; name: string; price: string; sale_price: string };
const KNOWN_MISSING = ["Zvanična cena", "Gramaža", "Sastojci", "Alergeni", "Nutritivne vrednosti"];

export function ProductForm({ product, categories }: { product?: Product; categories: Category[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [f, setF] = useState({
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    tagline: product?.tagline ?? "",
    description: product?.description ?? "",
    category_id: product?.category_id ?? categories[0]?.id ?? "",
    accent: product?.accent ?? "#6b2a2e",
    ingredients: product?.ingredients ?? "",
    allergens: product?.allergens ?? "",
    weight: product?.weight ?? "",
    is_active: product?.is_active ?? true,
    is_featured: product?.is_featured ?? false,
    sort: String(product?.sort ?? 100),
  });
  const [slugTouched, setSlugTouched] = useState(Boolean(product));
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [missing, setMissing] = useState<string[]>(product?.missing_info ?? KNOWN_MISSING);
  const [variants, setVariants] = useState<V[]>(
    product?.variants.map((v) => ({ id: v.id, name: v.name, price: String(v.price), sale_price: v.sale_price == null ? "" : String(v.sale_price) })) ?? [
      { name: "Standardna čaša", price: "", sale_price: "" },
    ],
  );

  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((x) => ({ ...x, [k]: v }));
  const setV = (i: number, patch: Partial<V>) => setVariants((vs) => vs.map((v, j) => (j === i ? { ...v, ...patch } : v)));
  const move = (i: number, d: number) =>
    setImages((im) => {
      const n = [...im];
      const j = i + d;
      if (j < 0 || j >= n.length) return im;
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const fd = new FormData();
    for (const file of Array.from(files)) fd.append("files", file);
    setUploading(true);
    const r = await uploadImages(fd);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
    if (r.ok) {
      setImages((im) => [...im, ...r.urls]);
      toast(`Otpremljeno slika: ${r.urls.length}. Sačuvajte proizvod da bi bile vidljive.`);
    } else toast(r.error, "error");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    start(async () => {
      const r = await saveProduct({
        id: product?.id,
        ...f,
        slug: f.slug || slugify(f.name),
        sort: Number(f.sort),
        images,
        missing_info: missing,
        variants: variants.map((v) => ({
          id: v.id,
          name: v.name,
          price: v.price === "" ? NaN : Number(v.price),
          sale_price: v.sale_price === "" ? null : Number(v.sale_price),
        })),
      });
      if (!r.ok) return toast(r.error, "error");
      toast(r.message);
      if (!product && r.id) router.push(`/admin/proizvodi/${r.id}`);
      else router.refresh();
    });
  };

  return (
    <form onSubmit={submit} className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
      <div className="space-y-4">
        <Card title="Osnovno">
          <div className="grid gap-4">
            <L label="Naziv proizvoda *">
              <input
                className="field"
                required
                maxLength={120}
                value={f.name}
                onChange={(e) => {
                  set("name", e.target.value);
                  if (!slugTouched) set("slug", slugify(e.target.value));
                }}
              />
            </L>
            <L label="URL adresa (slug)" hint={`/proizvod/${f.slug || slugify(f.name) || "…"}`}>
              <input
                className="field"
                value={f.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  set("slug", e.target.value);
                }}
              />
            </L>
            <L label="Kratak slogan" hint="Prikazuje se ispod naziva, rukopisnim slovima.">
              <input className="field" maxLength={160} value={f.tagline} onChange={(e) => set("tagline", e.target.value)} />
            </L>
            <L label="Opis">
              <textarea className="field min-h-32 resize-y" maxLength={4000} value={f.description} onChange={(e) => set("description", e.target.value)} />
            </L>
          </div>
        </Card>

        <Card title="Cene i varijante" action={<button type="button" onClick={() => setVariants((v) => [...v, { name: "", price: "", sale_price: "" }])} className="text-sm font-semibold underline underline-offset-4">+ Dodaj varijantu</button>}>
          <p className="mb-4 text-sm text-ink-soft">Za proizvod sa jednom cenom ostavite jednu varijantu. Akcijska cena je opciona i mora biti manja od redovne.</p>
          <div className="space-y-3">
            {variants.map((v, i) => (
              <div key={v.id ?? `new-${i}`} className="grid grid-cols-2 gap-3 rounded-xl bg-paper-2/40 p-3 sm:grid-cols-[1.4fr_1fr_1fr_auto] sm:items-end">
                <L label="Naziv varijante" className="col-span-2 sm:col-span-1">
                  <input className="field !min-h-11" required value={v.name} onChange={(e) => setV(i, { name: e.target.value })} />
                </L>
                <L label="Cena (RSD) *">
                  <input className="field !min-h-11" required inputMode="numeric" type="number" min={0} step={1} value={v.price} onChange={(e) => setV(i, { price: e.target.value })} />
                </L>
                <L label="Akcijska cena">
                  <input className="field !min-h-11" inputMode="numeric" type="number" min={0} step={1} placeholder="—" value={v.sale_price} onChange={(e) => setV(i, { sale_price: e.target.value })} />
                </L>
                <button
                  type="button"
                  disabled={variants.length === 1}
                  onClick={() => setVariants((vs) => vs.filter((_, j) => j !== i))}
                  className="h-11 rounded-lg px-3 text-sm font-semibold text-berry ring-1 ring-line hover:ring-berry disabled:opacity-30"
                  aria-label={`Ukloni varijantu ${v.name}`}
                >
                  Ukloni
                </button>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Slike">
          <p className="mb-4 text-sm text-ink-soft">Prva slika je glavna (prikazuje se na kartici). JPG, PNG, WEBP do 5 MB.</p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {images.map((src, i) => (
              <div key={src + i} className="group relative aspect-[4/5] overflow-hidden rounded-xl bg-paper-2 ring-1 ring-line">
                <Image src={src} alt="" fill sizes="160px" className="object-cover" />
                {i === 0 && <span className="absolute left-2 top-2 rounded-full bg-ink px-2 py-0.5 text-[0.65rem] font-bold text-paper">Glavna</span>}
                <div className="absolute inset-x-1 bottom-1 flex justify-between gap-1">
                  <div className="flex gap-1">
                    <IconBtn label="Pomeri levo" onClick={() => move(i, -1)} disabled={i === 0}>←</IconBtn>
                    <IconBtn label="Pomeri desno" onClick={() => move(i, 1)} disabled={i === images.length - 1}>→</IconBtn>
                  </div>
                  <IconBtn label="Ukloni sliku" onClick={() => setImages((im) => im.filter((_, j) => j !== i))} danger>
                    ✕
                  </IconBtn>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="grid aspect-[4/5] place-items-center rounded-xl border-2 border-dashed border-ink/20 text-sm font-semibold text-ink-soft hover:border-ink hover:text-ink"
            >
              {uploading ? "Otpremanje…" : "+ Dodaj slike"}
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
        </Card>

        <Card title="Sastav i informacije">
          <div className="grid gap-4">
            <L label="Gramaža / neto količina">
              <input className="field" placeholder="npr. 350 g" value={f.weight} onChange={(e) => set("weight", e.target.value)} />
            </L>
            <L label="Sastojci">
              <textarea className="field min-h-24 resize-y" value={f.ingredients} onChange={(e) => set("ingredients", e.target.value)} />
            </L>
            <L label="Alergeni">
              <input className="field" placeholder="npr. mleko, orašasti plodovi, gluten" value={f.allergens} onChange={(e) => set("allergens", e.target.value)} />
            </L>
          </div>
        </Card>
      </div>

      <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
        <Card title="Objavljivanje">
          <div className="space-y-3">
            <Toggle label="Aktivan (vidljiv u prodavnici)" checked={f.is_active} onChange={(v) => set("is_active", v)} />
            <Toggle label="Istaknut (najprodavanije / ukusi)" checked={f.is_featured} onChange={(v) => set("is_featured", v)} />
          </div>
          <button disabled={pending || uploading} className="btn btn-ink mt-5 w-full">
            {pending ? "Čuvanje…" : product ? "Sačuvaj izmene" : "Kreiraj proizvod"}
          </button>
          {product && (
            <Link href={`/proizvod/${product.slug}`} target="_blank" className="mt-3 block text-center text-sm font-semibold underline underline-offset-4">
              Pogledaj u prodavnici ↗
            </Link>
          )}
        </Card>

        <Card title="Organizacija">
          <div className="grid gap-4">
            <L label="Kategorija">
              <select className="field" value={f.category_id} onChange={(e) => set("category_id", e.target.value)}>
                <option value="">Bez kategorije</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </L>
            <L label="Boja ukusa" hint="Koristi se za pozadine i dugmad ovog proizvoda.">
              <div className="flex items-center gap-3">
                <input type="color" value={f.accent} onChange={(e) => set("accent", e.target.value)} className="h-12 w-16 cursor-pointer rounded-lg border-0 bg-transparent" />
                <span className="rounded-full px-4 py-2 text-sm font-bold" style={{ background: f.accent, color: onAccent(f.accent) }}>
                  {f.name || "Pregled"}
                </span>
              </div>
            </L>
            <L label="Redosled prikaza" hint="Manji broj = ranije u listi.">
              <input className="field" type="number" min={0} value={f.sort} onChange={(e) => set("sort", e.target.value)} />
            </L>
          </div>
        </Card>

        <Card title="Nedostajući podaci" className="bg-amber-50 ring-amber-200">
          <p className="mb-3 text-sm text-ink-soft">Označite šta još nije potvrđeno. Kada unesete i proverite podatak, uklonite oznaku.</p>
          <div className="flex flex-wrap gap-2">
            {KNOWN_MISSING.map((m) => {
              const on = missing.includes(m);
              return (
                <button
                  key={m}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setMissing((x) => (on ? x.filter((y) => y !== m) : [...x, m]))}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold ring-1 ${on ? "bg-amber-200 text-amber-950 ring-amber-300" : "bg-white text-ink/40 ring-line line-through"}`}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </Card>

        {product && (
          <Card title="Opasna zona">
            <ConfirmButton
              className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-berry ring-1 ring-berry/40 hover:bg-berry hover:text-white"
              title={`Obrisati „${product.name}“?`}
              body="Proizvod će biti trajno uklonjen. Postojeće porudžbine ostaju sačuvane."
              onConfirm={async () => {
                const r = await deleteProduct(product.id);
                if (r.ok) {
                  toast(r.message);
                  router.push("/admin/proizvodi");
                } else toast(r.error, "error");
              }}
            >
              Obriši proizvod
            </ConfirmButton>
          </Card>
        )}

        {variants.some((v) => v.price) && (
          <p className="px-1 text-xs text-ink-soft">
            Cena u prodavnici: od {formatRSD(Math.min(...variants.filter((v) => v.price).map((v) => Number(v.sale_price || v.price))))}
          </p>
        )}
      </div>
    </form>
  );
}

function L({ label, hint, children, className = "" }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-semibold">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-soft">{hint}</span>}
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 text-sm font-semibold">
      {label}
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span className="relative h-6 w-11 shrink-0 rounded-full bg-ink/20 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-ok peer-checked:after:translate-x-5 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink" />
    </label>
  );
}

function IconBtn({ children, label, onClick, disabled, danger }: { children: React.ReactNode; label: string; onClick: () => void; disabled?: boolean; danger?: boolean }) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} disabled={disabled} className={`grid h-7 w-7 place-items-center rounded-md bg-white/95 text-xs font-bold shadow disabled:opacity-30 ${danger ? "text-berry" : ""}`}>
      {children}
    </button>
  );
}
