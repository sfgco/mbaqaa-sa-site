import { zodResolver } from '@hookform/resolvers/zod'
import { settingsSchema, type Settings as SettingsT } from '@mbaqaa/shared'
import { useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { z } from 'zod'
import { AdminOnly } from '@/components/admin/AdminLayout'
import { LocalizedField } from '@/components/admin/LocalizedField'
import { AdminPageHeader } from '@/components/admin/ui'
import { TextField } from '@/components/forms/fields'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useSettings } from '@/hooks/queries'
import { useAdminMutation } from '@/hooks/useAdmin'
import { api } from '@/lib/api'

const socials = ['x', 'instagram', 'snapchat', 'tiktok', 'linkedin', 'youtube'] as const

export default function Settings() {
  const { data } = useSettings()
  return <AdminOnly>{data ? <SettingsForm settings={data} /> : <Skeleton className="h-96" />}</AdminOnly>
}

function SettingsForm({ settings }: { settings: SettingsT }) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const { register, handleSubmit, formState: { errors } } = useForm<z.input<typeof settingsSchema>, unknown, SettingsT>({
    resolver: zodResolver(settingsSchema),
    defaultValues: settings,
  })
  const save = useAdminMutation((body: SettingsT) => api<SettingsT>('/settings', { method: 'PATCH', body }), {
    onSuccess: (s) => qc.setQueryData(['settings'], s),
  })

  return (
    <>
      <AdminPageHeader title={t('admin.settings')} />
      <form onSubmit={handleSubmit((v) => save.mutate(v))} noValidate className="grid max-w-4xl gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('contact.info')}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField register={register} name="phone" label={t('contact.phone')} error={errors.phone} dir="ltr" />
              <TextField register={register} name="whatsapp" label={t('contact.whatsapp')} error={errors.whatsapp} dir="ltr" />
              <TextField register={register} name="email" label={t('contact.email')} error={errors.email} type="email" dir="ltr" />
              <TextField register={register} name="licenseNumber" label={t('admin.licenseNumber')} error={errors.licenseNumber} dir="ltr" />
              <TextField register={register} name="mapUrl" label={t('admin.mapUrl')} error={errors.mapUrl} dir="ltr" className="sm:col-span-2" />
            </div>
            <LocalizedField register={register} errors={errors} name="address" label={t('contact.address')} />
            <LocalizedField register={register} errors={errors} name="workingHours" label={t('contact.hours')} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.social')}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            {socials.map((s) => (
              <TextField key={s} register={register} name={`social.${s}`} label={s} error={errors.social?.[s]} dir="ltr" placeholder="https://" className="capitalize" />
            ))}
          </CardContent>
        </Card>
        <div>
          <Button type="submit" disabled={save.isPending}>
            {t('admin.save')}
          </Button>
        </div>
      </form>
    </>
  )
}
