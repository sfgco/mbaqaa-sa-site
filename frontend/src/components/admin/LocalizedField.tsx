import type { FieldErrors, FieldValues, Path, UseFormRegister } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useErrorText } from '@/components/forms/fields'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

/** Side-by-side Arabic (required) and English inputs for a `{ ar, en }` field. */
export function LocalizedField<T extends FieldValues>({
  register,
  errors,
  name,
  label,
  multiline,
  rows = 4,
}: {
  register: UseFormRegister<T>
  errors: FieldErrors<T>
  name: string
  label: string
  multiline?: boolean
  rows?: number
}) {
  const { t } = useTranslation()
  const errorText = useErrorText()
  const fieldErrors = name.split('.').reduce<any>((o, k) => o?.[k], errors) as Record<'ar' | 'en', { message?: string }> | undefined

  return (
    <fieldset className="grid gap-3 md:grid-cols-2">
      <legend className="mb-2 text-sm font-medium">{label}</legend>
      {(['ar', 'en'] as const).map((l) => {
        const id = `${name}.${l}`
        const err = fieldErrors?.[l]?.message
        const props = { id, dir: l === 'ar' ? 'rtl' : 'ltr', lang: l, 'aria-invalid': !!err, ...register(id as Path<T>) }
        return (
          <div key={l} className="grid gap-1.5">
            <Label htmlFor={id} className="text-xs text-muted-foreground">
              {t(l === 'ar' ? 'admin.arabic' : 'admin.english')}
            </Label>
            {multiline ? <Textarea rows={rows} {...props} /> : <Input {...props} />}
            {err && <p className="text-sm text-destructive">{errorText(err)}</p>}
          </div>
        )
      })}
    </fieldset>
  )
}
