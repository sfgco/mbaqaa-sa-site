import mongoose from "mongoose";
import { env } from "./config/env";

let pending: Promise<typeof mongoose> | null = null;

/** Reuses one connection across warm Lambda invocations; retries after a failure. */
export function connectDB(uri = env.MONGODB_URI) {
  if (mongoose.connection.readyState === 1) return Promise.resolve(mongoose);
  if (!pending) {
    pending = mongoose.connect(uri, { serverSelectionTimeoutMS: 8000, maxPoolSize: 5 }).catch((err) => {
      pending = null;
      throw err;
    });
  }
  return pending;
}

export async function disconnectDB() {
  pending = null;
  await mongoose.disconnect();
}
