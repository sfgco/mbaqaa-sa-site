import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env";
import { connectDB } from "./db";
import { errorHandler, notFoundHandler } from "./lib/errors";
import { statsRouter, usersRouter } from "./routes/admin";
import { authRouter } from "./routes/auth";
import { faqsRouter, postsRouter, settingsRouter } from "./routes/content";
import { documentsRouter } from "./routes/documents";
import { donationsRouter } from "./routes/donations";
import { contactRouter, requestsRouter } from "./routes/forms";
import { galleryRouter } from "./routes/gallery";

const MAX_JSON_BYTES = 200 * 1024;

/**
 * On Lambda, serverless-http puts the raw body on `req.body` as a Buffer and
 * marks the request as already finished, so Express 5's body-parser skips it.
 * Routes would then get a Buffer instead of an object. Parse it here.
 * Locally (app.listen) express.json() already parsed it and this is a no-op.
 */
const parseLambdaJsonBody: express.RequestHandler = (req, _res, next) => {
  if (!Buffer.isBuffer(req.body)) return next();
  const raw: Buffer = req.body;
  if (!req.is("application/json")) return next();
  if (raw.length > MAX_JSON_BYTES) {
    return next(Object.assign(new Error("request entity too large"), { status: 413, type: "entity.too.large" }));
  }
  const text = raw.toString("utf8").trim();
  try {
    req.body = text ? JSON.parse(text) : {};
    next();
  } catch {
    next(Object.assign(new Error("Malformed JSON body"), { type: "entity.parse.failed" }));
  }
};

export function createApp() {
  const app = express();
  // app.set("trust proxy", true);
  // app.disable("x-powered-by");

  app.use(helmet());
  // app.use(compression());
  app.use(
    cors({
      credentials: true,
      origin: env.corsOrigins.length ? env.corsOrigins : !env.isProd,
    }),
  );
  app.use(express.json({ limit: "200kb" }));
  app.use(parseLambdaJsonBody);
  app.use(cookieParser());

  const api = express.Router();
  api.get("/health", (_req, res) => {
    res.json({ ok: true });
  });
  // Every other route needs the database.
  api.use(async (_req, _res, next) => {
    await connectDB();
    next();
  });
  api.use("/auth", authRouter);
  api.use("/contact", contactRouter);
  api.use("/requests", requestsRouter);
  api.use("/donations", donationsRouter);
  api.use("/faqs", faqsRouter);
  api.use("/posts", postsRouter);
  api.use("/documents", documentsRouter);
  api.use("/gallery", galleryRouter);
  api.use("/settings", settingsRouter);
  api.use("/users", usersRouter);
  api.use("/stats", statsRouter);

  app.use("/api", api);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
