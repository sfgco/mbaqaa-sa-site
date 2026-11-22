import path from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv, type Plugin } from 'vite'

/**
 * Dev-only: serve /api/* in-process through the same handler Vercel uses,
 * so `npm run dev` needs no Vercel CLI/account.
 */
function devApi(): Plugin {
  return {
    name: 'mbaqaa-dev-api',
    apply: 'serve',
    configureServer(server) {
      const env = loadEnv(server.config.mode, process.cwd(), '')
      for (const [k, v] of Object.entries(env)) if (process.env[k] === undefined) process.env[k] = v
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        if (!req.url?.startsWith('/api/') && req.url !== '/api') return next()
        try {
          const mod = await server.ssrLoadModule('/server/http/handler.ts')
          await mod.default(req, res)
        } catch (err) {
          server.ssrFixStacktrace(err as Error)
          console.error(err)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: { code: 'INTERNAL', message: 'Dev API crashed' } }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), devApi()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
  ssr: { external: ['mongoose', 'bcryptjs', 'jsonwebtoken', 'sanitize-html'] },
  build: { chunkSizeWarningLimit: 900 },
})
