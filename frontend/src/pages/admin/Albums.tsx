import { zodResolver } from '@hookform/resolvers/zod'
import { albumSchema, type Album, type AlbumWithImages, type GalleryImage, type Paginated } from '@mbaqaa/shared'
import { ArrowDown, ArrowUp, Eye, ImagePlus, Images, Plus, Star } from 'lucide-react'
import { useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router'
import type { z } from 'zod'
import { LocalizedField } from '@/components/admin/LocalizedField'
import { AdminPageHeader, DeleteButton, StatusBadge } from '@/components/admin/ui'
import { useMultiImageUpload } from '@/components/admin/uploadHelpers'
import { ImageUploadField } from '@/components/admin/uploads'
import { SelectField, TextField } from '@/components/forms/fields'
import { useErrorText } from '@/components/forms/useErrorText'
import { Pager } from '@/components/Pager'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useAdminMutation, useAdminQuery } from '@/hooks/useAdmin'
import { useLang } from '@/hooks/useLang'
import { api, ApiError } from '@/lib/api'
import { formatDate, pick } from '@/lib/format'
import { moved } from '@/lib/reorder'
import { uploadsConfigured } from '@/lib/upload'

export function AlbumsList() {
  const { t } = useTranslation()
  const { lang } = useLang()
  const [page, setPage] = useState(1)
  const { data, isLoading } = useAdminQuery<Paginated<Album>>('/gallery/admin/albums', { page, limit: 24 })

  return (
    <>
      <AdminPageHeader
        title={t('admin.albums')}
        actions={
          <Button asChild size="sm">
            <Link to="/admin/albums/new">
              <Plus className="size-4" /> {t('admin.newAlbum')}
            </Link>
          </Button>
        }
      />
      {isLoading ? (
        <Skeleton className="h-64" />
      ) : !data?.items.length ? (
        <p className="py-12 text-center text-muted-foreground">{t('admin.empty')}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.items.map((a) => (
            <Link key={a._id} to={`/admin/albums/${a._id}`} className="group overflow-hidden rounded-lg border bg-card hover:shadow-md">
              <div className="aspect-video bg-muted">
                {a.coverImage ? (
                  <img src={a.coverImage} alt="" className="size-full object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center text-muted-foreground">
                    <Images className="size-8" />
                  </div>
                )}
              </div>
              <div className="flex items-start justify-between gap-2 p-3">
                <div className="min-w-0">
                  <p className="truncate font-medium group-hover:text-primary">{pick(a.title, lang)}</p>
                  <p className="text-xs text-muted-foreground">
                    {[t('media.photos', { count: a.imageCount }), a.eventDate && formatDate(a.eventDate, lang)].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <StatusBadge status={a.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
      {data && <Pager page={page} limit={data.limit} total={data.total} onChange={setPage} />}
    </>
  )
}

export function AlbumEditor() {
  const { id } = useParams()
  const isNew = !id || id === 'new'
  const { data, isLoading } = useAdminQuery<AlbumWithImages>(`/gallery/admin/albums/${id}`, undefined, !isNew)
  if (!isNew && (isLoading || !data)) return <Skeleton className="h-96" />
  return (
    <div className="grid gap-6">
      <AlbumForm key={id} album={isNew ? undefined : data} />
      {!isNew && data && <AlbumImages album={data} />}
    </div>
  )
}

type AlbumFormT = z.input<typeof albumSchema>
const toDateInput = (d?: string) => (d ? new Date(d).toISOString().slice(0, 10) : '')

function AlbumForm({ album }: { album?: AlbumWithImages }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const errorText = useErrorText()
  const { register, control, handleSubmit, setError, formState: { errors } } = useForm<AlbumFormT, unknown, z.output<typeof albumSchema>>({
    resolver: zodResolver(albumSchema),
    defaultValues: album
      ? {
          slug: album.slug,
          title: album.title,
          description: album.description,
          coverImage: album.coverImage ?? '',
          eventDate: toDateInput(album.eventDate) as unknown as Date,
          status: album.status,
        }
      : { status: 'published', description: { ar: '', en: '' } },
  })
  const save = useAdminMutation(
    (body: z.output<typeof albumSchema>) =>
      album ? api<Album>(`/gallery/admin/albums/${album._id}`, { method: 'PATCH', body }) : api<Album>('/gallery/admin/albums', { method: 'POST', body }),
    { onSuccess: (a) => !album && navigate(`/admin/albums/${a._id}`, { replace: true }) },
  )
  const remove = useAdminMutation(() => api(`/gallery/admin/albums/${album!._id}`, { method: 'DELETE' }), {
    success: t('admin.deleted'),
    onSuccess: () => navigate('/admin/albums'),
  })
  const submit = handleSubmit((v) =>
    save.mutate(v, {
      onError: (e) => {
        if (e instanceof ApiError && e.fields) for (const [f, c] of Object.entries(e.fields)) setError(f as keyof AlbumFormT, { message: c[0] })
      },
    }),
  )

  return (
    <>
      <AdminPageHeader
        title={album ? pick(album.title, 'ar') : t('admin.newAlbum')}
        actions={
          album && (
            <>
              {album.status === 'published' && (
                <Button asChild variant="outline" size="sm">
                  <Link to={`/media/albums/${album.slug}`} target="_blank">
                    <Eye className="size-4" /> {t('admin.viewSite')}
                  </Link>
                </Button>
              )}
              <DeleteButton onConfirm={() => remove.mutate(undefined)} />
            </>
          )
        }
      />
      <Card>
        <CardContent>
          <form onSubmit={submit} noValidate className="grid gap-5">
            <LocalizedField register={register} errors={errors} name="title" label={t('admin.titleField')} />
            <LocalizedField register={register} errors={errors} name="description" label={t('admin.description')} multiline rows={3} />
            <div className="grid gap-5 md:grid-cols-3">
              <TextField register={register} name="slug" label={t('admin.slug')} error={errors.slug} dir="ltr" placeholder="ramadan-campaign-2026" />
              <TextField register={register} name="eventDate" label={t('admin.eventDate')} error={errors.eventDate as never} type="date" optional />
              <SelectField
                control={control}
                name="status"
                label={t('admin.status')}
                error={errors.status}
                options={(['draft', 'published'] as const).map((s) => ({ value: s, label: t(`admin.statuses.${s}`) }))}
              />
            </div>
            <Controller
              control={control}
              name="coverImage"
              render={({ field }) => (
                <ImageUploadField label={t('admin.cover')} value={field.value as string | undefined} onChange={field.onChange} folder="mbaqaa/gallery" error={errorText(errors.coverImage?.message)} />
              )}
            />
            <div>
              <Button type="submit" disabled={save.isPending}>
                {t('admin.save')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  )
}

function AlbumImages({ album }: { album: AlbumWithImages }) {
  const { t } = useTranslation()
  const input = useRef<HTMLInputElement>(null)
  const { upload, progress } = useMultiImageUpload('mbaqaa/gallery')
  const images = album.images

  const add = useAdminMutation((items: { url: string; width?: number; height?: number }[]) =>
    api('/gallery/admin/images', { method: 'POST', body: { album: album._id, images: items } }),
  )
  const reorderImgs = useAdminMutation((ids: string[]) => api('/gallery/admin/images/reorder', { method: 'POST', body: { ids } }))
  const setCover = useAdminMutation((url: string) => api(`/gallery/admin/albums/${album._id}`, { method: 'PATCH', body: { coverImage: url } }))

  async function onFiles(files: FileList | null) {
    if (!files?.length) return
    const uploaded = await upload(Array.from(files))
    if (input.current) input.current.value = ''
    if (uploaded.length) add.mutate(uploaded)
  }


  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
        <CardTitle>
          {t('admin.images')} <span className="text-sm font-normal text-muted-foreground">({images.length})</span>
        </CardTitle>
        {uploadsConfigured() && (
          <>
            <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={(e) => onFiles(e.target.files)} />
            <Button size="sm" onClick={() => input.current?.click()} disabled={!!progress || add.isPending}>
              <ImagePlus className="size-4" />
              {progress ? `${progress.done + 1}/${progress.total} · ${progress.pct}%` : t('admin.addImages')}
            </Button>
          </>
        )}
      </CardHeader>
      <CardContent className="grid gap-6">
        {!uploadsConfigured() && <p className="text-sm text-amber-700">{t('admin.uploadsOff')}</p>}
        {images.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">{t('admin.noImages')}</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {images.map((img, i) => (
              <ImageTile
                key={img._id}
                img={img}
                isCover={album.coverImage === img.url}
                onUp={i > 0 ? () => reorderImgs.mutate(moved(images, i, -1)!) : undefined}
                onDown={i < images.length - 1 ? () => reorderImgs.mutate(moved(images, i, 1)!) : undefined}
                onCover={() => setCover.mutate(img.url)}
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

function ImageTile({ img, isCover, onUp, onDown, onCover }: { img: GalleryImage; isCover: boolean; onUp?: () => void; onDown?: () => void; onCover: () => void }) {
  const { t } = useTranslation()
  const [caption, setCaption] = useState(img.caption)
  const dirty = caption.ar !== img.caption.ar || caption.en !== img.caption.en
  const save = useAdminMutation(() => api(`/gallery/admin/images/${img._id}`, { method: 'PATCH', body: { caption } }))
  const remove = useAdminMutation(() => api(`/gallery/admin/images/${img._id}`, { method: 'DELETE' }), { success: t('admin.deleted') })

  return (
    <li className="overflow-hidden rounded-lg border bg-background">
      <div className="relative aspect-[4/3] bg-muted">
        <img src={img.url} alt="" loading="lazy" className="size-full object-cover" />
        {isCover && (
          <span className="absolute top-2 start-2 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
            <Star className="size-3" /> {t('admin.cover')}
          </span>
        )}
      </div>
      <div className="grid gap-2 p-2">
        <Input value={caption.ar} onChange={(e) => setCaption({ ...caption, ar: e.target.value })} placeholder={`${t('admin.caption')} (${t('admin.arabic')})`} dir="rtl" className="h-8 text-sm" />
        <Input value={caption.en} onChange={(e) => setCaption({ ...caption, en: e.target.value })} placeholder={`${t('admin.caption')} (${t('admin.english')})`} dir="ltr" className="h-8 text-sm" />
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="size-7" aria-label={t('admin.moveUp')} disabled={!onUp} onClick={onUp}>
            <ArrowUp className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="size-7" aria-label={t('admin.moveDown')} disabled={!onDown} onClick={onDown}>
            <ArrowDown className="size-4" />
          </Button>
          {!isCover && (
            <Button variant="ghost" size="icon" className="size-7" aria-label={t('admin.setCover')} title={t('admin.setCover')} onClick={onCover}>
              <Star className="size-4" />
            </Button>
          )}
          {dirty && (
            <Button size="sm" className="h-7" onClick={() => save.mutate(undefined)} disabled={save.isPending}>
              {t('admin.save')}
            </Button>
          )}
          <div className="ms-auto">
            <DeleteButton size="icon" onConfirm={() => remove.mutate(undefined)} />
          </div>
        </div>
      </div>
    </li>
  )
}
