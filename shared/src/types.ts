import type { z } from "zod";
import type { userRoles } from "./schemas/auth";
import type { RequestStatus, RequestType } from "./schemas/requests";
import type { contactStatuses } from "./schemas/contact";
import type { channelTypes, donationNotifyStatuses } from "./schemas/donations";
import type { postCategories, settingsSchema } from "./schemas/content";
import type { PublishStatus } from "./schemas/common";

export type Localized = { ar: string; en: string };
export type Lang = "ar" | "en";

export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
}

export interface ApiErrorBody {
  error: { code: string; message: string; details?: { fields?: Record<string, string[]> } };
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: (typeof userRoles)[number];
  active: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface RequestItem {
  _id: string;
  type: RequestType;
  status: RequestStatus;
  data: Record<string, unknown>;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactRequest {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  subject: string;
  message: string;
  status: (typeof contactStatuses)[number];
  adminNotes?: string;
  createdAt: string;
}

export interface DonationChannel {
  _id: string;
  type: (typeof channelTypes)[number];
  title: Localized;
  description?: Localized;
  bankName?: string;
  accountName?: string;
  iban?: string;
  qrImageUrl?: string;
  active: boolean;
  order: number;
}

export interface DonationNotification {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  /** Halalas (1 SAR = 100). */
  amount: number;
  channel?: { _id: string; title: Localized } | null;
  transferDate: string;
  reference?: string;
  recurring: boolean;
  notes?: string;
  status: (typeof donationNotifyStatuses)[number];
  adminNotes?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface DonationNotificationList extends Paginated<DonationNotification> {
  /** Sum of confirmed notifications in halalas. */
  confirmedTotal: number;
}

export interface Faq {
  _id: string;
  question: Localized;
  answer: Localized;
  category: string;
  status: PublishStatus;
  order: number;
}

export interface Post {
  _id: string;
  slug: string;
  title: Localized;
  excerpt: Localized;
  content?: Localized;
  coverImage?: string;
  category: (typeof postCategories)[number];
  status: PublishStatus;
  publishedAt?: string;
  author?: { _id: string; name: string } | null;
  createdAt: string;
}

export type Settings = z.output<typeof settingsSchema>;

export interface Stats {
  requests: Record<RequestType, { total: number; new: number }>;
  contact: { total: number; new: number };
  donations: { pending: number; confirmed: number; confirmedTotal: number };
  posts: { published: number; draft: number };
}
