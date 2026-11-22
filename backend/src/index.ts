import serverless from "serverless-http";
import { createApp } from "./app";
import { env } from "./config/env";
import { connectDB } from "./db";

const app = createApp();

// Warm the connection; requests await it again (and retry) if it failed.
connectDB().catch(() => undefined);

if (env.NODE_ENV === "development") {
  app.listen(env.PORT, () => console.log(`API ready at http://localhost:${env.PORT}/api`));
}

export const handler = serverless(app);
