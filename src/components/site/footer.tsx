import Link from "next/link";
import { cacheLife } from "next/cache";
import { Logo } from "./logo";
import { site } from "@/lib/config";
import { InstagramIcon, PhoneIcon } from "@/components/ui/icons";

const cols = [
  {
    title: "Prodavnica",
    links: [
      { href: "/prodavnica", label: "Svi ukusi" },
      { href: "/prodavnica?kategorija=cokoladne", label: "Čokoladne" },
      { href: "/prodavnica?kategorija=vocne", label: "Voćne" },
      { href: "/prodavnica?kategorija=desertne", label: "Desertne" },
      { href: "/prodavnica?kategorija=mini", label: "Mini & događaji" },
    ],
  },
  {
    title: "Informacije",
    links: [
      { href: "/o-nama", label: "O nama" },
      { href: "/dostava", label: "Dostava i plaćanje" },
      { href: "/cesta-pitanja", label: "Česta pitanja" },
      { href: "/privatnost", label: "Politika privatnosti" },
      { href: "/uslovi", label: "Uslovi korišćenja" },
    ],
  },
];

export async function Footer() {
  "use cache";
  cacheLife("days");
  const year = new Date().getFullYear();

  return (
    <footer className="torn-t mt-24 bg-ink pt-20 text-paper">
      <div className="mx-auto max-w-[1440px] px-4 md:px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <p className="hand text-4xl leading-tight">Zaboravi klasične opcije.</p>
            <p className="mt-2 max-w-sm text-paper/70">Proteinske ovsene kaše sa karakterom. Pravimo ih da ti dan krene jače.</p>
            <Link href="/prodavnica" className="btn mt-6 bg-paper text-ink hover:bg-oat">
              Poruči sada
            </Link>
          </div>
          {cols.map((c) => (
            <nav key={c.title} aria-label={c.title}>
              <p className="eyebrow text-paper/50">{c.title}</p>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-paper/85 transition-colors hover:text-paper">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
          <div>
            <p className="eyebrow text-paper/50">Kontakt</p>
            <ul className="mt-4 space-y-2.5 text-paper/85">
              <li>
                <a href={site.phoneHref} className="inline-flex items-center gap-2 hover:text-paper">
                  <PhoneIcon width={18} /> {site.phone}
                </a>
              </li>
              <li>
                <a href={site.instagram} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-paper">
                  <InstagramIcon width={18} /> {site.instagramHandle}
                </a>
              </li>
              <li>
                <Link href="/kontakt#saradnja" className="hover:text-paper">
                  Saradnja za objekte →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Logo invert className="mt-20 h-auto w-full opacity-95" />

        <div className="flex flex-col gap-2 border-t border-paper/15 py-6 text-xs text-paper/55 md:flex-row md:justify-between">
          <p>© {year} OAT BOMB. Sva prava zadržana.</p>
          <p>Plaćanje pouzećem · Podaci o firmi: [čeka potvrdu klijenta]</p>
        </div>
      </div>
    </footer>
  );
}
