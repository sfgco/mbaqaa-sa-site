import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'
import { AlbumCard } from '@/components/AlbumCard'
import { PageHeader, Section } from '@/components/layout/PageHeader'
import { Pager } from '@/components/Pager'
import { Skeleton } from '@/components/ui/skeleton'
import { useAlbums } from '@/hooks/queries'

export default function Albums() {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()
  const page = Number(params.get('page')) || 1
  const { data, isLoading } = useAlbums({ page, limit: 12 })

  return (
    <>
      <PageHeader title={t('media.albumsTitle')} intro={t('media.intro')} />
      <Section>
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-72" />
            ))}
          </div>
        ) : !data?.items.length ? (
          <p className="py-16 text-center text-muted-foreground">{t('media.emptyAlbums')}</p>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.items.map((a) => (
                <AlbumCard key={a._id} album={a} />
              ))}
            </div>
            <Pager page={page} limit={data.limit} total={data.total} onChange={(p) => setParams({ page: String(p) })} />
          </>
        )}
      </Section>
    </>
  )
}
