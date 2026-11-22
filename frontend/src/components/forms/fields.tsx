import type { ReactNode } from 'react'
import { Controller, type Control, type FieldError, type FieldValues, type Path, type UseFormRegister } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

/** Translates zod/server error codes ("invalid_phone") into messages. */
export function useErrorText() {
  const { t, i18n } = useTranslation()
  return (code?: string) => {
    if (!code) return undefined
    return i18n.exists(`errors.${code}`) ? t(`errors.${code}`) : t('errors.invalid')
  }
}

type FieldProps = {
  id: string
  label: string
  error?: FieldError
  optional?: boolean
  className?: string
  children: ReactNode
}

export function Field({ id, label, error, optional, className, children }: FieldProps) {
  const { t } = useTranslation()
  const errorText = useErrorText()
  return (
    <div className={cn('grid gap-2', className)}>
      <Label htmlFor={id}>
        {label}
        {optional && <span className="text-xs font-normal text-muted-foreground">{t('form.optional')}</span>}
      </Label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
          {errorText(error.message)}
        </p>
      )}
    </div>
  )
}

type Common<T extends FieldValues> = {
  name: Path<T>
  label: string
  error?: FieldError
  optional?: boolean
  className?: string
}

export function TextField<T extends FieldValues>({
  register,
  name,
  label,
  error,
  optional,
  className,
  multiline,
  ...input
}: Common<T> & { register: UseFormRegister<T>; multiline?: boolean } & Omit<React.ComponentProps<'input'>, 'name'>) {
  const aria = { 'aria-invalid': !!error, 'aria-describedby': error ? `${name}-error` : undefined }
  return (
    <Field id={name} label={label} error={error} optional={optional} className={className}>
      {multiline ? (
        <Textarea id={name} rows={4} {...aria} {...register(name)} />
      ) : (
        <Input id={name} {...aria} {...input} {...register(name, input.type === 'number' ? { valueAsNumber: true } : undefined)} />
      )}
    </Field>
  )
}

type Option = { value: string; label: string }

export function SelectField<T extends FieldValues>({
  control,
  name,
  label,
  error,
  optional,
  className,
  options,
  placeholder,
}: Common<T> & { control: Control<T>; options: Option[]; placeholder?: string }) {
  return (
    <Field id={name} label={label} error={error} optional={optional} className={className}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Select value={field.value ?? ''} onValueChange={field.onChange}>
            <SelectTrigger id={name} aria-invalid={!!error} className="w-full">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    </Field>
  )
}

export function RadioField<T extends FieldValues>({ control, name, label, error, className, options }: Common<T> & { control: Control<T>; options: Option[] }) {
  return (
    <Field id={name} label={label} error={error} className={className}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <RadioGroup value={field.value ?? ''} onValueChange={field.onChange} className="flex flex-wrap gap-4" aria-invalid={!!error}>
            {options.map((o) => (
              <label key={o.value} className="flex cursor-pointer items-center gap-2 text-sm">
                <RadioGroupItem value={o.value} id={`${name}-${o.value}`} />
                {o.label}
              </label>
            ))}
          </RadioGroup>
        )}
      />
    </Field>
  )
}

export function CheckboxGroupField<T extends FieldValues>({ control, name, label, error, className, options }: Common<T> & { control: Control<T>; options: Option[] }) {
  return (
    <Field id={name} label={label} error={error} className={className}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => {
          const value: string[] = field.value ?? []
          return (
            <div className="flex flex-wrap gap-x-5 gap-y-3">
              {options.map((o) => (
                <label key={o.value} className="flex cursor-pointer items-center gap-2 text-sm">
                  <Checkbox
                    checked={value.includes(o.value)}
                    onCheckedChange={(c) => field.onChange(c ? [...value, o.value] : value.filter((v) => v !== o.value))}
                  />
                  {o.label}
                </label>
              ))}
            </div>
          )
        }}
      />
    </Field>
  )
}

/** Hidden input bots love to fill. */
export function Honeypot<T extends FieldValues>({ register }: { register: UseFormRegister<T> }) {
  return (
    <div aria-hidden="true" className="absolute -start-[9999px] h-0 overflow-hidden">
      <label>
        Website
        <input tabIndex={-1} autoComplete="off" {...register('website' as Path<T>)} />
      </label>
    </div>
  )
}
