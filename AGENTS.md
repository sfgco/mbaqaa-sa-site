# AGENTS.md

Guide for AI coding agents (and humans) working on this repository.
Read this file fully before making changes.

---

## 1. Project Overview

**Mbaqaa — جمعية مبرة بقاء** (Mbaqaa Charity Association).

A non-profit that reuses discarded clothing: it collects it, cleans and refurbishes it, and passes the surplus to the families most in need, working with partner charities. Its programs are clothing reuse, awareness campaigns and smart (digital) donation. **The charity's full profile (about, vision, mission, goals, target groups, programs) is in [`docs/organization.md`](docs/organization.md). Use it for site copy and seed data; don't invent organizational claims.**

A full-stack website for the charity. **Arabic is the primary language (RTL)**; English is secondary (see §8a). It includes:

**Public site**

- **Landing** – hero, mission, goals, programs, latest news + gallery strip (Media Center), FAQ teaser, donation CTA
- **Contact** – contact form (stored as a _request_ in the dashboard)
- **Pages** – CMS-driven static pages (About, Programs, Privacy, …) rendered by slug
- **Media Center (المركز الإعلامي)** – `/media`: hub page with tabs/cards linking to its sections. Each section also has its own URL:
  - **News & articles (الأخبار والمقالات)** – `/media/news`: the blog (paginated, filter by category/tag, search) + single post `/media/news/:slug`
  - **Photo gallery (معرض الصور)** – `/media/gallery`: albums + images, lightbox viewer
  - **Videos (الفيديوهات)** – `/media/videos`: YouTube/Vimeo embeds in a grid, click to play in a dialog (privacy-enhanced `youtube-nocookie.com`)
  - Landing shows the latest 3 news items + a gallery strip with a "المركز الإعلامي" link
- **FAQ (الأسئلة الشائعة)** – `/faq`: heading **"الأسئلة الشائعة"** with subtitle **"يمكنك العثور على إجابات للأسئلة الأكثر شيوعاً حول الجمعية"**. Questions are grouped by category (tabs), shown as a shadcn `Accordion`, with client-side search, deep links (`/faq#q-slug`), and FAQPage JSON-LD for SEO. A "لم تجد إجابتك؟ تواصل معنا" CTA links to `/contact`
- **Our Strategic Vision (رؤيتنا الاستراتيجية)** – `/about/strategy`: short intro (vision & mission from `docs/organization.md`) + the PDFs in the documents section `strategy` (strategic plan, operational plans…), each with an inline `PdfViewer` / download
- **Our Governance (حوكمتنا)** – `/about/governance`: short intro + the PDFs in the documents section `governance` (bylaws, policies, board decisions, licenses…), grouped by category, each with view/download
- **Donate (تبرع)** – `/donate`: **no online card payments.** Shows the donation channels managed in the dashboard. Each one has a **QR image** (e.g. bank/IBAN QR, Ehsan or other platform QR, STC Pay), a label, a bank name, the account holder name, an IBAN with a copy button, and an optional link. Then an optional **donation notification form (إشعار تبرع)**: name, phone, email, amount, channel used, transfer date, receipt upload (image/PDF), "المانح الدائم" checkbox (monthly pledge), anonymous, message
- **Clothing donation request (تبرع بالملابس)** – `/donate/clothes`: donor (individual/company), city, district, address/location link, item types (men/women/children/shoes/other), approx. quantity (bags), condition, preferred pickup date/time or drop-off, notes
- **Volunteer form (تطوع)** – `/volunteer`: name, phone, email, city, age range, skills/interests, availability
- **Partnership form (شراكات)** – `/partners`: organization, type (company/government/educational/charity), contact person, partnership interest, message
- **Documents (الوثائق والتقارير)** – official charity PDFs grouped by category (licenses, governance & bylaws, policies, financial statements, annual reports, board decisions…), filter by category/year, search, view inline in a PDF viewer, download

### Default navigation (seeded, editable in dashboard)

| الرئيسية `/`                                                                                                                                    |
| ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **عن الجمعية** ▾ → من نحن `/pages/about` · رؤيتنا الاستراتيجية `/about/strategy` · حوكمتنا `/about/governance` · الوثائق والتقارير `/documents` |
| **برامجنا** `/pages/programs`                                                                                                                   |
| **المركز الإعلامي** ▾ `/media` → الأخبار والمقالات `/media/news` · معرض الصور `/media/gallery` · الفيديوهات `/media/videos`                     |
| **شارك معنا** ▾ → تبرع بالملابس `/donate/clothes` · تطوع `/volunteer` · شراكات `/partners`                                                      |
| **الأسئلة الشائعة** `/faq`                                                                                                                      |
| **تواصل معنا** `/contact`                                                                                                                       |
| **[تبرع الآن]** button → `/donate`                                                                                                              |

Old paths `/blog`, `/blog/:slug` and `/gallery` redirect to their `/media/...` equivalents. The footer repeats the key links, plus contact info, social links, and the license number from settings.

**Admin dashboard** (`/admin`, protected)

- Manage content: Pages, Media Center (news posts, gallery albums/images, videos), FAQs (+ categories), Documents (PDFs + categories, incl. Strategy & Governance), Navigation menu, Landing sections, Site settings
- Manage requests: Contact messages, Clothing donation requests (pickup scheduling workflow), Volunteer applications, Partnership requests, Donation channels (QR images + bank details), Donation notifications (verify receipts, status, export CSV)
- Manage users (admin / editor roles)

**Stack**
| Layer | Choice |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| Routing | React Router v6 |
| Styling | Tailwind CSS |
| UI components | shadcn/ui (Radix primitives + `lucide-react` icons, `sonner` toasts) |
| Tables (dashboard) | shadcn Data Table pattern (TanStack Table) |
| Data fetching | TanStack Query |
| Forms / validation | React Hook Form + Zod (schemas shared with backend) |
| Rich text | TipTap editor (stores HTML; sanitized on server) |
| Backend | AWS Lambda (Node.js 22, arm64) + API Gateway **HTTP API**, deployed with Serverless Framework v4 (built-in esbuild). Routing with Hono (`hono/aws-lambda`) |
| Database | MongoDB Atlas via Mongoose |
| Auth | JWT in httpOnly cookie, bcrypt password hashes |
| Media | Cloudinary (signed uploads) – images and PDFs |
| PDF viewer | `react-pdf` (pdf.js) |
| i18n | `react-i18next` – Arabic (default, RTL) + English |
| Payments | None online. QR images + bank details shown on `/donate`; donors optionally submit a notification + receipt, which admins verify |
| Email | Resend (admin notifications for new requests / donation notifications, thank-you emails) |
| Hosting (frontend) | S3 (private bucket) + CloudFront (Origin Access Control) |
| Hosting (API) | The same CloudFront distribution routes `/api/*` to API Gateway, so the site and API share one origin (cookies work, no CORS) |
| CI/CD | GitHub Actions + AWS OIDC role (no long-lived AWS keys) |
| Secrets | AWS SSM Parameter Store (`SecureString`) per stage |

---

## 2. Repository Layout

npm workspaces monorepo: `frontend`, `backend`, `shared`.

```
mbaqaa/
├── AGENTS.md
├── CLAUDE.md
├── package.json                  # workspaces + root scripts (dev, lint, typecheck, test, build)
├── package-lock.json
├── tsconfig.base.json            # shared TS options; each workspace extends it
├── .nvmrc                        # 22
├── .editorconfig · .prettierrc · eslint.config.js
├── docs/
│   ├── organization.md           # charity profile – source of truth for site copy & seed content
│   └── deployment.md             # one-time AWS setup runbook (see §14)
│
├── .github/
│   └── workflows/
│       ├── ci.yml                # PRs: lint, typecheck, test, build (all workspaces)
│       ├── deploy-frontend.yml   # build React → S3 sync → CloudFront invalidation
│       └── deploy-backend.yml    # serverless deploy → Lambda + API Gateway → smoke test
│
├── infra/                        # one-time / rarely changed AWS resources (CloudFormation)
│   ├── github-oidc.yml           # GitHub OIDC provider + deploy role (scoped to this repo)
│   └── frontend-hosting.yml      # S3 bucket, OAC, CloudFront (+ /api/* behaviour), SPA rewrite function, ACM/Route 53 aliases
│
├── shared/                       # @mbaqaa/shared – imported by frontend AND backend
│   ├── package.json
│   └── src/
│       ├── schemas/              # Zod: page, post, album, image, video, faq, document, contact, clothes, volunteer, partnership, donation, user, settings, navigation
│       ├── validators/           # saudiPhone, iban, localized ({ar,en}), slug
│       ├── constants.ts          # roles, statuses, document sections, limits
│       └── types.ts              # types inferred from schemas
│
├── frontend/                     # React SPA (Vite)
│   ├── package.json
│   ├── index.html
│   ├── vite.config.ts            # @ alias, dev proxy /api → http://localhost:3000
│   ├── components.json           # shadcn/ui config
│   ├── tailwind.config.ts · postcss.config.js · tsconfig.json
│   ├── .env.example              # VITE_* only
│   ├── public/                   # favicon, robots.txt, og image, placeholder QR
│   ├── tests/                    # Vitest + Testing Library
│   └── src/
│       ├── main.tsx
│       ├── App.tsx               # route tree
│       ├── routes/
│       │   ├── public/           # Landing, Contact, Page, MediaCenter, News, NewsPost, Gallery, Album, Videos, Faq, Strategy, Governance, Documents, DocumentView, Donate, DonateClothes, Volunteer, Partners, NotFound
│       │   └── admin/            # Login, Dashboard, Pages, Posts, Gallery, Videos, Faqs, FaqCategories, Documents, DocumentCategories, Navigation, Requests (contact | clothes | volunteer | partnership), DonationChannels, DonationNotifications, Settings, Users
│       ├── components/
│       │   ├── ui/               # shadcn/ui generated components
│       │   ├── layout/           # PublicLayout, AdminLayout, Navbar, Footer, AdminSidebar
│       │   └── features/         # NewsCard, GalleryGrid, Lightbox, VideoCard, VideoDialog, FaqAccordion, DocumentCard, DocumentList, PdfViewer, PdfUploader, DonationChannelCard, DonationNotifyForm, RichTextEditor…
│       ├── hooks/                # useAuth, useDebounce, queries/ (usePosts, usePage…)
│       ├── i18n/                 # i18next setup + locales/ar.json, locales/en.json
│       ├── lib/                  # utils.ts (cn), api.ts (fetch wrapper, base `/api`), formatters
│       └── styles/globals.css
│
├── backend/                      # Serverless API (AWS Lambda + API Gateway)
│   ├── package.json
│   ├── serverless.yml            # functions, httpApi routes, env from SSM, IAM, esbuild
│   ├── tsconfig.json
│   ├── .env.example              # local dev only
│   ├── scripts/
│   │   └── seed.ts               # first admin + content from docs/organization.md
│   ├── tests/                    # Vitest + mongodb-memory-server
│   └── src/
│       ├── app.ts                # Hono app: basePath('/api'), middleware, mounts all routers
│       ├── local.ts              # local dev server (@hono/node-server on :3000)
│       ├── handlers/             # Lambda entrypoints – one per domain, each `export const handler = handle(router)`
│       │   ├── auth.ts · pages.ts · posts.ts · gallery.ts · videos.ts · faqs.ts
│       │   ├── documents.ts · requests.ts · contact.ts · donations.ts
│       │   └── uploads.ts · settings.ts · navigation.ts · users.ts · stats.ts · health.ts
│       ├── routes/               # Hono routers per domain (thin: validate → service → JSON)
│       ├── services/             # business logic per domain
│       ├── models/               # Mongoose models
│       ├── middleware/           # auth, requireRole, rateLimit, validate, originVerify, errorHandler
│       ├── lib/                  # db.ts (cached connection), cloudinary.ts, mailer.ts, jwt.ts, logger.ts
│       └── utils/                # slugify, sanitizeHtml, pagination, csv, HttpError
│
└── e2e/                          # Playwright tests against local dev or staging
    └── playwright.config.ts
```

**Rules**

- `backend/src/routes/*` and `handlers/*` stay thin: parse → validate → call a `services/*` function → return JSON. No business logic or DB queries there.
- Each `handlers/<domain>.ts` mounts only its own router, so each Lambda bundle stays small. `app.ts` mounts everything for local dev and tests.
- Validation schemas live in `shared/src/schemas` and are imported as `@mbaqaa/shared`. Never duplicate a schema.
- `frontend` never imports from `backend`, and `backend` never imports from `frontend`. Both may import `shared`.
- `shared` must stay runtime-agnostic: no Node-only or DOM-only APIs.

---

## 3. Commands

Run from the repo root unless noted.

```bash
npm install                                  # installs all workspaces
npm run dev                                  # frontend (Vite :5173) + backend (local Hono :3000) together
npm run dev -w frontend                      # Vite only; proxies /api → :3000
npm run dev -w backend                       # local API only (tsx watch src/local.ts)
npm run build                                # build shared → frontend (dist/) → backend (serverless package)
npm run lint                                 # eslint, all workspaces
npm run typecheck                            # tsc --noEmit, all workspaces
npm test                                     # vitest, all workspaces
npm run test:e2e                             # playwright (e2e/)
npm run seed -w backend                      # seed admin + content (uses backend/.env)
cd frontend && npx shadcn@latest add <name>  # add a shadcn/ui component
cd backend && npx serverless deploy --stage staging   # manual deploy (normally done by GitHub Actions)
cd backend && npx serverless logs -f posts --stage staging -t
```

Before finishing any task, run `npm run lint && npm run typecheck && npm test`.

---

## 4. Environment Variables & Secrets

Keep the `.env.example` files in sync whenever you add a variable. Never commit `.env` files with real values.

**`backend/.env`** (local dev only; in AWS these come from SSM `/mbaqaa/<stage>/<NAME>`):

```
STAGE=local
MONGODB_URI=mongodb+srv://...
MONGODB_DB=mbaqaa
JWT_SECRET=change-me-long-random
JWT_EXPIRES_IN=7d
APP_URL=http://localhost:5173
ORIGIN_VERIFY_SECRET=local-dev            # CloudFront sends it as X-Origin-Verify; checked in AWS stages only

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

CURRENCY=SAR
MAX_PDF_SIZE_MB=20
MAX_RECEIPT_SIZE_MB=5

RESEND_API_KEY=
MAIL_FROM=noreply@mbaqaa.org
ADMIN_NOTIFY_EMAIL=admin@mbaqaa.org

SEED_ADMIN_EMAIL=admin@mbaqaa.sa
SEED_ADMIN_PASSWORD=change-me
```

**`frontend/.env`**: only `VITE_*` values, all public (e.g. `VITE_APP_URL`, `VITE_CLOUDINARY_CLOUD_NAME`). Never put a secret behind `VITE_`. The API base is always the relative `/api`.

**GitHub** (Settings → Environments `staging` and `production`):

| Kind   | Name                         | Used by                                                              |
| ------ | ---------------------------- | -------------------------------------------------------------------- |
| var    | `AWS_REGION`                 | both deploys (e.g. `me-central-1`; same region as the Atlas cluster) |
| var    | `AWS_DEPLOY_ROLE_ARN`        | both deploys (from `infra/github-oidc.yml`)                          |
| var    | `STAGE`                      | backend (`staging` / `prod`)                                         |
| var    | `APP_URL`                    | both (e.g. `https://staging.mbaqaa.org`, `https://mbaqaa.org`)       |
| var    | `FRONTEND_BUCKET`            | frontend deploy                                                      |
| var    | `CLOUDFRONT_DISTRIBUTION_ID` | frontend deploy                                                      |
| var    | `VITE_CLOUDINARY_CLOUD_NAME` | frontend build                                                       |
| secret | `SERVERLESS_ACCESS_KEY`      | backend deploy (Serverless Framework v4 login)                       |

App secrets (Mongo URI, JWT secret, Cloudinary secret, Resend key, origin-verify secret) live **only** in SSM, never in GitHub.

---

## 5. Data Model (MongoDB collections)

All documents have `createdAt` / `updatedAt` (Mongoose `timestamps: true`).

| Collection                    | Key fields                                                                                                                                                                                                                                                                                                                              | Indexes                                                                                          |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `users`                       | `name, email, passwordHash, role: 'admin'\|'editor', active, lastLoginAt`                                                                                                                                                                                                                                                               | `email` unique                                                                                   |
| `pages`                       | `title, slug, content(html), excerpt, coverImage, seo{title,description}, status: 'draft'\|'published', showInNav, navOrder`                                                                                                                                                                                                            | `slug` unique                                                                                    |
| `posts` (= Media Center news) | `title, slug, excerpt, content(html), coverImage, tags[], category, author(ref users), status, publishedAt, seo`                                                                                                                                                                                                                        | `slug` unique, `{status, publishedAt:-1}`, text index on `title, excerpt, content`               |
| `albums`                      | `title, slug, description, coverImage, order, status`                                                                                                                                                                                                                                                                                   | `slug` unique                                                                                    |
| `images`                      | `album(ref), url, publicId, width, height, caption, alt, order`                                                                                                                                                                                                                                                                         | `{album, order}`                                                                                 |
| `videos`                      | `title{ar,en}, description{ar,en}, provider: 'youtube'\|'vimeo', videoId, url, thumbnailUrl, publishedAt, status, featured, order`                                                                                                                                                                                                      | `{status, publishedAt:-1}`                                                                       |
| `faqCategories`               | `name{ar,en}, slug, order, active`                                                                                                                                                                                                                                                                                                      | `slug` unique                                                                                    |
| `faqs`                        | `question{ar,en}, answer{ar,en}(html), slug, category(ref faqCategories), order, status: 'draft'\|'published'`                                                                                                                                                                                                                          | `slug` unique, `{category, order}`                                                               |
| `documentCategories`          | `name{ar,en}, slug, description{ar,en}, section: 'strategy'\|'governance'\|'reports'\|'other', order, active`                                                                                                                                                                                                                           | `slug` unique, `{section, order}`                                                                |
| `documents`                   | `title{ar,en}, slug, description{ar,en}, category(ref documentCategories), year, issuedAt, fileUrl, publicId, fileSize(bytes), pageCount, thumbnailUrl, status: 'draft'\|'published', featured, order, downloads`                                                                                                                       | `slug` unique, `{category, status, year:-1}`, text index on `title.ar, title.en, description.ar` |
| `contactRequests`             | `name, email, phone, subject, message, status: 'new'\|'read'\|'replied'\|'archived', notes, ip, userAgent`                                                                                                                                                                                                                              | `{status, createdAt:-1}`                                                                         |
| `clothingDonations`           | `donorType: 'individual'\|'company', name, companyName, phone, email, city, district, address, locationUrl, itemTypes[], bagsCount, condition, method: 'pickup'\|'dropoff', preferredDate, preferredTimeSlot, notes, status: 'new'\|'scheduled'\|'collected'\|'sorted'\|'cancelled', scheduledAt, assignedTo(ref users), internalNotes` | `{status, createdAt:-1}`, `{city, status}`                                                       |
| `volunteers`                  | `name, phone, email, city, ageRange, gender, skills[], interests[], availability, message, status: 'new'\|'contacted'\|'accepted'\|'rejected'\|'archived', internalNotes`                                                                                                                                                               | `{status, createdAt:-1}`                                                                         |
| `partnershipRequests`         | `organization, orgType: 'company'\|'government'\|'educational'\|'charity'\|'other', contactName, phone, email, interest, message, status: 'new'\|'in_discussion'\|'agreed'\|'declined'\|'archived', internalNotes`                                                                                                                      | `{status, createdAt:-1}`                                                                         |
| `donationChannels`            | `title{ar,en}, type: 'bank'\|'platform'\|'wallet'\|'other', qrImageUrl, qrPublicId, bankName{ar,en}, accountName, iban, accountNumber, link, instructions{ar,en}, order, active`                                                                                                                                                        | `{active, order}`                                                                                |
| `donationNotifications`       | `donorName, phone, email, amount(halalas), currency, channel(ref donationChannels), transferDate, receiptUrl, receiptPublicId, monthlyPledge(bool), anonymous, message, status: 'pending'\|'confirmed'\|'rejected', reviewedBy(ref users), reviewedAt, internalNotes`                                                                   | `{status, createdAt:-1}`                                                                         |
| `settings`                    | singleton: `siteName, logo, contact{email,phone,address}, social{}, landing{hero, sections[]}, donation{intro{ar,en}, thankYouMessage{ar,en}, showNotifyForm}`                                                                                                                                                                          | –                                                                                                |

**Conventions**

- Money is stored as integer **halalas** (1 SAR = 100). Never floats.
- QR images are uploaded by admins only (image types, max 2 MB). Validate IBANs with the shared Zod helper (`SA` + 22 digits, mod-97 checksum). Show them grouped in fours.
- Donation receipts are **private**: upload them to a Cloudinary folder with `type: "authenticated"`. Admins view them only through short-lived signed URLs from the API, and they are never listed publicly.
- Slugs are generated from titles with `backend/src/utils/slugify.ts`, must be unique; append `-2`, `-3` on collision.
- HTML content is sanitized server-side (`sanitize-html` allow-list) on every write.
- Delete Cloudinary assets when the related image or document record is deleted (or its file is replaced).
- User-facing text fields are localized objects `{ ar: string, en?: string }`; `ar` is required. Applies to pages, posts, albums, images (caption/alt), documents, categories, and settings text.
- Document PDFs: upload as Cloudinary `resource_type: "raw"` (or `image` with `pdf` format to get page thumbnails), max **20 MB**, MIME must be `application/pdf` (checked server-side by magic bytes `%PDF`). Store `thumbnailUrl` from page 1.
- Saudi phone numbers are validated and normalized to `+9665XXXXXXXX` (shared Zod helper).
- `backend/scripts/seed.ts` creates the About and Programs pages, landing hero/goals/programs sections, and donation labels from `docs/organization.md` (Arabic text verbatim).
- Seed default document categories (with their `section`):
  - `strategy` → الخطة الاستراتيجية (Strategic Plan), الخطط التشغيلية (Operational Plans)
  - `governance` → اللائحة الأساسية (Bylaws), السياسات واللوائح (Policies), قرارات مجلس الإدارة (Board Decisions), التراخيص والشهادات (Licenses & Certificates)
  - `reports` → القوائم المالية (Financial Statements), التقارير السنوية (Annual Reports)
- `/about/strategy` and `/about/governance` list published documents whose category `section` is `strategy` / `governance`. `/documents` lists all sections. Admins choose the section when creating a category, so a PDF appears on the right page automatically.
- Videos: admins paste a YouTube/Vimeo URL; the server extracts `videoId` and thumbnail. Never embed arbitrary iframe HTML.
- Seed FAQ categories: عن الجمعية، التبرع بالملابس، التبرع المالي، التطوع والشراكات. Seed draft FAQs whose answers come only from `docs/organization.md` (e.g. ما هي جمعية بقاء؟، ما رؤية الجمعية؟، من هي الفئات المستهدفة؟، ما برامج الجمعية؟). Questions with no source answer (opening hours, pickup areas…) are seeded as **drafts** with the answer `{{يُستكمل من الجمعية}}`.

---

## 6. API Contract

Base path: `/api`. JSON in/out. Errors use one shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable",
    "details": {}
  }
}
```

Lists return `{ "items": [...], "page": 1, "limit": 12, "total": 42 }`. Query params: `page`, `limit` (max 50), `q`, `status`, `tag`, `sort`.

| Method                | Route                                                                                                                                                             | Access                                                                                                                                                                                                                           |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| POST                  | `/auth/login` · `/auth/logout`                                                                                                                                    | public                                                                                                                                                                                                                           |
| GET                   | `/auth/me`                                                                                                                                                        | auth                                                                                                                                                                                                                             |
| GET                   | `/pages`, `/pages/:slug`                                                                                                                                          | public (published only)                                                                                                                                                                                                          |
| GET/POST/PATCH/DELETE | `/pages/admin…`                                                                                                                                                   | editor+                                                                                                                                                                                                                          |
| GET                   | `/posts`, `/posts/:slug`                                                                                                                                          | public (published only)                                                                                                                                                                                                          |
| GET/POST/PATCH/DELETE | `/posts/admin…`                                                                                                                                                   | editor+                                                                                                                                                                                                                          |
| GET                   | `/gallery/albums`, `/gallery/albums/:slug`                                                                                                                        | public                                                                                                                                                                                                                           |
| CRUD                  | `/gallery/admin/albums…`, `/gallery/admin/images…` (+ reorder)                                                                                                    | editor+                                                                                                                                                                                                                          |
| GET                   | `/videos`                                                                                                                                                         | public (published only)                                                                                                                                                                                                          |
| CRUD                  | `/videos/admin…` (+ reorder, feature)                                                                                                                             | editor+                                                                                                                                                                                                                          |
| GET                   | `/faqs` (grouped by category)                                                                                                                                     | public (published only)                                                                                                                                                                                                          |
| CRUD                  | `/faqs/admin…`, `/faqs/admin/categories…` (+ reorder)                                                                                                             | editor+                                                                                                                                                                                                                          |
| GET / PUT             | `/navigation`                                                                                                                                                     | public read / admin write                                                                                                                                                                                                        |
| GET                   | `/documents/categories?section=`                                                                                                                                  | public (active only)                                                                                                                                                                                                             |
| GET                   | `/documents?section=&category=&year=&q=`, `/documents/:slug`                                                                                                      | public (published only)                                                                                                                                                                                                          |
| GET                   | `/documents/:slug/download`                                                                                                                                       | public – increments `downloads`, redirects to file URL with `Content-Disposition: attachment`                                                                                                                                    |
| CRUD                  | `/documents/admin…` (+ reorder, toggle featured)                                                                                                                  | editor+                                                                                                                                                                                                                          |
| CRUD                  | `/documents/admin/categories…` (+ reorder)                                                                                                                        | editor+ (delete blocked if category has documents)                                                                                                                                                                               |
| POST                  | `/uploads/sign`                                                                                                                                                   | editor+ (returns Cloudinary signature; `kind: 'image'\|'pdf'` sets folder, type and size limits). Public, rate-limited variant `kind: 'receipt'` (image/PDF, 5 MB, authenticated folder) for the donation notification form only |
| POST                  | `/contact`                                                                                                                                                        | public, rate-limited, honeypot                                                                                                                                                                                                   |
| GET/PATCH/DELETE      | `/contact/admin…`                                                                                                                                                 | editor+                                                                                                                                                                                                                          |
| POST                  | `/requests/clothes`, `/requests/volunteer`, `/requests/partnership`                                                                                               | public, rate-limited, honeypot; sends admin notification + confirmation email (if email given)                                                                                                                                   |
| GET/PATCH/DELETE      | `/requests/admin/:type…` (+ CSV export)                                                                                                                           | editor+                                                                                                                                                                                                                          |
| GET                   | `/donations/channels`                                                                                                                                             | public (active only)                                                                                                                                                                                                             |
| CRUD                  | `/donations/admin/channels…` (+ reorder, toggle active)                                                                                                           | admin                                                                                                                                                                                                                            |
| POST                  | `/donations/notify`                                                                                                                                               | public, rate-limited, honeypot; sends admin email                                                                                                                                                                                |
| GET/PATCH/DELETE      | `/donations/admin/notifications…` (confirm/reject, notes), `/donations/admin/notifications/export.csv`, `/donations/admin/notifications/:id/receipt` (signed URL) | admin                                                                                                                                                                                                                            |
| GET                   | `/settings`                                                                                                                                                       | public (safe subset)                                                                                                                                                                                                             |
| PATCH                 | `/settings`                                                                                                                                                       | admin                                                                                                                                                                                                                            |
| CRUD                  | `/users…`                                                                                                                                                         | admin                                                                                                                                                                                                                            |
| GET                   | `/stats`                                                                                                                                                          | editor+ (counts for dashboard home)                                                                                                                                                                                              |
| GET                   | `/health`                                                                                                                                                         | public – `{ ok, stage, version }`, pings DB; used by the deploy smoke test                                                                                                                                                       |

Public endpoints must never return drafts, password hashes, IPs or internal notes.

---

## 7. Backend Rules (serverless + MongoDB)

Paths in this section are relative to `backend/`.

- **Connection caching is mandatory.** Use `src/lib/db.ts`. It caches the Mongoose connection promise at module scope so warm Lambda invocations reuse it. Use `maxPoolSize: 5` and `serverSelectionTimeoutMS: 5000`. Never call `mongoose.connect` anywhere else.
- Handlers set `context.callbackWaitsForEmptyEventLoop = false` (Hono's `handle()` wrapper plus our db helper), so open sockets don't hold the invocation open.
- Keep bundles small: one function per domain and no heavy top-level imports. Load Cloudinary and mailer SDKs only in the services that use them.
- Lambda limits: 6 MB request/response payload and 29 s API Gateway timeout. Files never go through Lambda; the browser uploads straight to Cloudinary with a signature from `/uploads/sign`. CSV exports are paginated or streamed under the limit.
- In AWS stages, `originVerify` middleware rejects requests without the correct `X-Origin-Verify` header. That header is added by CloudFront, so the raw API Gateway URL can't be used to bypass the site. Skipped when `STAGE=local`.
- Client IP for rate limiting comes from `CloudFront-Viewer-Address`, falling back to `requestContext.http.sourceIp`.
- Logs: structured JSON to CloudWatch through `lib/logger.ts`, with request id, route, status and duration. Log retention is 30 days (set in `serverless.yml`).
- MongoDB Atlas network access: Lambda has no fixed IP. Either allow `0.0.0.0/0` with a strong password and a dedicated least-privilege DB user per stage, or move later to VPC + NAT / Atlas PrivateLink. Document the choice in `docs/deployment.md`.
- Use `.lean()` for read queries returning JSON.
- Always paginate lists; never return an unbounded collection.
- Validate every request body/query with the shared Zod schema via `validate()` middleware.
- Auth: `requireAuth` reads the JWT from the `token` httpOnly, `Secure`, `SameSite=Lax` cookie. `requireRole('admin')` for admin-only routes.
- State-changing admin requests must check `Origin` matches `APP_URL` (CSRF protection).
- Rate-limit public POST endpoints (contact, donations, login). Use a Mongo-backed limiter collection with a TTL index (no in-memory state; it doesn't survive between invocations).
- No payment processing happens on our servers. A donation notification is only a donor's claim. It stays `pending` until an admin checks it against the bank statement and marks it `confirmed`. Totals shown in the dashboard count only `confirmed` notifications.
- Never log secrets, passwords, receipt URLs, or IBANs from donor submissions.
- Throw typed `HttpError(status, code, message)`; the error middleware formats the response.

---

## 8. Frontend Rules

Paths in this section are relative to `frontend/`.

- Functional components + hooks only. TypeScript `strict` on; no `any` unless justified in a comment.
- Server state goes through TanStack Query hooks in `src/hooks/queries/`. No `fetch` calls directly in components.
- Forms: React Hook Form + `zodResolver(sharedSchema)`.
- Admin routes are lazy-loaded (`React.lazy`) and wrapped in `<RequireAuth role="…">`.
- Every list view handles **loading, empty, and error** states.
- Accessibility: semantic HTML, labels on all inputs, alt text on images, keyboard-operable lightbox/modals, visible focus, WCAG AA contrast.
- Responsive, mobile-first. Test at 375px, 768px, 1280px.
- SEO: set `<title>` / meta description per route (react-helmet-async) from content `seo` fields.
- Images: use Cloudinary transformation URLs for size (`w_`, `q_auto`, `f_auto`) and `loading="lazy"`.
- **UI components come from shadcn/ui.** Add them with `npx shadcn@latest add <name>`; never hand-write a primitive that shadcn provides (Button, Input, Textarea, Select, Checkbox, RadioGroup, Switch, Dialog, AlertDialog, Sheet, DropdownMenu, Tabs, Card, Badge, Table, Pagination, Skeleton, Tooltip, Sonner, Form, Calendar, Popover, Command, Sidebar, Breadcrumb).
- Files in `src/components/ui/` are shadcn-owned: small tweaks are fine, but compose them into `components/features/*` rather than heavily rewriting them.
- Forms use shadcn `<Form>` (`FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`) wired to React Hook Form + Zod.
- Confirm destructive actions with `AlertDialog`; show feedback with `toast()` from `sonner`; loading states with `Skeleton`.
- Dashboard shell uses the shadcn `Sidebar` block; list screens use the Data Table pattern (sorting, filtering, pagination, row actions via `DropdownMenu`).
- Merge classes with `cn()` from `@/lib/utils`. Use `class-variance-authority` for variants.
- Theme through shadcn CSS variables (`--background`, `--primary`, …) in `src/styles/globals.css`; use semantic classes (`bg-primary`, `text-muted-foreground`), never hard-coded colors. Support dark mode via the `class` strategy.
- Import path alias `@/` → `src/` (configured in `tsconfig.json`, `vite.config.ts`, and `components.json`).
- **PDF documents:** `PdfViewer` (in `components/features`) wraps `react-pdf` with page navigation, zoom, fullscreen, and Download / Open-in-new-tab buttons. Lazy-load it (pdf.js is heavy) and configure the pdf.js worker via Vite (`pdfjs-dist/build/pdf.worker.min.mjs?url`). On mobile or if rendering fails, fall back to a download link. The Documents page shows `DocumentCard`s (thumbnail, title, category badge, year, file size) in a grid with category Tabs, year Select, and search.

---

## 8a. Language & RTL

- Default locale `ar` with `<html lang="ar" dir="rtl">`; English at `/en/...` switches to `dir="ltr"`. Language switcher in navbar and admin header.
- All UI strings go in `src/i18n/locales/{ar,en}.json`; no hard-coded text in components.
- Use **logical** Tailwind classes only (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `text-start`); never `ml-`/`mr-`/`left-`/`right-`. Flip directional icons (arrows, chevrons) with `rtl:rotate-180`.
- Arabic font: IBM Plex Sans Arabic (or Tajawal) with a Latin fallback; set in the Tailwind theme.
- Dates via `Intl.DateTimeFormat` for the active locale; money via `Intl.NumberFormat` (currency **SAR** by default).
- Admin forms show `ar` and `en` fields side by side (Tabs) for localized content; `ar` is required.

---

## 9. Dashboard Features (acceptance checklist)

- [ ] Login / logout, session persists across reloads, redirect to `/admin/login` when unauthenticated
- [ ] Home: counts (new contact requests, pending donation notifications, confirmed donations this month & total, published posts), recent activity
- [ ] Pages: list, create, edit (rich text, SEO fields, nav toggle/order), publish/unpublish, delete with confirm
- [ ] Posts: same as pages + tags, category, cover image, scheduled `publishedAt`
- [ ] Gallery: albums CRUD, drag-and-drop multi-image upload, captions/alt, reorder, set cover
- [ ] Documents: list with filters (category, year, status), upload PDF (drag-and-drop, progress, 20 MB limit, PDF-only), preview in `PdfViewer`, edit title/description (ar/en)/category/year/issue date, replace file, publish/unpublish, feature, reorder, delete with confirm, see download count
- [ ] Document categories: CRUD, choose section (strategy / governance / reports / other), reorder, activate/deactivate
- [ ] Videos: add by URL (auto thumbnail + preview), title/description ar/en, publish, feature, reorder, delete
- [ ] FAQs: CRUD with ar/en question + rich-text answer, category, drag-and-drop reorder, publish/unpublish; FAQ categories CRUD + reorder
- [ ] Navigation: edit the main menu (labels ar/en, links, dropdown children, order) with the default below
- [ ] Clothing donations: table + filters (status, city, date, method), status workflow new → scheduled → collected → sorted (or cancelled), set pickup date/time, assign to a user, call/WhatsApp link from the phone number, map link, CSV export
- [ ] Volunteers & partnerships: table + filters, detail view, status change, internal notes, CSV export
- [ ] Dashboard home also shows counts of new clothing requests, volunteers, partnership requests, and today's scheduled pickups
- [ ] Contact requests: table with filters (status, date, search), detail view, change status, internal notes, delete
- [ ] Donation channels: CRUD (upload/replace QR image, bank name, account name, IBAN, link, instructions ar/en), reorder, activate/deactivate, live preview of the public card
- [ ] Donation notifications: table + filters (status, channel, date, monthly pledge), receipt preview (image/PDF), confirm/reject, notes, confirmed totals, CSV export (admin only)
- [ ] Settings: site info, social links, landing hero/sections, donation page intro/thank-you text, toggle notification form
- [ ] Users (admin only): invite/create, change role, deactivate
- [ ] All destructive actions require confirmation; all mutations show toast success/error

---

## 10. Testing

- **Unit/API:** Vitest + `mongodb-memory-server`. Each service gets tests for happy path, validation failure, and authorization failure.
- **Donations:** IBAN validation, receipt upload limits (type/size), receipts never returned by public endpoints, only `confirmed` counted in totals.
- **E2E:** Playwright covering: submit contact form → appears in dashboard; create & publish post → visible on `/media/news`; publish FAQ → visible in accordion on `/faq`; PDF in a governance category → shows on `/about/governance`; upload & publish PDF → viewable and downloadable on `/documents`; `/donate` shows active channels' QR images + copy IBAN works; submit donation notification → appears pending in dashboard → confirm; Arabic pages render RTL.
- Uploads: test that non-PDF files and files over 20 MB are rejected.
- New features need tests. Bug fixes need a regression test.

---

## 11. Code Style & Git

- Prettier + ESLint (typescript-eslint, react-hooks, jsx-a11y). Don't disable rules inline without a reason comment.
- Naming: components `PascalCase.tsx`, hooks `useThing.ts`, others `camelCase.ts`.
- Commits: Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`).
- Keep PRs focused; update this file when you change architecture, commands, env vars, or conventions.

---

## 12. Do / Don't

**Do**

- Reuse `components/ui` (shadcn) before creating anything new; check the shadcn registry first.
- Add new env vars to the right `.env.example`, to section 4, and (for backend) to `serverless.yml` + SSM in `docs/deployment.md`.
- Add indexes for any new query pattern on large collections.

**Don't**

- Don't put secrets in frontend code or commit them.
- Don't add online payment gateways or card forms unless explicitly asked.
- Don't count unconfirmed donation notifications as income.
- Don't add new dependencies without a clear need; prefer what's in the stack table.
- Don't create a new Mongo connection per request.

---

## 13. Suggested Build Order

0. Monorepo skeleton (workspaces, `shared`, tsconfig base, lint/prettier), `ci.yml`
1. `frontend/`: Vite + TS + Tailwind + Router; i18n (ar/en, RTL); `npx shadcn@latest init`; add base components; layouts (public navbar/footer, admin Sidebar); schemas in `shared`
2. `backend/`: Hono app + `local.ts`, `serverless.yml`, `lib/db.ts`, models, error/validate/auth middleware, seed script
3. Auth API + admin login + `RequireAuth`
4. Pages & Posts (API → admin CRUD → public views)
5. Gallery + Cloudinary signed uploads
   5b. Documents: categories with sections, PDF upload, `PdfViewer`, public Documents, Strategy and Governance pages
   5c. Media Center hub (news = posts, gallery, videos) + FAQ page
6. Contact, clothing donation, volunteer and partnership forms + requests management + email notification
7. Settings + dynamic Landing
8. Donations (channels with QR images, public `/donate` page, notification form + private receipt upload, admin verification, CSV export)
9. Dashboard stats, Users management
10. SEO, a11y pass, tests
11. AWS: `infra/` stacks, SSM parameters, GitHub environments, then the deploy workflows (staging first, then production)

---

## 14. Deployment (AWS + GitHub Actions)

### Architecture

```
Browser ──► CloudFront (mbaqaa.org, ACM cert in us-east-1)
              ├── default (*)  ──► S3 bucket (private, OAC)   ← React build
              │                    CloudFront Function: rewrite non-file paths → /index.html (SPA)
              └── /api/*       ──► API Gateway HTTP API ──► Lambda (one per domain) ──► MongoDB Atlas
                                   cache: CachingDisabled · origin request: all viewer headers/cookies/query except Host
                                   + custom header X-Origin-Verify
```

- Don't use CloudFront "custom error responses" (403/404 → index.html) for the SPA. They apply to `/api/*` too and would hide API errors. Use the CloudFront Function on the default behaviour only.
- Stages: `staging` (branch `develop` → staging.mbaqaa.org) and `prod` (branch `main` → mbaqaa.org). Each stage has its own bucket, distribution, Lambda stack, SSM parameters and Atlas database.

### Workflows (`.github/workflows/`)

| File                  | Trigger                                                                     | Does                                                                                                                     |
| --------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `ci.yml`              | pull requests, pushes to non-deploy branches                                | `npm ci` → lint → typecheck → test → build (all workspaces)                                                              |
| `deploy-frontend.yml` | push to `develop` / `main` touching `frontend/**` or `shared/**`, or manual | test + build → OIDC → `s3 sync` `assets/` (immutable, 1 year), then the rest (`no-cache`) → CloudFront invalidation `/*` |
| `deploy-backend.yml`  | push to `develop` / `main` touching `backend/**` or `shared/**`, or manual  | test → OIDC → `serverless deploy --stage $STAGE` → `GET $APP_URL/api/health` smoke test                                  |

- Deploy jobs use GitHub Environments (`staging`, `production`). `production` requires reviewer approval.
- `concurrency` per workflow and branch, with `cancel-in-progress: false`, so two deploys never overlap.
- Old hashed `assets/*` are **not** deleted on deploy, so open tabs can still lazy-load chunks. An S3 lifecycle rule expires objects in `assets/` after 30 days.
- Rollback: re-run the previous successful workflow run, or `serverless rollback --timestamp <t> --stage <stage>` for the API.

### Deploy IAM role (least privilege, from `infra/github-oidc.yml`)

- Trust: `token.actions.githubusercontent.com`, `sub` limited to `repo:<org>/mbaqaa:environment:staging|production`.
- Frontend: `s3:ListBucket`, `s3:PutObject`, `s3:DeleteObject` on the stage bucket, plus `cloudfront:CreateInvalidation` on the distribution.
- Backend: CloudFormation and the Serverless deployment bucket, Lambda, API Gateway, IAM `PassRole` for the function role, CloudWatch Logs, plus `ssm:GetParameter(s)` on `/mbaqaa/<stage>/*` and `kms:Decrypt`.

### Rules

- Never hard-code AWS account IDs, ARNs, bucket names or domains in code. They come from GitHub environment vars or `serverless.yml` params.
- Never add AWS access keys to GitHub secrets; only the OIDC role is used.
- Infra changes go in `infra/*.yml` and `docs/deployment.md`, not the console.
