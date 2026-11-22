import type { IncomingMessage, ServerResponse } from 'node:http'
import { connectDB } from '../db'
import { checkOrigin } from '../middleware/csrf'
import { requireAccess } from '../middleware/auth'
import { rateLimit } from '../middleware/rateLimit'
import { HttpError } from '../utils/httpError'
import { parseCookies } from '../utils/cookies'
import { findRoute } from './router'
import type { Ctx, Result, Route } from './types'

/**
 * Single API entry. Domain route tables are imported lazily so a request
 * only loads the code for its own domain (keeps cold starts small).
 */
const domains: Record<string, () => Promise<{ routes: Route[] }>> = {
  auth: () => import('../routes/auth'),
  pages: () => import('../routes/pages'),
  posts: () => import('../routes/posts'),
  gallery: () => import('../routes/gallery'),
  videos: () => import('../routes/videos'),
  faqs: () => import('../routes/faqs'),
  navigation: () => import('../routes/navigation'),
  documents: () => import('../routes/documents'),
  uploads: () => import('../routes/uploads'),
  contact: () => import('../routes/contact'),
  requests: () => import('../routes/requests'),
  donations: () => import('../routes/donations'),
  settings: () => import('../routes/settings'),
  users: () => import('../routes/users'),
  stats: () => import('../routes/stats'),
  health: async () => ({ routes: [{ method: 'GET', path: '/health', access: 'public', handler: () => ({ body: { ok: true } }) }] }),
}

const MAX_BODY = 1_000_000

async function readBody(req: IncomingMessage): Promise<unknown> {
  // Vercel may have already parsed it.
  const pre = (req as IncomingMessage & { body?: unknown }).body
  if (pre !== undefined && pre !== null && typeof pre !== 'string' && !Buffer.isBuffer(pre)) return pre
  let raw = typeof pre === 'string' ? pre : Buffer.isBuffer(pre) ? pre.toString('utf8') : ''
  if (!raw && !req.readableEnded) {
    const chunks: Buffer[] = []
    let size = 0
    for await (const chunk of req) {
      size += (chunk as Buffer).length
      if (size > MAX_BODY) throw new HttpError(413, 'PAYLOAD_TOO_LARGE', 'Request body too large')
      chunks.push(chunk as Buffer)
    }
    raw = Buffer.concat(chunks).toString('utf8')
  }
  if (!raw) return undefined
  const type = String(req.headers['content-type'] ?? '')
  if (!type.includes('application/json')) throw new HttpError(415, 'UNSUPPORTED_MEDIA_TYPE', 'Expected JSON')
  try {
    return JSON.parse(raw)
  } catch {
    throw new HttpError(400, 'INVALID_JSON', 'Malformed JSON body')
  }
}

function clientIp(req: IncomingMessage): string {
  const fwd = String(req.headers['x-forwarded-for'] ?? '').split(',')[0].trim()
  return fwd || req.socket?.remoteAddress || 'unknown'
}

function send(res: ServerResponse, result: Result): void {
  res.statusCode = result.status ?? 200
  for (const [k, v] of Object.entries(result.headers ?? {})) res.setHeader(k, v)
  if (result.cookies?.length) res.setHeader('Set-Cookie', result.cookies)
  if (!res.hasHeader('Cache-Control')) res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  if (result.raw !== undefined) {
    res.end(result.raw)
    return
  }
  if (res.statusCode === 204 || res.statusCode === 301 || res.statusCode === 302 || result.body === undefined) {
    res.end()
    return
  }
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(result.body))
}

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  try {
    const url = new URL(req.url ?? '/', 'http://localhost')
    // Vercel rewrite passes the original path as ?__path=…; dev/test use the real path.
    const rewritten = url.searchParams.get('__path')
    url.searchParams.delete('__path')
    const path = '/' + (rewritten ?? url.pathname.replace(/^\/api\/?/, '')).replace(/^\/+|\/+$/g, '')
    const domain = path.split('/')[1] ?? ''
    const load = domains[domain]
    if (!load) throw new HttpError(404, 'NOT_FOUND', 'Unknown endpoint')
    const { routes } = await load()
    const method = (req.method ?? 'GET').toUpperCase()
    const found = findRoute(routes, method, path)
    if (!found) throw new HttpError(404, 'NOT_FOUND', 'Unknown endpoint')
    if ('methodNotAllowed' in found) throw new HttpError(405, 'METHOD_NOT_ALLOWED', 'Method not allowed')

    const ctx: Ctx = {
      method,
      path,
      params: found.params,
      query: Object.fromEntries(url.searchParams),
      headers: req.headers,
      body: method === 'GET' || method === 'DELETE' ? undefined : await readBody(req),
      ip: clientIp(req),
      cookies: parseCookies(req.headers.cookie),
    }
    const { route } = found
    if (route.access !== 'public') checkOrigin(ctx)
    await connectDB()
    if (route.rateLimit) await rateLimit(route.rateLimit.key, ctx.ip, route.rateLimit.max, route.rateLimit.windowSec)
    await requireAccess(ctx, route.access)
    send(res, await route.handler(ctx))
  } catch (err) {
    if (err instanceof HttpError) {
      send(res, { status: err.status, body: { error: { code: err.code, message: err.message, details: err.details } } })
      return
    }
    const e = err as { name?: string; code?: number }
    if (e?.name === 'CastError') {
      send(res, { status: 404, body: { error: { code: 'NOT_FOUND', message: 'Resource not found' } } })
      return
    }
    if (e?.code === 11000) {
      send(res, { status: 409, body: { error: { code: 'CONFLICT', message: 'Duplicate value' } } })
      return
    }
    // Never log request bodies (may contain IBANs, receipts, passwords).
    console.error('[api] unhandled error:', (err as Error)?.message)
    send(res, { status: 500, body: { error: { code: 'INTERNAL', message: 'Internal server error' } } })
  }
}
