import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import type { Lang } from '@mbaqaa/shared'
import ar from './ar'
import en from './en'

const STORAGE_KEY = 'lang'

function initialLang(): Lang {
  const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
  return saved === 'en' ? 'en' : 'ar'
}

export function applyDocumentLang(lang: Lang) {
  document.documentElement.lang = lang
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
}

void i18n.use(initReactI18next).init({
  resources: { ar: { translation: ar }, en: { translation: en } },
  lng: initialLang(),
  fallbackLng: 'ar',
  interpolation: { escapeValue: false },
  returnObjects: true,
})

applyDocumentLang(i18n.language as Lang)
i18n.on('languageChanged', (lng) => {
  localStorage.setItem(STORAGE_KEY, lng)
  applyDocumentLang(lng as Lang)
})

export default i18n
