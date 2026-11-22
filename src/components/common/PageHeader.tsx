import { ChevronLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { LocaleLink } from './LocaleLink'

export interface Crumb {
  label: string
  to?: string
}

/** Title band at the top of public pages, with breadcrumb. */
export function PageHeader({ title, subtitle, crumbs = [] }: { title: string; subtitle?: string; crumbs?: Crumb[] }) {
  const { t } = useTranslation()
  return (
    <header className="border-b bg-gradient-to-b from-secondary to-background">
      <div className="container mx-auto max-w-6xl px-4 py-10 md:py-14">
        <nav aria-label={t('nav.breadcrumb')} className="mb-4 text-sm text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <LocaleLink to="/" className="hover:text-foreground">
                {t('nav.home')}
              </LocaleLink>
            </li>
            {crumbs.map((c, i) => (
              <li key={i} className="flex items-center gap-1">
                <ChevronLeft className="size-4 ltr:rotate-180" aria-hidden />
                {c.to ? (
                  <LocaleLink to={c.to} className="hover:text-foreground">
                    {c.label}
                  </LocaleLink>
                ) : (
                  <span aria-current="page">{c.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">{title}</h1>
        {subtitle ? <p className="mt-3 max-w-3xl text-lg text-muted-foreground">{subtitle}</p> : null}
      </div>
    </header>
  )
}
