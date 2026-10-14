const rsd = new Intl.NumberFormat("sr-Latn-RS", { maximumFractionDigits: 0 });
export const formatRSD = (n: number) => `${rsd.format(n)} RSD`;

const dt = new Intl.DateTimeFormat("sr-Latn-RS", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Belgrade" });
export const formatDate = (iso: string) => dt.format(new Date(iso));

export const effectivePrice = (v: { price: number; sale_price: number | null }) => v.sale_price ?? v.price;

/** Readable text color on top of a flavor accent. */
export function onAccent(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.35 ? "#121110" : "#F4F1EA";
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/đ/g, "dj")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
