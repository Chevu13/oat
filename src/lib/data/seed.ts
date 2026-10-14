// Seed catalog built from OAT BOMB's public Instagram (@oat_bomb).
// Verified from posts: flavor names, product type ("proteinske kaše"), mini cups for events, B2B offer.
// NOT publicly available: prices, weights, ingredients, allergens, nutrition → demo prices + missing_info flags.
// Descriptions only state what is visible in the brand's own photos and captions.

export const DEMO_MISSING = ["Zvanična cena", "Gramaža", "Sastojci", "Alergeni", "Nutritivne vrednosti"];

export const seedCategories = [
  { slug: "cokoladne", name: "Čokoladne", description: "Za one kojima je čokolada uvek odgovor.", sort: 1 },
  { slug: "vocne", name: "Voćne", description: "Bobičasto voće, sveže i lagano.", sort: 2 },
  { slug: "desertne", name: "Desertne", description: "Omiljeni deserti, pretvoreni u proteinsku kašu.", sort: 3 },
  { slug: "posne", name: "Posne", description: "Ukus bez kompromisa i u danima posta.", sort: 4 },
  { slug: "mini", name: "Mini & događaji", description: "Mini kaše za proslave, sastanke i sve vrste događaja.", sort: 5 },
];

type SeedProduct = {
  slug: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  images: string[];
  accent: string;
  featured?: boolean;
  variants: { name: string; price: number; sale_price?: number; stock: number }[];
};

const cup = (price: number, stock: number, sale_price?: number) => [{ name: "Standardna čaša", price, sale_price, stock }];

export const seedProducts: SeedProduct[] = [
  {
    slug: "choco-raspberry",
    name: "Choco Raspberry",
    category: "cokoladne",
    tagline: "Čokolada i malina. Kontrast koji budi.",
    description:
      "Slojevita proteinska ovsena kaša: čokoladna baza, sočan sloj maline i kremasti čokoladni vrh, završen celim malinama.",
    images: ["/images/products/choco-raspberry.jpg", "/images/products/choco-raspberry-duo.jpg"],
    accent: "#6B2A2E",
    featured: true,
    variants: cup(420, 32),
  },
  {
    slug: "nutella",
    name: "Nutella",
    category: "cokoladne",
    tagline: "Uživanje bez griže savesti.",
    description:
      "Čokoladna proteinska kaša sa kremastim slojem, sjajnom čokoladnom glazurom i hrskavim seckanim orašastim plodovima na vrhu. Za dane kada želiš desert, a biraš pametno.",
    images: ["/images/products/nutella.jpg", "/images/products/nutella-tiramisu.jpg"],
    accent: "#4A2D20",
    featured: true,
    variants: cup(440, 28),
  },
  {
    slug: "snickers",
    name: "Snickers",
    category: "cokoladne",
    tagline: "Tri sloja, jedan zalogaj sreće.",
    description:
      "Ovsena proteinska baza, kremasti beli sloj i čokoladna glazura posuta hrskavim komadićima. Inspirisano klasikom koji svi znamo.",
    images: ["/images/products/snickers.jpg"],
    accent: "#7A4A26",
    featured: true,
    variants: cup(440, 24),
  },
  {
    slug: "coko-bananica",
    name: "Čoko bananica",
    category: "cokoladne",
    tagline: "Ukus detinjstva, odrasla verzija.",
    description:
      "Proteinska ovsena kaša sa debelim slojem tamne čokoladne glazure. Omaž domaćoj klasici, bez kompromisa u ukusu.",
    images: ["/images/products/coko-bananica.jpg"],
    accent: "#2E211C",
    variants: cup(420, 18),
  },
  {
    slug: "tiramisu",
    name: "Tiramisu",
    category: "desertne",
    tagline: "Italijanski klasik, u čaši.",
    description:
      "Naizmenični slojevi ovsene kaše i kremastog fila, posuti kakaom. Elegantan, lagan i taman dovoljno sladak.",
    images: ["/images/products/tiramisu.jpg", "/images/products/nutella-tiramisu.jpg"],
    accent: "#8C6A4F",
    featured: true,
    variants: cup(460, 22),
  },
  {
    slug: "cheesecake",
    name: "Cheesecake",
    category: "desertne",
    tagline: "Kremasto ispod, voćno na vrhu.",
    description:
      "Svetla, kremasta ovsena proteinska kaša sa bogatim slojem crvenog voća na vrhu. Ukus omiljene torte, za svaki dan.",
    images: ["/images/products/cheesecake.jpg"],
    accent: "#9E1C3C",
    variants: cup(440, 26),
  },
  {
    slug: "bounty",
    name: "Bounty",
    category: "desertne",
    tagline: "Kokos koji te odvede na plažu.",
    description:
      "Nežna, svetla proteinska kaša sa kremastim kokos slojem i listićima kokosa na vrhu. Za ljubitelje tropskog ukusa.",
    images: ["/images/products/bounty.jpg"],
    accent: "#CFC3A6",
    variants: cup(440, 20),
  },
  {
    slug: "pistachio",
    name: "Pistachio",
    category: "desertne",
    tagline: "Rođendanski ukus. Novo u ponudi.",
    description:
      "Ukus koji smo vam poklonili povodom našeg prvog rođendana: kremasti pistać sloj preko proteinske ovsene kaše, sa seckanim pistaćima na vrhu.",
    images: ["/images/products/pistachio.jpg"],
    accent: "#8E9C5A",
    featured: true,
    variants: cup(480, 15),
  },
  {
    slug: "blueberry",
    name: "Blueberry",
    category: "vocne",
    tagline: "Ljubičasto, kremasto, neodoljivo.",
    description:
      "Proteinska ovsena kaša sa borovnicama, kremastim belim slojem i celim borovnicama na vrhu. Prepoznaćeš je po boji.",
    images: ["/images/products/blueberry.jpg"],
    accent: "#6A58A6",
    featured: true,
    variants: cup(440, 30),
  },
  {
    slug: "raspberry",
    name: "Raspberry",
    category: "vocne",
    tagline: "Nova letnja opsesija.",
    description:
      "Ružičasta proteinska kaša sa malinama, nežnim kremastim slojem i malinama na vrhu. Poruči i uveri se u ukus koji osvaja.",
    images: ["/images/products/raspberry.jpg"],
    accent: "#C23B66",
    variants: cup(440, 16, 390),
  },
  {
    slug: "cherry",
    name: "Cherry",
    category: "vocne",
    tagline: "Spoj višnje i čokolade koji osvaja na prvi pogled.",
    description:
      "Proteinska kaša sa višnjama, prekrivena bogatim čokoladnim listićima i višnjama na vrhu. Voćno i čokoladno u savršenom balansu.",
    images: ["/images/products/cherry.jpg"],
    accent: "#7A1426",
    variants: cup(460, 3),
  },
  {
    slug: "posna",
    name: "Posna",
    category: "posne",
    tagline: "Posna ovsena kaša, pun ukus.",
    description:
      "Posna ovsena kaša sa slojem crvenog voća, prelivena seckanim orasima i listićima badema. Dokaz da post ne mora da bude dosadan.",
    images: ["/images/products/posna.jpg"],
    accent: "#A07A45",
    variants: cup(420, 12),
  },
  {
    slug: "mini-kase",
    name: "Mini kaše za događaje",
    category: "mini",
    tagline: "Mali zalogaji za velike trenutke.",
    description:
      "U ponudi imamo mini kaše za sve vrste događaja: proslave, poslovne sastanke, rođendane i ketering. Izaberi ukus, a za veće količine nam se javi za ponudu.",
    images: ["/images/products/mini.jpg", "/images/lifestyle/mini-events.jpg"],
    accent: "#8A6B4E",
    variants: [
      { name: "Raspberry", price: 220, stock: 60 },
      { name: "Snickers", price: 220, stock: 60 },
      { name: "Bounty", price: 220, stock: 60 },
      { name: "Nutella", price: 220, stock: 60 },
    ],
  },
];
