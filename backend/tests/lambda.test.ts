import serverless from "serverless-http";
import { describe, expect, it } from "vitest";
import { app } from "./setup";

// Regression: on Lambda (serverless-http + Express 5) express.json() skipped the
// body, so routes received a Buffer instead of parsed JSON.
const handler = serverless(app);

function httpApiEvent(method: string, path: string, body?: string, base64 = false) {
  return {
    version: "2.0",
    routeKey: `${method} /api/{proxy+}`,
    rawPath: path,
    rawQueryString: "",
    headers: { "content-type": "application/json", host: "api.example.com" },
    requestContext: {
      http: { method, path, protocol: "HTTP/1.1", sourceIp: "1.2.3.4", userAgent: "vitest" },
      requestId: "test",
      stage: "$default",
    },
    body: body === undefined ? undefined : base64 ? Buffer.from(body).toString("base64") : body,
    isBase64Encoded: base64,
  };
}

async function invoke(event: ReturnType<typeof httpApiEvent>) {
  const res = (await handler(event, {})) as { statusCode: number; body: string; isBase64Encoded?: boolean };
  const text = res.isBase64Encoded ? Buffer.from(res.body, "base64").toString("utf8") : res.body;
  return { status: res.statusCode, json: JSON.parse(text) };
}

describe("lambda handler JSON bodies", () => {
  const login = JSON.stringify({ email: "nobody@test.sa", password: "wrong-password" });

  it("parses a JSON body (plain)", async () => {
    const res = await invoke(httpApiEvent("POST", "/api/auth/login", login));
    // Parsed body reaches the service → credentials check, not a validation error.
    expect(res.status).toBe(401);
    expect(res.json.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("parses a base64-encoded JSON body", async () => {
    const res = await invoke(httpApiEvent("POST", "/api/auth/login", login, true));
    expect(res.status).toBe(401);
    expect(res.json.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("rejects malformed JSON with 400 BAD_JSON", async () => {
    const res = await invoke(httpApiEvent("POST", "/api/auth/login", "{not json"));
    expect(res.status).toBe(400);
    expect(res.json.error.code).toBe("BAD_JSON");
  });
});
