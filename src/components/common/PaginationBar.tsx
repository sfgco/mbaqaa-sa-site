import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

/** Simple prev/next pagination for list responses ({ page, limit, total }). */
export function PaginationBar({ page, limit, total, onChange }: { page: number; limit: number; total: number; onChange: (p: number) => void }) {
  const { t } = useTranslation()
  const pages = Math.max(1, Math.ceil(total / limit))
  if (pages <= 1) return null
  return (
    <nav aria-label={t('pagination.label')} className="mt-8 flex items-center justify-center gap-3">
      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        <ChevronRight className="size-4 ltr:rotate-180" aria-hidden />
        {t('actions.previous')}
      </Button>
      <span className="text-sm text-muted-foreground">{t('pagination.page', { page, pages })}</span>
      <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => onChange(page + 1)}>
        {t('actions.next')}
        <ChevronLeft className="size-4 ltr:rotate-180" aria-hidden />
      </Button>
    </nav>
  )
}
