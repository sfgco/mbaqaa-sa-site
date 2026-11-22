# API reference (contract)

Base `/api`. JSON in/out. Errors: `{ "error": { "code", "message", "details?" } }`; validation errors are `400 VALIDATION_ERROR` with `details.fields: { "path.to.field": ["message"] }`.
Inputs = Zod schemas in `shared/schemas/*`. Outputs = DTOs in `shared/types.ts`. Lists return `Paginated<T>` = `{ items, page, limit, total }` (limit ≤ 50).

All requests go through one function (`api/index.ts` → `server/http/handler.ts`), which lazily loads `server/routes/<domain>.ts` by the first path segment. Access: `public` | `auth` | `editor` (= any signed-in user) | `admin`. Non-public routes also require `Origin` to match `APP_URL` or the request host (CSRF).

## Auth
| Method | Path | Access | Body / Query | Response |
|---|---|---|---|---|
| POST | /auth/login | public, rate-limited | `loginSchema` | `{ user }` + `token` cookie |
| POST | /auth/logout | public | – | 204, clears cookie |
| GET | /auth/me | auth | – | `{ user }` |

## Content (public reads return published only)
| Method | Path | Access | Notes |
|---|---|---|---|
| GET | /pages | public | `?page&limit&q` → `Paginated<Page>` |
| GET | /pages/:slug | public | `Page` |
| GET/POST | /pages/admin | editor | list `?page&limit&q&status` / create `pageSchema` |
| GET/PATCH/DELETE | /pages/admin/:id | editor | `pageUpdateSchema` |
| GET | /posts | public | `postListQuery` (`q, tag, category`) → `Paginated<Post>` (content omitted) |
| GET | /posts/meta | public | `{ categories: string[], tags: string[] }` from published posts |
| GET | /posts/:slug | public | `Post` (author `{_id,name}`) |
| GET/POST | /posts/admin | editor | list / create (author = current user; `publishedAt` defaults to now when published) |
| GET/PATCH/DELETE | /posts/admin/:id | editor | |
| GET | /gallery/albums | public | `Paginated<Album>` with `imageCount` |
| GET | /gallery/albums/:slug | public | `AlbumWithImages` |
| GET | /gallery/latest | public | `?limit=8` → `{ items: GalleryImage[] }` from published albums |
| GET/POST | /gallery/admin/albums | editor | list (all statuses) / create |
| POST | /gallery/admin/albums/reorder | editor | `{ ids }` |
| GET/PATCH/DELETE | /gallery/admin/albums/:id | editor | GET → `AlbumWithImages`; DELETE removes images + Cloudinary assets |
| POST | /gallery/admin/images | editor | `imagesBulkSchema` → `{ items: GalleryImage[] }` |
| POST | /gallery/admin/images/reorder | editor | `{ ids }` |
| PATCH/DELETE | /gallery/admin/images/:id | editor | `imageUpdateSchema`; DELETE removes Cloudinary asset |
| GET | /videos | public | `?page&limit&featured=true` → `Paginated<Video>` |
| GET/POST | /videos/admin | editor | create `videoSchema` (server extracts provider/videoId/thumbnail) |
| POST | /videos/admin/reorder | editor | `{ ids }` |
| PATCH/DELETE | /videos/admin/:id | editor | |
| GET | /faqs | public | `{ items: FaqGroup[] }` active categories with ≥1 published FAQ, ordered |
| GET/POST | /faqs/admin | editor | list `?category&status&q&page&limit` / create |
| POST | /faqs/admin/reorder | editor | `{ ids }` |
| PATCH/DELETE | /faqs/admin/:id | editor | |
| GET/POST | /faqs/admin/categories | editor | `{ items: FaqCategory[] }` / create |
| POST | /faqs/admin/categories/reorder | editor | `{ ids }` |
| PATCH/DELETE | /faqs/admin/categories/:id | editor | DELETE → 409 `CATEGORY_NOT_EMPTY` if it has FAQs |
| GET | /navigation | public | `Navigation` (default menu if none saved) |
| PUT | /navigation | admin | `navigationSchema` |

## Documents
| Method | Path | Access | Notes |
|---|---|---|---|
| GET | /documents/categories | public | `?section` → `{ items: DocumentCategory[] }` active, with published `documentCount` |
| GET | /documents | public | `documentListQuery` (`category` = slug) → `DocumentList` (`years` = distinct years for section/category) |
| GET | /documents/:slug | public | `DocumentItem` |
| GET | /documents/:slug/download | public | increments `downloads`, 302 to the file with `fl_attachment` |
| GET/POST | /documents/admin | editor | list (`category` = id, all statuses) / create `documentSchema` |
| POST | /documents/admin/reorder | editor | `{ ids }` |
| GET/PATCH/DELETE | /documents/admin/:id | editor | replacing `publicId` deletes the old asset |
| GET/POST | /documents/admin/categories | editor | `?section` → `{ items }` with `documentCount` (all statuses) |
| POST | /documents/admin/categories/reorder | editor | `{ ids }` |
| PATCH/DELETE | /documents/admin/categories/:id | editor | DELETE → 409 `CATEGORY_NOT_EMPTY` |

When Cloudinary is configured, the server verifies a PDF on create/replace through the Admin API (format `pdf`, bytes ≤ 20 MB, page count) and by reading the first bytes (`%PDF`). `thumbnailUrl` = page 1 rendered as JPG (`pg_1`).

## Uploads
`POST /uploads/sign` `{ kind }` → `UploadSignature`. The client posts `file, api_key, timestamp, signature, folder, type, allowed_formats` to `uploadUrl` (`https://api.cloudinary.com/v1_1/<cloud>/image/upload`). The signature covers `allowed_formats, folder, timestamp, type`.

| kind | access | folder | type | formats | max |
|---|---|---|---|---|---|
| image | editor | mbaqaa/images | upload | jpg,jpeg,png,webp | 10 MB |
| pdf | editor | mbaqaa/documents | upload | pdf | 20 MB |
| receipt | public, rate-limited (10/h per IP) | mbaqaa/receipts | authenticated | jpg,jpeg,png,webp,pdf | 5 MB |

The response is 503 `UPLOADS_NOT_CONFIGURED` when Cloudinary env vars are missing.

## Requests / forms
| Method | Path | Access | Notes |
|---|---|---|---|
| POST | /contact | public, rate-limited (5/10 min), honeypot | `contactSchema` → 201 `{ ok, id }` |
| GET | /contact/admin | editor | `?page&limit&q&status&from&to` → `Paginated<ContactRequest>` |
| GET/PATCH/DELETE | /contact/admin/:id | editor | GET marks `new` → `read` |
| POST | /requests/clothes · /requests/volunteer · /requests/partnership | public, rate-limited, honeypot | 201 `{ ok, id }`; admin email + confirmation email if given |
| GET | /requests/admin/:type | editor | `requestListQuery` |
| GET | /requests/admin/:type/export.csv | editor | CSV (UTF-8 BOM) |
| GET/PATCH/DELETE | /requests/admin/:type/:id | editor | type-specific admin update schema |

## Donations
| Method | Path | Access | Notes |
|---|---|---|---|
| GET | /donations/channels | public | `{ items: DonationChannel[] }` active, ordered (no `qrPublicId`) |
| GET/POST | /donations/admin/channels | admin | |
| POST | /donations/admin/channels/reorder | admin | `{ ids }` |
| PATCH/DELETE | /donations/admin/channels/:id | admin | |
| POST | /donations/notify | public, rate-limited (5/h), honeypot | `donationNotifySchema`; amount → halalas; status `pending` |
| GET | /donations/admin/notifications | admin | `notificationListQuery` → `DonationNotificationList` (totals count `confirmed` only) |
| GET | /donations/admin/notifications/export.csv | admin | |
| GET/PATCH/DELETE | /donations/admin/notifications/:id | admin | status change sets `reviewedBy/reviewedAt` |
| GET | /donations/admin/notifications/:id/receipt | admin | `{ url, format, expiresAt }`, a short-lived signed Cloudinary download URL |

## Settings, users, stats
| Method | Path | Access | Notes |
|---|---|---|---|
| GET | /settings | public | `Settings` (defaults merged) |
| GET | /settings/admin | admin | `Settings` |
| PATCH | /settings | admin | `settingsUpdateSchema` |
| GET/POST | /users | admin | `Paginated<User>` / `userCreateSchema` |
| PATCH/DELETE | /users/:id | admin | you can't demote, deactivate or delete yourself (400 `SELF_ACTION`) |
| GET | /stats | editor | `Stats` |
| GET | /health | public | `{ ok: true }` |
