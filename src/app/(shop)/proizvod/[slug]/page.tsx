import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { JsonLd } from "@/components/site/json-ld";
import { Gallery } from "@/components/product/gallery";
import { BuyBox } from "@/components/product/buy-box";
import { ProductCard } from "@/components/product/product-card";
import { Reveal } from "@/components/ui/reveal";
import { getCatalog, getProductBySlug } from "@/lib/catalog";
import { site } from "@/lib/config";
import { effectivePrice } from "@/lib/format";

export async function generateStaticParams() {
  const { products } = await getCatalog();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/proizvod/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const found = await getProductBySlug(slug);
  if (!found) notFound(); // resolved before streaming starts → real 404 status
  const { product: p } = found;
  return {
    title: `${p.name} — proteinska ovsena kaša`,
    description: `${p.tagline ?? ""} ${p.description ?? ""}`.trim().slice(0, 158),
    alternates: { canonical: `/proizvod/${p.slug}` },
    openGraph: { title: `${p.name} | OAT BOMB`, images: p.images.slice(0, 1).map((url) => ({ url, alt: p.name })) },
  };
}

export default function ProductPage({ params }: PageProps<"/proizvod/[slug]">) {
  // Known slugs are fully prerendered; the boundary keeps navigation to new products instant.
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <Product params={params} />
    </Suspense>
  );
}

function ProductSkeleton() {
  return (
    <div className="mx-auto grid max-w-[1440px] gap-10 px-4 pt-14 md:px-8 lg:grid-cols-2 lg:gap-16" aria-hidden>
      <div className="aspect-[4/5] animate-pulse rounded-[2rem] bg-paper-2" />
      <div className="space-y-5 lg:pt-6">
        <div className="h-4 w-24 rounded bg-paper-2" />
        <div className="h-20 w-3/4 rounded-xl bg-paper-2" />
        <div className="h-12 w-40 rounded-xl bg-paper-2" />
        <div className="h-14 w-full rounded-full bg-paper-2" />
      </div>
    </div>
  );
}

async function Product({ params }: Pick<PageProps<"/proizvod/[slug]">, "params">) {
  const { slug } = await params;
  const found = await getProductBySlug(slug);
  if (!found) notFound();
  const { product: p, category } = found;
  const { products } = await getCatalog();
  const related = [...products.filter((x) => x.id !== p.id && x.category_id === p.category_id), ...products.filter((x) => x.id !== p.id && x.category_id !== p.category_id)].slice(0, 4);

  const info = [
    { t: "Opis", body: p.description, open: true },
    {
      t: "Sastojci i alergeni",
      body:
        [p.ingredients && `Sastojci: ${p.ingredients}`, p.allergens && `Alergeni: ${p.allergens}`].filter(Boolean).join("\n") ||
        `Detaljan sastav i informacije o alergenima uskoro objavljujemo. Ako imaš alergiju ili posebne potrebe, pozovi nas na ${site.phone} pre porudžbine.`,
    },
  ];
  // Size the name so its longest word always fits on one line (CHOCO / RASPBERRY, never RASPBER-RY).
  const longest = Math.max(...p.name.split(/\s+/).map((w) => w.length));

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: p.name,
          description: p.description,
          image: p.images.map((i) => `${site.url}${i}`),
          brand: { "@type": "Brand", name: "OAT BOMB" },
          category: category?.name,
          sku: p.slug,
          offers: p.variants.map((v) => ({
            "@type": "Offer",
            name: v.name,
            price: effectivePrice(v),
            priceCurrency: "RSD",
            availability: "https://schema.org/InStock",
            url: `${site.url}/proizvod/${p.slug}`,
          })),
        }}
      />

      <div className="mx-auto max-w-[1440px] px-4 pt-6 md:px-8 md:pt-8">
        <Breadcrumbs
          items={[
            { name: "Prodavnica", href: "/prodavnica" },
            ...(category ? [{ name: category.name, href: `/prodavnica?kategorija=${category.slug}` }] : []),
            { name: p.name, href: `/proizvod/${p.slug}` },
          ]}
        />

        <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-16">
          <Gallery images={p.images} name={p.name} accent={p.accent} />

          <div className="lg:pt-6">
            {category && (
              <Link href={`/prodavnica?kategorija=${category.slug}`} className="eyebrow inline-flex items-center gap-2 text-ink-soft hover:text-ink">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.accent }} /> {category.name}
              </Link>
            )}
            <h1
              className="display mt-3 [--col:calc(100vw-2rem)] md:[--col:calc(100vw-4rem)] lg:[--col:calc((min(100vw,1440px)-8rem)/2)]"
              style={{ fontSize: `min(6rem, calc(var(--col) / ${(longest * 0.9).toFixed(2)}))` }}
            >
              {p.name}
            </h1>
            {p.tagline && <p className="hand mt-3 text-3xl">{p.tagline}</p>}

            <div className="mt-8">
              <BuyBox product={p} />
            </div>

            <ul className="mt-8 grid grid-cols-3 gap-2 text-center text-xs font-semibold">
              {["Proteinska ovsena baza", "Dostava ili preuzimanje", "Spremno za poneti"].map((t) => (
                <li key={t} className="rounded-2xl bg-paper-2 px-2 py-3">
                  {t}
                </li>
              ))}
            </ul>

            <div className="mt-8 divide-y divide-line border-y border-line">
              {info.map((s) => (
                <details key={s.t} open={s.open} className="group py-1">
                  <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-lg font-extrabold uppercase [font-stretch:115%] [&::-webkit-details-marker]:hidden">
                    {s.t}
                    <span className="text-2xl transition-transform duration-300 group-open:rotate-45" aria-hidden>
                      +
                    </span>
                  </summary>
                  <p className="whitespace-pre-line pb-5 leading-relaxed text-ink-soft">{s.body}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mx-auto max-w-[1440px] px-4 pt-24 md:px-8">
          <h2 className="display text-5xl md:text-7xl">Probaj i ove</h2>
          <ul className="mt-10 grid grid-cols-2 gap-x-3 gap-y-8 md:gap-x-5 lg:grid-cols-4">
            {related.map((r, n) => (
              <Reveal as="li" key={r.id} delay={n * 0.06}>
                <ProductCard product={r} />
              </Reveal>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
