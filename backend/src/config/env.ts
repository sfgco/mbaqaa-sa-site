import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().default(4000),
  MONGODB_URI: z.string().default("mongodb://localhost:27017/mbaqaa"),
  JWT_SECRET: z.string().default(""),
  JWT_EXPIRES_IN: z.string().default("12h"),
  CORS_ORIGINS: z.string().default(""),
  COOKIE_SAMESITE: z.enum(["lax", "strict", "none"]).default("lax"),
});

const parsed = schema.parse(process.env);

if (parsed.NODE_ENV === "production" && parsed.JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be set (≥ 32 chars) in production");
}

export const env = {
  ...parsed,
  JWT_SECRET: parsed.JWT_SECRET || "dev-only-secret-change-me-dev-only-secret",
  corsOrigins: parsed.CORS_ORIGINS.split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  isProd: parsed.NODE_ENV === "production",
};
