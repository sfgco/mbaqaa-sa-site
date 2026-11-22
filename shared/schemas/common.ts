import { z } from 'zod'

/** Localized text: `ar` required, `en` optional. */
export const localized = (max = 500) =>
  z.object({
    ar: z.string().trim().min(1).max(max),
    en: z.string().trim().max(max).optional().default(''),
  })

/** Localized text where both languages are optional (descriptions, SEO…). */
export const localizedOptional = (max = 2000) =>
  z
    .object({
      ar: z.string().trim().max(max).optional().default(''),
      en: z.string().trim().max(max).optional().default(''),
    })
    .optional()
    .default({ ar: '', en: '' })

export type Localized = { ar: string; en?: string }

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'invalid id')

export const slug = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u, 'invalid slug')
  .max(120)

export const publishStatus = z.enum(['draft', 'published'])
export type PublishStatus = z.infer<typeof publishStatus>

export const url = z.string().trim().url().max(2000)
export const optionalUrl = z.union([url, z.literal('')]).optional().default('')

/** Saudi mobile, normalized to +9665XXXXXXXX. Accepts 05XXXXXXXX, 5XXXXXXXX, 9665…, +9665…, 009665… */
export function normalizeSaPhone(input: string): string | null {
  const digits = input.replace(/[\s\-()]/g, '').replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
  const m = digits.match(/^(?:\+?966|00966|0)?(5\d{8})$/)
  return m ? `+966${m[1]}` : null
}
export const saPhone = z
  .string()
  .trim()
  .transform((v, ctx) => {
    const n = normalizeSaPhone(v)
    if (!n) {
      ctx.addIssue({ code: 'custom', message: 'invalid_phone' })
      return z.NEVER
    }
    return n
  })

export const email = z.string().trim().toLowerCase().email().max(200)
export const optionalEmail = z.union([email, z.literal('')]).optional().default('')

/** IBAN (Saudi): SA + 22 digits, mod-97 checksum. Spaces ignored; output is compact uppercase. */
export function normalizeIban(input: string): string {
  return input.replace(/\s+/g, '').toUpperCase()
}
export function isValidSaIban(input: string): boolean {
  const iban = normalizeIban(input)
  if (!/^SA\d{22}$/.test(iban)) return false
  const rearranged = iban.slice(4) + iban.slice(0, 4)
  const numeric = rearranged.replace(/[A-Z]/g, (c) => String(c.charCodeAt(0) - 55))
  let rem = 0
  for (const ch of numeric) rem = (rem * 10 + Number(ch)) % 97
  return rem === 1
}
export function formatIban(input: string): string {
  return normalizeIban(input).replace(/(.{4})/g, '$1 ').trim()
}
export const iban = z
  .string()
  .transform(normalizeIban)
  .refine(isValidSaIban, { message: 'invalid_iban' })

/** Honeypot: bots fill it, humans don't see it. Must be empty. */
export const honeypot = z.string().max(0).optional().default('')

export const listQuery = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(12),
  q: z.string().trim().max(200).optional(),
  status: z.string().trim().max(40).optional(),
  tag: z.string().trim().max(80).optional(),
  sort: z.string().trim().max(40).optional(),
})
export type ListQuery = z.infer<typeof listQuery>

export const reorderSchema = z.object({ ids: z.array(objectId).min(1).max(500) })

/** Date coming from <input type="date"> (YYYY-MM-DD) or ISO string. */
export const dateInput = z.coerce.date()
