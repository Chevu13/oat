import { Hero } from "@/components/home/hero";
import { FlavorCarousel } from "@/components/home/flavor-carousel";
import { BrandStory, CategoryTiles, EventsAndPartners, InstagramGrid, LayerStory, Marquee, ProductRow } from "@/components/home/sections";
import { getBestsellers, getCatalog } from "@/lib/catalog";
import { JsonLd } from "@/components/site/json-ld";
import { site } from "@/lib/config";

export default async function HomePage() {
  const [{ categories, products }, bestsellers] = await Promise.all([getCatalog(), getBestsellers(4)]);
  const flavors = products.filter((p) => p.variants.length === 1); // single-cup flavors (not the mini sets)

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
      <LayerStory />
      <BrandStory />
      <EventsAndPartners />
      <InstagramGrid />
    </>
  );
}
