import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { store } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { TOPIC_LABEL } from "@/lib/types";
import { InquiryDoneButton } from "@/components/admin/inquiry-done-button";

export const metadata: Metadata = { title: "Upiti" };

export default async function InquiriesPage() {
  await requireAdmin();
  const inquiries = await store.listInquiries();
  const open = inquiries.filter((i) => !i.done).length;

  return (
    <>
      <h1 className="text-3xl font-extrabold [font-stretch:115%] md:text-4xl">Upiti</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Poruke iz formulara za saradnju na stranici Kontakt. {open > 0 ? `Novih: ${open}.` : "Nema novih upita."}
      </p>

      {inquiries.length === 0 ? (
        <p className="mt-6 rounded-2xl bg-white p-10 text-center text-ink-soft ring-1 ring-line">Još nema upita.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {inquiries.map((i) => (
            <li key={i.id} className={`rounded-2xl bg-white p-5 ring-1 md:p-6 ${i.done ? "opacity-60 ring-line" : "ring-ink/20"}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${i.done ? "bg-ink/10 text-ink/60" : "bg-berry text-white"}`}>{i.done ? "Rešeno" : "Novo"}</span>
                    <span className="rounded-full bg-paper-2 px-2.5 py-1 text-xs font-bold">{TOPIC_LABEL[i.topic]}</span>
                    <span className="text-xs text-ink-soft">{formatDate(i.created_at)}</span>
                  </div>
                  <p className="mt-2 text-lg font-extrabold [font-stretch:110%]">
                    {i.name}
                    {i.company && <span className="font-semibold text-ink-soft"> · {i.company}</span>}
                  </p>
                  <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    <a href={`tel:${i.phone.replace(/[^\d+]/g, "")}`} className="font-semibold underline underline-offset-2">
                      {i.phone}
                    </a>
                    <a href={`mailto:${i.email}?subject=${encodeURIComponent("OAT BOMB – odgovor na upit")}`} className="underline underline-offset-2">
                      {i.email}
                    </a>
                  </p>
                </div>
                <InquiryDoneButton id={i.id} done={i.done} />
              </div>
              <p className="mt-4 whitespace-pre-line rounded-xl bg-paper-2/60 p-4 text-sm leading-relaxed">{i.message}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
