import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/reveal";
import { ProductCard } from "@/components/product/product-card";
import { ArrowIcon, InstagramIcon } from "@/components/ui/icons";
import { site } from "@/lib/config";
import type { Category, Product } from "@/lib/types";

export function Marquee({ items, tone = "ink" }: { items: string[]; tone?: "ink" | "paper" }) {
  const row = [...items, ...items];
  return (
    <div className={`relative z-10 -my-3 -ml-[5%] w-[110%] -rotate-[1.5deg] overflow-hidden py-4 ${tone === "ink" ? "bg-ink text-paper" : "bg-paper text-ink ring-2 ring-ink"}`} aria-hidden>
      <div className="flex w-max animate-marquee gap-8 whitespace-nowrap motion-reduce:animate-none">
        {row.map((t, i) => (
          <span key={i} className="display flex items-center gap-8 text-3xl md:text-5xl">
            {t} <span className="text-berry">✶</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function SectionHead({ eyebrow, title, link }: { eyebrow: string; title: React.ReactNode; link?: { href: string; label: string } }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <p className="eyebrow text-ink-soft">{eyebrow}</p>
        <h2 className="display mt-3 text-[7.2vw] sm:text-6xl lg:text-7xl">{title}</h2>
      </div>
      {link && (
        <Link href={link.href} className="group inline-flex items-center gap-2 font-bold [font-stretch:112%]">
          {link.label}
          <ArrowIcon className="transition-transform duration-500 group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}

export function CategoryTiles({ categories, products }: { categories: Category[]; products: Product[] }) {
  const tiles = categories
    .map((c) => ({ c, items: products.filter((p) => p.category_id === c.id) }))
    .filter((t) => t.items.length > 0);
  return (
    <section className="mx-auto max-w-[1440px] px-4 py-20 md:px-8 md:py-28" aria-labelledby="kategorije">
      <SectionHead eyebrow="Kategorije" title={<span id="kategorije">Po raspoloženju</span>} link={{ href: "/prodavnica", label: "Sva ponuda" }} />
      <div className="-mx-4 mt-10 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-5 md:overflow-visible md:px-0">
        {tiles.map(({ c, items }, n) => (
          <Reveal key={c.id} delay={n * 0.06} className="w-[62vw] shrink-0 snap-start sm:w-[40vw] md:w-auto">
            <Link href={`/prodavnica?kategorija=${c.slug}`} className="group relative block aspect-[3/4] overflow-hidden rounded-[1.4rem]">
              <Image
                src={items[0].images[0]}
                alt={`${c.name} proteinske kaše`}
                fill
                sizes="(min-width:768px) 20vw, 62vw"
                className="object-cover transition-transform duration-1000 ease-[var(--ease-out-expo)] group-hover:scale-110"
              />
              <span className="absolute inset-0 opacity-0 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-60" style={{ background: items[0].accent }} />
              <div className="absolute inset-x-2 bottom-2 rounded-[1rem] bg-paper p-4 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-1">
                <p className="text-xl font-extrabold uppercase leading-none [font-stretch:120%]">{c.name}</p>
                <p className="mt-1 text-sm text-ink-soft">
                  {items.length} {items.length === 1 ? "ukus" : "ukusa"} →
                </p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function ProductRow({ title, eyebrow, products, categories }: { title: string; eyebrow: string; products: Product[]; categories: Category[] }) {
  return (
    <section className="mx-auto max-w-[1440px] px-4 py-20 md:px-8 md:py-24">
      <SectionHead eyebrow={eyebrow} title={title} link={{ href: "/prodavnica", label: "Pogledaj sve" }} />
      <ul className="mt-10 grid grid-cols-2 gap-x-3 gap-y-8 md:gap-x-5 lg:grid-cols-4">
        {products.map((p, n) => (
          <Reveal as="li" key={p.id} delay={(n % 4) * 0.07}>
            <ProductCard product={p} categoryName={categories.find((c) => c.id === p.category_id)?.name} />
          </Reveal>
        ))}
      </ul>
    </section>
  );
}

const layers = [
  { top: "25%", n: "03", t: "Vrh", d: "Toping koji daje završni udarac: kakao, voće, orašasti plodovi ili glazura." },
  { top: "40%", n: "02", t: "Sloj", d: "Krem, voće ili čokolada. Svaki ukus ima svoj karakter." },
  { top: "74%", n: "01", t: "Baza", d: "Kremasta proteinska ovsena kaša. Temelj koji drži ceo dan." },
];

export function LayerStory() {
  return (
    <section className="relative overflow-x-clip bg-paper-2/70 py-20 md:py-28" aria-labelledby="sloj">
      <div className="mx-auto grid max-w-[1440px] items-center gap-12 px-4 md:px-8 lg:grid-cols-2 lg:gap-20">
        <Reveal className="relative mx-auto w-full max-w-[520px]">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem]">
            <Image src="/images/products/tiramisu.jpg" alt="Presek slojeva OAT BOMB Tiramisu kaše" fill sizes="(min-width:1024px) 520px, 92vw" className="object-cover" />
          </div>
          {layers.map((l) => (
            <div key={l.n} className="absolute right-3 flex items-center gap-2 md:right-0 md:translate-x-[30%]" style={{ top: l.top }}>
              <span className="h-px w-10 bg-ink md:w-20" />
              <span className="rounded-full bg-ink px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-paper">{l.t}</span>
            </div>
          ))}
        </Reveal>
        <div>
          <p className="eyebrow text-ink-soft">Anatomija jedne bombe</p>
          <h2 id="sloj" className="display mt-3 text-[13vw] sm:text-7xl lg:text-8xl">
            Sloj
            <br />
            po sloj.
          </h2>
          <ol className="mt-10 space-y-8">
            {[...layers].reverse().map((l, n) => (
              <Reveal as="li" key={l.n} delay={n * 0.1} className="grid grid-cols-[auto_1fr] gap-5 border-t border-ink/15 pt-6">
                <span className="display text-3xl text-ink/30">{l.n}</span>
                <div>
                  <p className="text-xl font-extrabold uppercase [font-stretch:118%]">{l.t}</p>
                  <p className="mt-1 max-w-md text-ink-soft">{l.d}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export function BrandStory() {
  return (
    <section className="mx-auto grid max-w-[1440px] items-center gap-14 px-4 py-24 md:px-8 md:py-32 lg:grid-cols-[1fr_1.1fr]">
      <div className="order-2 lg:order-1">
        <p className="eyebrow text-ink-soft">Naša priča</p>
        <h2 className="display mt-3 text-[8.4vw] sm:text-6xl lg:text-7xl">
          Doručak
          <br />
          bez kompromisa.
        </h2>
        <p className="mt-8 max-w-lg text-lg leading-relaxed text-ink-soft">
          OAT BOMB je nastao iz jednostavne ideje: obrok koji je u isto vreme ukusan, zasitan i pun proteina ne mora da bude dosadan. Zato svaku kašu slažemo u slojevima, kao desert, a pravimo je da te nosi kroz dan.
        </p>
        <p className="hand mt-6 text-3xl">Iza nas je prvi rođendan. Ovo je tek početak.</p>
        <Link href="/o-nama" className="btn btn-line mt-8">
          Upoznaj OAT BOMB
        </Link>
      </div>
      <Reveal className="relative order-1 mx-auto w-full max-w-[620px] lg:order-2">
        <span className="tape -top-3 left-1/3 rotate-[4deg]" />
        <div className="torn-b rotate-[1.5deg] bg-white p-3 pb-8 shadow-[0_30px_60px_-25px_rgb(18_17_16/0.35)]">
          <div className="relative aspect-[1440/1240]">
            <Image src="/images/lifestyle/top-down-seven.jpg" alt="Sedam OAT BOMB kaša odozgo: Choco Raspberry, Blueberry, Čoko bananica, Bounty, Nutella, Cheesecake i Snickers" fill sizes="(min-width:1024px) 620px, 92vw" className="object-cover" />
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export function EventsAndPartners() {
  return (
    <section className="mx-auto grid max-w-[1440px] gap-4 px-4 md:px-8 lg:grid-cols-2" aria-label="Događaji i saradnja">
      <Reveal className="group relative min-h-[560px] overflow-hidden rounded-[2rem] text-paper">
        <Image src="/images/lifestyle/mini-events.jpg" alt="Četiri mini OAT BOMB kaše za događaje na drvenom stolu" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
          <p className="eyebrow text-paper/75">Mini kaše</p>
          <h2 className="display mt-2 text-4xl sm:text-5xl md:text-6xl">Za sve vrste događaja</h2>
          <p className="mt-3 max-w-md text-paper/85">Rođendani, sastanci, proslave, ketering. Mali zalogaji koji ostavljaju veliki utisak.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/proizvod/mini-kase" className="btn bg-paper text-ink hover:bg-oat">
              Poruči mini kaše
            </Link>
            <Link href="/kontakt#saradnja" className="btn btn-line">
              Upit za veće količine
            </Link>
          </div>
        </div>
      </Reveal>
      <Reveal delay={0.08} className="relative flex min-h-[560px] flex-col overflow-hidden rounded-[2rem] bg-ink p-6 text-paper md:p-10">
        <p className="eyebrow text-paper/60" id="saradnja-home">Za kafiće, teretane i prodavnice</p>
        <h2 className="display mt-2 text-4xl sm:text-5xl md:text-6xl">Oat Bomb u vašem objektu</h2>
        <p className="mt-4 max-w-md text-paper/80">
          Ukoliko želiš da obogatiš svoju ponudu kvalitetnim proizvodima i svojim klijentima ponudiš nešto što će se zaista tražiti, javi nam se za saradnju.
        </p>
        <Link href="/kontakt#saradnja" className="btn mt-6 self-start bg-paper text-ink hover:bg-oat">
          Javi se za saradnju <ArrowIcon />
        </Link>
        <div className="relative -mx-6 -mb-6 mt-8 flex-1 md:-mx-10 md:-mb-10">
          <Image src="/images/lifestyle/kraft-carriers.jpg" alt="OAT BOMB kaše u kartonskim nosačima" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover object-[50%_62%]" />
        </div>
      </Reveal>
    </section>
  );
}

const ig = [
  { src: "/images/lifestyle/lineup-four.jpg", alt: "Nutella, Raspberry, Snickers i Blueberry kaše" },
  { src: "/images/ig/menu.jpg", alt: "OAT BOMB meni ukusa" },
  { src: "/images/lifestyle/trio-wood.jpg", alt: "Choco Raspberry i Čoko bananica kaše" },
  { src: "/images/ig/collage-1.jpg", alt: "Choco Raspberry, Čoko bananica i Tiramisu" },
  { src: "/images/products/nutella-tiramisu.jpg", alt: "Nutella i Tiramisu kaše" },
  { src: "/images/ig/collage-3.jpg", alt: "Snickers, Nutella i Cheesecake" },
];

export function InstagramGrid() {
  return (
    <section className="mx-auto max-w-[1440px] px-4 pt-24 md:px-8 md:pt-32" aria-labelledby="ig">
      <div className="flex flex-col items-center text-center">
        <InstagramIcon width={30} height={30} />
        <h2 id="ig" className="display mt-4 text-[11vw] sm:text-6xl lg:text-7xl">
          {site.instagramHandle}
        </h2>
        <p className="hand mt-2 text-2xl text-ink-soft">Pratite nas za nove ukuse i akcije</p>
      </div>
      <ul className="mt-10 grid grid-cols-3 gap-2 md:grid-cols-6 md:gap-3">
        {ig.map((x, n) => (
          <Reveal as="li" key={x.src} delay={n * 0.05}>
            <a href={site.instagram} target="_blank" rel="noreferrer" className="group relative block aspect-square overflow-hidden rounded-xl md:rounded-2xl">
              <Image src={x.src} alt={x.alt} fill sizes="(min-width:768px) 16vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
              <span className="absolute inset-0 grid place-items-center bg-ink/0 text-paper opacity-0 transition-all duration-300 group-hover:bg-ink/45 group-hover:opacity-100">
                <InstagramIcon width={28} height={28} />
              </span>
            </a>
          </Reveal>
        ))}
      </ul>
      <div className="mt-8 flex justify-center">
        <a href={site.instagram} target="_blank" rel="noreferrer" className="btn btn-line">
          Prati {site.instagramHandle}
        </a>
      </div>
    </section>
  );
}
