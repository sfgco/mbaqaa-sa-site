import { zodResolver } from '@hookform/resolvers/zod'
import { channelTypes, donationChannelSchema, type DonationChannel } from '@mbaqaa/shared'
import { ArrowDown, ArrowUp, Pencil, Plus } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { z } from 'zod'
import { AdminOnly } from '@/components/admin/AdminLayout'
import { LocalizedField } from '@/components/admin/LocalizedField'
import { AdminPageHeader, DeleteButton } from '@/components/admin/ui'
import { SelectField, TextField } from '@/components/forms/fields'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useAdminMutation, useAdminQuery } from '@/hooks/useAdmin'
import { useLang } from '@/hooks/useLang'
import { api } from '@/lib/api'
import { pick } from '@/lib/format'
import { moved } from '@/lib/reorder'

export default function Channels() {
  const { t } = useTranslation()
  const { lang } = useLang()
  const { data } = useAdminQuery<{ items: DonationChannel[] }>('/donations/admin/channels')
  const [editing, setEditing] = useState<DonationChannel | 'new' | null>(null)
  const reorder = useAdminMutation((ids: string[]) => api('/donations/admin/channels/reorder', { method: 'POST', body: { ids } }))
  const remove = useAdminMutation((id: string) => api(`/donations/admin/channels/${id}`, { method: 'DELETE' }), { success: t('admin.deleted') })
  const items = data?.items ?? []

  return (
    <AdminOnly>
      <AdminPageHeader
        title={t('admin.channels')}
        actions={
          <Button size="sm" onClick={() => setEditing('new')}>
            <Plus className="size-4" /> {t('admin.newChannel')}
          </Button>
        }
      />
      <div className="space-y-3">
        {items.length === 0 && <p className="py-12 text-center text-muted-foreground">{t('admin.empty')}</p>}
        {items.map((c, i) => (
          <Card key={c._id} className="py-4">
            <CardContent className="flex items-center gap-3">
              <div className="flex flex-col">
                <Button variant="ghost" size="icon" className="size-7" aria-label={t('admin.moveUp')} disabled={i === 0} onClick={() => reorder.mutate(moved(items, i, -1)!)}>
                  <ArrowUp className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" className="size-7" aria-label={t('admin.moveDown')} disabled={i === items.length - 1} onClick={() => reorder.mutate(moved(items, i, 1)!)}>
                  <ArrowDown className="size-4" />
                </Button>
              </div>
              {c.type === 'qr' && c.qrImageUrl && <img src={c.qrImageUrl} alt="" className="size-14 rounded border" />}
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{pick(c.title, lang)}</p>
                <p className="text-sm text-muted-foreground" dir={c.iban ? 'ltr' : undefined}>
                  {c.type === 'bank' ? `${c.bankName ?? ''} · ${c.iban ?? ''}` : t('admin.channelTypes.qr')}
                </p>
              </div>
              {!c.active && <Badge variant="secondary">{t('admin.statuses.draft')}</Badge>}
              <Button variant="ghost" size="icon" aria-label={t('admin.edit')} onClick={() => setEditing(c)}>
                <Pencil className="size-4" />
              </Button>
              <DeleteButton size="icon" onConfirm={() => remove.mutate(c._id)} />
            </CardContent>
          </Card>
        ))}
      </div>
      {editing && <ChannelDialog channel={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />}
    </AdminOnly>
  )
}

type Form = z.input<typeof donationChannelSchema>

function ChannelDialog({ channel, onClose }: { channel?: DonationChannel; onClose: () => void }) {
  const { t } = useTranslation()
  const { register, control, handleSubmit, formState: { errors } } = useForm<Form, unknown, z.output<typeof donationChannelSchema>>({
    resolver: zodResolver(donationChannelSchema),
    defaultValues: channel
      ? {
          type: channel.type,
          title: channel.title,
          description: channel.description ?? { ar: '', en: '' },
          bankName: channel.bankName ?? '',
          accountName: channel.accountName ?? '',
          iban: channel.iban ?? '',
          qrImageUrl: channel.qrImageUrl ?? '',
          active: channel.active,
        }
      : { type: 'bank', active: true, description: { ar: '', en: '' } },
  })
  const type = useWatch({ control, name: 'type' })
  const save = useAdminMutation(
    (body: z.output<typeof donationChannelSchema>) =>
      channel ? api(`/donations/admin/channels/${channel._id}`, { method: 'PATCH', body }) : api('/donations/admin/channels', { method: 'POST', body }),
    { onSuccess: onClose },
  )

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{channel ? t('admin.edit') : t('admin.newChannel')}</DialogTitle>
        </DialogHeader>
        <form id="channel-form" onSubmit={handleSubmit((v) => save.mutate(v))} noValidate className="grid gap-5">
          <SelectField
            control={control}
            name="type"
            label={t('admin.channelType')}
            error={errors.type}
            options={channelTypes.map((c) => ({ value: c, label: t(`admin.channelTypes.${c}`) }))}
          />
          <LocalizedField register={register} errors={errors} name="title" label={t('admin.titleField')} />
          <LocalizedField register={register} errors={errors} name="description" label={t('admin.description')} multiline rows={2} />
          {type === 'bank' ? (
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField register={register} name="bankName" label={t('donate.bank')} error={errors.bankName} />
              <TextField register={register} name="accountName" label={t('donate.accountName')} error={errors.accountName} />
              <TextField register={register} name="iban" label={t('donate.iban')} error={errors.iban} dir="ltr" placeholder="SA00 0000 0000 0000 0000 0000" className="sm:col-span-2" />
            </div>
          ) : (
            <TextField register={register} name="qrImageUrl" label={t('admin.qrImageUrl')} error={errors.qrImageUrl} dir="ltr" placeholder="/qr/QR_donation.jpeg" />
          )}
          <Controller
            control={control}
            name="active"
            render={({ field }) => (
              <div className="flex items-center gap-3">
                <Switch id="active" checked={!!field.value} onCheckedChange={field.onChange} />
                <Label htmlFor="active">{t('admin.active')}</Label>
              </div>
            )}
          />
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('admin.cancel')}
          </Button>
          <Button type="submit" form="channel-form" disabled={save.isPending}>
            {t('admin.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
