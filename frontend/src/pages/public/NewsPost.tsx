import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { Section } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { usePost } from '@/hooks/queries'
import { useLang } from '@/hooks/useLang'
import { formatDate, pick } from '@/lib/format'
import NotFound from './NotFound'

export default function NewsPost() {
  const { slug = '' } = useParams()
  const { t } = useTranslation()
  const { lang, isRtl } = useLang()
  const { data: post, isLoading, isError } = usePost(slug)
  const Back = isRtl ? ArrowRight : ArrowLeft

  if (isLoading) {
    return (
      <Section>
        <Skeleton className="mb-4 h-10 w-2/3" />
        <Skeleton className="h-64" />
      </Section>
    )
  }
  if (isError || !post) return <NotFound />

  return (
    <article className="container mx-auto max-w-3xl px-4 py-12">
      <Link to="/news" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
        <Back className="size-4" /> {t('news.back')}
      </Link>
      <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
        <Badge variant="secondary">{t(`news.categories.${post.category}`)}</Badge>
        <time dateTime={post.publishedAt}>{formatDate(post.publishedAt, lang)}</time>
      </div>
      <h1 className="text-3xl leading-tight font-bold text-primary md:text-4xl">{pick(post.title, lang)}</h1>
      {post.coverImage && <img src={post.coverImage} alt="" className="mt-8 w-full rounded-xl object-cover" />}
      <div className="mt-8 space-y-4 text-lg leading-loose">
        {pick(post.content, lang)
          .split(/\n{2,}/)
          .map((para, i) => (
            <p key={i} className="whitespace-pre-line">
              {para}
            </p>
          ))}
      </div>
    </article>
  )
}
