import { z } from 'zod'
import { localized, localizedOptional, objectId, publishStatus, slug, url } from './common'

export const documentSections = ['strategy', 'governance', 'reports', 'other'] as const
export const documentSection = z.enum(documentSections)
export type DocumentSection = z.infer<typeof documentSection>

export const MAX_PDF_BYTES = 20 * 1024 * 1024

export const documentCategorySchema = z.object({
  name: localized(120),
  slug: z.union([slug, z.literal('')]).optional().default(''),
  description: localizedOptional(1000),
  section: documentSection,
  order: z.coerce.number().int().min(0).optional().default(0),
  active: z.boolean().optional().default(true),
})
export type DocumentCategoryInput = z.input<typeof documentCategorySchema>
export const documentCategoryUpdateSchema = documentCategorySchema.partial()

const currentYear = new Date().getFullYear()

export const documentSchema = z.object({
  title: localized(250),
  slug: z.union([slug, z.literal('')]).optional().default(''),
  description: localizedOptional(2000),
  category: objectId,
  year: z.coerce.number().int().min(1990).max(currentYear + 1),
  issuedAt: z.coerce.date().optional(),
  fileUrl: url,
  publicId: z.string().min(1).max(300),
  fileSize: z.coerce.number().int().min(1).max(MAX_PDF_BYTES, { message: 'file_too_large' }),
  pageCount: z.coerce.number().int().min(0).optional().default(0),
  thumbnailUrl: z.union([url, z.literal('')]).optional().default(''),
  status: publishStatus.default('draft'),
  featured: z.boolean().optional().default(false),
  order: z.coerce.number().int().min(0).optional().default(0),
})
export type DocumentInput = z.input<typeof documentSchema>
export const documentUpdateSchema = documentSchema.partial()

export const documentListQuery = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(12),
  section: documentSection.optional(),
  category: z.string().trim().max(120).optional(), // slug (public) or id (admin)
  year: z.coerce.number().int().optional(),
  q: z.string().trim().max(200).optional(),
  status: publishStatus.optional(),
})
