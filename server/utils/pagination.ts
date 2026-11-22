import type { Paginated } from '../../shared/types'

export function paginate(page = 1, limit = 12) {
  const l = Math.min(Math.max(1, limit), 50)
  const p = Math.max(1, page)
  return { page: p, limit: l, skip: (p - 1) * l }
}

export function paged<T>(items: T[], total: number, page: number, limit: number): Paginated<T> {
  return { items, page, limit, total }
}

/** Escape user text for use inside a RegExp. */
export function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
