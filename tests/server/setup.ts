import mongoose from 'mongoose'
import { afterAll, beforeEach } from 'vitest'
import { connectDB, disconnectDB } from '../../server/db'

beforeEach(async () => {
  await connectDB()
  const collections = await mongoose.connection.db!.collections()
  await Promise.all(collections.map((c) => c.deleteMany({})))
})

afterAll(async () => {
  await disconnectDB()
})
