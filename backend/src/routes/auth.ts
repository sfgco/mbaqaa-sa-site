import { Router } from "express";
import { loginSchema } from "@mbaqaa/shared";
import { env } from "../config/env";
import { HttpError } from "../lib/errors";
import { clearSessionCookie, requireAuth, setSessionCookie, signToken } from "../lib/auth";
import { limiter } from "../lib/rateLimit";
import { UserModel, hashPassword, publicUser, verifyPassword } from "../models/User";

export const authRouter = Router();

/** Creates the first admin from ADMIN_EMAIL/ADMIN_PASSWORD while no admin exists. */
async function bootstrapAdmin(email: string) {
  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD || email !== env.ADMIN_EMAIL.toLowerCase()) return;
  if (await UserModel.exists({ role: "admin" })) return;
  await UserModel.create({
    name: "Admin",
    email,
    passwordHash: await hashPassword(env.ADMIN_PASSWORD),
    role: "admin",
  });
}

authRouter.post("/login", limiter(15, 10), async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);
  await bootstrapAdmin(email);
  const user = await UserModel.findOne({ email });
  if (!user || !user.active || !(await verifyPassword(password, user.passwordHash))) {
    throw new HttpError(401, "INVALID_CREDENTIALS", "Wrong email or password");
  }
  user.lastLoginAt = new Date();
  await user.save();
  setSessionCookie(res, signToken(String(user._id)));
  res.json({ user: publicUser(user) });
});

authRouter.post("/logout", (_req, res) => {
  clearSessionCookie(res);
  res.status(204).end();
});

authRouter.get("/me", requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user!) });
});
