import mongoose, { Schema } from 'mongoose'

const rateLimitSchema = new Schema({
  key: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
})
rateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const RateLimitModel =
  (mongoose.models.RateLimit as mongoose.Model<{ key: string; count: number; expiresAt: Date }>) ||
  mongoose.model('RateLimit', rateLimitSchema, 'rateLimits')
