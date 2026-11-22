import http from 'node:http'
import type { AddressInfo } from 'node:net'
import { afterAll, beforeAll } from 'vitest'
import handler from '../../server/http/handler'
import { UserModel } from '../../server/models/User'
import { hashPassword } from '../../server/services/authService'

export const ORIGIN = 'http://localhost:3000'

/** Starts the real API handler on a random port for the test file. */
export function useApi() {
  const state = { base: '' }
  let server: http.Server
  beforeAll(async () => {
    server = http.createServer((req, res) => void handler(req, res))
    await new Promise<void>((r) => server.listen(0, r))
    state.base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api`
  })
  afterAll(async () => {
    await new Promise<void>((r) => server.close(() => r()))
  })

  async function call(method: string, path: string, opts: { body?: unknown; cookie?: string; origin?: string | null; ip?: string } = {}) {
    const headers: Record<string, string> = { 'x-forwarded-for': opts.ip ?? `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}` }
    if (opts.body !== undefined) headers['content-type'] = 'application/json'
    if (opts.cookie) headers.cookie = opts.cookie
    if (opts.origin !== null) headers.origin = opts.origin ?? ORIGIN
    const res = await fetch(state.base + path, {
      method,
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      redirect: 'manual',
    })
    const text = await res.text()
    let json: any // eslint-disable-line @typescript-eslint/no-explicit-any -- test convenience
    try {
      json = text ? JSON.parse(text) : undefined
    } catch {
      json = undefined
    }
    return { status: res.status, body: json, text, headers: res.headers }
  }

  /** Create a user and return its auth cookie. */
  async function loginAs(role: 'admin' | 'editor' = 'admin') {
    const email = `${role}-${Math.random().toString(36).slice(2)}@test.sa`
    await UserModel.create({ name: role, email, passwordHash: await hashPassword('password123'), role })
    const r = await call('POST', '/auth/login', { body: { email, password: 'password123' } })
    const setCookie = r.headers.get('set-cookie') ?? ''
    return setCookie.split(';')[0]
  }

  return { call, loginAs, state }
}
