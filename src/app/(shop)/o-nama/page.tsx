import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageShell } from "@/components/site/page-shell";
import { Reveal } from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "O nama",
  description: "OAT BOMB pravi slojevite proteinske ovsene kaše sa karakterom: od Choco Raspberry do Pistachio. Upoznaj priču iza brenda.",
  alternates: { canonical: "/o-nama" },
};

export default function AboutPage() {
  return (
    <PageShell
      title="O nama"
      eyebrow="Priča iza čaše"
      href="/o-nama"
      wide
      intro={
        <>
          <span className="hand block text-3xl text-ink">Spoj ukusa i snage.</span>
          OAT BOMB je nastao sa jednim ciljem: da obrok koji je dobar za tebe bude i nešto čemu se raduješ. Zato pravimo proteinske ovsene kaše koje izgledaju i imaju ukus kao desert.
        </>
      }
    >
      <div className="grid gap-6 md:grid-cols-12">
        <Reveal className="relative aspect-square overflow-hidden rounded-[2rem] md:col-span-7">
          <Image src="/images/lifestyle/lineup-four.jpg" alt="Četiri OAT BOMB kaše na drvenom stolu" fill sizes="(min-width:768px) 58vw, 100vw" className="object-cover" />
        </Reveal>
        <Reveal delay={0.08} className="flex flex-col justify-end rounded-[2rem] bg-ink p-8 text-paper md:col-span-5 md:p-10">
          <p className="display text-4xl sm:text-5xl md:text-6xl">Zaboravi klasične opcije.</p>
          <p className="mt-5 text-paper/75">
            Svaka OAT BOMB kaša se slaže u slojevima: proteinska ovsena baza, sloj voća, krema ili čokolade, i toping koji daje završni udarac. Rezultat je obrok koji te zasiti, a ne dosadi.
          </p>
        </Reveal>
      </div>

      <div className="mt-24 grid gap-12 md:grid-cols-3">
        {[
          { n: "12", t: "ukusa", d: "Od čokoladnih i voćnih, do desertnih i posne varijante. Uvek postoji ukus za tvoje raspoloženje." },
          { n: "1.", t: "rođendan", d: "Prvi rođendan smo proslavili novim ukusom, Pistachio. Ovo je tek početak." },
          { n: "∞", t: "prilika", d: "Doručak, užina posle treninga, slatkiš bez griže savesti ili mini kaše za događaje." },
        ].map((x, i) => (
          <Reveal key={x.t} delay={i * 0.08} className="border-t-2 border-ink pt-6">
            <p className="display text-7xl">{x.n}</p>
            <p className="mt-2 text-xl font-extrabold uppercase [font-stretch:118%]">{x.t}</p>
            <p className="mt-2 text-ink-soft">{x.d}</p>
          </Reveal>
        ))}
      </div>

      <div className="mt-24 grid items-center gap-10 md:grid-cols-2">
        <Reveal className="relative">
          <span className="tape -top-3 left-10 -rotate-6" />
          <div className="torn-b -rotate-1 bg-white p-3 pb-8 shadow-xl">
            <div className="relative aspect-square">
              <Image src="/images/lifestyle/kraft-carriers.jpg" alt="OAT BOMB kaše spremne za isporuku" fill sizes="(min-width:768px) 45vw, 100vw" className="object-cover" />
            </div>
          </div>
        </Reveal>
        <div>
          <h2 className="display text-5xl md:text-6xl">Za ljude i za objekte</h2>
          <p className="mt-5 text-lg text-ink-soft">
            Pored porudžbina za tebe i tvoje društvo, sarađujemo i sa objektima. Ako imaš kafić, teretanu ili prodavnicu i želiš da svojim gostima ponudiš nešto što će se zaista tražiti, javi nam se.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/prodavnica" className="btn btn-ink">
              Poruči online
            </Link>
            <Link href="/kontakt#saradnja" className="btn btn-line">
              Saradnja
            </Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
