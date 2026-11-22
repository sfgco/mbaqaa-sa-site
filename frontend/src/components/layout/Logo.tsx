import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

export function Logo({ className }: { className?: string }) {
  const { t } = useTranslation()
  return (
    <Link to="/" className={cn('inline-flex shrink-0 items-center', className)}>
      <img src="/logo.jpg" alt={t('meta.title')} className="h-12 w-auto mix-blend-multiply" width={124} height={48} />
    </Link>
  )
}
