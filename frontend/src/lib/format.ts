import type { Lang, Localized } from '@mbaqaa/shared'

/** Picks the current language, falling back to Arabic. */
export function pick(value: Localized | undefined | null, lang: string) {
  if (!value) return ''
  return (lang === 'en' ? value.en : value.ar) || value.ar || value.en || ''
}

const locale = (lang: string) => (lang === 'en' ? 'en-GB' : 'ar-SA-u-nu-latn')

export function formatDate(value: string | Date | undefined, lang: string) {
  if (!value) return ''
  return new Intl.DateTimeFormat(locale(lang), { dateStyle: 'medium' }).format(new Date(value))
}

export function formatDateTime(value: string | Date | undefined, lang: string) {
  if (!value) return ''
  return new Intl.DateTimeFormat(locale(lang), { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

/** Halalas → "1,234.50 ر.س" */
export function formatSar(halalas: number, lang: string) {
  return new Intl.NumberFormat(locale(lang), { style: 'currency', currency: 'SAR' }).format(halalas / 100)
}

export const otherLang = (lang: string): Lang => (lang === 'ar' ? 'en' : 'ar')
