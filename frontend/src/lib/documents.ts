import { apiUrl } from '@/lib/api'

/** Counts the download server-side, then redirects to the file. */
export const downloadUrl = (slug: string) => apiUrl(`/documents/${encodeURIComponent(slug)}/download`)
