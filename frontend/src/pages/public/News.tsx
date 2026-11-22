import { postCategories } from '@mbaqaa/shared'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'
import { PageHeader, Section } from '@/components/layout/PageHeader'
import { Pager } from '@/components/Pager'
import { PostCard } from '@/components/PostCard'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { usePosts } from '@/hooks/queries'

export default function News() {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()
  const page = Number(params.get('page') ?? 1) || 1
  const category = params.get('category') ?? undefined
  const { data, isLoading } = usePosts({ page, limit: 9, category })

  const setCategory = (c?: string) => setParams(c ? { category: c } : {})

  return (
    <>
      <PageHeader title={t('news.title')} />
      <Section>
        <div className="mb-8 flex flex-wrap gap-2">
          <Button size="sm" variant={!category ? 'default' : 'outline'} onClick={() => setCategory()}>
            {t('news.all')}
          </Button>
          {postCategories.map((c) => (
            <Button key={c} size="sm" variant={category === c ? 'default' : 'outline'} onClick={() => setCategory(c)}>
              {t(`news.categories.${c}`)}
            </Button>
          ))}
        </div>
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-80" />
            ))}
          </div>
        ) : !data?.items.length ? (
          <p className="py-16 text-center text-muted-foreground">{t('news.empty')}</p>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-3">
              {data.items.map((p) => (
                <PostCard key={p._id} post={p} />
              ))}
            </div>
            <Pager page={page} limit={data.limit} total={data.total} onChange={(p) => setParams({ ...(category && { category }), page: String(p) })} />
          </>
        )}
      </Section>
    </>
  )
}
