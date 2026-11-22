# mbaqaa.sa — جمعية مبرة بقاء

The website for Mbaqaa Charity, which reuses clothing. It's Arabic-first (RTL), with English.

| Workspace | What it is |
|---|---|
| `shared/` | Zod schemas and TypeScript types used by both the backend and the frontend |
| `backend/` | Express 5 + Mongoose API, deployed to AWS Lambda with the Serverless Framework v4 |
| `frontend/` | React 19 + Vite + Tailwind v4 + shadcn/ui + react-router + TanStack Query + i18next |

Organisation content comes from `organization.md` and is mirrored in `frontend/src/data/siteContent.ts`. The financial sustainability plan in `organization.md` is internal and is **not** published.

## Pages
- **Public:** `/` · `/about` · `/programs` · `/news` · `/news/:slug` · `/faq` · `/contact` · `/donate` (QR, bank transfer and the transfer notice form, with the «المانح الدائم» option) · `/donate/clothes` (pickup request) · `/volunteer` · `/partners`
- **Dashboard (`/admin`):** overview stats · clothes, volunteer and partnership requests (status, notes, CSV export) · contact messages · donation notices (confirm or reject, totals, CSV) · donation channels · news posts · FAQs · site settings · users (admin or editor roles)

## Develop
```bash
npm install
cp backend/.env.example backend/.env   # set MONGODB_URI (local DB), ADMIN_EMAIL, ADMIN_PASSWORD
npm run seed                           # local DB only: settings, placeholder channels, FAQs, a welcome post
npm run dev -w backend                 # http://localhost:4000/api
npm run dev -w frontend                # http://localhost:5173 (proxies /api → :4000)
```
To sign in to `/admin`, use `ADMIN_EMAIL`/`ADMIN_PASSWORD`. The first login creates the admin. You can also create one with `npm run admin:create -w backend -- --email … --password … --name …`.

## Check
```bash
npm run lint && npm run typecheck && npm test && npm run build -w frontend
```
Backend tests run against an in-memory MongoDB (`mongodb-memory-server`).

## Deploy
Deploys run through GitHub Actions with AWS OIDC: `develop` deploys to staging and `main` to production.
- `deploy-frontend.yml`: Vite build → S3 + CloudFront. Route `/api/*` on the same CloudFront distribution to the API so cookies stay first-party. Otherwise, set `VITE_API_URL`, `CORS_ORIGINS` and `COOKIE_SAMESITE=none`.
- `deploy-backend.yml`: `serverless deploy`. Secrets: `SERVERLESS_ACCESS_KEY`, `MONGODB_URI`, `JWT_SECRET`, `ADMIN_PASSWORD`. Vars: `AWS_DEPLOY_ROLE_ARN`, `AWS_REGION`, `ADMIN_EMAIL`, `CORS_ORIGINS`, `COOKIE_SAMESITE`, `API_URL`.

API reference: [docs/api.md](docs/api.md).
