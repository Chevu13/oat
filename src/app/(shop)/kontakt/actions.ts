"use server";

import { z } from "zod";
import { store } from "@/lib/data";
import { fieldRules } from "@/lib/validation";
import { INQUIRY_TOPICS } from "@/lib/types";

const inquirySchema = z.object({
  name: z.string({ error: "Unesite ime i prezime." }).trim().min(2, "Unesite ime i prezime.").max(120),
  company: z
    .string()
    .trim()
    .max(120, "Predugačak naziv.")
    .optional()
    .transform((v) => v || null),
  email: fieldRules.email,
  phone: fieldRules.phone,
  topic: z.enum(INQUIRY_TOPICS, "Izaberite temu upita."),
  message: z.string({ error: "Napišite poruku." }).trim().min(10, "Poruka treba da ima bar 10 karaktera.").max(2000, "Poruka je predugačka."),
});

export type InquiryErrors = Partial<Record<keyof z.infer<typeof inquirySchema>, string>>;
export type InquiryResult = { ok: true } | { ok: false; error: string; fields?: InquiryErrors };

export async function sendInquiry(form: Record<string, unknown>): Promise<InquiryResult> {
  // Honeypot: bots fill every field, people never see this one.
  if (typeof form.website === "string" && form.website) return { ok: true };
  const parsed = inquirySchema.safeParse(form);
  if (!parsed.success) {
    const fields: InquiryErrors = {};
    for (const i of parsed.error.issues) {
      const k = i.path[0] as keyof InquiryErrors;
      if (k && !fields[k]) fields[k] = i.message;
    }
    return { ok: false, error: "Proverite označena polja.", fields };
  }
  try {
    await store.saveInquiry(parsed.data);
    return { ok: true };
  } catch (e) {
    console.error("sendInquiry failed", e);
    return { ok: false, error: "Slanje nije uspelo. Pokušajte ponovo ili nas pozovite." };
  }
}
