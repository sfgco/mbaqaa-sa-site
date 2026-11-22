import { useTranslation } from 'react-i18next'

/** Translates zod/server error codes ("invalid_phone") into messages. */
export function useErrorText() {
  const { t, i18n } = useTranslation()
  return (code?: string) => {
    if (!code) return undefined
    return i18n.exists(`errors.${code}`) ? t(`errors.${code}`) : t('errors.invalid')
  }
}
