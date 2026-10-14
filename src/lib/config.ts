export const site = {
  name: "OAT BOMB",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  description:
    "OAT BOMB — proteinske ovsene kaše u 12 ukusa: Choco Raspberry, Nutella, Snickers, Tiramisu, Pistachio i drugi. Poruči online: dostava uz plaćanje pouzećem ili lično preuzimanje.",
  // Public on @oat_bomb posts.
  phone: "063 833 1192",
  phoneHref: "tel:+381638331192",
  instagram: "https://www.instagram.com/oat_bomb/",
  instagramHandle: "@oat_bomb",
  // ⚠ PLACEHOLDER — client must confirm before launch.
  email: "info@oatbomb.rs",
  // ⚠ PLACEHOLDER — pickup address and hours, client must confirm.
  pickup: "Adresa radnje i radno vreme: čeka potvrdu",
  legalPlaceholder: true,
};

// Delivery pricing — PLACEHOLDER values for the demo. Keep in sync with place_order() in
// supabase/migrations/0001_init.sql (prepared for the future Supabase backend).
export const DELIVERY_FEE = 290;
export const FREE_DELIVERY_FROM = 3000;
export const shippingFor = (subtotal: number, method: "dostava" | "preuzimanje" = "dostava") =>
  method === "preuzimanje" || subtotal === 0 || subtotal >= FREE_DELIVERY_FROM ? 0 : DELIVERY_FEE;

export const showDemoNotice = process.env.NEXT_PUBLIC_SHOW_DEMO_NOTICE !== "false";
