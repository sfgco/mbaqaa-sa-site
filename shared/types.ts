/**
 * API response DTOs (JSON shapes). Dates are ISO strings on the wire.
 * Inputs are the Zod schemas in ./schemas; these are the outputs.
 */
import type { DocumentSection } from './schemas/document'
import type { Role } from './schemas/user'
import type { VideoProvider } from './schemas/video'
import type { NavItem } from './schemas/navigation'
import type { Settings } from './schemas/settings'

export type { NavItem, Settings, Role, DocumentSection, VideoProvider }

export interface L {
  ar: string
  en?: string
}

export type PublishStatus = 'draft' | 'published'

export interface Paginated<T> {
  items: T[]
  page: number
  limit: number
  total: number
}

export interface ApiErrorBody {
  error: { code: string; message: string; details?: unknown }
}

interface Base {
  _id: string
  createdAt: string
  updatedAt: string
}

export interface Seo {
  title?: L
  description?: L
}

export interface User extends Base {
  name: string
  email: string
  role: Role
  active: boolean
  lastLoginAt?: string
}

export interface Page extends Base {
  title: L
  slug: string
  content: L
  excerpt: L
  coverImage: string
  seo: Seo
  status: PublishStatus
  showInNav: boolean
  navOrder: number
}

export interface Post extends Base {
  title: L
  slug: string
  excerpt: L
  content: L // omitted (empty) in list responses
  coverImage: string
  tags: string[]
  category: string
  author?: { _id: string; name: string } | null
  status: PublishStatus
  publishedAt?: string
  seo: Seo
}

export interface Album extends Base {
  title: L
  slug: string
  description: L
  coverImage: string
  order: number
  status: PublishStatus
  imageCount?: number
}

export interface GalleryImage extends Base {
  album: string
  url: string
  publicId: string
  width: number
  height: number
  caption: L
  alt: L
  order: number
}

export interface AlbumWithImages {
  album: Album
  images: GalleryImage[]
}

export interface Video extends Base {
  title: L
  description: L
  provider: VideoProvider
  videoId: string
  url: string
  thumbnailUrl: string
  publishedAt?: string
  status: PublishStatus
  featured: boolean
  order: number
}

export interface FaqCategory extends Base {
  name: L
  slug: string
  order: number
  active: boolean
}

export interface Faq extends Base {
  question: L
  answer: L
  slug: string
  category: string
  order: number
  status: PublishStatus
}

/** GET /faqs */
export interface FaqGroup extends FaqCategory {
  faqs: Faq[]
}

export interface DocumentCategory extends Base {
  name: L
  slug: string
  description: L
  section: DocumentSection
  order: number
  active: boolean
  documentCount?: number
}

export interface DocumentItem extends Base {
  title: L
  slug: string
  description: L
  /** Populated in public and admin list/detail responses. */
  category: Pick<DocumentCategory, '_id' | 'name' | 'slug' | 'section'>
  year: number
  issuedAt?: string
  fileUrl: string
  publicId: string
  fileSize: number
  pageCount: number
  thumbnailUrl: string
  status: PublishStatus
  featured: boolean
  order: number
  downloads: number
}

/** GET /documents adds the years available for the current filters. */
export interface DocumentList extends Paginated<DocumentItem> {
  years: number[]
}

export interface Navigation {
  items: NavItem[]
}

export interface ContactRequest extends Base {
  name: string
  email: string
  phone: string
  subject: string
  message: string
  status: 'new' | 'read' | 'replied' | 'archived'
  notes: string
}

export interface ClothingDonation extends Base {
  donorType: 'individual' | 'company'
  name: string
  companyName: string
  phone: string
  email: string
  city: string
  district: string
  address: string
  locationUrl: string
  itemTypes: string[]
  bagsCount: number
  condition: string
  method: 'pickup' | 'dropoff'
  preferredDate?: string
  preferredTimeSlot: string
  notes: string
  status: 'new' | 'scheduled' | 'collected' | 'sorted' | 'cancelled'
  scheduledAt?: string | null
  assignedTo?: { _id: string; name: string } | null
  internalNotes: string
}

export interface Volunteer extends Base {
  name: string
  phone: string
  email: string
  city: string
  ageRange: string
  gender: string
  skills: string[]
  interests: string[]
  availability: string
  message: string
  status: 'new' | 'contacted' | 'accepted' | 'rejected' | 'archived'
  internalNotes: string
}

export interface PartnershipRequest extends Base {
  organization: string
  orgType: string
  contactName: string
  phone: string
  email: string
  interest: string
  message: string
  status: 'new' | 'in_discussion' | 'agreed' | 'declined' | 'archived'
  internalNotes: string
}

export interface DonationChannel extends Base {
  title: L
  type: 'bank' | 'platform' | 'wallet' | 'other'
  qrImageUrl: string
  qrPublicId?: string // admin only
  bankName: L
  accountName: string
  iban: string
  accountNumber: string
  link: string
  instructions: L
  order: number
  active: boolean
}

export interface DonationNotification extends Base {
  donorName: string
  phone: string
  email: string
  amount: number // halalas
  currency: string
  channel: { _id: string; title: L } | null
  transferDate: string
  hasReceipt: boolean
  monthlyPledge: boolean
  anonymous: boolean
  message: string
  status: 'pending' | 'confirmed' | 'rejected'
  reviewedBy?: { _id: string; name: string } | null
  reviewedAt?: string
  internalNotes: string
}

/** GET /donations/admin/notifications */
export interface DonationNotificationList extends Paginated<DonationNotification> {
  totals: { confirmedTotal: number; confirmedThisMonth: number; pendingCount: number }
}

export interface Stats {
  contact: { new: number }
  clothes: { new: number; scheduledToday: number }
  volunteers: { new: number }
  partnerships: { new: number }
  donations: { pending: number; confirmedThisMonth: number; confirmedTotal: number }
  posts: { published: number }
  documents: { published: number }
  recent: Array<{ type: 'contact' | 'clothes' | 'volunteer' | 'partnership' | 'donation'; id: string; title: string; createdAt: string }>
}

/** GET /settings (public subset). Admin GET /settings/admin returns the same shape. */
export type PublicSettings = Settings
