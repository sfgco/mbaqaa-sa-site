import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { z } from 'zod'
import arCommon from './locales/ar/common.json'
import arPublic from './locales/ar/public.json'
import arAdmin from './locales/ar/admin.json'
import enCommon from './locales/en/common.json'
import enPublic from './locales/en/public.json'
import enAdmin from './locales/en/admin.json'

export const LANGS = ['ar', 'en'] as const
export type Lang = (typeof LANGS)[number]

/** Language from the URL: `/en/...` → en, everything else → ar (admin uses the stored preference). */
export function langFromPath(pathname: string): Lang {
  if (pathname === '/en' || pathname.startsWith('/en/')) return 'en'
  if (pathname.startsWith('/admin')) return (localStorage.getItem('admin-lang') as Lang) === 'en' ? 'en' : 'ar'
  return 'ar'
}

export function applyLang(lang: Lang) {
  document.documentElement.lang = lang
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
  if (i18n.language !== lang) void i18n.changeLanguage(lang)
}

void i18n.use(initReactI18next).init({
  resources: {
    ar: { common: arCommon, public: arPublic, admin: arAdmin },
    en: { common: enCommon, public: enPublic, admin: enAdmin },
  },
  lng: langFromPath(window.location.pathname),
  fallbackLng: 'ar',
  ns: ['common', 'public', 'admin'],
  defaultNS: 'common',
  interpolation: { escapeValue: false },
  returnNull: false,
})

/**
 * Zod messages become i18n keys under `common:validation.*` (FormError translates them).
 * Messages set explicitly in shared schemas (e.g. 'invalid_phone') are kept as-is and also translated.
 */
z.config({
  customError: (iss) => {
    if (iss.code === 'too_small') return iss.minimum === 1 && iss.origin === 'string' ? 'required' : 'too_small'
    if (iss.code === 'too_big') return 'too_big'
    if (iss.code === 'invalid_format') return iss.format === 'email' ? 'invalid_email' : iss.format === 'url' ? 'invalid_url' : 'invalid'
    if (iss.code === 'invalid_type') return iss.input === undefined || iss.input === '' ? 'required' : 'invalid'
    if (iss.code === 'invalid_value') return 'required'
    return 'invalid'
  },
})

export default i18n
