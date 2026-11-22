import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import type { L } from '@shared/types'
import { pickL, type Lang } from '@/lib/format'

/** Active language + helpers: `l(localized)` picks text, `to('/path')` adds the /en prefix when needed. */
export function useLang() {
  const { i18n } = useTranslation()
  const lang: Lang = i18n.language === 'en' ? 'en' : 'ar'
  const l = useCallback((v: L | undefined | null) => pickL(v, lang), [lang])
  const to = useCallback(
    (path: string) => {
      if (/^https?:\/\//.test(path) || path.startsWith('/admin')) return path
      return lang === 'en' ? `/en${path === '/' ? '' : path}` || '/en' : path
    },
    [lang],
  )
  return { lang, l, to, dir: lang === 'ar' ? ('rtl' as const) : ('ltr' as const) }
}

/** URL for the same page in the other language. */
export function useSwitchLangPath() {
  const { pathname, search, hash } = useLocation()
  const isEn = pathname === '/en' || pathname.startsWith('/en/')
  const target = isEn ? pathname.replace(/^\/en/, '') || '/' : `/en${pathname === '/' ? '' : pathname}`
  return target + search + hash
}
