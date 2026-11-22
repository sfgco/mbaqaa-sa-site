import bcrypt from "bcryptjs";
import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose";
import { userRoles } from "@mbaqaa/shared";
import { toJSON } from "./common";

const schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: true },
    role: { type: String, enum: userRoles, default: "editor" },
    active: { type: Boolean, default: true },
    lastLoginAt: Date,
  },
  { timestamps: true, toJSON },
);

export type User = InferSchemaType<typeof schema>;
export type UserDoc = HydratedDocument<User>;
export const UserModel = model("User", schema);

export const hashPassword = (pw: string) => bcrypt.hash(pw, 12);
export const verifyPassword = (pw: string, hash: string) => bcrypt.compare(pw, hash);

export function publicUser(u: UserDoc | User & { _id: unknown }) {
  const { _id, name, email, role, active, lastLoginAt, createdAt } = u as any;
  return { _id: String(_id), name, email, role, active, lastLoginAt, createdAt };
}
