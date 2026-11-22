import { z } from "zod";
import { honeypot, optionalEmail, optionalText, paginationQuery, phone, requiredText } from "./common";

export const requestTypes = ["clothes", "volunteer", "partnership"] as const;
export const requestType = z.enum(requestTypes);
export type RequestType = z.infer<typeof requestType>;

export const requestStatuses = ["new", "in_progress", "completed", "cancelled"] as const;
export const requestStatus = z.enum(requestStatuses);
export type RequestStatus = z.infer<typeof requestStatus>;

/** In-kind clothes donation: we arrange a pickup. */
export const clothesQuantities = ["bag", "few_bags", "large"] as const;
export const clothesRequestSchema = z.object({
  name: requiredText(100),
  phone,
  email: optionalEmail,
  city: requiredText(80),
  district: requiredText(80),
  address: optionalText(300),
  quantity: z.enum(clothesQuantities),
  itemTypes: z.array(z.enum(["men", "women", "children", "shoes", "other"])).min(1, "required"),
  preferredDate: optionalText(20),
  notes: optionalText(1000),
  ...honeypot,
});

export const volunteerAreas = ["sorting", "pickup", "awareness", "events", "media", "other"] as const;
export const volunteerRequestSchema = z.object({
  name: requiredText(100),
  phone,
  email: optionalEmail,
  city: requiredText(80),
  gender: z.enum(["male", "female"]),
  age: z.coerce.number().int().min(15, "too_young").max(80),
  areas: z.array(z.enum(volunteerAreas)).min(1, "required"),
  availability: z.enum(["weekdays", "weekends", "flexible"]),
  experience: optionalText(1000),
  ...honeypot,
});

export const partnerTypes = ["company", "government", "educational", "nonprofit", "other"] as const;
export const partnershipRequestSchema = z.object({
  organization: requiredText(150),
  contactName: requiredText(100),
  phone,
  email: z.string().trim().toLowerCase().email("invalid_email"),
  partnerType: z.enum(partnerTypes),
  message: requiredText(2000),
  ...honeypot,
});

export const requestSchemas = {
  clothes: clothesRequestSchema,
  volunteer: volunteerRequestSchema,
  partnership: partnershipRequestSchema,
} as const;

export type ClothesRequestInput = z.input<typeof clothesRequestSchema>;
export type VolunteerRequestInput = z.input<typeof volunteerRequestSchema>;
export type PartnershipRequestInput = z.input<typeof partnershipRequestSchema>;

export const requestListQuery = paginationQuery.extend({ status: requestStatus.optional() });
export const requestAdminUpdateSchema = z
  .object({ status: requestStatus, adminNotes: z.string().trim().max(2000) })
  .partial();
