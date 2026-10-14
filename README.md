# OAT BOMB — online prodavnica (demo)

Prodavnica proteinskih ovsenih kaša OAT BOMB: Next.js 16 (App Router, Cache Components), TypeScript, Tailwind CSS 4, Motion.

> **Demo režim.** Sajt trenutno radi **bez baze**: podaci se čuvaju u JSON fajlu (`.data/demo-db.json`). Supabase se povezuje tek kada klijent odobri sajt (vidi dole). Cene su **demo vrednosti**: zvanične cene nisu javno dostupne.

## Pokretanje

```bash
npm install
cp .env.example .env.local   # pa popuniti ADMIN_EMAIL, ADMIN_PASSWORD, SESSION_SECRET
npm run dev                  # http://localhost:3000
```

Produkcijski build: `npm run build && npm start`.

Katalog se pravi automatski pri prvom pokretanju iz `src/lib/data/seed.ts`. Da se demo vrati na početno stanje, obrišite folder `.data/`.

## Admin panel

- Adresa: `/admin` (prijava na `/admin/prijava`)
- Pristupni podaci: `ADMIN_EMAIL` i `ADMIN_PASSWORD` iz `.env.local` (lokalni test nalog)
- Sesija: potpisan (HMAC) httpOnly kolačić, 12 sati. Svaka admin stranica i svaka server akcija ponovo proverava sesiju.

Šta admin može:

| Oblast | Funkcije |
|---|---|
| Pregled | broj porudžbina, nove porudžbine, ukupna vrednost (bez otkazanih), poslednje porudžbine, najprodavanije, nisko stanje, spisak podataka koji nedostaju |
| Porudžbine | pretraga (broj, ime, telefon, e-mail, grad), filter po statusu i datumu, detalji, promena statusa (Nova, U obradi, Poslata, Isporučena, Otkazana) |
| Proizvodi | dodavanje, izmena, brisanje (uz potvrdu), naziv, opis, cena, akcijska cena, upload i redosled slika, kategorija, stanje, varijante, uključi/isključi, istaknut, boja ukusa, sastav/alergeni/gramaža, oznake "nedostaje" |
| Kategorije | dodavanje, izmena, brisanje (uz potvrdu), promena redosleda |

Izmene su odmah vidljive u prodavnici: keš kataloga se poništava (`updateTag("catalog")`), bez ponovnog deploy-a.

## Bezbednost porudžbina

- Pregledač šalje samo `variant_id` i količinu. **Cene, zalihe, dostavu i ukupan iznos računa server** (`store.placeOrder`), a cene iz pregledača se ignorišu.
- Zalihe se proveravaju i umanjuju pod zaključavanjem: demo koristi red za upis, a Supabase verzija koristi `FOR UPDATE` u `place_order()`.
- Validacija svih polja sa `zod` na klijentu i na serveru, kao i honeypot polje protiv botova.

## Struktura

```
src/app/(shop)/        prodavnica: početna, prodavnica, proizvod, plaćanje, potvrda, info stranice
src/app/admin/         admin panel + server akcije (actions.ts)
src/lib/data/store.ts  interfejs ka podacima (jedini "šav" za bazu)
src/lib/data/demo-store.ts   demo implementacija (JSON fajl)
src/lib/catalog.ts     keširano čitanje kataloga za prodavnicu
supabase/migrations/   SQL šema, RLS i place_order() (spremno za Supabase)
scripts/               obrada slika i generisanje seed.sql
```

## Deploy demo verzije na Vercel

1. Postaviti projekat na GitHub i importovati ga u Vercel (framework: Next.js).
2. Environment variables: `NEXT_PUBLIC_SITE_URL` (npr. `https://oatbomb.vercel.app`), `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `SESSION_SECRET` (min. 32 karaktera), `NEXT_PUBLIC_SHOW_DEMO_NOTICE=true`.
3. Deploy.

⚠ Na Vercelu demo podaci idu u `/tmp`, koji je privremen i poseban za svaku instancu servera. Porudžbine i izmene iz admina zato mogu da nestanu posle neaktivnosti ili da se ne vide sa druge instance. To je dovoljno za prezentaciju, ali **ne i za pravu prodaju**: za to je potreban Supabase.

## Povezivanje na Supabase (posle odobrenja)

1. Napraviti Supabase projekat (region `eu-central-1`).
2. U SQL editoru pokrenuti `supabase/migrations/0001_init.sql`, pa `supabase/seed.sql` (generiše se sa `node scripts/gen-seed-sql.ts`).
3. Authentication → Users → kreirati admin korisnika, zatim:
   ```sql
   insert into public.admins (user_id) select id from auth.users where email = 'vlasnik@oatbomb.rs';
   ```
4. U kodu: `npm i @supabase/supabase-js @supabase/ssr`, napisati `src/lib/data/supabase-store.ts` koji implementira `Store` (čitanje kataloga anon ključem, porudžbine preko RPC `place_order`, potvrda preko `get_order_public`, admin operacije sa sesijom korisnika pod RLS-om, slike u bucket `product-images`) i izvesti ga iz `src/lib/data/index.ts`. Zameniti `src/lib/auth.ts` sa Supabase Auth (`signInWithPassword` + provera tabele `admins`).
5. Env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, plus domen slika u `next.config.ts` → `images.remotePatterns`.

Service-role ključ nije potreban: pretraživač ima samo anon ključ, a RLS i `security definer` funkcije štite podatke.

## Šta klijent treba da dostavi pre lansiranja

- **Zvanične cene** za svih 13 proizvoda (sada su demo cene)
- Gramaža, sastojci, alergeni i nutritivne vrednosti (označeno u adminu kao "nedostaje")
- Cena i zone dostave, rok isporuke, radno vreme
- Uputstvo za čuvanje i rok trajanja
- Podaci o firmi: naziv, PIB, matični broj, adresa, kontakt e-mail
- Pregled i odobrenje tekstova Politike privatnosti i Uslova korišćenja (označeni kao nacrt)
- Kategorije su predložene od strane dizajnera (čokoladne, voćne, desertne, posne, mini) i mogu se menjati u adminu.

Na sajtu su ovi podaci označeni žutom oznakom ⚠.
