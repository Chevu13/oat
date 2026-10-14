import { getCatalog } from "@/lib/catalog";
import { site } from "@/lib/config";
import { effectivePrice, formatRSD } from "@/lib/format";

// llms.txt: a plain-text summary of the shop for AI assistants and answer engines.
export async function GET() {
  const { products, categories } = await getCatalog();
  const lines = [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    "OAT BOMB pravi slojevite proteinske ovsene kaše u čaši. Dostava uz plaćanje pouzećem ili lično preuzimanje u radnji. Mini kaše za događaje i saradnja sa objektima (kafići, teretane, prodavnice).",
    "",
    `- Telefon: ${site.phone}`,
    `- Instagram: ${site.instagram}`,
    `- Prodavnica: ${site.url}/prodavnica`,
    "",
    "## Ukusi",
    ...categories.flatMap((c) => {
      const items = products.filter((p) => p.category_id === c.id);
      return items.length
        ? [``, `### ${c.name}`, ...items.map((p) => `- [${p.name}](${site.url}/proizvod/${p.slug}): ${p.tagline ?? ""} Od ${formatRSD(Math.min(...p.variants.map(effectivePrice)))}.`)]
        : [];
    }),
    "",
    "## Informacije",
    `- [Dostava i plaćanje](${site.url}/dostava)`,
    `- [Česta pitanja](${site.url}/cesta-pitanja)`,
    `- [O nama](${site.url}/o-nama)`,
    `- [Kontakt i saradnja](${site.url}/kontakt)`,
  ];
  return new Response(lines.join("\n"), { headers: { "content-type": "text/plain; charset=utf-8" } });
}
