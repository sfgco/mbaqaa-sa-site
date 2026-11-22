import type { Route } from './types'

/** Match `/pages/admin/:id` against `/pages/admin/42` → { id: '42' }. */
export function matchPath(pattern: string, path: string): Record<string, string> | null {
  const p = pattern.split('/').filter(Boolean)
  const a = path.split('/').filter(Boolean)
  if (p.length !== a.length) return null
  const params: Record<string, string> = {}
  for (let i = 0; i < p.length; i++) {
    if (p[i].startsWith(':')) params[p[i].slice(1)] = decodeURIComponent(a[i])
    else if (p[i] !== a[i]) return null
  }
  return params
}

/**
 * Find the route for method+path. Static segments win over params
 * (e.g. `/posts/admin` beats `/posts/:slug`) because routes are scored.
 */
export function findRoute(
  routes: Route[],
  method: string,
  path: string,
): { route: Route; params: Record<string, string> } | { methodNotAllowed: true } | null {
  let best: { route: Route; params: Record<string, string>; score: number } | null = null
  let pathMatched = false
  for (const route of routes) {
    const params = matchPath(route.path, path)
    if (!params) continue
    pathMatched = true
    if (route.method !== method) continue
    const score = route.path.split('/').filter((s) => s && !s.startsWith(':')).length
    if (!best || score > best.score) best = { route, params, score }
  }
  if (best) return { route: best.route, params: best.params }
  return pathMatched ? { methodNotAllowed: true } : null
}
