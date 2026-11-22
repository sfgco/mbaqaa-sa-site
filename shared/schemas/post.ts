import { z } from 'zod'
import { localized, localizedOptional, optionalUrl, publishStatus, slug } from './common'
import { seoSchema } from './page'

export const postSchema = z.object({
  title: localized(200),
  slug: z.union([slug, z.literal('')]).optional().default(''),
  excerpt: localizedOptional(500),
  content: localizedOptional(200_000),
  coverImage: optionalUrl,
  tags: z.array(z.string().trim().min(1).max(60)).max(20).optional().default([]),
  category: z.string().trim().max(80).optional().default(''),
  status: publishStatus.default('draft'),
  publishedAt: z.coerce.date().optional(),
  seo: seoSchema,
})
export type PostInput = z.input<typeof postSchema>
export const postUpdateSchema = postSchema.partial()

export const postListQuery = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(12),
  q: z.string().trim().max(200).optional(),
  tag: z.string().trim().max(60).optional(),
  category: z.string().trim().max(80).optional(),
  status: publishStatus.optional(),
})
