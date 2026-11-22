// Vercel serverless entry. All /api/* requests are rewritten here (see vercel.json)
// and dispatched by server/http/handler.ts. Keep this file thin.
export { default } from '../server/http/handler'
