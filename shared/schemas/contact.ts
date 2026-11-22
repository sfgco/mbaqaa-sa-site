import { z } from 'zod'
import { email, honeypot, saPhone } from './common'

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email,
  phone: z.union([saPhone, z.literal('')]).optional().default(''),
  subject: z.string().trim().min(2).max(200),
  message: z.string().trim().min(10).max(5000),
  website: honeypot,
})
export type ContactInput = z.input<typeof contactSchema>

export const contactStatuses = ['new', 'read', 'replied', 'archived'] as const
export const contactAdminUpdateSchema = z.object({
  status: z.enum(contactStatuses).optional(),
  notes: z.string().max(5000).optional(),
})
