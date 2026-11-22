import type { NextFunction, Request, RequestHandler, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { HttpError } from "./errors";
import { UserModel, type UserDoc } from "../models/User";

export const COOKIE = "token";

declare module "express-serve-static-core" {
  interface Request {
    user?: UserDoc;
  }
}

export function signToken(userId: string) {
  return jwt.sign({ sub: userId }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"] });
}

export function setSessionCookie(res: Response, token: string) {
  const decoded = jwt.decode(token) as { exp: number };
  res.cookie(COOKIE, token, {
    httpOnly: true,
    secure: env.isProd || env.COOKIE_SAMESITE === "none",
    sameSite: env.COOKIE_SAMESITE,
    path: "/",
    expires: new Date(decoded.exp * 1000),
  });
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(COOKIE, { path: "/", sameSite: env.COOKIE_SAMESITE, secure: env.isProd || env.COOKIE_SAMESITE === "none" });
}

/** Blocks cross-site writes on cookie-authenticated routes. */
function checkOrigin(req: Request) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return;
  const origin = req.get("origin");
  if (!origin) return; // non-browser clients (curl, tests) don't send Origin
  const host = req.get("host");
  let originHost = "";
  try {
    originHost = new URL(origin).host;
  } catch {
    /* invalid origin */
  }
  if (originHost === host || env.corsOrigins.includes(origin)) return;
  if (!env.isProd && env.corsOrigins.length === 0) return;
  throw new HttpError(403, "BAD_ORIGIN", "Origin not allowed");
}

export async function loadUser(req: Request) {
  const header = req.get("authorization");
  const token = req.cookies?.[COOKIE] ?? (header?.startsWith("Bearer ") ? header.slice(7) : undefined);
  if (!token) return null;
  try {
    const { sub } = jwt.verify(token, env.JWT_SECRET) as { sub: string };
    const user = await UserModel.findById(sub);
    return user?.active ? user : null;
  } catch {
    return null;
  }
}

function guard(check?: (u: UserDoc) => boolean): RequestHandler {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      checkOrigin(req);
      const user = await loadUser(req);
      if (!user) throw new HttpError(401, "UNAUTHORIZED", "Sign in required");
      if (check && !check(user)) throw new HttpError(403, "FORBIDDEN", "Not allowed");
      req.user = user;
      next();
    } catch (e) {
      next(e);
    }
  };
}

/** Any signed-in, active user. */
export const requireAuth = guard();
export const requireEditor = requireAuth;
export const requireAdmin = guard((u) => u.role === "admin");
