import jwt from 'jsonwebtoken'
import { env } from '../env'
import type { Access, AuthUser, Ctx } from '../http/types'
import { HttpError } from '../utils/httpError'
import { serializeCookie } from '../utils/cookies'
import { UserModel } from '../models/User'

export const AUTH_COOKIE = 'token'

export function signToken(user: AuthUser): string {
  return jwt.sign({ sub: user.id, role: user.role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  })
}

function maxAgeSeconds(): number {
  const m = env.JWT_EXPIRES_IN.match(/^(\d+)([smhd])$/)
  if (!m) return 7 * 86400
  return Number(m[1]) * { s: 1, m: 60, h: 3600, d: 86400 }[m[2] as 's' | 'm' | 'h' | 'd']
}

export function authCookie(token: string): string {
  return serializeCookie(AUTH_COOKIE, token, { maxAge: maxAgeSeconds(), secure: env.isProd, sameSite: 'Lax' })
}
export function clearAuthCookie(): string {
  return serializeCookie(AUTH_COOKIE, '', { maxAge: 0, secure: env.isProd, sameSite: 'Lax' })
}

/** Resolve the user from the JWT cookie (re-checks the DB so deactivation takes effect immediately). */
export async function getAuthUser(ctx: Ctx): Promise<AuthUser | null> {
  const token = ctx.cookies[AUTH_COOKIE]
  if (!token) return null
  let payload: { sub?: string }
  try {
    payload = jwt.verify(token, env.JWT_SECRET) as { sub?: string }
  } catch {
    return null
  }
  if (!payload.sub) return null
  const u = await UserModel.findById(payload.sub).select('name email role active').lean()
  if (!u || !u.active) return null
  return { id: String(u._id), name: u.name, email: u.email, role: u.role }
}

/** Throws 401/403 unless the request meets `access`. Sets ctx.user. */
export async function requireAccess(ctx: Ctx, access: Access): Promise<void> {
  if (access === 'public') return
  const user = await getAuthUser(ctx)
  if (!user) throw new HttpError(401, 'UNAUTHORIZED', 'Authentication required')
  ctx.user = user
  if (access === 'admin' && user.role !== 'admin') throw new HttpError(403, 'FORBIDDEN', 'Admin role required')
}
