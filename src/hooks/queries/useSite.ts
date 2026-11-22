import { useQuery } from '@tanstack/react-query'
import type { Navigation, PublicSettings } from '@shared/types'
import { apiGet } from '@/lib/api'

export function useSettings() {
  return useQuery({ queryKey: ['settings'], queryFn: () => apiGet<PublicSettings>('/settings'), staleTime: 5 * 60_000 })
}

export function useNavigation() {
  return useQuery({ queryKey: ['navigation'], queryFn: () => apiGet<Navigation>('/navigation'), staleTime: 5 * 60_000 })
}
