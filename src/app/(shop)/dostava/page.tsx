import type { Metadata } from "next";
import { PageShell, Placeholder, Prose } from "@/components/site/page-shell";
import { DELIVERY_FEE, FREE_DELIVERY_FROM, site } from "@/lib/config";
import { formatRSD } from "@/lib/format";

export const metadata: Metadata = {
  title: "Dostava i plaćanje",
  description: "Kako funkcioniše dostava OAT BOMB proteinskih kaša i plaćanje pouzećem.",
  alternates: { canonical: "/dostava" },
};

const steps = [
  ["Poruči", "Izaberi ukuse, dodaj ih u korpu i popuni podatke za dostavu."],
  ["Potvrda", "Javljamo ti se na telefon radi potvrde porudžbine i termina dostave."],
  ["Plati pouzećem", "Plaćaš gotovinom kuriru u trenutku preuzimanja."],
];

export default function DeliveryPage() {
  return (
    <PageShell title="Dostava" eyebrow="Dostava i plaćanje" href="/dostava" intro="Poručiš online, mi potvrdimo telefonom, ti platiš kada kaša stigne.">
      <ol className="mb-16 grid gap-4 md:grid-cols-3">
        {steps.map(([t, d], i) => (
          <li key={t} className="rounded-[1.5rem] bg-white/70 p-6 ring-1 ring-line">
            <p className="display text-5xl text-ink/25">0{i + 1}</p>
            <p className="mt-3 text-xl font-extrabold uppercase [font-stretch:118%]">{t}</p>
            <p className="mt-1 text-ink-soft">{d}</p>
          </li>
        ))}
      </ol>
      <Prose>
        <h2>Cena dostave</h2>
        <p>
          Dostava se naplaćuje {formatRSD(DELIVERY_FEE)}. Za porudžbine preko {formatRSD(FREE_DELIVERY_FROM)} dostava je besplatna.{" "}
          <Placeholder>iznose potvrđuje klijent</Placeholder>
        </p>
        <h2>Područje i rok dostave</h2>
        <p>
          <Placeholder>Gradovi/zone dostave, rok isporuke i radni dani — čeka potvrdu klijenta.</Placeholder>
        </p>
        <h2>Čuvanje</h2>
        <p>
          <Placeholder>Uputstvo za čuvanje i rok trajanja — čeka potvrdu klijenta.</Placeholder>
        </p>
        <h2>Plaćanje</h2>
        <p>Trenutno je dostupno isključivo plaćanje pouzećem. Kartice se ne naplaćuju online.</p>
        <h2>Veće porudžbine i događaji</h2>
        <p>Za mini kaše za događaje i porudžbine za objekte pozovite nas na {site.phone} radi dogovora o terminu i količini.</p>
      </Prose>
    </PageShell>
  );
}
