import { CheckCircle2 } from 'lucide-react'
import type { FormEventHandler, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function FormShell({
  done,
  successText,
  onReset,
  onSubmit,
  pending,
  children,
}: {
  done: boolean
  successText: string
  onReset: () => void
  onSubmit: FormEventHandler
  pending: boolean
  children: ReactNode
}) {
  const { t } = useTranslation()
  if (done) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center" role="status">
          <CheckCircle2 className="size-14 text-accent" />
          <p className="max-w-md text-lg">{successText}</p>
          <Button variant="outline" onClick={onReset}>
            {t('form.sendAnother')}
          </Button>
        </CardContent>
      </Card>
    )
  }
  return (
    <Card>
      <CardContent>
        <form onSubmit={onSubmit} noValidate className="relative grid gap-5 sm:grid-cols-2">
          {children}
          <div className="sm:col-span-2">
            <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
              {pending ? t('form.submitting') : t('form.submit')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
