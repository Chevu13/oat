import type { Metadata } from "next";
import { PageShell, Placeholder, Prose } from "@/components/site/page-shell";
import { site } from "@/lib/config";

export const metadata: Metadata = { title: "Uslovi korišćenja", alternates: { canonical: "/uslovi" } };

export default function TermsPage() {
  return (
    <PageShell
      title="Uslovi"
      eyebrow="Uslovi korišćenja i prodaje"
      href="/uslovi"
      intro={<Placeholder>Nacrt — tekst mora da pregleda i odobri klijent (po potrebi pravnik) pre objavljivanja.</Placeholder>}
    >
      <Prose>
        <h2>Prodavac</h2>
        <p>
          <Placeholder>Naziv firme / preduzetnika, sedište, PIB, matični broj, registracija</Placeholder>
        </p>
        <h2>Porudžbina</h2>
        <p>
          Porudžbina je prihvaćena kada je potvrdimo telefonom. Zadržavamo pravo da odbijemo porudžbinu u slučaju netačnih podataka ili nedostupnosti proizvoda, o čemu kupca
          obaveštavamo.
        </p>
        <h2>Cene</h2>
        <p>
          Cene su izražene u dinarima (RSD) <Placeholder>potvrditi PDV status</Placeholder>. Važeća je cena u trenutku slanja porudžbine.
        </p>
        <h2>Plaćanje i isporuka</h2>
        <p>Kod dostave na adresu plaćanje se vrši pouzećem, gotovinom kuriru. Kod ličnog preuzimanja plaća se u radnji prilikom preuzimanja. Uslovi su navedeni na stranici Dostava.</p>
        <h2>Reklamacije</h2>
        <p>
          Zbog prirode proizvoda (sveža hrana), eventualne reklamacije prijavite odmah po prijemu na {site.phone}.{" "}
          <Placeholder>Detaljna procedura reklamacija i izuzeci od prava na odustanak za kvarljivu robu, prema Zakonu o zaštiti potrošača.</Placeholder>
        </p>
      </Prose>
    </PageShell>
  );
}
