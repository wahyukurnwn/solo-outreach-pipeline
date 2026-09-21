# Pipeline — a solo outreach tracker

[![CI](https://github.com/TODO-owner/TODO-repo/actions/workflows/ci.yml/badge.svg)](https://github.com/TODO-owner/TODO-repo/actions/workflows/ci.yml)
![License: ISC](https://img.shields.io/badge/license-ISC-blue)

A lightweight pipeline for people doing outreach alone: track prospects through stages, never miss a follow-up, and read **honest** conversion numbers. It also drafts a first message from what you already know about each prospect.

**Live demo:** https://TODO-live-demo-url — read-only sample data, no sign-up needed.

<!-- TODO: add 2-3 screenshots or a short GIF here (dashboard, prospect detail with AI draft, analytics). -->

> **What this project is.** A full-stack case study built end to end by one person: product idea, data model, API, three frontends, auth, tests, and deployment. It is **not** a validated startup — see [Limitations](#limitations-and-what-i-would-do-next). The interesting part is less the feature list than the decisions behind it, so those are written down [below](#engineering-decisions).

---

## Features

**Pipeline**
- Prospects with six stages (New → Contacted → Replied → Call scheduled → Closed Won / Closed Lost) and four channels (Email, LinkedIn, Phone, Other).
- Follow-up dates, with a dashboard card for what is due today or overdue.
- Activity log per prospect (sent / replied / no response), editable and deletable.
- Analytics computed on the fly: response rate, conversion rate, per-channel breakdown, stage distribution.

**AI drafting**
- One click drafts a short outreach message from the prospect's name, company, channel, stage and notes. It is stateless: the text is poured into the activity form, and nothing is stored unless you save the activity.

**Accounts and security**
- Email + password and Google sign-in; forgot / reset password by email; change or remove a password; unlink Google.
- Short-lived access token plus a rotating refresh token in an `httpOnly` cookie, with server-side revocation on sign-out.
- Per-IP rate limiting on sign-up, sign-in and forgot-password; per-user rate limiting on AI drafts.

**Admin console** (separate app)
- List and search users, promote or demote roles, and choose which account powers the public demo.
- Every role change and demo-flag change is written to an audit log (who changed whose, from what, to what, when).

**Public read-only demo**
- `/demo` shows the whole product with sample data, without an account.

## Architecture

```mermaid
flowchart LR
  subgraph Browser
    P["platform<br/>TanStack Start :3000"]
    A["admin<br/>TanStack Start :4000"]
  end
  P -- "Hono RPC (typed)" --> API
  A -- "Hono RPC (typed)" --> API
  API["api<br/>Hono :8000"] --> DB[("PostgreSQL<br/>Prisma 7")]
  API --> R["Resend<br/>(email)"]
  API --> O["OpenRouter<br/>(AI drafts)"]
  API --> G["Google OAuth"]
```

pnpm monorepo:

```
apps/
  api/        Hono + Prisma + Zod — modules per domain (auth, prospect, activity, analytics, admin, demo, draft)
  platform/   The product: landing page, auth, dashboard, prospects, analytics, settings, public demo
  admin/      Admin console (separate origin, separate session)
packages/
  ui/         Shared design system (Tailwind v4 tokens, Button, Card, Dialog, Badge, StatCard, …)
```

The frontends import the API's `AppType` and call it through Hono's RPC client, so request and response types are inferred from the real route definitions — there is no hand-written client and no code generation step.

## Engineering decisions

These are the parts I would want to talk through in a review.

**Analytics are derived, never stored.** Response and conversion rates are computed from the activity log on every request, so there is no aggregate table that can drift out of sync. Definitions are explicit: *response rate* = prospects that replied ÷ prospects with at least one activity; *conversion rate* = Closed Won prospects that were actually contacted ÷ prospects contacted (so it cannot exceed 100% because someone marked a deal Won without logging outreach). With nothing contacted the UI shows "—", not "0%", and a note appears while the sample is small.

**Access is scoped by ownership, and answers with 404.** Another user's prospect returns 404 rather than 403, so the API does not confirm that the resource exists.

**Auth without a session store, but with revocation.** Access tokens live 15 minutes. A refresh token (random, stored only as a SHA-256 hash) lives 30 days in an `httpOnly`, `SameSite=Lax` cookie scoped to `/api/auth`, and is **rotated on every use**: the old one is revoked immediately, so a stolen token replayed after the owner refreshes is rejected. On the client, concurrent 401s share a single in-flight refresh; without that, two parallel refreshes would race the rotation and log the user out.

**Google OAuth never puts a JWT in a URL.** The callback issues a single-use, 60-second exchange code; the frontend trades it for a token over a POST.

**Password reset does not leak who has an account.** The response is identical for known and unknown emails. The reset link is built server-side from a trusted `app → origin + path` map, not from the request's `Origin` header, so the email cannot be tricked into pointing at another domain.

**Invariants live in the service layer and in transactions.** An account must always keep at least one way to sign in (you cannot remove your last one). At most one account is the public demo; flagging a new one clears the old one in the same transaction, and audit-log rows are written in that transaction too, so the trail cannot lose an entry. No-op changes are not logged.

**The public demo cannot be pointed at other users.** `/api/demo/*` resolves the single `is_demo` account on the server and never accepts a user id from the client.

**Dates are date-only on purpose.** Follow-up and activity dates are stored as `DATE` and formatted in UTC. Due-ness is decided against the user's *local* date (sent by the client), which fixed an off-by-one where a follow-up due "today" stayed hidden for the first hours of the day in UTC+ timezones.

**AI drafting is stateless and cost-aware.** No `ai_drafts` table: generate, review, use or discard. The provider call has a 30s timeout with the SDK's default retries **disabled** (its default is exponential backoff for up to an hour, which would defeat the timeout and burn the free quota). Provider failures — including a free provider answering HTTP 200 with an error in the body — map to clear 503s instead of a generic 500, while the real cause is logged. Drafts are rate-limited **per user, not per IP**, because the cost attaches to the account.

**Tests never touch the dev database.** The suite runs against a derived `<db>_test` database that is created and migrated automatically, and a setup file refuses to run against any database whose name does not end in `_test`. This exists because an earlier version silently cleared the demo flag on the real demo account on every run.

**Privacy in the UI.** The sidebar shows only the local part of the email; account settings shows it masked (`joh*****@example.com`).

## Tech stack

| Area | Choices |
|---|---|
| API | Hono 4, Prisma 7 (`pg` driver adapter), PostgreSQL, Zod 4, bcrypt, `jsonwebtoken`, `@hono/oauth-providers` |
| Frontend | TanStack Start / Router / Query, React 19, Tailwind CSS v4, react-hot-toast, lucide-react |
| Shared | pnpm workspaces, TypeScript, Hono RPC types, `@mycustom/ui` design system |
| Integrations | Resend (email), OpenRouter SDK (AI), Google OAuth |
| Quality | Vitest (integration tests against a real Postgres), Biome, Husky pre-commit lint |

## Getting started

**Prerequisites:** Node.js 24 (developed on 24.14), pnpm 10, Docker.

```bash
git clone https://github.com/TODO-owner/TODO-repo.git
cd TODO-repo
pnpm install

# PostgreSQL on localhost:5449
docker compose -f docker-compose.dev.yaml up -d
```

Create your `.env` from the template (all apps read the one in the repository root):

```bash
cp .env.example .env
```

Only `JWT_SECRET` needs a real value to get going (`openssl rand -base64 48`); everything else has a working local default or is optional:

| Variable | Needed for | If empty |
|---|---|---|
| `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, `VITE_API_URL` | Running the app | — (defaults in the template work locally) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | "Continue with Google" | That one route answers 503; email + password works |
| `RESEND_API_KEY` / `EMAIL_FROM` | Password-reset emails | Reset links are printed to the API console |
| `OPENROUTER_API_KEY` / `OPENROUTER_MODEL` | "Draft with AI" | Only drafting answers 503 |

`CORS_ORIGIN` lists the frontends, platform first and admin second.

Token and reset lifetimes can be tuned with `ACCESS_TOKEN_EXPIRES_IN_MINUTES` (15), `REFRESH_TOKEN_EXPIRES_IN_DAYS` (30) and `PASSWORD_RESET_TTL_MINUTES` (15).

```bash
pnpm --filter api db:migrate    # apply migrations
pnpm dev                        # api :8000, platform :3000, admin :4000
```

**Google sign-in (optional).** To enable it, create an OAuth client in Google Cloud Console and register `http://localhost:8000/api/auth/callback/google` as an authorized redirect URI. Without credentials the API still boots and everything else works; only the Google route answers 503.

**First admin and the demo account.** There is deliberately no self-service admin sign-up. Sign up in the app, then promote yourself:

```bash
pnpm --filter api db:studio     # or: UPDATE users SET role = 'ADMIN' WHERE email = '…';
```

Sign in again (the role is read from the token), open the admin console at http://localhost:4000, and use **Make demo account** on any user to power `/demo`.

## Testing and quality

```bash
pnpm --filter api test          # 100+ integration tests, real Postgres, separate _test database
pnpm lint                       # Biome
pnpm --filter platform exec tsc --noEmit   # likewise for admin and api
```

The tests cover auth (sign-up, sign-in, refresh rotation and replay rejection, logout revocation, Google exchange, reset flow), ownership and 404 behaviour, analytics maths, admin routes and audit logs, the demo endpoints, rate limiting, the mailer, and AI drafting with the provider stubbed at `fetch` level (including timeout and error-mapping paths).

## Deployment

The repository ships a production `docker-compose.yaml` and GitHub Actions workflows in `.github/workflows/`. CI runs lint, type checks and the API test suite against a Postgres service on every push and pull request; merging to `main` deploys.

Things the code requires in production:

- **HTTPS, and one site.** The refresh cookie is `Secure` when `NODE_ENV=production`, and it is only sent when the frontends and the API are *same-site* — e.g. `app.example.com`, `admin.example.com` and `api.example.com`. Hosting the API on an unrelated domain will silently break token refresh.
- **`CORS_ORIGIN`** must list every frontend origin; the first is used as the base for password-reset links and the Google callback redirect, the second as the admin origin.
- **`RESEND_API_KEY`** must be set: in production a missing key returns a clear 503 rather than silently dropping the reset email. Resend's sandbox sender can only email the account owner, so a verified domain is needed before real users can reset passwords.
- **Google redirect URI** for the production API domain must be registered.

## Limitations and what I would do next

Being straightforward about these matters more than a polished feature list:

- **Not validated with real users.** The problem statement is an assumption. The obvious next step is interviewing a handful of freelancers about how they track leads today.
- **The channel model is Western-outbound-shaped.** There is no WhatsApp channel and no contact-number field, which is where much freelance work in Southeast Asia actually happens. A "send via WhatsApp" action with the AI draft pre-filled would be the most relevant feature to add.
- **No reminders outside the app.** Follow-ups are only visible when you open it; email or push reminders are the missing half of a CRM habit.
- **Single-instance assumptions.** The rate limiter and the OAuth exchange codes are in memory, which is fine for one server and needs Redis (or similar) to scale out.
- **The AI uses a free model.** Latency varies a lot (roughly 5–30 s), there is a daily request quota, and free providers may retain prompts — the UI warns users not to put sensitive data in notes.
- **The role is embedded in the access token**, so a role change applies at the next sign-in or refresh rather than instantly.
- **Session management UI** (list and revoke other devices) is deferred; sign-out revokes only the current session.
- **No browser end-to-end tests**; the frontends are covered by types and the API by integration tests.
- **The UI is English only**, and some code comments and `ERD.md` are written in Indonesian.

## Project notes

- [`ERD.md`](ERD.md) — data model and design principles (DBML, Indonesian).

## License

[ISC](LICENSE)
