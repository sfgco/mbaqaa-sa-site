import { z } from 'zod'
import { honeypot, iban, localized, localizedOptional, objectId, optionalEmail, optionalUrl, saPhone, url } from './common'
import { sarToHalalas } from './money'

export const channelTypes = ['bank', 'platform', 'wallet', 'other'] as const

export const donationChannelSchema = z
  .object({
    title: localized(150),
    type: z.enum(channelTypes),
    qrImageUrl: z.union([url, z.literal('')]).optional().default(''),
    qrPublicId: z.string().max(300).optional().default(''),
    bankName: localizedOptional(150),
    accountName: z.string().trim().max(200).optional().default(''),
    iban: z.union([iban, z.literal('')]).optional().default(''),
    accountNumber: z.string().trim().max(40).optional().default(''),
    link: optionalUrl,
    instructions: localizedOptional(1000),
    order: z.coerce.number().int().min(0).optional().default(0),
    active: z.boolean().optional().default(true),
  })
  .refine((c) => c.type !== 'bank' || c.iban.length > 0, { path: ['iban'], message: 'required' })
export type DonationChannelInput = z.input<typeof donationChannelSchema>
// Partial update: IBAN still validated if present.
export const donationChannelUpdateSchema = z.object({
  title: localized(150).optional(),
  type: z.enum(channelTypes).optional(),
  qrImageUrl: z.union([url, z.literal('')]).optional(),
  qrPublicId: z.string().max(300).optional(),
  bankName: localizedOptional(150),
  accountName: z.string().trim().max(200).optional(),
  iban: z.union([iban, z.literal('')]).optional(),
  accountNumber: z.string().trim().max(40).optional(),
  link: optionalUrl,
  instructions: localizedOptional(1000),
  order: z.coerce.number().int().min(0).optional(),
  active: z.boolean().optional(),
})

export const MAX_RECEIPT_BYTES = 5 * 1024 * 1024
export const MAX_QR_BYTES = 2 * 1024 * 1024

/** Public donation notification ("إشعار تبرع"). `amount` is SAR as entered; server stores halalas. */
export const donationNotifySchema = z
  .object({
    donorName: z.string().trim().max(120).optional().default(''),
    phone: saPhone,
    email: optionalEmail,
    amount: z
      .union([z.string(), z.number()])
      .refine((v) => {
        const h = sarToHalalas(v)
        return h !== null && h >= 100 && h <= 100_000_000_00
      }, { message: 'invalid_amount' }),
    channel: objectId,
    transferDate: z.coerce.date(),
    receiptPublicId: z.string().max(300).optional().default(''),
    receiptResourceType: z.enum(['image', 'raw']).optional().default('image'),
    receiptFormat: z.string().max(10).optional().default(''),
    monthlyPledge: z.boolean().optional().default(false),
    anonymous: z.boolean().optional().default(false),
    message: z.string().trim().max(2000).optional().default(''),
    website: honeypot,
  })
  .refine((d) => d.anonymous || d.donorName.length >= 2, { path: ['donorName'], message: 'required' })
export type DonationNotifyInput = z.input<typeof donationNotifySchema>

export const notificationStatuses = ['pending', 'confirmed', 'rejected'] as const
export const notificationAdminUpdateSchema = z.object({
  status: z.enum(notificationStatuses).optional(),
  internalNotes: z.string().max(5000).optional(),
})

export const notificationListQuery = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  q: z.string().trim().max(200).optional(),
  status: z.enum(notificationStatuses).optional(),
  channel: objectId.optional(),
  monthlyPledge: z.enum(['true', 'false']).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
})
