/** Convert lean docs (ObjectIds, Dates) into plain JSON-safe objects. */
export function toJSON<T = unknown>(doc: unknown): T {
  return JSON.parse(JSON.stringify(doc)) as T
}

/** Remove keys from an object (shallow). */
export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const copy = { ...obj }
  for (const k of keys) delete copy[k]
  return copy
}
