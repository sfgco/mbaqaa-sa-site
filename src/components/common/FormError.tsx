import type { FieldError as RHFFieldError } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { FieldError } from '@/components/ui/field'

/** Shows a translated validation message (Zod messages are i18n keys under common:validation). */
export function FormError({ error }: { error?: Pick<RHFFieldError, 'message'> }) {
  const { t } = useTranslation()
  if (!error?.message) return null
  return <FieldError>{t(`common:validation.${error.message}`, { defaultValue: error.message })}</FieldError>
}
