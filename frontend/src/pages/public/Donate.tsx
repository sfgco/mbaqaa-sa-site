import { donationNotifySchema, type DonationChannel } from '@mbaqaa/shared'
import { Check, Copy, Landmark, QrCode } from 'lucide-react'
import { useState } from 'react'
import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Honeypot, SelectField, TextField } from '@/components/forms/fields'
import { FormShell } from '@/components/forms/FormShell'
import { useApiForm } from '@/components/forms/useApiForm'
import { PageHeader, Section } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { useChannels } from '@/hooks/queries'
import { useLang } from '@/hooks/useLang'
import { api } from '@/lib/api'
import { pick } from '@/lib/format'

function CopyButton({ value }: { value: string }) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      onClick={async () => {
        await navigator.clipboard.writeText(value)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      {copied ? t('donate.copied') : t('donate.copy')}
    </Button>
  )
}

export function ChannelCard({ channel }: { channel: DonationChannel }) {
  const { t } = useTranslation()
  const { lang } = useLang()
  const Icon = channel.type === 'qr' ? QrCode : Landmark
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className="size-5 text-accent" /> {pick(channel.title, lang)}
        </CardTitle>
        {channel.description && pick(channel.description, lang) && <CardDescription>{pick(channel.description, lang)}</CardDescription>}
      </CardHeader>
      <CardContent>
        {channel.type === 'qr' && channel.qrImageUrl ? (
          <img src={channel.qrImageUrl} alt={pick(channel.title, lang)} className="mx-auto size-56 rounded-lg border" loading="lazy" />
        ) : (
          <dl className="space-y-3 text-sm">
            {channel.bankName && (
              <div>
                <dt className="text-muted-foreground">{t('donate.bank')}</dt>
                <dd className="font-medium">{channel.bankName}</dd>
              </div>
            )}
            {channel.accountName && (
              <div>
                <dt className="text-muted-foreground">{t('donate.accountName')}</dt>
                <dd className="font-medium">{channel.accountName}</dd>
              </div>
            )}
            {channel.iban && (
              <div>
                <dt className="text-muted-foreground">{t('donate.iban')}</dt>
                <dd className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-muted px-3 py-2">
                  <span dir="ltr" className="font-mono tracking-wider">{channel.iban.replace(/(.{4})/g, '$1 ').trim()}</span>
                  <CopyButton value={channel.iban} />
                </dd>
              </div>
            )}
          </dl>
        )}
      </CardContent>
    </Card>
  )
}

export default function Donate() {
  const { t } = useTranslation()
  const { lang } = useLang()
  const channels = useChannels()
  const { form, done, reset, pending, onSubmit } = useApiForm(
    donationNotifySchema,
    (v) => api('/donations/notify', { method: 'POST', body: v }),
    { defaultValues: { recurring: false } },
  )
  const { register, control, formState: { errors } } = form

  return (
    <>
      <PageHeader title={t('donate.title')} intro={t('donate.intro')} />
      <Section title={t('donate.channels')}>
        {channels.isLoading ? (
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        ) : !channels.data?.items.length ? (
          <p className="text-muted-foreground">{t('donate.noChannels')}</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {channels.data.items.map((c) => (
              <ChannelCard key={c._id} channel={c} />
            ))}
          </div>
        )}
      </Section>
      <Section title={t('donate.notifyTitle')} className="max-w-4xl !pt-0">
        <p className="-mt-4 mb-6 text-muted-foreground">{t('donate.notifyIntro')}</p>
        <FormShell done={done} successText={t('donate.success')} onReset={reset} onSubmit={onSubmit} pending={pending}>
          <Honeypot register={register} />
          <TextField register={register} name="name" label={t('form.name')} error={errors.name} autoComplete="name" />
          <TextField register={register} name="phone" label={t('form.phone')} error={errors.phone} type="tel" dir="ltr" placeholder={t('form.phonePlaceholder')} />
          <TextField register={register} name="amount" label={t('form.amount')} error={errors.amount} type="number" min={1} step="0.01" inputMode="decimal" dir="ltr" />
          <TextField register={register} name="transferDate" label={t('form.transferDate')} error={errors.transferDate} type="date" />
          {!!channels.data?.items.length && (
            <SelectField
              control={control}
              name="channelId"
              label={t('form.channel')}
              error={errors.channelId}
              optional
              placeholder={t('form.select')}
              options={channels.data.items.map((c) => ({ value: c._id, label: pick(c.title, lang) }))}
            />
          )}
          <TextField register={register} name="reference" label={t('form.reference')} error={errors.reference} optional dir="ltr" />
          <TextField register={register} name="email" label={t('form.email')} error={errors.email} type="email" dir="ltr" optional />
          <Controller
            control={control}
            name="recurring"
            render={({ field }) => (
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border bg-secondary/40 p-4 sm:col-span-2">
                <Checkbox checked={!!field.value} onCheckedChange={(c) => field.onChange(c === true)} className="mt-0.5" />
                <span>
                  <span className="font-semibold">{t('donate.recurring')}</span>
                  <span className="block text-sm text-muted-foreground">{t('donate.recurringHint')}</span>
                </span>
              </label>
            )}
          />
          <TextField register={register} name="notes" label={t('form.notes')} error={errors.notes} multiline optional className="sm:col-span-2" />
        </FormShell>
      </Section>
    </>
  )
}
