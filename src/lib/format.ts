import type { L } from '@shared/types'
import { formatIban } from '@shared/schemas/common'

export type Lang = 'ar' | 'en'

/** Pick the active language, falling back to Arabic. */
export function pickL(v: L | undefined | null, lang: Lang): string {
  if (!v) return ''
  return (lang === 'en' ? v.en || v.ar : v.ar) ?? ''
}

const intlLocale = (lang: Lang) => (lang === 'ar' ? 'ar-SA-u-ca-gregory-nu-latn' : 'en-GB')

export function formatDate(d: string | Date | undefined | null, lang: Lang, opts?: Intl.DateTimeFormatOptions): string {
  if (!d) return ''
  return new Intl.DateTimeFormat(intlLocale(lang), opts ?? { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(d))
}

export function formatDateTime(d: string | Date | undefined | null, lang: Lang): string {
  return formatDate(d, lang, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

/** Halalas → localized SAR string. */
export function formatMoney(halalas: number, lang: Lang, currency = 'SAR'): string {
  return new Intl.NumberFormat(intlLocale(lang), { style: 'currency', currency }).format(halalas / 100)
}

export function formatNumber(n: number, lang: Lang): string {
  return new Intl.NumberFormat(intlLocale(lang)).format(n)
}

export function formatBytes(bytes: number, lang: Lang): string {
  const mb = bytes / (1024 * 1024)
  return mb >= 1
    ? `${new Intl.NumberFormat(intlLocale(lang), { maximumFractionDigits: 1 }).format(mb)} MB`
    : `${new Intl.NumberFormat(intlLocale(lang), { maximumFractionDigits: 0 }).format(bytes / 1024)} KB`
}

export { formatIban }

/** Cloudinary delivery transformation (w_, q_auto, f_auto). Non-Cloudinary URLs are returned as-is. */
export function cld(url: string | undefined, width: number, extra = ''): string {
  if (!url) return ''
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url
  return url.replace('/upload/', `/upload/w_${width},c_limit,q_auto,f_auto${extra ? ',' + extra : ''}/`)
}

/** WhatsApp deep link from a +9665… number. */
export function whatsappLink(phone: string): string {
  return `https://wa.me/${phone.replace(/\D/g, '')}`
}
