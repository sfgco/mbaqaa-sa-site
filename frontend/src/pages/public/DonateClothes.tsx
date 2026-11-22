import { clothesQuantities, clothesRequestSchema } from '@mbaqaa/shared'
import { Info } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { CheckboxGroupField, Honeypot, SelectField, TextField } from '@/components/forms/fields'
import { FormShell } from '@/components/forms/FormShell'
import { useApiForm } from '@/components/forms/useApiForm'
import { PageHeader, Section } from '@/components/layout/PageHeader'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { api } from '@/lib/api'

const itemTypes = ['men', 'women', 'children', 'shoes', 'other'] as const

export default function DonateClothes() {
  const { t } = useTranslation()
  const { form, done, reset, pending, onSubmit } = useApiForm(
    clothesRequestSchema,
    (v) => api('/requests/clothes', { method: 'POST', body: v }),
    { defaultValues: { itemTypes: [] } },
  )
  const { register, control, formState: { errors } } = form

  return (
    <>
      <PageHeader title={t('clothes.title')} intro={t('clothes.intro')} />
      <Section className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <FormShell done={done} successText={t('clothes.success')} onReset={reset} onSubmit={onSubmit} pending={pending}>
            <Honeypot register={register} />
            <TextField register={register} name="name" label={t('form.name')} error={errors.name} autoComplete="name" />
            <TextField register={register} name="phone" label={t('form.phone')} error={errors.phone} type="tel" dir="ltr" placeholder={t('form.phonePlaceholder')} autoComplete="tel" />
            <TextField register={register} name="city" label={t('form.city')} error={errors.city} autoComplete="address-level2" />
            <TextField register={register} name="district" label={t('form.district')} error={errors.district} />
            <TextField register={register} name="address" label={t('form.address')} error={errors.address} optional className="sm:col-span-2" />
            <SelectField
              control={control}
              name="quantity"
              label={t('form.quantity')}
              error={errors.quantity}
              placeholder={t('form.select')}
              options={clothesQuantities.map((q) => ({ value: q, label: t(`form.quantities.${q}`) }))}
            />
            <TextField register={register} name="preferredDate" label={t('form.preferredDate')} error={errors.preferredDate} type="date" optional />
            <CheckboxGroupField
              control={control}
              name="itemTypes"
              label={t('form.itemTypes')}
              error={errors.itemTypes as never}
              className="sm:col-span-2"
              options={itemTypes.map((i) => ({ value: i, label: t(`form.items.${i}`) }))}
            />
            <TextField register={register} name="email" label={t('form.email')} error={errors.email} type="email" dir="ltr" optional />
            <TextField register={register} name="notes" label={t('form.notes')} error={errors.notes} multiline optional className="sm:col-span-2" />
          </FormShell>
        </div>
        <aside>
          <Alert>
            <Info className="size-4" />
            <AlertTitle>{t('clothes.tips')}</AlertTitle>
            <AlertDescription>
              <ul className="mt-2 list-disc space-y-2 ps-4">
                {(t('clothes.tipsList', { returnObjects: true }) as string[]).map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        </aside>
      </Section>
    </>
  )
}
