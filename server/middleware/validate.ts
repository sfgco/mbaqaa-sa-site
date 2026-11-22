import type { z } from 'zod'
import { HttpError } from '../utils/httpError'

/** Parse input with a shared Zod schema; throws 400 VALIDATION_ERROR with field errors. */
export function validate<S extends z.ZodType>(schema: S, input: unknown): z.output<S> {
  const r = schema.safeParse(input ?? {})
  if (!r.success) {
    const fields: Record<string, string[]> = {}
    for (const issue of r.error.issues) {
      const key = issue.path.join('.') || '_'
      ;(fields[key] ??= []).push(issue.message)
    }
    throw new HttpError(400, 'VALIDATION_ERROR', 'Invalid input', { fields })
  }
  return r.data
}
