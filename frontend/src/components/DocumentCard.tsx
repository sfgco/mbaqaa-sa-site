import type { DocumentItem } from '@mbaqaa/shared'
import { Eye, FileText } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { DownloadButton } from '@/components/DownloadButton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { useLang } from '@/hooks/useLang'
import { pick } from '@/lib/format'
import { formatBytes } from '@/lib/upload'

export function DocumentMeta({ doc }: { doc: DocumentItem }) {
  const { t } = useTranslation()
  const { lang } = useLang()
  const parts = ['PDF', doc.year ? String(doc.year) : '', doc.file.pages ? t('governance.pages', { count: doc.file.pages }) : '', formatBytes(doc.file.bytes, lang)].filter(Boolean)
  // Each part is isolated so Arabic and Latin digits don't reorder each other.
  return (
    <p className="flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
      {parts.map((part, i) => (
        <span key={i} className="inline-flex items-center gap-x-1.5">
          {i > 0 && <span aria-hidden="true">·</span>}
          <bdi>{part}</bdi>
        </span>
      ))}
    </p>
  )
}

export function DocumentThumb({ doc, className = '' }: { doc: DocumentItem; className?: string }) {
  return doc.file.thumbnailUrl ? (
    <img src={doc.file.thumbnailUrl} alt="" loading="lazy" className={`size-full object-cover object-top ${className}`} />
  ) : (
    <div className={`flex size-full items-center justify-center text-primary/40 ${className}`}>
      <FileText className="size-14" />
    </div>
  )
}

export function DocumentCard({ doc, showCategory }: { doc: DocumentItem; showCategory?: boolean }) {
  const { t } = useTranslation()
  const { lang } = useLang()
  return (
    <Card className="gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md">
      <Link to={`/governance/${doc.slug}`} className="block aspect-[4/3] overflow-hidden border-b bg-secondary" tabIndex={-1} aria-hidden="true">
        <DocumentThumb doc={doc} />
      </Link>
      <CardContent className="flex flex-1 flex-col gap-2 py-4">
        {showCategory && doc.category && (
          <Badge variant="secondary" className="w-fit">
            {pick(doc.category.title, lang)}
          </Badge>
        )}
        <h3 className="leading-snug font-semibold">
          <Link to={`/governance/${doc.slug}`} className="hover:text-primary">
            {pick(doc.title, lang)}
          </Link>
        </h3>
        <DocumentMeta doc={doc} />
      </CardContent>
      <CardFooter className="gap-2 border-t py-3">
        <Button asChild size="sm" variant="outline" className="flex-1">
          <Link to={`/governance/${doc.slug}`}>
            <Eye className="size-4" /> {t('governance.view')}
          </Link>
        </Button>
        <DownloadButton doc={doc} size="sm" className="flex-1" />
      </CardFooter>
    </Card>
  )
}
