import mongoose from 'mongoose'
import { env } from './env'

/**
 * Cached Mongoose connection for serverless: warm invocations reuse it.
 * This is the ONLY place that calls mongoose.connect.
 */
type Cache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
const g = globalThis as unknown as { __mongoose?: Cache }
const cache: Cache = (g.__mongoose ??= { conn: null, promise: null })

export async function connectDB(): Promise<typeof mongoose> {
  if (cache.conn && mongoose.connection.readyState === 1) return cache.conn
  if (!cache.promise) {
    const uri = env.MONGODB_URI
    if (!uri) throw new Error('MONGODB_URI is not set')
    mongoose.set('strictQuery', true)
    cache.promise = mongoose
      .connect(uri, { dbName: env.MONGODB_DB, bufferCommands: false, maxPoolSize: 5, serverSelectionTimeoutMS: 8000 })
      .catch((err) => {
        cache.promise = null
        throw err
      })
  }
  cache.conn = await cache.promise
  return cache.conn
}

/** Tests only. */
export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect()
  cache.conn = null
  cache.promise = null
}
