import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useApiErrorMessage } from '@/components/forms/useApiForm'
import { api } from '@/lib/api'

type Query = Record<string, string | number | undefined>

/** All admin queries are keyed ['admin', path, query] so logout can clear them. */
export function useAdminQuery<T>(path: string, query?: Query, enabled = true) {
  return useQuery({
    queryKey: ['admin', path, query],
    queryFn: () => api<T>(path, { query }),
    placeholderData: keepPreviousData,
    enabled,
  })
}

/** Mutation that refreshes admin queries and shows a toast. */
export function useAdminMutation<V, R = unknown>(
  fn: (v: V) => Promise<R>,
  opts: { success?: string; onSuccess?: (r: R) => void; errorText?: (e: unknown) => string | undefined } = {},
) {
  const qc = useQueryClient()
  const { t } = useTranslation()
  const errorMessage = useApiErrorMessage()
  return useMutation({
    mutationFn: fn,
    onSuccess: (r) => {
      void qc.invalidateQueries({ queryKey: ['admin'] })
      toast.success(opts.success ?? t('admin.saved'))
      opts.onSuccess?.(r)
    },
    onError: (e) => toast.error(opts.errorText?.(e) ?? errorMessage(e)),
  })
}
