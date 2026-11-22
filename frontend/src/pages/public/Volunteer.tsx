import { volunteerAreas, volunteerRequestSchema } from '@mbaqaa/shared'
import { useTranslation } from 'react-i18next'
import { CheckboxGroupField, Honeypot, RadioField, SelectField, TextField } from '@/components/forms/fields'
import { FormShell } from '@/components/forms/FormShell'
import { useApiForm } from '@/components/forms/useApiForm'
import { PageHeader, Section } from '@/components/layout/PageHeader'
import { api } from '@/lib/api'

export default function Volunteer() {
  const { t } = useTranslation()
  const { form, done, reset, pending, onSubmit } = useApiForm(
    volunteerRequestSchema,
    (v) => api('/requests/volunteer', { method: 'POST', body: v }),
    { defaultValues: { areas: [] } },
  )
  const { register, control, formState: { errors } } = form

  return (
    <>
      <PageHeader title={t('volunteer.title')} intro={t('volunteer.intro')} />
      <Section className="max-w-4xl">
        <FormShell done={done} successText={t('volunteer.success')} onReset={reset} onSubmit={onSubmit} pending={pending}>
          <Honeypot register={register} />
          <TextField register={register} name="name" label={t('form.name')} error={errors.name} autoComplete="name" />
          <TextField register={register} name="phone" label={t('form.phone')} error={errors.phone} type="tel" dir="ltr" placeholder={t('form.phonePlaceholder')} />
          <TextField register={register} name="email" label={t('form.email')} error={errors.email} type="email" dir="ltr" optional />
          <TextField register={register} name="city" label={t('form.city')} error={errors.city} />
          <RadioField
            control={control}
            name="gender"
            label={t('form.gender')}
            error={errors.gender}
            options={(['male', 'female'] as const).map((g) => ({ value: g, label: t(`form.genders.${g}`) }))}
          />
          <TextField register={register} name="age" label={t('form.age')} error={errors.age} type="number" min={15} max={80} inputMode="numeric" />
          <CheckboxGroupField
            control={control}
            name="areas"
            label={t('form.areas')}
            error={errors.areas as never}
            className="sm:col-span-2"
            options={volunteerAreas.map((a) => ({ value: a, label: t(`form.areaOptions.${a}`) }))}
          />
          <SelectField
            control={control}
            name="availability"
            label={t('form.availability')}
            error={errors.availability}
            placeholder={t('form.select')}
            options={(['weekdays', 'weekends', 'flexible'] as const).map((a) => ({ value: a, label: t(`form.availabilityOptions.${a}`) }))}
          />
          <TextField register={register} name="experience" label={t('form.experience')} error={errors.experience} multiline optional className="sm:col-span-2" />
        </FormShell>
      </Section>
    </>
  )
}
