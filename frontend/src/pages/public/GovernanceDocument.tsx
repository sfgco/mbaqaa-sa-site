import { ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { DocumentMeta, DocumentThumb } from '@/components/DocumentCard'
import { DownloadButton } from '@/components/DownloadButton'
import { Section } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useDocument } from '@/hooks/queries'
import { useLang } from '@/hooks/useLang'
import { pick } from '@/lib/format'
import NotFound from './NotFound'

export default function GovernanceDocument() {
  const { slug = '' } = useParams()
  const { t } = useTranslation()
  const { lang, isRtl } = useLang()
  const { data: doc, isLoading, isError } = useDocument(slug)
  const Back = isRtl ? ArrowRight : ArrowLeft

  if (isLoading) {
    return (
      <Section>
        <Skeleton className="mb-4 h-10 w-2/3" />
        <Skeleton className="h-[70svh]" />
      </Section>
    )
  }
  if (isError || !doc) return <NotFound />

  const title = pick(doc.title, lang)
  const description = pick(doc.description, lang)

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <Link
        to={doc.category ? `/governance?category=${doc.category.slug}` : '/governance'}
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
      >
        <Back className="size-4" /> {t('governance.back')}
      </Link>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          {doc.category && (
            <Badge variant="secondary" className="mb-3">
              {pick(doc.category.title, lang)}
            </Badge>
          )}
          <h1 className="text-2xl leading-tight font-bold text-primary md:text-3xl">{title}</h1>
          <div className="mt-2">
            <DocumentMeta doc={doc} />
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <a href={doc.file.url} target="_blank" rel="noreferrer">
              <ExternalLink className="size-4" /> {t('governance.openInNewTab')}
            </a>
          </Button>
          <DownloadButton doc={doc} />
        </div>
      </div>
      {description && <p className="mb-8 max-w-3xl leading-loose whitespace-pre-line">{description}</p>}

      <object data={doc.file.url} type="application/pdf" title={title} className="h-[80svh] w-full rounded-xl border bg-muted">
        {/* Shown where inline PDF isn't supported (most mobile browsers) */}
        <div className="flex flex-col items-center gap-4 p-8 text-center">
          <div className="aspect-[3/4] w-56 overflow-hidden rounded-lg border bg-background">
            <DocumentThumb doc={doc} />
          </div>
          <p className="text-muted-foreground">{t('governance.viewerFallback')}</p>
          <Button asChild>
            <a href={doc.file.url} target="_blank" rel="noreferrer">
              {t('governance.openInNewTab')}
            </a>
          </Button>
        </div>
      </object>
    </div>
  )
}
