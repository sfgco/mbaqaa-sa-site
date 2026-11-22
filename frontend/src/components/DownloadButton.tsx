import type { DocumentItem } from '@mbaqaa/shared'
import { Download } from 'lucide-react'
import { useState, type ComponentProps } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { useLang } from '@/hooks/useLang'
import { api } from '@/lib/api'
import { downloadUrl } from '@/lib/documents'
import { pick } from '@/lib/format'

/** A safe file name from the document title, e.g. "اللائحة الأساسية 2025.pdf". */
function fileName(doc: DocumentItem, lang: string) {
  const base = pick(doc.title, lang).replace(/[\\/:*?"<>|]+/g, ' ').trim() || doc.slug
  return `${base}${doc.year && !base.includes(String(doc.year)) ? ` ${doc.year}` : ''}.pdf`
}

/**
 * Saves the PDF with a proper name. Files live on another origin, where the `download` attribute is ignored,
 * so we fetch the bytes and save a blob. If the file host blocks CORS, we fall back to opening it in a new tab.
 * The href keeps a no-JS fallback (server counts and redirects).
 */
export function DownloadButton({ doc, ...props }: { doc: DocumentItem } & ComponentProps<typeof Button>) {
  const { t } = useTranslation()
  const { lang } = useLang()
  const [busy, setBusy] = useState(false)

  async function onClick(e: React.MouseEvent) {
    e.preventDefault()
    setBusy(true)
    void api(`/documents/${encodeURIComponent(doc.slug)}/downloads`, { method: 'POST' }).catch(() => undefined)
    try {
      const res = await fetch(doc.file.url, { mode: 'cors' })
      if (!res.ok) throw new Error(String(res.status))
      const url = URL.createObjectURL(await res.blob())
      const a = document.createElement('a')
      a.href = url
      a.download = fileName(doc, lang)
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 10_000)
    } catch {
      window.open(doc.file.url, '_blank', 'noopener')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Button asChild {...props}>
      <a href={downloadUrl(doc.slug)} onClick={onClick} aria-busy={busy}>
        <Download className="size-4" /> {t('governance.download')}
      </a>
    </Button>
  )
}
