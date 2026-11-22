import { postCategories, type Post } from '@mbaqaa/shared'
import { Newspaper } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router'
import { PageHeader, Section } from '@/components/layout/PageHeader'
import { Pager } from '@/components/Pager'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { usePosts } from '@/hooks/queries'
import { useLang } from '@/hooks/useLang'
import { formatDate, pick } from '@/lib/format'

export function PostCard({ post }: { post: Post }) {
  const { t } = useTranslation()
  const { lang } = useLang()
  return (
    <Card className="overflow-hidden pt-0 transition-shadow hover:shadow-md">
      <Link to={`/news/${post.slug}`} className="block aspect-video bg-secondary">
        {post.coverImage ? (
          <img src={post.coverImage} alt="" loading="lazy" className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center text-primary/40">
            <Newspaper className="size-12" />
          </div>
        )}
      </Link>
      <CardHeader>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary">{t(`news.categories.${post.category}`)}</Badge>
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt, lang)}</time>
        </div>
        <CardTitle className="text-lg leading-snug">
          <Link to={`/news/${post.slug}`} className="hover:text-primary">
            {pick(post.title, lang)}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">{pick(post.excerpt, lang)}</CardContent>
    </Card>
  )
}

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
