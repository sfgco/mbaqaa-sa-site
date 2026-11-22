import { useTranslation } from 'react-i18next'
import type { Lang } from '@mbaqaa/shared'
import { otherLang } from '@/lib/format'

export function useLang() {
  const { i18n } = useTranslation()
  const lang = (i18n.language === 'en' ? 'en' : 'ar') as Lang
  return { lang, toggle: () => i18n.changeLanguage(otherLang(lang)), isRtl: lang === 'ar' }
}
