import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { PageHeader, Section } from '@/components/layout/PageHeader'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useFaqs } from '@/hooks/queries'
import { useLang } from '@/hooks/useLang'
import { pick } from '@/lib/format'

export default function Faq() {
  const { t } = useTranslation()
  const { lang } = useLang()
  const { data, isLoading } = useFaqs()

  return (
    <>
      <PageHeader title={t('faq.title')} />
      <Section className="max-w-3xl">
        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14" />
            ))}
          </div>
        ) : !data?.items.length ? (
          <p className="text-center text-muted-foreground">{t('faq.empty')}</p>
        ) : (
          <Accordion type="single" collapsible className="rounded-xl border bg-card px-6">
            {data.items.map((f) => (
              <AccordionItem key={f._id} value={f._id}>
                <AccordionTrigger className="text-base">{pick(f.question, lang)}</AccordionTrigger>
                <AccordionContent className="leading-loose whitespace-pre-line text-muted-foreground">{pick(f.answer, lang)}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
        <div className="mt-10 flex flex-col items-center gap-3 text-center">
          <p className="text-muted-foreground">{t('faq.more')}</p>
          <Button asChild>
            <Link to="/contact">{t('faq.ask')}</Link>
          </Button>
        </div>
      </Section>
    </>
  )
}
