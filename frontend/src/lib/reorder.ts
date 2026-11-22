/** Moves item at `i` by `dir` and returns the new id order. */
export function moved<T extends { _id: string }>(items: T[], i: number, dir: -1 | 1) {
  const ids = items.map((x) => x._id)
  const j = i + dir
  if (j < 0 || j >= ids.length) return null
  ;[ids[i], ids[j]] = [ids[j], ids[i]]
  return ids
}
