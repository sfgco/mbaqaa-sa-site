import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  const { t } = useTranslation()
  return (
    <div className="container mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <p className="text-7xl font-bold text-accent">404</p>
      <h1 className="mt-4 text-2xl font-bold text-primary">{t('errors.notFound')}</h1>
      <p className="mt-2 text-muted-foreground">{t('errors.notFoundBody')}</p>
      <Button asChild className="mt-8">
        <Link to="/">{t('errors.backHome')}</Link>
      </Button>
    </div>
  )
}
