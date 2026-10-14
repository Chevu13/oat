import { Hero } from "@/components/home/hero";
import { FlavorCarousel } from "@/components/home/flavor-carousel";
import { BrandStory, CategoryTiles, EventsAndPartners, InstagramGrid, LayerStory, Marquee, ProductRow } from "@/components/home/sections";
import { getBestsellers, getCatalog } from "@/lib/catalog";
import { JsonLd } from "@/components/site/json-ld";
import { site } from "@/lib/config";

export default async function HomePage() {
  const [{ categories, products }, bestsellers] = await Promise.all([getCatalog(), getBestsellers(4)]);
  // Single flavors only: bundles and mini sets have their own sections.
  const catOf = (slug: string) => categories.find((c) => c.slug === slug)?.id;
  const flavors = products.filter((p) => p.category_id !== catOf("paketi") && p.category_id !== catOf("mini"));
  const bundles = products.filter((p) => p.category_id === catOf("paketi"));

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": `${site.url}/#org`,
              name: site.name,
              url: site.url,
              logo: `${site.url}/icon.png`,
              telephone: "+381638331192",
              sameAs: [site.instagram],
              description: site.description,
            },
            { "@type": "WebSite", url: site.url, name: site.name, inLanguage: "sr-Latn", publisher: { "@id": `${site.url}/#org` } },
          ],
        }}
      />
      <Hero flavorCount={flavors.length} />
      <Marquee items={flavors.map((p) => p.name)} />
      <CategoryTiles categories={categories} products={products} />
      <FlavorCarousel products={flavors} />
      <ProductRow eyebrow="Omiljeno" title="Najprodavanije" products={bestsellers} categories={categories} />
      {bundles.length > 0 && (
        <ProductRow eyebrow="Kombinuj i uštedi" title="Paketi" products={bundles.slice(0, 4)} categories={categories} link={{ href: "/prodavnica?kategorija=paketi", label: "Svi paketi" }} />
      )}
      <LayerStory />
      <BrandStory />
      <EventsAndPartners />
      <InstagramGrid />
    </>
  );
}
