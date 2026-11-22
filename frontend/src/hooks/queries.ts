import { useQuery } from '@tanstack/react-query'
import type { DonationChannel, Faq, Paginated, Post, Settings } from '@mbaqaa/shared'
import { api } from '@/lib/api'

export const useSettings = () =>
  useQuery({ queryKey: ['settings'], queryFn: () => api<Settings>('/settings'), staleTime: 5 * 60_000 })

export const useChannels = () =>
  useQuery({ queryKey: ['channels'], queryFn: () => api<{ items: DonationChannel[] }>('/donations/channels') })

export const useFaqs = () => useQuery({ queryKey: ['faqs'], queryFn: () => api<{ items: Faq[] }>('/faqs') })

export const usePosts = (query: { page?: number; limit?: number; category?: string }) =>
  useQuery({ queryKey: ['posts', query], queryFn: () => api<Paginated<Post>>('/posts', { query }) })

export const usePost = (slug: string) =>
  useQuery({ queryKey: ['post', slug], queryFn: () => api<Post>(`/posts/${encodeURIComponent(slug)}`), retry: false })
