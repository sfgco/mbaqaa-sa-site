import { z } from "zod";
import { localized, localizedOptional, paginationQuery, publishStatus } from "./common";

export const faqSchema = z.object({
  question: localized(300),
  answer: localized(3000),
  category: z.string().trim().max(60).default("general"),
  status: publishStatus.default("published"),
});
export const faqUpdateSchema = faqSchema.partial();
export type FaqInput = z.input<typeof faqSchema>;

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "invalid_slug")
  .max(120);

export const postCategories = ["news", "campaigns", "events", "awareness"] as const;

export const postSchema = z.object({
  slug: slugSchema,
  title: localized(200),
  excerpt: localized(500),
  content: localized(20000),
  coverImage: z.string().trim().max(500).optional().transform((v) => v || undefined),
  category: z.enum(postCategories).default("news"),
  status: publishStatus.default("draft"),
  publishedAt: z.preprocess((v) => (v === "" || v == null ? undefined : v), z.coerce.date().optional()),
});
export const postUpdateSchema = postSchema.partial();
export type PostInput = z.input<typeof postSchema>;

export const postListQuery = paginationQuery.extend({
  category: z.enum(postCategories).optional(),
  status: publishStatus.optional(),
});

const url = z.union([z.literal(""), z.string().trim().url("invalid_url")]).default("");

export const settingsSchema = z.object({
  phone: z.string().trim().max(30).default(""),
  whatsapp: z.string().trim().max(30).default(""),
  email: z.union([z.literal(""), z.string().trim().email("invalid_email")]).default(""),
  address: localizedOptional(300).default({ ar: "", en: "" }),
  licenseNumber: z.string().trim().max(50).default(""),
  workingHours: localizedOptional(200).default({ ar: "", en: "" }),
  mapUrl: url,
  social: z
    .object({ x: url, instagram: url, snapchat: url, tiktok: url, linkedin: url, youtube: url })
    .default({ x: "", instagram: "", snapchat: "", tiktok: "", linkedin: "", youtube: "" }),
});
export const settingsUpdateSchema = settingsSchema.partial();
export type SettingsInput = z.input<typeof settingsSchema>;
