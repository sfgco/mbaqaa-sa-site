import { Shirt, Sparkles, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { PageHeader, Section } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { org } from '@/data/siteContent'
import { useLang } from '@/hooks/useLang'
import { pick } from '@/lib/format'

const meta = {
  reuse: { icon: Shirt, to: '/donate/clothes', cta: 'nav.donateClothes' },
  awareness: { icon: Users, to: '/partners', cta: 'nav.partners' },
  smart: { icon: Sparkles, to: '/donate', cta: 'nav.donateMoney' },
} as const

export default function Programs() {
  const { t } = useTranslation()
  const { lang } = useLang()
  return (
    <>
      <PageHeader title={t('programs.title')} intro={t('programs.intro')} />
      <Section>
        <div className="space-y-6">
          {org.programs.map((p, i) => {
            const m = meta[p.key as keyof typeof meta]
            return (
              <article key={p.key} className="flex flex-col gap-6 rounded-2xl border bg-card p-6 md:flex-row md:items-center md:p-8">
                <div className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary">
                  <m.icon className="size-10" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{String(i + 1).padStart(2, '0')}</p>
                  <h2 className="text-xl font-bold text-primary">{pick(p.title, lang)}</h2>
                  <p className="mt-2 text-muted-foreground">{pick(p.body, lang)}</p>
                </div>
                <Button asChild variant="outline">
                  <Link to={m.to}>{t(m.cta)}</Link>
                </Button>
              </article>
            )
          })}
        </div>
      </Section>
    </>
  )
}
