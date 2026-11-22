# API reference

Base path `/api`. JSON in and out.

- **Errors** look like `{ "error": { "code", "message", "details?" } }`. Validation errors are `400 VALIDATION_ERROR`, with `details.fields: { "path.to.field": ["code"] }`. The codes (`required`, `invalid_phone`, `invalid_email`…) are translated on the client under `errors.*`.
- **Inputs** are validated with the Zod schemas in `shared/src/schemas/*`, and the client uses the same schemas. **Outputs** are typed in `shared/src/types.ts`.
- **Lists** return `Paginated<T>` = `{ items, page, limit, total }`. `limit` is at most 50. They accept `?page&limit&q`.
- **Access** levels: `public` | `editor` (any signed-in, active user) | `admin`. A session is an httpOnly `token` cookie (a JWT), or `Authorization: Bearer`.
- **CSRF protection**: on authenticated writes, a browser `Origin` must match the request host or an entry in `CORS_ORIGINS`.
- **Public forms** are rate-limited per instance and have a `website` honeypot field that must stay empty.

## Auth
| Method | Path | Access | Notes |
|---|---|---|---|
| POST | /auth/login | public, 10 per 15 min | `loginSchema` → `{ user }` + cookie. The first login with `ADMIN_EMAIL`/`ADMIN_PASSWORD` creates the first admin while no admin exists |
| POST | /auth/logout | public | 204, clears the cookie |
| GET | /auth/me | editor | `{ user }` |

## Public forms
| Method | Path | Access | Notes |
|---|---|---|---|
| POST | /requests/clothes · /requests/volunteer · /requests/partnership | public, 5 per 10 min | `clothesRequestSchema` / `volunteerRequestSchema` / `partnershipRequestSchema` → 201 `{ ok, id }` |
| GET | /requests/admin/:type | editor | `?status` → `Paginated<RequestItem>` |
| GET | /requests/admin/:type/export.csv | editor | CSV (UTF-8 BOM, formula-injection safe) |
| GET/PATCH/DELETE | /requests/admin/:type/:id | editor | PATCH `{ status?, adminNotes? }` |
| POST | /contact | public, 5 per 10 min | `contactSchema` → 201 `{ ok, id }` |
| GET | /contact/admin | editor | `?status` → `Paginated<ContactRequest>` |
| GET/PATCH/DELETE | /contact/admin/:id | editor | GET moves `new` → `read` |

## Donations (QR and bank transfer only; no payment gateway)
| Method | Path | Access | Notes |
|---|---|---|---|
| GET | /donations/channels | public | `{ items: DonationChannel[] }` (active, ordered) |
| GET/POST | /donations/admin/channels | admin | `donationChannelSchema`. `bank` requires `iban` (SA + 22 digits); `qr` requires `qrImageUrl` |
| POST | /donations/admin/channels/reorder | admin | `{ ids }` |
| PATCH/DELETE | /donations/admin/channels/:id | admin | |
| POST | /donations/notify | public, 5 per hour | `donationNotifySchema`. `amount` is in SAR and stored in halalas. `recurring` = «المانح الدائم» |
| GET | /donations/admin/notifications | admin | `?status` → `DonationNotificationList` (`confirmedTotal` in halalas) |
| GET | /donations/admin/notifications/export.csv | admin | |
| GET/PATCH/DELETE | /donations/admin/notifications/:id | admin | a status change sets `reviewedBy` and `reviewedAt` |

## Content
| Method | Path | Access | Notes |
|---|---|---|---|
| GET | /posts | public | `?category&q&page&limit` → published posts only, `content` omitted |
| GET | /posts/:slug | public | `Post` (author `{_id,name}`) |
| GET/POST | /posts/admin | editor | list `?status&category` / create (`publishedAt` defaults to now when published) |
| GET/PATCH/DELETE | /posts/admin/:id | editor | |
| GET | /faqs | public | `{ items: Faq[] }` published, ordered |
| GET/POST | /faqs/admin | editor | |
| POST | /faqs/admin/reorder | editor | `{ ids }` |
| PATCH/DELETE | /faqs/admin/:id | editor | |
| GET | /settings | public | `Settings` (defaults merged) |
| PATCH | /settings | admin | `settingsUpdateSchema` |

## Users and stats
| Method | Path | Access | Notes |
|---|---|---|---|
| GET/POST | /users | admin | `Paginated<User>` / `userCreateSchema` |
| PATCH/DELETE | /users/:id | admin | you can't demote, deactivate or delete yourself (400 `SELF_ACTION`) |
| GET | /stats | editor | `Stats` |
| GET | /health | public | `{ ok: true }` (no DB) |
