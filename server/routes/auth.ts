import { loginSchema } from '../../shared/schemas/user'
import type { Route } from '../http/types'
import { ok } from '../http/types'
import { authCookie, clearAuthCookie, signToken } from '../middleware/auth'
import { validate } from '../middleware/validate'
import * as auth from '../services/authService'

export const routes: Route[] = [
  {
    method: 'POST',
    path: '/auth/login',
    access: 'public',
    rateLimit: { key: 'login', max: 10, windowSec: 900 },
    handler: async (ctx) => {
      const user = await auth.login(validate(loginSchema, ctx.body))
      return { ...ok({ user: { _id: user.id, name: user.name, email: user.email, role: user.role } }), cookies: [authCookie(signToken(user))] }
    },
  },
  {
    method: 'POST',
    path: '/auth/logout',
    access: 'public',
    handler: () => ({ status: 204, cookies: [clearAuthCookie()] }),
  },
  {
    method: 'GET',
    path: '/auth/me',
    access: 'auth',
    handler: async (ctx) => ok({ user: await auth.getMe(ctx.user!.id) }),
  },
]
