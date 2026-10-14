import type { Metadata } from "next";
import { PageShell } from "@/components/site/page-shell";
import { JsonLd } from "@/components/site/json-ld";
import { site } from "@/lib/config";

export const metadata: Metadata = {
  title: "Česta pitanja",
  description: "Odgovori na najčešća pitanja o OAT BOMB proteinskim ovsenim kašama: ukusi, porudžbina, plaćanje pouzećem, posna varijanta, mini kaše i saradnja.",
  alternates: { canonical: "/cesta-pitanja" },
};

const faq = [
  ["Šta je OAT BOMB?", "OAT BOMB je brend proteinskih ovsenih kaša u čaši. Svaka kaša je slojevita: proteinska ovsena baza, sloj voća, krema ili čokolade i toping na vrhu."],
  ["Koje ukuse imate?", "Choco Raspberry, Nutella, Snickers, Čoko bananica, Tiramisu, Cheesecake, Bounty, Pistachio, Blueberry, Raspberry, Cherry i Posna. Imamo i mini kaše za događaje."],
  ["Kako da poručim?", `Izaberi ukuse u prodavnici, dodaj ih u korpu i završi porudžbinu. Možeš poručiti i telefonom na ${site.phone}.`],
  ["Kako se plaća?", "Plaćanje je pouzećem: gotovinom kuriru prilikom preuzimanja porudžbine."],
  ["Da li imate posnu kašu?", "Da. Posna ovsena kaša je u ponudi pod nazivom Posna."],
  ["Da li kaše sadrže alergene?", `Detaljan sastav i alergene uskoro objavljujemo za svaki ukus. Ako imaš alergiju, pozovi nas na ${site.phone} pre porudžbine.`],
  ["Da li pravite kaše za događaje?", "Da, u ponudi imamo mini kaše za sve vrste događaja: rođendane, proslave, poslovne sastanke i ketering."],
  ["Mogu li da prodajem OAT BOMB u svom objektu?", "Možeš. Ako želiš OAT BOMB kaše u svom kafiću, teretani ili prodavnici, javi nam se za saradnju."],
];

export default function FaqPage() {
  return (
    <PageShell title="Pitanja" eyebrow="Česta pitanja" href="/cesta-pitanja" intro="Sve što te zanima o OAT BOMB kašama, na jednom mestu.">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
        }}
      />
      <div className="max-w-3xl divide-y divide-line border-y border-line">
        {faq.map(([q, a], i) => (
          <details key={q} className="group" open={i === 0}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-xl font-extrabold [font-stretch:112%] [&::-webkit-details-marker]:hidden">
              {q}
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-[1.5px] border-ink text-xl transition-transform duration-300 group-open:rotate-45" aria-hidden>
                +
              </span>
            </summary>
            <p className="pb-6 pr-14 text-lg leading-relaxed text-ink-soft">{a}</p>
          </details>
        ))}
      </div>
    </PageShell>
  );
}
