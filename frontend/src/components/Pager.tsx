import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

export function Pager({ page, limit, total, onChange }: { page: number; limit: number; total: number; onChange: (p: number) => void }) {
  const { t } = useTranslation()
  const pages = Math.max(1, Math.ceil(total / limit))
  if (pages <= 1) return null
  return (
    <div className="mt-8 flex items-center justify-center gap-3 text-sm">
      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        {t('admin.prev')}
      </Button>
      <span className="text-muted-foreground">{t('admin.pageOf', { page, pages })}</span>
      <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => onChange(page + 1)}>
        {t('admin.next')}
      </Button>
    </div>
  )
}
