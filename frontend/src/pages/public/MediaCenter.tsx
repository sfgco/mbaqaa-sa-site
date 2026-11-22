import { Images, Newspaper } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { AlbumCard } from '@/components/AlbumCard'
import { PageHeader, Section } from '@/components/layout/PageHeader'
import { PostCard } from '@/components/PostCard'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAlbums, usePosts } from '@/hooks/queries'

export default function MediaCenter() {
  const { t } = useTranslation()
  const albums = useAlbums({ limit: 6 })
  const posts = usePosts({ limit: 3 })

  return (
    <>
      <PageHeader title={t('media.title')} intro={t('media.intro')}>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link to="/news">
              <Newspaper className="size-4" /> {t('nav.news')}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/media/albums">
              <Images className="size-4" /> {t('nav.albums')}
            </Link>
          </Button>
        </div>
      </PageHeader>

      <Section>
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-primary">{t('home.newsTitle')}</h2>
          <Button asChild variant="link">
            <Link to="/news">{t('home.allNews')}</Link>
          </Button>
        </div>
        {posts.isLoading ? (
          <Skeleton className="h-72" />
        ) : !posts.data?.items.length ? (
          <p className="text-muted-foreground">{t('news.empty')}</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {posts.data.items.map((p) => (
              <PostCard key={p._id} post={p} />
            ))}
          </div>
        )}
      </Section>

      <section className="bg-secondary/50">
        <Section>
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-primary">{t('media.latestAlbums')}</h2>
            <Button asChild variant="link">
              <Link to="/media/albums">{t('media.allAlbums')}</Link>
            </Button>
          </div>
          {albums.isLoading ? (
            <Skeleton className="h-72" />
          ) : !albums.data?.items.length ? (
            <p className="text-muted-foreground">{t('media.emptyAlbums')}</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {albums.data.items.map((a) => (
                <AlbumCard key={a._id} album={a} />
              ))}
            </div>
          )}
        </Section>
      </section>
    </>
  )
}
