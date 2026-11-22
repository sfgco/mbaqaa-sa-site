import type { ApiErrorBody } from '@shared/types'

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: { fields?: Record<string, string[]> } & Record<string, unknown>,
  ) {
    super(message)
  }
}

type Query = Record<string, string | number | boolean | undefined | null>

export function qs(query?: Query): string {
  if (!query) return ''
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(query)) if (v !== undefined && v !== null && v !== '') p.set(k, String(v))
  const s = p.toString()
  return s ? `?${s}` : ''
}

/** Fetch wrapper for /api. Sends cookies, parses JSON, throws ApiError on non-2xx. */
export async function api<T>(path: string, opts: { method?: string; body?: unknown; query?: Query; signal?: AbortSignal } = {}): Promise<T> {
  const res = await fetch(`/api${path}${qs(opts.query)}`, {
    method: opts.method ?? 'GET',
    credentials: 'same-origin',
    headers: opts.body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    signal: opts.signal,
  })
  if (res.status === 204) return undefined as T
  const text = await res.text()
  const json = text ? (JSON.parse(text) as unknown) : undefined
  if (!res.ok) {
    const err = (json as ApiErrorBody | undefined)?.error
    throw new ApiError(res.status, err?.code ?? 'HTTP_ERROR', err?.message ?? res.statusText, err?.details as ApiError['details'])
  }
  return json as T
}

export const apiGet = <T>(path: string, query?: Query, signal?: AbortSignal) => api<T>(path, { query, signal })
export const apiPost = <T>(path: string, body?: unknown) => api<T>(path, { method: 'POST', body: body ?? {} })
export const apiPatch = <T>(path: string, body: unknown) => api<T>(path, { method: 'PATCH', body })
export const apiPut = <T>(path: string, body: unknown) => api<T>(path, { method: 'PUT', body })
export const apiDelete = <T = void>(path: string) => api<T>(path, { method: 'DELETE' })

/** Copy server field errors (400 VALIDATION_ERROR) into a react-hook-form instance. */
export function applyServerErrors(err: unknown, setError: (name: never, e: { message: string }) => void): boolean {
  if (err instanceof ApiError && err.details?.fields) {
    for (const [name, msgs] of Object.entries(err.details.fields)) setError(name as never, { message: msgs[0] })
    return true
  }
  return false
}
