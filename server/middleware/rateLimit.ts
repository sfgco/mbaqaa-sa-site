import { RateLimitModel } from '../models/RateLimit'
import { HttpError } from '../utils/httpError'

/** Fixed-window limiter stored in Mongo (TTL index cleans up). Survives across serverless invocations. */
export async function rateLimit(key: string, ip: string, max: number, windowSec: number): Promise<void> {
  const window = Math.floor(Date.now() / 1000 / windowSec)
  const id = `${key}:${ip}:${window}`
  const doc = await RateLimitModel.findOneAndUpdate(
    { key: id },
    { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date((window + 1) * windowSec * 1000) } },
    { upsert: true, new: true },
  ).lean()
  if (doc && doc.count > max) throw new HttpError(429, 'RATE_LIMITED', 'Too many requests, try again later')
}
