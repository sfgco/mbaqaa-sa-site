import { z } from 'zod'
import { localized, objectId, publishStatus, slug } from './common'

export const faqCategorySchema = z.object({
  name: localized(120),
  slug: z.union([slug, z.literal('')]).optional().default(''),
  order: z.coerce.number().int().min(0).optional().default(0),
  active: z.boolean().optional().default(true),
})
export type FaqCategoryInput = z.input<typeof faqCategorySchema>
export const faqCategoryUpdateSchema = faqCategorySchema.partial()

export const faqSchema = z.object({
  question: localized(300),
  answer: localized(20_000),
  slug: z.union([slug, z.literal('')]).optional().default(''),
  category: objectId,
  order: z.coerce.number().int().min(0).optional().default(0),
  status: publishStatus.default('draft'),
})
export type FaqInput = z.input<typeof faqSchema>
export const faqUpdateSchema = faqSchema.partial()
