import { z } from 'zod'
import { localized, localizedOptional, optionalUrl, publishStatus, slug } from './common'

export const seoSchema = z
  .object({ title: localizedOptional(120), description: localizedOptional(300) })
  .optional()
  .default({ title: { ar: '', en: '' }, description: { ar: '', en: '' } })

export const pageSchema = z.object({
  title: localized(200),
  slug: z.union([slug, z.literal('')]).optional().default(''),
  content: localizedOptional(200_000),
  excerpt: localizedOptional(500),
  coverImage: optionalUrl,
  seo: seoSchema,
  status: publishStatus.default('draft'),
  showInNav: z.boolean().optional().default(false),
  navOrder: z.coerce.number().int().min(0).max(1000).optional().default(0),
})
export type PageInput = z.input<typeof pageSchema>
export type PageData = z.output<typeof pageSchema>
export const pageUpdateSchema = pageSchema.partial()
