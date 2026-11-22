import rateLimit from "express-rate-limit";
import { env } from "../config/env";

/** In-memory per instance — a soft limit on Lambda, enough to slow down casual abuse. */
export const limiter = (windowMinutes: number, max: number) =>
  rateLimit({
    windowMs: windowMinutes * 60_000,
    limit: max,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    skip: () => env.NODE_ENV === "test",
    handler: (_req, res) => {
      res.status(429).json({ error: { code: "RATE_LIMITED", message: "Too many requests, try again later" } });
    },
  });
