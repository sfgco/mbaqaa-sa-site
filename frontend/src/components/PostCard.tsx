import type { Post } from '@mbaqaa/shared'
import { Newspaper } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
