import type { Metadata } from "next";
import { PageShell, Placeholder } from "@/components/site/page-shell";
import { InstagramIcon, PhoneIcon } from "@/components/ui/icons";
import { site } from "@/lib/config";

export const metadata: Metadata = {
  title: "Kontakt i saradnja",
  description: "Kontaktiraj OAT BOMB: telefon 063 833 1192 ili Instagram @oat_bomb. Mini kaše za događaje i saradnja sa kafićima, teretanama i prodavnicama.",
  alternates: { canonical: "/kontakt" },
};

const igDm = "https://ig.me/m/oat_bomb";

export default function ContactPage() {
  return (
    <PageShell title="Kontakt" eyebrow="Tu smo za tebe" href="/kontakt" intro="Pitanje o ukusu, porudžbini ili saradnji? Najbrže ćeš nas dobiti telefonom ili porukom na Instagramu.">
      <div className="grid gap-4 md:grid-cols-2">
        <a href={site.phoneHref} className="group flex min-h-64 flex-col justify-between rounded-[2rem] bg-ink p-8 text-paper transition-transform duration-500 hover:-rotate-1">
          <PhoneIcon width={34} height={34} />
          <div>
            <p className="eyebrow text-paper/60">Pozovi nas</p>
            <p className="display mt-2 text-3xl sm:text-4xl md:text-5xl">{site.phone}</p>
            <p className="mt-2 text-paper/70">
              Radno vreme: <Placeholder>čeka potvrdu</Placeholder>
            </p>
          </div>
        </a>
        <a href={igDm} target="_blank" rel="noreferrer" className="group flex min-h-64 flex-col justify-between rounded-[2rem] bg-white/70 p-8 ring-1 ring-line transition-transform duration-500 hover:rotate-1">
          <InstagramIcon width={34} height={34} />
          <div>
            <p className="eyebrow text-ink-soft">Piši nam na Instagramu</p>
            <p className="display mt-2 text-3xl sm:text-4xl md:text-5xl">{site.instagramHandle}</p>
            <p className="mt-2 text-ink-soft">Pošalji poruku, odgovaramo u najkraćem roku.</p>
          </div>
        </a>
      </div>

      <section id="saradnja" className="mt-20 scroll-mt-28 rounded-[2rem] bg-paper-2 p-8 md:p-14">
        <p className="eyebrow text-ink-soft">B2B · Događaji</p>
        <h2 className="display mt-3 text-4xl sm:text-5xl md:text-7xl">Saradnja</h2>
        <div className="mt-8 grid gap-10 md:grid-cols-2">
          <div>
            <h3 className="text-xl font-extrabold uppercase [font-stretch:118%]">Kaše u vašem objektu</h3>
            <p className="mt-2 text-ink-soft">
              Ukoliko želite OAT BOMB kaše u vašem objektu, javite nam se za saradnju. Kafići, teretane, prodavnice zdrave hrane: obogatite ponudu proizvodom koji se zaista traži.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-extrabold uppercase [font-stretch:118%]">Mini kaše za događaje</h3>
            <p className="mt-2 text-ink-soft">Rođendani, proslave, poslovni sastanci i ketering. Recite nam broj gostiju i ukuse, a mi pripremamo ponudu.</p>
          </div>
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          <a href={site.phoneHref} className="btn btn-ink">
            <PhoneIcon /> Pozovi za ponudu
          </a>
          <a href={igDm} target="_blank" rel="noreferrer" className="btn btn-line">
            <InstagramIcon /> Pošalji poruku
          </a>
        </div>
      </section>

      <section className="mt-20 grid gap-6 text-sm md:grid-cols-3">
        <div>
          <p className="eyebrow text-ink-soft">E-mail</p>
          <p className="mt-2">
            <Placeholder>{site.email}</Placeholder>
          </p>
        </div>
        <div>
          <p className="eyebrow text-ink-soft">Adresa / proizvodnja</p>
          <p className="mt-2">
            <Placeholder>čeka potvrdu klijenta</Placeholder>
          </p>
        </div>
        <div>
          <p className="eyebrow text-ink-soft">Podaci o firmi</p>
          <p className="mt-2">
            <Placeholder>naziv, PIB, matični broj</Placeholder>
          </p>
        </div>
      </section>
    </PageShell>
  );
}
