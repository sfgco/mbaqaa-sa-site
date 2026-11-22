import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm, type DefaultValues, type FieldValues, type Path } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import type { z } from 'zod'
import { ApiError } from '@/lib/api'

/** Turns an ApiError into a toast message. */
export function useApiErrorMessage() {
  const { t } = useTranslation()
  return (e: unknown) => {
    if (e instanceof ApiError) {
      if (e.status === 0) return t('errors.network')
      if (e.status === 429) return t('errors.rateLimited')
    }
    return t('errors.generic')
  }
}

/**
 * react-hook-form + zod (shared schema) + a mutation. Server field errors are mapped back onto the form.
 */
export function useApiForm<S extends z.ZodType<FieldValues, FieldValues>, R = unknown>(
  schema: S,
  submit: (values: z.output<S>) => Promise<R>,
  opts: { defaultValues?: DefaultValues<z.input<S>>; onSuccess?: (r: R) => void } = {},
) {
  const form = useForm<z.input<S>, unknown, z.output<S>>({
    resolver: zodResolver(schema as never),
    defaultValues: opts.defaultValues,
  })
  const [done, setDone] = useState(false)
  const errorMessage = useApiErrorMessage()

  const mutation = useMutation({
    mutationFn: submit,
    onSuccess: (r) => {
      setDone(true)
      opts.onSuccess?.(r)
    },
    onError: (e) => {
      if (e instanceof ApiError && e.fields) {
        for (const [field, codes] of Object.entries(e.fields)) {
          form.setError(field as Path<z.input<S>>, { message: codes[0] })
        }
      }
      toast.error(errorMessage(e))
    },
  })

  return {
    form,
    done,
    reset: () => {
      form.reset()
      setDone(false)
    },
    pending: mutation.isPending,
    onSubmit: form.handleSubmit((v) => mutation.mutate(v)),
  }
}
