import type { DocumentFile } from '@mbaqaa/shared'
import { FileText, ImagePlus, Upload } from 'lucide-react'
import { useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLang } from '@/hooks/useLang'
import { inspectPdf } from '@/lib/pdf'
import { formatBytes, MB, uploadFile, uploadsConfigured, type UploadFolder } from '@/lib/upload'
import { checkImage, IMAGE_TYPES, PDF_MAX_MB, useUploadErrors } from './uploadHelpers'

function Progress({ label, pct }: { label: string; pct?: number }) {
  return (
    <div className="grid gap-1.5" role="status">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-primary transition-[width]" style={{ width: `${pct ?? 15}%` }} />
      </div>
    </div>
  )
}

/** PDF uploader: uploads the file, renders page 1 as a thumbnail, records page count and size. */
export function PdfUploadField({ value, onChange, error }: { value?: Partial<DocumentFile>; onChange: (v: Partial<DocumentFile>) => void; error?: string }) {
  const { t } = useTranslation()
  const { lang } = useLang()
  const id = useId()
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState<{ label: string; pct?: number } | null>(null)
  const uploadError = useUploadErrors()
  const enabled = uploadsConfigured()

  async function pick(file: File) {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) return toast.error(t('admin.onlyPdf'))
    if (file.size > PDF_MAX_MB * MB) return toast.error(t('admin.tooLarge', { mb: PDF_MAX_MB }))
    try {
      setBusy({ label: t('admin.preparing') })
      // A broken PDF shouldn't block the upload; it just won't have a thumbnail.
      const info = await inspectPdf(file).catch(() => ({ pages: undefined, thumbnail: null }))
      const url = await uploadFile(file, 'mbaqaa/governance', { onProgress: (pct) => setBusy({ label: t('admin.uploading', { pct }), pct }) })
      const thumbnailUrl = info.thumbnail
        ? await uploadFile(info.thumbnail, 'mbaqaa/governance', { filename: file.name.replace(/\.pdf$/i, '') + '-thumb.jpg' }).catch(() => undefined)
        : undefined
      onChange({ url, thumbnailUrl, pages: info.pages, bytes: file.size })
    } catch (e) {
      toast.error(uploadError(e))
    } finally {
      setBusy(null)
      if (input.current) input.current.value = ''
    }
  }

  return (
    <div className="grid gap-3">
      <Label htmlFor={`${id}-url`}>{t('admin.file')}</Label>
      <div className="flex flex-col gap-4 rounded-lg border border-dashed p-4 sm:flex-row sm:items-center">
        <div className="flex aspect-[3/4] w-24 shrink-0 items-center justify-center overflow-hidden rounded border bg-muted">
          {value?.thumbnailUrl ? <img src={value.thumbnailUrl} alt="" className="size-full object-cover object-top" /> : <FileText className="size-8 text-muted-foreground" />}
        </div>
        <div className="grid min-w-0 flex-1 gap-2">
          {value?.url && (
            <a href={value.url} target="_blank" rel="noreferrer" dir="ltr" className="truncate text-sm text-primary underline-offset-4 hover:underline">
              {value.url}
            </a>
          )}
          {(value?.pages || value?.bytes) && (
            <p className="text-xs text-muted-foreground">
              {[value.pages && t('governance.pages', { count: value.pages }), formatBytes(value.bytes, lang)].filter(Boolean).join(' · ')}
            </p>
          )}
          {busy ? (
            <Progress label={busy.label} pct={busy.pct} />
          ) : enabled ? (
            <div>
              <input ref={input} type="file" accept="application/pdf,.pdf" className="sr-only" id={id} onChange={(e) => e.target.files?.[0] && pick(e.target.files[0])} />
              <Button type="button" variant="outline" size="sm" onClick={() => input.current?.click()}>
                <Upload className="size-4" /> {value?.url ? t('admin.replaceFile') : t('admin.chooseFile')}
              </Button>
              <span className="ms-2 text-xs text-muted-foreground">PDF ≤ {PDF_MAX_MB} MB</span>
            </div>
          ) : (
            <p className="text-sm text-amber-700">{t('admin.uploadsOff')}</p>
          )}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="grid gap-1.5 sm:col-span-2">
          <Label htmlFor={`${id}-url`} className="text-xs text-muted-foreground">
            {t('admin.fileUrl')}
          </Label>
          <Input id={`${id}-url`} dir="ltr" value={value?.url ?? ''} onChange={(e) => onChange({ ...value, url: e.target.value })} placeholder="https://…/file.pdf" aria-invalid={!!error} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor={`${id}-pages`} className="text-xs text-muted-foreground">
            {t('admin.pagesCount')}
          </Label>
          <Input
            id={`${id}-pages`}
            type="number"
            min={1}
            dir="ltr"
            value={value?.pages ?? ''}
            onChange={(e) => onChange({ ...value, pages: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

/** Single image (e.g. album cover): upload or paste a URL. */
export function ImageUploadField({ label, value, onChange, folder, error }: { label: string; value?: string; onChange: (url: string) => void; folder: UploadFolder; error?: string }) {
  const { t } = useTranslation()
  const id = useId()
  const input = useRef<HTMLInputElement>(null)
  const [pct, setPct] = useState<number | null>(null)
  const uploadError = useUploadErrors()

  async function pick(file: File) {
    const problem = checkImage(file, t)
    if (problem) return toast.error(problem)
    try {
      setPct(0)
      onChange(await uploadFile(file, folder, { onProgress: setPct }))
    } catch (e) {
      toast.error(uploadError(e))
    } finally {
      setPct(null)
      if (input.current) input.current.value = ''
    }
  }

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-3">
        <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded border bg-muted">
          {value ? <img src={value} alt="" className="size-full object-cover" /> : <ImagePlus className="size-6 text-muted-foreground" />}
        </div>
        <Input id={id} dir="ltr" value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder="https://" aria-invalid={!!error} />
        {uploadsConfigured() && (
          <>
            <input ref={input} type="file" accept={IMAGE_TYPES.join(',')} className="sr-only" onChange={(e) => e.target.files?.[0] && pick(e.target.files[0])} />
            <Button type="button" variant="outline" size="sm" disabled={pct !== null} onClick={() => input.current?.click()}>
              <Upload className="size-4" />
              {pct !== null ? `${pct}%` : t('admin.chooseFile')}
            </Button>
          </>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
