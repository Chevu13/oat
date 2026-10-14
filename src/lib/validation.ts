import { z } from "zod";

const trimmed = (min: number, max: number, msg: string) => z.string({ error: msg }).trim().min(min, msg).max(max, "Predugačak unos.");

/** Shared by the checkout form (instant feedback) and the server action (authoritative). */
export const customerSchema = z.object({
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
  street: trimmed(3, 200, "Unesite ulicu i broj."),
  city: trimmed(2, 80, "Unesite grad."),
  postal_code: z.string({ error: "Unesite poštanski broj." }).trim().regex(/^\d{5}$/, "Poštanski broj ima 5 cifara."),
  note: z
    .string()
    .max(1000, "Napomena je predugačka.")
    .optional()
    .transform((v) => v?.trim() || null),
  payment_method: z.literal("pouzece", "Izaberite način plaćanja."),
});

export const itemsSchema = z
  .array(z.object({ variant_id: z.uuid(), quantity: z.number().int().min(1).max(99) }))
  .min(1, "Korpa je prazna.")
  .max(50);

export type FieldErrors = Partial<Record<keyof z.infer<typeof customerSchema>, string>>;

export function fieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const k = issue.path[0] as keyof FieldErrors;
    if (k && !out[k]) out[k] = issue.message;
  }
  return out;
}
