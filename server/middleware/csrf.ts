import { env } from '../env'
import type { Ctx } from '../http/types'
import { HttpError } from '../utils/httpError'

/** State-changing authenticated requests must come from our own origin. */
export function checkOrigin(ctx: Ctx): void {
  if (ctx.method === 'GET' || ctx.method === 'HEAD') return
  const origin = (ctx.headers.origin as string | undefined) ?? refererOrigin(ctx.headers.referer as string | undefined)
  const allowed = new Set([new URL(env.APP_URL).origin])
  const host = ctx.headers.host
  // Same host the request was sent to (covers Vercel preview URLs and local dev ports).
  if (host) {
    allowed.add(`https://${host}`)
    if (!env.isProd) allowed.add(`http://${host}`)
  }
  if (!origin || !allowed.has(origin)) throw new HttpError(403, 'CSRF', 'Invalid request origin')
}

function refererOrigin(ref?: string): string | undefined {
  if (!ref) return undefined
  try {
    return new URL(ref).origin
  } catch {
    return undefined
  }
}
