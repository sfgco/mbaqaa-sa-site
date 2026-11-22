import { CheckCircle2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PageHeader, Section } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { org } from '@/data/siteContent'
import { useSettings } from '@/hooks/queries'
import { useLang } from '@/hooks/useLang'
import { pick } from '@/lib/format'
import type { Localized } from '@mbaqaa/shared'

function List({ items }: { items: Localized[] }) {
  const { lang } = useLang()
  return (
    <ul className="space-y-3">
      {items.map((it, i) => (
        <li key={i} className="flex gap-3">
          <CheckCircle2 className="mt-1 size-5 shrink-0 text-accent" />
          <span>{pick(it, lang)}</span>
        </li>
      ))}
    </ul>
  )
}

export default function About() {
  const { t } = useTranslation()
  const { lang } = useLang()
  const { data: settings } = useSettings()

  return (
    <>
      <PageHeader title={t('about.title')} intro={pick(org.tagline, lang)} />
      <Section title={t('about.whoWeAre')}>
        <p className="max-w-4xl text-lg leading-loose">{pick(org.about, lang)}</p>
        {settings?.licenseNumber && (
          <p className="mt-4 text-sm text-muted-foreground">
            {t('about.license')}: <span dir="ltr">{settings.licenseNumber}</span>
          </p>
        )}
      </Section>
      <Section className="grid gap-6 !pt-0 md:grid-cols-2">
        <Card className="border-accent/40 bg-secondary/50">
          <CardHeader>
            <CardTitle className="text-xl text-primary">{t('about.vision')}</CardTitle>
          </CardHeader>
          <CardContent className="leading-loose">{pick(org.vision, lang)}</CardContent>
        </Card>
        <Card className="border-accent/40 bg-secondary/50">
          <CardHeader>
            <CardTitle className="text-xl text-primary">{t('about.mission')}</CardTitle>
          </CardHeader>
          <CardContent className="leading-loose">{pick(org.mission, lang)}</CardContent>
        </Card>
      </Section>
      <Section title={t('about.goals')} className="!pt-0">
        <List items={org.goals} />
      </Section>
      <Section className="grid gap-10 !pt-0 md:grid-cols-2">
        <div>
          <h2 className="mb-6 text-2xl font-bold text-primary">{t('about.why')}</h2>
          <List items={org.justifications} />
        </div>
        <div>
          <h2 className="mb-6 text-2xl font-bold text-primary">{t('about.audiences')}</h2>
          <List items={org.audiences} />
        </div>
      </Section>
    </>
  )
}
