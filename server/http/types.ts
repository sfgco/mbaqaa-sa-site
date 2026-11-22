import type { IncomingHttpHeaders } from 'node:http'
import type { Role } from '../../shared/schemas/user'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: Role
}

export interface Ctx {
  method: string
  /** Path without the `/api` prefix, e.g. `/pages/admin/123`. */
  path: string
  params: Record<string, string>
  query: Record<string, string>
  headers: IncomingHttpHeaders
  body: unknown
  ip: string
  cookies: Record<string, string>
  /** Set by auth guard. */
  user?: AuthUser
}

export interface Result {
  status?: number
  body?: unknown
  headers?: Record<string, string>
  /** Raw string/Buffer body (CSV etc.); `body` is ignored when set. */
  raw?: string | Buffer
  cookies?: string[]
}

export type Access = 'public' | 'auth' | 'editor' | 'admin'

export interface Route {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  /** Path pattern relative to /api, with `:params`, e.g. `/pages/admin/:id`. */
  path: string
  access: Access
  /** Public POST endpoints: Mongo-backed limiter key + max per window. */
  rateLimit?: { key: string; max: number; windowSec: number }
  handler: (ctx: Ctx) => Promise<Result> | Result
}

export const ok = (body: unknown, status = 200): Result => ({ status, body })
export const created = (body: unknown): Result => ({ status: 201, body })
export const noContent = (): Result => ({ status: 204 })
