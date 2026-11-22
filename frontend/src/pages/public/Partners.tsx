import { partnerTypes, partnershipRequestSchema } from '@mbaqaa/shared'
import { CheckCircle2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Honeypot, SelectField, TextField } from '@/components/forms/fields'
import { FormShell } from '@/components/forms/FormShell'
import { useApiForm } from '@/components/forms/useApiForm'
import { PageHeader, Section } from '@/components/layout/PageHeader'
import { api } from '@/lib/api'

export default function Partners() {
  const { t } = useTranslation()
  const { form, done, reset, pending, onSubmit } = useApiForm(partnershipRequestSchema, (v) =>
    api('/requests/partnership', { method: 'POST', body: v }),
  )
  const { register, control, formState: { errors } } = form

  return (
    <>
      <PageHeader title={t('partners.title')} intro={t('partners.intro')} />
      <Section className="grid gap-8 lg:grid-cols-3">
        <aside className="order-last lg:order-first">
          <ul className="space-y-4">
            {(t('partners.benefits', { returnObjects: true }) as string[]).map((b) => (
              <li key={b} className="flex gap-3">
                <CheckCircle2 className="mt-1 size-5 shrink-0 text-accent" />
                {b}
              </li>
            ))}
          </ul>
        </aside>
        <div className="lg:col-span-2">
          <FormShell done={done} successText={t('partners.success')} onReset={reset} onSubmit={onSubmit} pending={pending}>
            <Honeypot register={register} />
            <TextField register={register} name="organization" label={t('form.organization')} error={errors.organization} autoComplete="organization" />
            <SelectField
              control={control}
              name="partnerType"
              label={t('form.partnerType')}
              error={errors.partnerType}
              placeholder={t('form.select')}
              options={partnerTypes.map((p) => ({ value: p, label: t(`form.partnerTypes.${p}`) }))}
            />
            <TextField register={register} name="contactName" label={t('form.contactName')} error={errors.contactName} autoComplete="name" />
            <TextField register={register} name="phone" label={t('form.phone')} error={errors.phone} type="tel" dir="ltr" placeholder={t('form.phonePlaceholder')} />
            <TextField register={register} name="email" label={t('form.email')} error={errors.email} type="email" dir="ltr" className="sm:col-span-2" />
            <TextField register={register} name="message" label={t('form.message')} error={errors.message} multiline className="sm:col-span-2" />
          </FormShell>
        </div>
      </Section>
    </>
  )
}
