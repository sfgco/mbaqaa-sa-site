import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { User } from '@shared/types'
import type { LoginInput } from '@shared/schemas/user'
import { ApiError, apiGet, apiPost } from '@/lib/api'

type Me = Pick<User, '_id' | 'name' | 'email' | 'role'>

export function useAuth() {
  const qc = useQueryClient()
  const me = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        return (await apiGet<{ user: Me }>('/auth/me')).user
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) return null
        throw e
      }
    },
    staleTime: 5 * 60_000,
  })
  const login = useMutation({
    mutationFn: (input: LoginInput) => apiPost<{ user: Me }>('/auth/login', input),
    onSuccess: (d) => qc.setQueryData(['auth', 'me'], d.user),
  })
  const logout = useMutation({
    mutationFn: () => apiPost<void>('/auth/logout'),
    onSuccess: () => {
      qc.setQueryData(['auth', 'me'], null)
      qc.removeQueries({ predicate: (q) => q.queryKey[0] === 'admin' })
    },
  })
  return { user: me.data ?? null, isLoading: me.isLoading, login, logout, isAdmin: me.data?.role === 'admin' }
}
