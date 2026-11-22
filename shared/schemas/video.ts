import { z } from 'zod'
import { localized, localizedOptional, publishStatus, url } from './common'

export type VideoProvider = 'youtube' | 'vimeo'

/** Extract provider + id from a YouTube/Vimeo URL. Returns null for anything else. */
export function parseVideoUrl(input: string): { provider: VideoProvider; videoId: string } | null {
  let u: URL
  try {
    u = new URL(input.trim())
  } catch {
    return null
  }
  const host = u.hostname.replace(/^www\.|^m\./, '')
  if (host === 'youtu.be') {
    const id = u.pathname.slice(1).split('/')[0]
    return /^[\w-]{11}$/.test(id) ? { provider: 'youtube', videoId: id } : null
  }
  if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    let id = u.searchParams.get('v') ?? ''
    const m = u.pathname.match(/^\/(?:embed|shorts|live|v)\/([\w-]{11})/)
    if (m) id = m[1]
    return /^[\w-]{11}$/.test(id) ? { provider: 'youtube', videoId: id } : null
  }
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const m = u.pathname.match(/(?:^|\/)(\d{6,12})(?:\/|$)/)
    return m ? { provider: 'vimeo', videoId: m[1] } : null
  }
  return null
}

export function videoEmbedUrl(provider: VideoProvider, videoId: string): string {
  return provider === 'youtube'
    ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`
    : `https://player.vimeo.com/video/${videoId}?autoplay=1&dnt=1`
}

export const videoSchema = z.object({
  url: url.refine((v) => parseVideoUrl(v) !== null, { message: 'invalid_video_url' }),
  title: localized(200),
  description: localizedOptional(2000),
  publishedAt: z.coerce.date().optional(),
  status: publishStatus.default('draft'),
  featured: z.boolean().optional().default(false),
  order: z.coerce.number().int().min(0).optional().default(0),
})
export type VideoInput = z.input<typeof videoSchema>
export const videoUpdateSchema = videoSchema.partial()
