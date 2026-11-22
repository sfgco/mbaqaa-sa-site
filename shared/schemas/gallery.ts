import { z } from 'zod'
import { localized, localizedOptional, objectId, optionalUrl, publishStatus, slug, url } from './common'

export const albumSchema = z.object({
  title: localized(200),
  slug: z.union([slug, z.literal('')]).optional().default(''),
  description: localizedOptional(2000),
  coverImage: optionalUrl,
  order: z.coerce.number().int().min(0).optional().default(0),
  status: publishStatus.default('draft'),
})
export type AlbumInput = z.input<typeof albumSchema>
export const albumUpdateSchema = albumSchema.partial()

export const imageSchema = z.object({
  album: objectId,
  url,
  publicId: z.string().max(300).optional().default(''),
  width: z.coerce.number().int().min(0).optional().default(0),
  height: z.coerce.number().int().min(0).optional().default(0),
  caption: localizedOptional(500),
  alt: localizedOptional(300),
  order: z.coerce.number().int().min(0).optional().default(0),
})
export type ImageInput = z.input<typeof imageSchema>
export const imageUpdateSchema = imageSchema.omit({ album: true, url: true, publicId: true }).partial()

/** Bulk add images after a multi-upload. */
export const imagesBulkSchema = z.object({
  album: objectId,
  images: z.array(imageSchema.omit({ album: true })).min(1).max(100),
})
