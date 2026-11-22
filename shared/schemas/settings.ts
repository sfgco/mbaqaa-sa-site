import { z } from 'zod'
import { localizedOptional, optionalUrl } from './common'

const lo = (max = 2000) => localizedOptional(max)

export const landingCardSchema = z.object({
  icon: z.string().max(40).optional().default(''), // lucide icon name
  title: lo(200),
  text: lo(1000),
})
export const landingSectionSchema = z.object({
  key: z.enum(['about', 'goals', 'programs', 'targetGroups', 'news', 'gallery', 'faq', 'donateCta']),
  enabled: z.boolean().default(true),
  title: lo(200),
  subtitle: lo(1000),
  items: z.array(landingCardSchema).max(20).optional().default([]),
})

export const settingsSchema = z.object({
  siteName: lo(150),
  logo: optionalUrl,
  licenseNumber: z.string().trim().max(60).optional().default(''),
  contact: z
    .object({
      email: z.string().trim().max(200).optional().default(''),
      phone: z.string().trim().max(40).optional().default(''),
      whatsapp: z.string().trim().max(40).optional().default(''),
      address: lo(500),
      mapUrl: optionalUrl,
    })
    .optional()
    .default({ email: '', phone: '', whatsapp: '', address: { ar: '', en: '' }, mapUrl: '' }),
  social: z
    .object({
      x: optionalUrl,
      instagram: optionalUrl,
      snapchat: optionalUrl,
      tiktok: optionalUrl,
      youtube: optionalUrl,
      linkedin: optionalUrl,
      facebook: optionalUrl,
    })
    .partial()
    .optional()
    .default({}),
  landing: z
    .object({
      hero: z.object({
        title: lo(200),
        subtitle: lo(1000),
        image: optionalUrl,
        primaryCta: z.object({ label: lo(60), href: z.string().max(300).default('/donate') }).optional(),
        secondaryCta: z.object({ label: lo(60), href: z.string().max(300).default('/donate/clothes') }).optional(),
      }),
      sections: z.array(landingSectionSchema).max(12).default([]),
    })
    .optional(),
  donation: z
    .object({
      intro: lo(3000),
      thankYouMessage: lo(2000),
      showNotifyForm: z.boolean().default(true),
    })
    .optional(),
})
export type SettingsInput = z.input<typeof settingsSchema>
export type Settings = z.output<typeof settingsSchema>
export const settingsUpdateSchema = settingsSchema.partial()
