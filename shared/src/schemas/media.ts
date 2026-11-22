import { z } from "zod";
import { localized, localizedOptional, objectId, paginationQuery, publishStatus } from "./common";
import { slugSchema } from "./content";

/** Absolute http(s) URL or a site-relative path ("/files/x.pdf"). */
export const fileUrl = z
  .string()
  .trim()
  .max(1000)
  .refine((v) => /^https?:\/\/\S+$/i.test(v) || /^\/[^\s]*$/.test(v), "invalid_url");

const optionalFileUrl = z.preprocess((v) => (v === "" || v == null ? undefined : v), fileUrl.optional());
const optionalDate = z.preprocess((v) => (v === "" || v == null ? undefined : v), z.coerce.date().optional());

// ---------- Governance documents ----------
export const documentCategorySchema = z.object({
  slug: slugSchema,
  title: localized(150),
  description: localizedOptional(1000).default({ ar: "", en: "" }),
  active: z.boolean().default(true),
});
export const documentCategoryUpdateSchema = documentCategorySchema.partial();
export type DocumentCategoryInput = z.input<typeof documentCategorySchema>;

export const documentFileSchema = z.object({
  url: fileUrl,
  /** Page 1 rendered as an image when the file was uploaded. */
  thumbnailUrl: optionalFileUrl,
  pages: z.coerce.number().int().min(1).max(10_000).optional(),
  bytes: z.coerce.number().int().min(1).max(100 * 1024 * 1024).optional(),
});

export const documentSchema = z.object({
  category: objectId,
  slug: slugSchema,
  title: localized(250),
  description: localizedOptional(5000).default({ ar: "", en: "" }),
  year: z.preprocess((v) => (v === "" || v == null || Number.isNaN(v) ? undefined : v), z.coerce.number().int().min(1990).max(2100).optional()),
  file: documentFileSchema,
  status: publishStatus.default("published"),
  publishedAt: optionalDate,
});
export const documentUpdateSchema = documentSchema.partial();
export type DocumentInput = z.input<typeof documentSchema>;

export const documentListQuery = paginationQuery.extend({
  /** Category slug (public) or id (admin). */
  category: z.string().trim().max(120).optional(),
  year: z.coerce.number().int().min(1990).max(2100).optional(),
  status: publishStatus.optional(),
});

// ---------- Photo albums ----------
export const albumSchema = z.object({
  slug: slugSchema,
  title: localized(200),
  description: localizedOptional(3000).default({ ar: "", en: "" }),
  coverImage: optionalFileUrl,
  eventDate: optionalDate,
  status: publishStatus.default("published"),
});
export const albumUpdateSchema = albumSchema.partial();
export type AlbumInput = z.input<typeof albumSchema>;

export const albumImageSchema = z.object({
  url: fileUrl,
  caption: localizedOptional(300).default({ ar: "", en: "" }),
  width: z.coerce.number().int().positive().optional(),
  height: z.coerce.number().int().positive().optional(),
});
export const imagesBulkSchema = z.object({
  album: objectId,
  images: z.array(albumImageSchema).min(1).max(100),
});
export const imageUpdateSchema = z.object({ caption: localizedOptional(300) });
