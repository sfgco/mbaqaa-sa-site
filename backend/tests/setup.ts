import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import { afterAll, beforeAll, beforeEach } from "vitest";
import { createApp } from "../src/app";
import { connectDB, disconnectDB } from "../src/db";
import { UserModel, hashPassword } from "../src/models/User";

export const app = createApp();
let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await connectDB(mongo.getUri());
});

beforeEach(async () => {
  await Promise.all(Object.values(mongoose.connection.collections).map((c) => c.deleteMany({})));
});

afterAll(async () => {
  await disconnectDB();
  await mongo?.stop();
});

/** Creates a user and returns a supertest agent holding their session cookie. */
export async function loginAs(role: "admin" | "editor" = "admin") {
  const email = `${role}@test.sa`;
  await UserModel.create({ name: role, email, role, passwordHash: await hashPassword("correct-horse-battery") });
  const agent = request.agent(app);
  await agent.post("/api/auth/login").send({ email, password: "correct-horse-battery" }).expect(200);
  return agent;
}
