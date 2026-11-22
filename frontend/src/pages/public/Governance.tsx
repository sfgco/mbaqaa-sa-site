import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'
import { DocumentCard } from '@/components/DocumentCard'
import { PageHeader, Section } from '@/components/layout/PageHeader'
import { Pager } from '@/components/Pager'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useDocumentCategories, useDocuments } from '@/hooks/queries'
import { useLang } from '@/hooks/useLang'
import { pick } from '@/lib/format'

export default function Governance() {
  const { t } = useTranslation()
  const { lang } = useLang()
  const [params, setParams] = useSearchParams()
  const category = params.get('category') ?? undefined
  const year = Number(params.get('year')) || undefined
  const page = Number(params.get('page')) || 1
  const [q, setQ] = useState(params.get('q') ?? '')

  const categories = useDocumentCategories()
  const docs = useDocuments({ category, year, page, limit: 12, q: params.get('q') || undefined })
  const visibleCategories = categories.data?.items.filter((c) => c.documentCount > 0) ?? []
  const current = categories.data?.items.find((c) => c.slug === category)

  const update = (next: Record<string, string | undefined>) => {
    const merged = { category, year: year ? String(year) : undefined, q: params.get('q') ?? undefined, ...next }
    setParams(Object.fromEntries(Object.entries(merged).filter(([, v]) => v)) as Record<string, string>)
  }

  // Debounced search → URL
  useEffect(() => {
    const id = setTimeout(() => {
      if ((params.get('q') ?? '') !== q) update({ q: q || undefined, page: undefined })
    }, 350)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  return (
    <>
      <PageHeader title={t('governance.title')} intro={t('governance.intro')} />
      <Section>
        <div className="mb-6 flex flex-wrap gap-2" role="tablist">
          <Button size="sm" role="tab" aria-selected={!category} variant={!category ? 'default' : 'outline'} onClick={() => update({ category: undefined, year: undefined, page: undefined })}>
            {t('governance.all')}
          </Button>
          {visibleCategories.map((c) => (
            <Button key={c._id} size="sm" role="tab" aria-selected={category === c.slug} variant={category === c.slug ? 'default' : 'outline'} onClick={() => update({ category: c.slug, year: undefined, page: undefined })}>
              {pick(c.title, lang)}
              <span className="text-xs opacity-70">({c.documentCount})</span>
            </Button>
          ))}
        </div>

        {current && pick(current.description, lang) && <p className="mb-6 max-w-3xl whitespace-pre-line text-muted-foreground">{pick(current.description, lang)}</p>}

        <div className="mb-8 flex flex-wrap gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 start-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('governance.search')} className="ps-9" aria-label={t('governance.search')} />
          </div>
          {!!docs.data?.years.length && (
            <Select value={year ? String(year) : 'all'} onValueChange={(v) => update({ year: v === 'all' ? undefined : v, page: undefined })}>
              <SelectTrigger className="w-40" aria-label={t('governance.year')}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('governance.allYears')}</SelectItem>
                {docs.data.years.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {docs.isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-80" />
            ))}
          </div>
        ) : !docs.data?.items.length ? (
          <p className="py-16 text-center text-muted-foreground">{t('governance.empty')}</p>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {docs.data.items.map((d) => (
                <DocumentCard key={d._id} doc={d} showCategory={!category} />
              ))}
            </div>
            <Pager page={page} limit={docs.data.limit} total={docs.data.total} onChange={(p) => update({ page: String(p) })} />
          </>
        )}
      </Section>
    </>
  )
}
