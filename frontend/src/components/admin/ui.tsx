import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function AdminPageHeader({ title, actions }: { title: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-bold text-primary">{title}</h1>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

const statusTone: Record<string, string> = {
  new: 'bg-brand-blue/15 text-brand-blue',
  pending: 'bg-amber-100 text-amber-800',
  in_progress: 'bg-amber-100 text-amber-800',
  read: 'bg-muted text-muted-foreground',
  completed: 'bg-accent/20 text-primary',
  confirmed: 'bg-accent/20 text-primary',
  published: 'bg-accent/20 text-primary',
  replied: 'bg-accent/20 text-primary',
  cancelled: 'bg-destructive/10 text-destructive',
  rejected: 'bg-destructive/10 text-destructive',
  draft: 'bg-muted text-muted-foreground',
  archived: 'bg-muted text-muted-foreground',
}

export function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation()
  return (
    <Badge variant="outline" className={cn('border-transparent', statusTone[status])}>
      {t(`admin.statuses.${status}`)}
    </Badge>
  )
}

export function DeleteButton({ onConfirm, size = 'sm' }: { onConfirm: () => void; size?: 'sm' | 'icon' }) {
  const { t } = useTranslation()
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size={size} className="text-destructive hover:text-destructive" aria-label={t('admin.delete')}>
          <Trash2 className="size-4" />
          {size !== 'icon' && t('admin.delete')}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('admin.delete')}</AlertDialogTitle>
          <AlertDialogDescription>{t('admin.confirmDelete')}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('admin.cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive text-white hover:bg-destructive/90">
            {t('admin.delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function EmptyRow({ colSpan }: { colSpan: number }) {
  const { t } = useTranslation()
  return (
    <tr>
      <td colSpan={colSpan} className="py-12 text-center text-muted-foreground">
        {t('admin.empty')}
      </td>
    </tr>
  )
}
