# mbaqaa.sa — جمعية مبرة بقاء

The website for Mbaqaa Charity, which reuses clothing. It's Arabic-first (RTL), with English.

| Workspace | What it is |
|---|---|
| `shared/` | Zod schemas and TypeScript types used by both the backend and the frontend |
| `backend/` | Express 5 + Mongoose API, deployed to AWS Lambda with the Serverless Framework v4 |
| `frontend/` | React 19 + Vite + Tailwind v4 + shadcn/ui + react-router + TanStack Query + i18next |

Organisation content comes from `organization.md` and is mirrored in `frontend/src/data/siteContent.ts`. The financial sustainability plan in `organization.md` is internal and is **not** published.

## Pages
- **Public:** `/` · `/about` · `/programs` · `/governance` (sections, year filter, search) · `/governance/:slug` (inline PDF viewer + download) · `/media` (media center: news + photo albums) · `/media/albums` · `/media/albums/:slug` (lightbox) · `/news` · `/news/:slug` · `/faq` · `/contact` · `/donate` (QR, bank transfer and the transfer notice form, with the «المانح الدائم» option) · `/donate/clothes` (pickup request) · `/volunteer` · `/partners`
- **Dashboard (`/admin`):** overview stats · clothes, volunteer and partnership requests (status, notes, CSV export) · contact messages · donation notices (confirm or reject, totals, CSV) · donation channels · governance documents and sections (PDF upload with automatic thumbnail and page count) · photo albums (multi-photo upload, captions, cover, order) · news posts · FAQs · site settings · users (admin or editor roles)

## File uploads
The dashboard uploads files directly to the shared upload service set in `VITE_API_UPLOAD` (`POST …?path=mbaqaa/governance|mbaqaa/gallery`, multipart `file`, response `{ files: [{ url }] }`). For governance PDFs, the browser renders page 1 with `pdfjs-dist`, uploads it as the thumbnail, and records the page count and size. Without `VITE_API_UPLOAD`, editors can paste file URLs instead.
- The site's download button fetches the PDF and saves it with its title as the filename. For that, the file host must allow CORS (`Access-Control-Allow-Origin`). Otherwise the file opens in a new tab instead.
- Deleting a document or photo removes only its record. The service has no delete API, so the file stays on the upload service.

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
Deploys run through GitHub Actions using the `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` repository secrets: `develop` deploys to staging and `main` to production.
- `deploy-frontend.yml`: Vite build → S3 + CloudFront. Secrets: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`. Vars: `AWS_REGION`, `FRONTEND_BUCKET`, `CLOUDFRONT_DISTRIBUTION_ID`, `APP_URL`, `VITE_API_URL`, `VITE_API_UPLOAD`. Route `/api/*` on the same CloudFront distribution to the API so cookies stay first-party. Otherwise, set `VITE_API_URL`, `CORS_ORIGINS` and `COOKIE_SAMESITE=none`.
- `deploy-backend.yml`: `serverless deploy`. Secrets: `SERVERLESS_ACCESS_KEY`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `MONGODB_URI`, `JWT_SECRET`, `ADMIN_PASSWORD`. Vars: `AWS_REGION`, `ADMIN_EMAIL`, `CORS_ORIGINS`, `COOKIE_SAMESITE`, `API_URL`.

API reference: [docs/api.md](docs/api.md).
