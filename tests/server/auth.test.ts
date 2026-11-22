import { describe, expect, it } from 'vitest'
import { useApi } from './helpers'

const api = useApi()

describe('auth', () => {
  it('logs in, returns me, logs out', async () => {
    const cookie = await api.loginAs('editor')
    expect(cookie).toMatch(/^token=/)
    const me = await api.call('GET', '/auth/me', { cookie })
    expect(me.status).toBe(200)
    expect(me.body.user.role).toBe('editor')
    expect(me.body.user.passwordHash).toBeUndefined()
    const out = await api.call('POST', '/auth/logout', { cookie })
    expect(out.status).toBe(204)
    expect(out.headers.get('set-cookie')).toMatch(/Max-Age=0/)
  })

  it('rejects bad credentials and invalid input', async () => {
    const bad = await api.call('POST', '/auth/login', { body: { email: 'nobody@test.sa', password: 'x' } })
    expect(bad.status).toBe(401)
    const invalid = await api.call('POST', '/auth/login', { body: { email: 'not-an-email' } })
    expect(invalid.status).toBe(400)
    expect(invalid.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('requires auth for /auth/me', async () => {
    const r = await api.call('GET', '/auth/me')
    expect(r.status).toBe(401)
  })

  it('returns 404 for unknown endpoints', async () => {
    const r = await api.call('GET', '/nope')
    expect(r.status).toBe(404)
  })
})
