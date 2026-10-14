# OAT BOMB — online prodavnica (demo)

Prodavnica proteinskih ovsenih kaša OAT BOMB: Next.js 16 (App Router, Cache Components), TypeScript, Tailwind CSS 4, Motion.

> **Demo režim.** Sajt radi **bez baze**: lokalno se podaci čuvaju u JSON fajlu (`.data/demo-db.json`), a na Vercelu u besplatnom Upstash Redis skladištu. Supabase se povezuje tek kada klijent odobri sajt (vidi dole). Cene su **demo vrednosti**: zvanične cene nisu javno dostupne.

## Pokretanje

```bash
npm install
cp .env.example .env.local   # pa popuniti ADMIN_EMAIL, ADMIN_PASSWORD, SESSION_SECRET
npm run dev                  # http://localhost:3000
```

Produkcijski build: `npm run build && npm start`.

Katalog se pravi automatski pri prvom pokretanju iz `src/lib/data/seed.ts`. Da se demo vrati na početno stanje, obrišite folder `.data/`.

## Admin panel

- Adresa: `/admin`, **u demo verziji bez lozinke**
- Za uključivanje prijave: `ADMIN_REQUIRE_LOGIN=true`, a pristupni podaci su `ADMIN_EMAIL` i `ADMIN_PASSWORD` (prijava na `/admin/prijava`)
- Sesija: potpisan (HMAC) httpOnly kolačić, 12 sati. Svaka admin stranica i svaka server akcija ponovo proverava sesiju.

Šta admin može:

| Oblast | Funkcije |
|---|---|
| Pregled | broj porudžbina, nove porudžbine, ukupna vrednost (bez otkazanih), poslednje porudžbine, najprodavanije, spisak podataka koji nedostaju |
| Porudžbine | pretraga (broj, ime, telefon, e-mail, grad), filter po statusu i datumu, detalji, promena statusa (Nova, U obradi, Poslata, Isporučena, Otkazana) |
| Proizvodi | dodavanje, izmena, brisanje (uz potvrdu), naziv, opis, cena, akcijska cena, upload i redosled slika, kategorija, varijante, uključi/isključi, istaknut, boja ukusa, sastav/alergeni/gramaža, oznake "nedostaje" |
| Kategorije | dodavanje, izmena, brisanje (uz potvrdu), promena redosleda |
| Upiti | poruke iz formulara za saradnju (stranica Kontakt): tema, kontakt, poruka, označavanje kao rešeno |

Izmene su odmah vidljive u prodavnici: keš kataloga se poništava (`updateTag("catalog")`), bez ponovnog deploy-a.

## Bezbednost porudžbina

- Pregledač šalje samo `variant_id` i količinu. **Cene, dostavu i ukupan iznos računa server** (`store.placeOrder`), a cene iz pregledača se ignorišu.
- Način preuzimanja: **dostava na adresu** (plaćanje pouzećem) ili **lično preuzimanje u radnji** (plaćanje na licu mesta, bez troškova dostave).
- Praćenje zaliha (lager) namerno nije uključeno u demo, i može se dodati kao dorada.
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

1. Importovati GitHub repo u Vercel (framework: Next.js).
2. **Storage → Create → Upstash (Redis) → Free → Connect to project.** Vercel sam dodaje `KV_REST_API_URL` i `KV_REST_API_TOKEN`.
   Ovo je obavezno: Vercel pokreće svaku rutu kao zasebnu funkciju, pa bez zajedničkog skladišta porudžbina iz korpe ne bi bila vidljiva na stranici potvrde ni u adminu. Redis ovde služi kao demo skladište (katalog, porudžbine, otpremljene slike), a ne kao prava baza.
3. Environment variables: `NEXT_PUBLIC_SITE_URL` (npr. `https://oat-orpin.vercel.app`), a za zaštićen admin `ADMIN_REQUIRE_LOGIN=true`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` i `SESSION_SECRET` (min. 32 karaktera).
4. Redeploy.

Sa Redisom se izmene iz admina vide u prodavnici najkasnije za ~30 sekundi (keš na drugim instancama). Lokalno (`npm run dev` / `npm start`) Redis nije potreban: podaci idu u `.data/demo-db.json`.

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

- **Zvanične cene** za svih 13 proizvoda i 6 paketa (sada su demo cene)
- Adresa radnje i radno vreme za lično preuzimanje
- Gramaža, sastojci, alergeni i nutritivne vrednosti (označeno u adminu kao "nedostaje")
- Cena i zone dostave, rok isporuke, radno vreme
- Uputstvo za čuvanje i rok trajanja
- Podaci o firmi: naziv, PIB, matični broj, adresa, kontakt e-mail
- Pregled i odobrenje tekstova Politike privatnosti i Uslova korišćenja (označeni kao nacrt)
- Kategorije su predložene od strane dizajnera (čokoladne, voćne, desertne, posne, mini) i mogu se menjati u adminu.

Na sajtu su ovi podaci označeni žutom oznakom ⚠.
