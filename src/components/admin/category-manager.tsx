"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteCategory, reorderCategories, saveCategory, type ActionResult } from "@/app/admin/actions";
import type { Category } from "@/lib/types";
import { Card, ConfirmButton, toast } from "./ui";

export function CategoryManager({ categories, counts }: { categories: Category[]; counts: Record<string, number> }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState({ name: "", description: "" });
  const [create, setCreate] = useState({ name: "", description: "" });

  const run = (fn: () => Promise<ActionResult>, after?: () => void) =>
    start(async () => {
      const r = await fn();
      if (r.ok) {
        toast(r.message);
        after?.();
        router.refresh();
      } else toast(r.error, "error");
    });

  const move = (i: number, d: number) => {
    const ids = categories.map((c) => c.id);
    [ids[i], ids[i + d]] = [ids[i + d], ids[i]];
    run(() => reorderCategories(ids));
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
      <Card title="Kategorije">
        <p className="mb-4 text-sm text-ink-soft">Redosled određuje kako se kategorije prikazuju u prodavnici i na početnoj strani.</p>
        <ul className={`divide-y divide-line ${pending ? "opacity-60" : ""}`}>
          {categories.map((c, i) => (
            <li key={c.id} className="py-3">
              {editing === c.id ? (
                <form
                  className="grid gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    run(() => saveCategory({ id: c.id, ...draft }), () => setEditing(null));
                  }}
                >
                  <input className="field !min-h-11" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} required maxLength={80} aria-label="Naziv kategorije" />
                  <input className="field !min-h-11" value={draft.description} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} placeholder="Kratak opis" aria-label="Opis kategorije" />
                  <div className="flex gap-2">
                    <button className="btn btn-ink !min-h-10 text-sm">Sačuvaj</button>
                    <button type="button" className="btn btn-line !min-h-10 text-sm" onClick={() => setEditing(null)}>
                      Odustani
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <button type="button" disabled={i === 0 || pending} onClick={() => move(i, -1)} className="px-2 text-ink/60 hover:text-ink disabled:opacity-20" aria-label={`Pomeri ${c.name} gore`}>
                      ▲
                    </button>
                    <button type="button" disabled={i === categories.length - 1 || pending} onClick={() => move(i, 1)} className="px-2 text-ink/60 hover:text-ink disabled:opacity-20" aria-label={`Pomeri ${c.name} dole`}>
                      ▼
                    </button>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">{c.name}</p>
                    <p className="truncate text-sm text-ink-soft">
                      {counts[c.id] ?? 0} proizvoda{c.description ? ` · ${c.description}` : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(c.id);
                      setDraft({ name: c.name, description: c.description ?? "" });
                    }}
                    className="rounded-lg px-3 py-2 text-sm font-semibold ring-1 ring-line hover:ring-ink"
                  >
                    Izmeni
                  </button>
                  <ConfirmButton
                    className="rounded-lg px-3 py-2 text-sm font-semibold text-berry ring-1 ring-line hover:ring-berry"
                    title={`Obrisati kategoriju „${c.name}“?`}
                    body={counts[c.id] ? `${counts[c.id]} proizvoda će ostati bez kategorije (neće biti obrisani).` : "Kategorija nema proizvoda."}
                    onConfirm={() => run(() => deleteCategory(c.id))}
                  >
                    Obriši
                  </ConfirmButton>
                </div>
              )}
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Nova kategorija" className="lg:self-start">
        <form
          className="grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            run(() => saveCategory(create), () => setCreate({ name: "", description: "" }));
          }}
        >
          <label>
            <span className="mb-1.5 block text-sm font-semibold">Naziv *</span>
            <input className="field" required maxLength={80} value={create.name} onChange={(e) => setCreate((d) => ({ ...d, name: e.target.value }))} />
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-semibold">Opis</span>
            <input className="field" maxLength={200} value={create.description} onChange={(e) => setCreate((d) => ({ ...d, description: e.target.value }))} />
          </label>
          <button disabled={pending} className="btn btn-ink">
            Dodaj kategoriju
          </button>
        </form>
      </Card>
    </div>
  );
}
