import { z } from "zod";

const trimmed = (min: number, max: number, msg: string) => z.string({ error: msg }).trim().min(min, msg).max(max, "Predugačak unos.");

const contact = {
  customer_name: trimmed(2, 120, "Unesite ime i prezime."),
  email: z.string({ error: "Unesite ispravnu e-mail adresu." }).trim().toLowerCase().pipe(z.email("Unesite ispravnu e-mail adresu.")),
  phone: z
    .string({ error: "Unesite broj telefona." })
    .trim()
    .regex(/^[+\d][\d\s/()-]*$/, "Unesite ispravan broj telefona.")
    .refine((v) => {
      const d = v.replace(/\D/g, "").length;
      return d >= 8 && d <= 15;
    }, "Unesite ispravan broj telefona."),
  note: z
    .string()
    .max(1000, "Napomena je predugačka.")
    .optional()
    .transform((v) => v?.trim() || null),
};

const address = {
  street: trimmed(3, 200, "Unesite ulicu i broj."),
  city: trimmed(2, 80, "Unesite grad."),
  postal_code: z.string({ error: "Unesite poštanski broj." }).trim().regex(/^\d{5}$/, "Poštanski broj ima 5 cifara."),
};

const deliverySchema = z.object({ ...contact, ...address, delivery_method: z.literal("dostava") });
// Pickup needs no address; empty strings keep the stored order shape uniform.
const pickupSchema = z.object({
  ...contact,
  street: z.unknown().optional().transform(() => ""),
  city: z.unknown().optional().transform(() => ""),
  postal_code: z.unknown().optional().transform(() => ""),
  delivery_method: z.literal("preuzimanje"),
});

/** Shared by the checkout form (instant feedback) and the server action (authoritative). */
export const customerSchema = z.discriminatedUnion("delivery_method", [deliverySchema, pickupSchema], { error: "Izaberite način preuzimanja." });

/** Per-field rules for on-blur validation (address fields only matter for delivery). */
export const fieldRules = deliverySchema.shape;

export const itemsSchema = z
  .array(z.object({ variant_id: z.uuid(), quantity: z.number().int().min(1).max(99) }))
  .min(1, "Korpa je prazna.")
  .max(50);

export type FieldErrors = Partial<Record<keyof typeof fieldRules, string>>;

export function fieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const k = issue.path[0] as keyof FieldErrors;
    if (k && !out[k]) out[k] = issue.message;
  }
  return out;
}
