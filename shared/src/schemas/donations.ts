import { z } from "zod";
import { honeypot, localized, localizedOptional, objectId, optionalEmail, optionalText, paginationQuery, phone, requiredText } from "./common";

export const channelTypes = ["bank", "qr"] as const;

/** Saudi IBAN: SA + 22 digits. Spaces are stripped. */
export const ibanSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/\s/g, "").toUpperCase())
  .pipe(z.string().regex(/^SA\d{22}$/, "invalid_iban"));

export const donationChannelSchema = z.object({
  type: z.enum(channelTypes),
  title: localized(120),
  description: localizedOptional(500).optional(),
  bankName: z.string().trim().max(120).optional(),
  accountName: z.string().trim().max(150).optional(),
  iban: z.preprocess((v) => (v === "" ? undefined : v), ibanSchema.optional()),
  qrImageUrl: z.string().trim().max(500).optional(),
  active: z.boolean().default(true),
});
export const donationChannelUpdateSchema = donationChannelSchema.partial();
export type DonationChannelInput = z.input<typeof donationChannelSchema>;

export const donationNotifyStatuses = ["pending", "confirmed", "rejected"] as const;
export const donationNotifyStatus = z.enum(donationNotifyStatuses);

/** The donor tells us they transferred money, so we can match it and thank them. */
export const donationNotifySchema = z.object({
  name: requiredText(100),
  phone,
  email: optionalEmail,
  amount: z.coerce.number().positive("required").max(10_000_000),
  channelId: objectId.optional(),
  transferDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "invalid_date"),
  reference: optionalText(100),
  /** "المانح الدائم" — would like to give monthly. */
  recurring: z.boolean().default(false),
  notes: optionalText(1000),
  ...honeypot,
});
export type DonationNotifyInput = z.input<typeof donationNotifySchema>;

export const notificationListQuery = paginationQuery.extend({ status: donationNotifyStatus.optional() });
export const notificationAdminUpdateSchema = z
  .object({ status: donationNotifyStatus, adminNotes: z.string().trim().max(2000) })
  .partial();
