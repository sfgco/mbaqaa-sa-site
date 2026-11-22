import type { GalleryImage } from '@mbaqaa/shared'
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { Section } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useAlbum } from '@/hooks/queries'
import { useLang } from '@/hooks/useLang'
import { formatDate, pick } from '@/lib/format'
import NotFound from './NotFound'

export default function AlbumPage() {
  const { slug = '' } = useParams()
  const { t } = useTranslation()
  const { lang, isRtl } = useLang()
  const { data: album, isLoading, isError } = useAlbum(slug)
  const [open, setOpen] = useState<number | null>(null)
  const Back = isRtl ? ArrowRight : ArrowLeft

  if (isLoading) {
    return (
      <Section>
        <Skeleton className="mb-6 h-10 w-1/2" />
        <Skeleton className="h-96" />
      </Section>
    )
  }
  if (isError || !album) return <NotFound />

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <Link to="/media/albums" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
        <Back className="size-4" /> {t('media.backToAlbums')}
      </Link>
      <h1 className="text-3xl font-bold text-primary">{pick(album.title, lang)}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {[album.eventDate && formatDate(album.eventDate, lang), t('media.photos', { count: album.imageCount })].filter(Boolean).join(' · ')}
      </p>
      {pick(album.description, lang) && <p className="mt-4 max-w-3xl leading-loose whitespace-pre-line">{pick(album.description, lang)}</p>}

      <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {album.images.map((img, i) => (
          <li key={img._id}>
            <button
              type="button"
              onClick={() => setOpen(i)}
              className="group block aspect-square w-full overflow-hidden rounded-lg bg-secondary focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
              aria-label={pick(img.caption, lang) || t('media.photoOf', { n: i + 1, total: album.images.length })}
            >
              <img src={img.url} alt={pick(img.caption, lang)} loading="lazy" className="size-full object-cover transition-transform duration-300 group-hover:scale-105" />
            </button>
          </li>
        ))}
      </ul>

      {open !== null && <Lightbox images={album.images} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
    </div>
  )
}

function Lightbox({ images, index, onIndex, onClose }: { images: GalleryImage[]; index: number; onIndex: (i: number) => void; onClose: () => void }) {
  const { t } = useTranslation()
  const { lang, isRtl } = useLang()
  const img = images[index]
  const go = useCallback((delta: number) => onIndex((index + delta + images.length) % images.length), [index, images.length, onIndex])
  // Visual direction: in RTL, the "next" control sits on the left.
  const PrevIcon = isRtl ? ChevronRight : ChevronLeft
  const NextIcon = isRtl ? ChevronLeft : ChevronRight
  const caption = pick(img.caption, lang)

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-w-[calc(100%-1rem)] gap-3 border-none bg-black/95 p-3 text-white sm:max-w-5xl [&>button]:text-white"
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') go(isRtl ? -1 : 1)
          if (e.key === 'ArrowLeft') go(isRtl ? 1 : -1)
        }}
      >
        <DialogTitle className="sr-only">{t('media.photoOf', { n: index + 1, total: images.length })}</DialogTitle>
        <DialogDescription className="sr-only">{caption}</DialogDescription>
        <div className="relative flex items-center justify-center">
          <img src={img.url} alt={caption} className="max-h-[78svh] w-auto rounded object-contain" />
          {images.length > 1 && (
            <>
              <Button size="icon" variant="secondary" className="absolute start-2 top-1/2 -translate-y-1/2 rounded-full opacity-80" onClick={() => go(-1)} aria-label={t('media.prev')}>
                <PrevIcon className="size-5" />
              </Button>
              <Button size="icon" variant="secondary" className="absolute end-2 top-1/2 -translate-y-1/2 rounded-full opacity-80" onClick={() => go(1)} aria-label={t('media.next')}>
                <NextIcon className="size-5" />
              </Button>
            </>
          )}
        </div>
        <div className="flex items-center justify-between gap-4 px-1 text-sm">
          <span>{caption}</span>
          <span className="shrink-0 text-white/70">{t('media.photoOf', { n: index + 1, total: images.length })}</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
