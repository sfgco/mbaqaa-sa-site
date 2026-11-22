import { z } from "zod";
import { honeypot, optionalEmail, paginationQuery, phone, requiredText } from "./common";

export const contactStatuses = ["new", "read", "replied", "archived"] as const;
export const contactStatus = z.enum(contactStatuses);

export const contactSchema = z.object({
  name: requiredText(100),
  phone,
  email: optionalEmail,
  subject: requiredText(150),
  message: requiredText(3000),
  ...honeypot,
});
export type ContactInput = z.input<typeof contactSchema>;

export const contactListQuery = paginationQuery.extend({ status: contactStatus.optional() });
export const contactAdminUpdateSchema = z
  .object({ status: contactStatus, adminNotes: z.string().trim().max(2000) })
  .partial();
