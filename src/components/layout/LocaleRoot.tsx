import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Direction } from 'radix-ui'
import { applyLang, langFromPath } from '@/i18n'

/** Syncs <html lang/dir> + i18n with the URL (/en → English LTR, otherwise Arabic RTL). */
export function LocaleRoot() {
  const { pathname } = useLocation()
  const lang = langFromPath(pathname)
  useEffect(() => {
    applyLang(lang)
  }, [lang])
  useEffect(() => {
    if (!location.hash) window.scrollTo(0, 0)
  }, [pathname])
  return (
    <Direction.Provider dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <Outlet />
    </Direction.Provider>
  )
}
