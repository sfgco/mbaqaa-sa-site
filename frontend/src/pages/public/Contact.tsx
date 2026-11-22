import { contactSchema } from '@mbaqaa/shared'
import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Honeypot, TextField } from '@/components/forms/fields'
import { FormShell } from '@/components/forms/FormShell'
import { useApiForm } from '@/components/forms/useApiForm'
import { PageHeader, Section } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSettings } from '@/hooks/queries'
import { useLang } from '@/hooks/useLang'
import { api } from '@/lib/api'
import { pick } from '@/lib/format'

function InfoRow({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 text-primary">{icon}</span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="font-medium">{children}</div>
      </div>
    </li>
  )
}

export default function Contact() {
  const { t } = useTranslation()
  const { lang } = useLang()
  const { data: s } = useSettings()
  const { form, done, reset, pending, onSubmit } = useApiForm(contactSchema, (v) => api('/contact', { method: 'POST', body: v }))
  const { register, formState: { errors } } = form
  const wa = s?.whatsapp.replace(/\D/g, '').replace(/^0/, '966')

  return (
    <>
      <PageHeader title={t('contact.title')} intro={t('contact.intro')} />
      <Section className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <FormShell done={done} successText={t('contact.success')} onReset={reset} onSubmit={onSubmit} pending={pending}>
            <Honeypot register={register} />
            <TextField register={register} name="name" label={t('form.name')} error={errors.name} autoComplete="name" />
            <TextField register={register} name="phone" label={t('form.phone')} error={errors.phone} type="tel" dir="ltr" placeholder={t('form.phonePlaceholder')} />
            <TextField register={register} name="email" label={t('form.email')} error={errors.email} type="email" dir="ltr" optional />
            <TextField register={register} name="subject" label={t('form.subject')} error={errors.subject} />
            <TextField register={register} name="message" label={t('form.message')} error={errors.message} multiline className="sm:col-span-2" />
          </FormShell>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{t('contact.info')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-5">
              {s?.phone && (
                <InfoRow icon={<Phone className="size-5" />} label={t('contact.phone')}>
                  <a href={`tel:${s.phone}`} dir="ltr">{s.phone}</a>
                </InfoRow>
              )}
              {s?.whatsapp && (
                <InfoRow icon={<MessageCircle className="size-5" />} label={t('contact.whatsapp')}>
                  <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" dir="ltr">{s.whatsapp}</a>
                </InfoRow>
              )}
              {s?.email && (
                <InfoRow icon={<Mail className="size-5" />} label={t('contact.email')}>
                  <a href={`mailto:${s.email}`}>{s.email}</a>
                </InfoRow>
              )}
              {s && pick(s.address, lang) && (
                <InfoRow icon={<MapPin className="size-5" />} label={t('contact.address')}>
                  {s.mapUrl ? <a href={s.mapUrl} target="_blank" rel="noreferrer" className="underline-offset-4 hover:underline">{pick(s.address, lang)}</a> : pick(s.address, lang)}
                </InfoRow>
              )}
              {s && pick(s.workingHours, lang) && (
                <InfoRow icon={<Clock className="size-5" />} label={t('contact.hours')}>
                  {pick(s.workingHours, lang)}
                </InfoRow>
              )}
            </ul>
            <figure className="mt-6 flex flex-col items-center gap-2 rounded-lg border bg-background p-4">
              <img src="/qr/QR_Whatsapp.jpeg" alt={t('contact.whatsappQr')} className="size-40" loading="lazy" />
              <figcaption className="text-center text-xs text-muted-foreground">{t('contact.whatsappQr')}</figcaption>
            </figure>
          </CardContent>
        </Card>
      </Section>
    </>
  )
}
