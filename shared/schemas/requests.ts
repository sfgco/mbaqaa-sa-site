import { z } from 'zod'
import { email, honeypot, objectId, optionalEmail, optionalUrl, saPhone } from './common'

export const requestTypes = ['clothes', 'volunteer', 'partnership'] as const
export const requestType = z.enum(requestTypes)
export type RequestType = z.infer<typeof requestType>

// ---------- Clothing donation ----------
export const itemTypes = ['men', 'women', 'children', 'shoes', 'other'] as const
export const clothingConditions = ['new', 'good', 'used', 'mixed'] as const
export const timeSlots = ['morning', 'afternoon', 'evening'] as const
export const clothingStatuses = ['new', 'scheduled', 'collected', 'sorted', 'cancelled'] as const

export const clothingDonationSchema = z
  .object({
    donorType: z.enum(['individual', 'company']),
    name: z.string().trim().min(2).max(120),
    companyName: z.string().trim().max(200).optional().default(''),
    phone: saPhone,
    email: optionalEmail,
    city: z.string().trim().min(2).max(80),
    district: z.string().trim().max(120).optional().default(''),
    address: z.string().trim().max(500).optional().default(''),
    locationUrl: optionalUrl,
    itemTypes: z.array(z.enum(itemTypes)).min(1),
    bagsCount: z.coerce.number().int().min(1).max(1000),
    condition: z.enum(clothingConditions),
    method: z.enum(['pickup', 'dropoff']),
    preferredDate: z.coerce.date().optional(),
    preferredTimeSlot: z.union([z.enum(timeSlots), z.literal('')]).optional().default(''),
    notes: z.string().trim().max(2000).optional().default(''),
    website: honeypot,
  })
  .refine((d) => d.donorType !== 'company' || d.companyName.length > 0, {
    path: ['companyName'],
    message: 'required',
  })
  .refine((d) => d.method !== 'pickup' || d.address.length > 0 || d.locationUrl.length > 0, {
    path: ['address'],
    message: 'address_required_for_pickup',
  })
export type ClothingDonationInput = z.input<typeof clothingDonationSchema>

export const clothingAdminUpdateSchema = z.object({
  status: z.enum(clothingStatuses).optional(),
  scheduledAt: z.union([z.coerce.date(), z.null()]).optional(),
  assignedTo: z.union([objectId, z.null()]).optional(),
  internalNotes: z.string().max(5000).optional(),
})

// ---------- Volunteer ----------
export const ageRanges = ['under18', '18-24', '25-34', '35-44', '45+'] as const
export const volunteerStatuses = ['new', 'contacted', 'accepted', 'rejected', 'archived'] as const
export const availabilityOptions = ['weekdays', 'weekends', 'evenings', 'flexible'] as const

export const volunteerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: saPhone,
  email,
  city: z.string().trim().min(2).max(80),
  ageRange: z.enum(ageRanges),
  gender: z.union([z.enum(['male', 'female']), z.literal('')]).optional().default(''),
  skills: z.array(z.string().trim().min(1).max(80)).max(20).optional().default([]),
  interests: z.array(z.string().trim().min(1).max(80)).max(20).optional().default([]),
  availability: z.enum(availabilityOptions),
  message: z.string().trim().max(2000).optional().default(''),
  website: honeypot,
})
export type VolunteerInput = z.input<typeof volunteerSchema>
export const volunteerAdminUpdateSchema = z.object({
  status: z.enum(volunteerStatuses).optional(),
  internalNotes: z.string().max(5000).optional(),
})

// ---------- Partnership ----------
export const orgTypes = ['company', 'government', 'educational', 'charity', 'other'] as const
export const partnershipStatuses = ['new', 'in_discussion', 'agreed', 'declined', 'archived'] as const

export const partnershipSchema = z.object({
  organization: z.string().trim().min(2).max(200),
  orgType: z.enum(orgTypes),
  contactName: z.string().trim().min(2).max(120),
  phone: saPhone,
  email,
  interest: z.string().trim().min(2).max(200),
  message: z.string().trim().max(3000).optional().default(''),
  website: honeypot,
})
export type PartnershipInput = z.input<typeof partnershipSchema>
export const partnershipAdminUpdateSchema = z.object({
  status: z.enum(partnershipStatuses).optional(),
  internalNotes: z.string().max(5000).optional(),
})

export const requestListQuery = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  q: z.string().trim().max(200).optional(),
  status: z.string().trim().max(40).optional(),
  city: z.string().trim().max(80).optional(),
  method: z.enum(['pickup', 'dropoff']).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
})
