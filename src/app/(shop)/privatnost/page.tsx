import type { Metadata } from "next";
import { PageShell, Placeholder, Prose } from "@/components/site/page-shell";

export const metadata: Metadata = { title: "Politika privatnosti", alternates: { canonical: "/privatnost" } };

export default function PrivacyPage() {
  return (
    <PageShell
      title="Privatnost"
      eyebrow="Politika privatnosti"
      href="/privatnost"
      intro={<Placeholder>Nacrt — tekst mora da pregleda i odobri klijent (po potrebi pravnik) pre objavljivanja.</Placeholder>}
    >
      <Prose>
        <h2>Rukovalac podacima</h2>
        <p>
          Rukovalac podacima o ličnosti je <Placeholder>naziv firme / preduzetnika, adresa, PIB, matični broj, kontakt e-mail</Placeholder>.
        </p>
        <h2>Koje podatke prikupljamo</h2>
        <ul>
          <li>Ime i prezime, adresu, grad i poštanski broj, radi isporuke porudžbine.</li>
          <li>Broj telefona, radi potvrde porudžbine i dogovora sa kurirom.</li>
          <li>E-mail adresu, radi komunikacije u vezi sa porudžbinom.</li>
          <li>Napomenu za dostavu, ako je uneta.</li>
        </ul>
        <h2>Svrha i pravni osnov</h2>
        <p>Podatke obrađujemo isključivo radi izvršenja porudžbine (izvršenje ugovora) i ispunjavanja zakonskih obaveza, u skladu sa Zakonom o zaštiti podataka o ličnosti Republike Srbije.</p>
        <h2>Čuvanje i deljenje podataka</h2>
        <p>
          Podatke ne prodajemo niti ustupamo trećim licima, osim kurirskoj službi u meri potrebnoj za isporuku. Rok čuvanja: <Placeholder>čeka potvrdu</Placeholder>.
        </p>
        <h2>Kolačići</h2>
        <p>Sajt koristi lokalno skladište pregledača isključivo za pamćenje sadržaja korpe. Ne koristimo kolačiće za praćenje ni oglašavanje.</p>
        <h2>Vaša prava</h2>
        <p>
          Imate pravo na pristup, ispravku i brisanje svojih podataka, kao i pravo na pritužbu Povereniku za informacije od javnog značaja i zaštitu podataka o ličnosti. Zahtev
          možete poslati na <Placeholder>kontakt e-mail</Placeholder>.
        </p>
      </Prose>
    </PageShell>
  );
}
