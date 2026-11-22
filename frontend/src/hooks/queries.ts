import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { Album, AlbumWithImages, DocumentCategory, DocumentItem, DocumentList, DonationChannel, Faq, Paginated, Post, Settings } from '@mbaqaa/shared'
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

export const useDocumentCategories = () =>
  useQuery({ queryKey: ['documentCategories'], queryFn: () => api<{ items: DocumentCategory[] }>('/documents/categories') })

export const useDocuments = (query: { category?: string; year?: number; q?: string; page?: number; limit?: number }) =>
  useQuery({ queryKey: ['documents', query], queryFn: () => api<DocumentList>('/documents', { query }), placeholderData: keepPreviousData })

export const useDocument = (slug: string) =>
  useQuery({ queryKey: ['document', slug], queryFn: () => api<DocumentItem>(`/documents/${encodeURIComponent(slug)}`), retry: false })

export const useAlbums = (query: { page?: number; limit?: number }) =>
  useQuery({ queryKey: ['albums', query], queryFn: () => api<Paginated<Album>>('/gallery/albums', { query }) })

export const useAlbum = (slug: string) =>
  useQuery({ queryKey: ['album', slug], queryFn: () => api<AlbumWithImages>(`/gallery/albums/${encodeURIComponent(slug)}`), retry: false })
