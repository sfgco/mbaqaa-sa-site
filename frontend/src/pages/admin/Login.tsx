import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginInput } from '@mbaqaa/shared'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { TextField } from '@/components/forms/fields'
import { useApiErrorMessage } from '@/components/forms/useApiForm'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useLogin, useMe } from '@/hooks/useAuth'
import { useLang } from '@/hooks/useLang'
import { ApiError } from '@/lib/api'

export default function Login() {
  const { t } = useTranslation()
  const { toggle } = useLang()
  const navigate = useNavigate()
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/admin'
  const me = useMe()
  const login = useLogin()
  const errorMessage = useApiErrorMessage()
  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) })

  if (me.data) return <Navigate to={from} replace />

  const error = login.error
    ? login.error instanceof ApiError && login.error.code === 'INVALID_CREDENTIALS'
      ? t('admin.invalidLogin')
      : errorMessage(login.error)
    : null

  return (
    <div className="flex min-h-svh items-center justify-center bg-secondary/50 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <img src="/logo.jpg" alt="" className="mx-auto h-16 w-auto mix-blend-multiply" />
          <CardTitle className="mt-2">{t('admin.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" noValidate onSubmit={handleSubmit((v) => login.mutate(v, { onSuccess: () => navigate(from, { replace: true }) }))}>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <TextField register={register} name="email" label={t('form.email')} error={errors.email} type="email" dir="ltr" autoComplete="username" />
            <TextField register={register} name="password" label={t('admin.password')} error={errors.password} type="password" dir="ltr" autoComplete="current-password" />
            <Button type="submit" disabled={login.isPending}>
              {t('admin.login')}
            </Button>
            <Button type="button" variant="link" size="sm" onClick={toggle}>
              {t('meta.switchLang')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
