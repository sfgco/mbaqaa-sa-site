import type { Model } from 'mongoose'

/** Arabic-friendly slug: keeps Arabic/Latin letters and digits, joins with "-". */
export function slugify(input: string): string {
  return input
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[ً-ٰٟـ]/g, '') // Arabic diacritics + tatweel
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100)
}

/** Unique slug within a collection: `base`, `base-2`, `base-3`… (ignoring `excludeId`). */
export async function uniqueSlug(model: Model<any>, source: string, excludeId?: unknown): Promise<string> { // eslint-disable-line @typescript-eslint/no-explicit-any -- generic over all models
  const base = slugify(source) || 'item'
  let candidate = base
  for (let i = 2; ; i++) {
    const filter: Record<string, unknown> = { slug: candidate }
    if (excludeId) filter._id = { $ne: excludeId }
    if (!(await model.exists(filter))) return candidate
    candidate = `${base}-${i}`
  }
}
