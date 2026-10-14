"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteProduct, toggleProduct } from "@/app/admin/actions";
import { ConfirmButton, toast } from "./ui";

export function ProductRowActions({ id, name, active, featured }: { id: string; name: string; active: boolean; featured: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<{ ok: boolean; message?: string; error?: string }>) =>
    start(async () => {
      const r = await fn();
      toast(r.ok ? r.message! : r.error!, r.ok ? "ok" : "error");
      router.refresh();
    });

  return (
    <div className={`flex items-center gap-2 ${pending ? "opacity-50" : ""}`}>
      <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold" title="Vidljiv u prodavnici">
        <input type="checkbox" role="switch" checked={active} disabled={pending} onChange={(e) => run(() => toggleProduct(id, "is_active", e.target.checked))} className="peer sr-only" />
        <span className="relative h-6 w-11 rounded-full bg-ink/20 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-ok peer-checked:after:translate-x-5 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink" />
        <span className="hidden lg:inline">Aktivan</span>
      </label>
      <button
        type="button"
        disabled={pending}
        onClick={() => run(() => toggleProduct(id, "is_featured", !featured))}
        className={`grid h-9 w-9 place-items-center rounded-lg text-lg ring-1 ring-line ${featured ? "bg-amber-100 text-amber-700" : "text-ink/30 hover:text-ink"}`}
        aria-label={featured ? "Ukloni iz istaknutih" : "Označi kao istaknut"}
        aria-pressed={featured}
      >
        ★
      </button>
      <Link href={`/admin/proizvodi/${id}`} className="rounded-lg px-3 py-2 text-sm font-semibold ring-1 ring-line hover:ring-ink">
        Izmeni
      </Link>
      <ConfirmButton
        className="rounded-lg px-3 py-2 text-sm font-semibold text-berry ring-1 ring-line hover:ring-berry"
        title={`Obrisati „${name}“?`}
        body="Proizvod će biti trajno uklonjen iz prodavnice. Postojeće porudžbine ostaju sačuvane. Ako želite samo privremeno da ga sakrijete, isključite ga."
        onConfirm={() => run(() => deleteProduct(id))}
      >
        Obriši
      </ConfirmButton>
    </div>
  );
}
