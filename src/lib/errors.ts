import type { TFunction } from 'i18next'
import { ApiError } from './api'
import { UploadError } from './upload'

/** Human message for any thrown error (API codes, upload errors, network). */
export function errorMessage(err: unknown, t: TFunction): string {
  if (err instanceof UploadError) return t('common:upload.' + err.code, { max: 20 })
  if (err instanceof ApiError) return t(`common:errors.${err.code}`, { defaultValue: err.message || t('common:errors.generic') })
  if (err instanceof TypeError) return t('common:states.networkError')
  return t('common:errors.generic')
}
