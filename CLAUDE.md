# CLAUDE.md

@AGENTS.md

The file above (AGENTS.md) is the single source of truth for architecture, commands, conventions, and rules. Follow it. Notes below are Claude-specific additions only — don't duplicate AGENTS.md content here.

## Working style

- Before coding a feature, read the relevant `shared/src/schemas/*`, `backend/src/models/*`, and the existing route/component for that domain so changes stay consistent.
- Work in the build order from AGENTS.md §13 unless told otherwise. Finish one vertical slice (schema → model → service → api → hooks → UI → tests) before starting the next.
- Make the smallest change that satisfies the task. Don't refactor unrelated code or rename files unprompted.
- When requirements are ambiguous (e.g. design details, copy, which fields are required), pick a sensible default, note it in your summary, and keep it easy to change.

## Project

Mbaqaa — جمعية مبرة بقاء. Arabic-first (RTL) charity site for reusing clothing. Write UI copy in Arabic first, then English, via the i18n files. Never use physical direction classes (`ml-`, `mr-`, `left-`, `right-`).

- Take the charity's about, vision, mission, goals and programs from `docs/organization.md`. Don't make up statistics, partners, testimonials, license numbers or impact figures. Use clearly marked placeholders (e.g. `{{عدد المستفيدين}}`) and list them in your summary.
- The financial sustainability plan in that file is internal. Don't publish it on the site unless asked.

## UI

- Use shadcn/ui for every UI primitive. If a component is missing, add it with `npx shadcn@latest add <name>` instead of writing one from scratch or pulling in another UI library.

## Verification

- After changes run: `npm run lint && npm run typecheck && npm test`. Fix failures before reporting done.
- For UI work, also run `npm run build` to catch import/route errors, and check the screen in both `ar` (RTL) and `en` (LTR).
- For Documents work, check with a real multi-page PDF: it views inline, downloads, and shows its thumbnail.
- Don't claim something works unless a command or test showed it.

## Safety

- Never read, print, or commit real values from `.env` files.
- Never run `npm run seed` or any script against a production `MONGODB_URI`. Ask first if unsure which database a URI points to.
- Never run `serverless deploy`, `serverless remove`, `aws` write commands, or `cloudformation deploy` yourself. Deploys go through GitHub Actions. Ask before any command that changes AWS resources.
- When editing `.github/workflows/*` or `infra/*`, keep OIDC-only auth and least-privilege IAM. Never add AWS keys or widen IAM to `*`.
- Donations are QR images and bank transfers only. Don't add Stripe or any other payment gateway. Use placeholder QR images and fake IBANs in the seed data, never real account details.
- Ask before: adding a dependency, changing a Mongoose schema in a way that breaks existing documents, or deleting files.

## Keeping docs current

- When you change architecture, commands, env vars, API routes, or data models, update AGENTS.md in the same change.
- Keep `frontend/.env.example` and `backend/.env.example` in sync with AGENTS.md §4.
- Work inside the right workspace: run a single workspace's checks with `-w frontend` / `-w backend` / `-w shared` while iterating, then the root checks before finishing.
