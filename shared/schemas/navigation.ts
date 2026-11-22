import { z } from 'zod'
import { localized } from './common'

const href = z
  .string()
  .trim()
  .min(1)
  .max(300)
  .refine((v) => v.startsWith('/') || /^https?:\/\//.test(v), { message: 'invalid_href' })

export const navLinkSchema = z.object({ label: localized(80), href })
export const navItemSchema = navLinkSchema.extend({
  href: href.optional().default(''),
  children: z.array(navLinkSchema).max(12).optional().default([]),
  isButton: z.boolean().optional().default(false),
})
export const navigationSchema = z.object({ items: z.array(navItemSchema).max(12) })
export type NavigationInput = z.input<typeof navigationSchema>
export type NavItem = z.output<typeof navItemSchema>
