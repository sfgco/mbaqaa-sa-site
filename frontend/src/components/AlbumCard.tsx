import type { Album } from '@mbaqaa/shared'
import { Images } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { useLang } from '@/hooks/useLang'
import { formatDate, pick } from '@/lib/format'

export function AlbumCard({ album }: { album: Album }) {
  const { t } = useTranslation()
  const { lang } = useLang()
  return (
    <Link to={`/media/albums/${album.slug}`} className="group block overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        {album.coverImage ? (
          <img src={album.coverImage} alt="" loading="lazy" className="size-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="flex size-full items-center justify-center text-primary/40">
            <Images className="size-12" />
          </div>
        )}
        <span className="absolute bottom-2 start-2 rounded-full bg-black/60 px-2.5 py-1 text-xs text-white">{t('media.photos', { count: album.imageCount })}</span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold group-hover:text-primary">{pick(album.title, lang)}</h3>
        {album.eventDate && <p className="mt-1 text-xs text-muted-foreground">{formatDate(album.eventDate, lang)}</p>}
      </div>
    </Link>
  )
}
