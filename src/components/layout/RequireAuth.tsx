import { Navigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Role } from '@shared/types'
import { useAuth } from '@/hooks/useAuth'
import { ErrorState } from '@/components/common/States'

/** Guards admin routes. `role="admin"` blocks editors. */
export function RequireAuth({ role, children }: { role?: Role; children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const location = useLocation()
  const { t } = useTranslation()
  if (isLoading) return <div className="p-8 text-muted-foreground">{t('states.loading')}</div>
  if (!user) return <Navigate to="/admin/login" replace state={{ from: location.pathname + location.search }} />
  if (role === 'admin' && user.role !== 'admin') return <ErrorState message={t('errors.FORBIDDEN')} />
  return <>{children}</>
}
