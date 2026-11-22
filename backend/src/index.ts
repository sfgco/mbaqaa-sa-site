import serverless from "serverless-http";

// Warm the MongoDB connection; requests await it again (and retry) if needed
connectDB().catch(() => undefined);

console.log("✅ Starting server in", env.NODE_ENV);
// Start server
if (env.NODE_ENV === "development") {
  app.listen(env.PORT, () =>
    console.log(`Server 🚀 Started http://localhost:${env.PORT}/api/v1`),
  );
}

export const handler = serverless(app);
