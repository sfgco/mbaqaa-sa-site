import { z } from "zod";

/** Saudi mobile: 05XXXXXXXX, 5XXXXXXXX, +9665XXXXXXXX or 009665XXXXXXXX. */
export const saudiPhoneRegex = /^(?:\+?966|00966|0)?5\d{8}$/;

export const phone = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, ""))
  .pipe(z.string().regex(saudiPhoneRegex, "invalid_phone"));

export const optionalEmail = z
  .union([z.literal(""), z.string().trim().toLowerCase().email("invalid_email")])
  .optional()
  .transform((v) => (v ? v : undefined));

export const requiredText = (max = 200) => z.string().trim().min(1, "required").max(max, "too_long");
export const optionalText = (max = 1000) =>
  z.string().trim().max(max, "too_long").optional().transform((v) => (v ? v : undefined));

/** Honeypot: must stay empty. Bots fill every input. */
export const honeypot = { website: z.string().max(0).optional() };

/** Bilingual text. Arabic is required, English is optional. */
export const localized = (max = 500) =>
  z.object({
    ar: z.string().trim().min(1, "required").max(max),
    en: z.string().trim().max(max).default(""),
  });

export const publishStatus = z.enum(["draft", "published"]);
export type PublishStatus = z.infer<typeof publishStatus>;

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, "invalid_id");
export const reorderSchema = z.object({ ids: z.array(objectId).min(1).max(500) });

export const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  q: z.string().trim().max(100).optional(),
});

/** Bilingual text where both languages may be empty (settings, optional descriptions). */
export const localizedOptional = (max = 500) =>
  z.object({ ar: z.string().trim().max(max).default(""), en: z.string().trim().max(max).default("") });
