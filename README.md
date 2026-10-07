# US30 Trading Academy

> **The goal is not to predict the market. The goal is to build a repeatable decision-making process.**

An educational web platform that teaches trading of the **US30 / Dow Jones and Dow futures (YM / MYM)** from absolute
beginner to advanced level. It is a working application — not a mock-up — with a 26-module curriculum, interactive labs,
a chart replay, a virtual-account simulator, a backtesting lab, a trading journal, an AI tutor and a final assessment.

**It is not** a signals service, copy trading, a profit promise or a "secret strategy". Nothing in it tells anyone when to buy or
sell. All charts used for practice are **synthetic and labelled DEMO**.

> Educational only. Not financial advice. Trading CFDs and futures involves significant risk of loss; futures are leveraged
> and losses can exceed the initial margin. Past results do not guarantee future results.

---

## What is inside

| Area | What it does |
| --- | --- |
| **Academy** | 26 modules · 10 progressive levels · 182 lessons · 934 quiz questions (multiple choice, true/false, numeric, position-size, R:R, chart-based). Every answer is explained. A level opens when 80% of the previous level's lessons are completed. |
| **Labs** | Market Structure, Draw Your Levels, Fibonacci, Confluence (score 0–8): the student marks the chart and gets feedback on the reasoning. |
| **Chart Replay** | The market bar by bar, never showing the future. Draw levels/zones/trendlines/Fibonacci, trade with the shared execution engine, get a **process** evaluation (not P&L). |
| **Simulator** | Virtual account with balance, equity, margin, open and daily P&L, drawdown, spread and commission (illustrative values), stop/target resolution with gaps. |
| **Backtesting Lab** | Buy / Sell / Wait on a DEMO series with written rule-sets; the report separates **rule adherence** from results and warns about small samples. |
| **Journal** | Entry reason, emotion, mistakes, process rating, screenshots; win rate, payoff, expectancy, profit factor, R, drawdown, streaks, by setup / session / emotion, and a behavioural card. |
| **Daily plan + pre-trade checklist** | 12-item checklist (stop, risk and R:R verified from the order; the rest declared). It warns and teaches — it **never blocks**. |
| **Calculators** | Risk, position size for YM/MYM (always showing dollar risk), tick value, leverage, costs, R:R. |
| **Sessions & economic calendar** | Market sessions converted to the user's timezone; events with LOW / MEDIUM / HIGH / EXTREME impact ("don't trade news" is a method choice, not a rule). |
| **Glossary** | 117 searchable terms. |
| **AI tutor & chart analyzer** | Server-side only. Never gives signals ("buy now"), never promises results. Works without a model key: the chart reading is computed deterministically. |
| **Learning Sources** | Each source with *Source + Date checked* and an honest verification level (CME first). |
| **Final Assessment** | An unknown DEMO chart, 12 decision steps, a 0–100 **process** score. The market outcome is shown afterwards as information and never changes the grade. |
| **Gamification** | XP, streaks, achievements — rewarding study, review and patience, with daily caps; never trade volume. |
| **Admin** | Content CRUD (modules, lessons, quizzes with a validated editor, video allow-list, attachments), users (roles, disable, guards against locking yourself out), economic events, glossary, statistics. |
| **Original framework** | The *Confluence Trading Framework* (12 steps + 5 educational setups) — shown with the mandatory notice that it is **not** the official Cuebanks / Wall Street Academy course. |

---

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS 4 · shadcn/ui-style components (Radix) · Lucide ·
Node route handlers (REST) · PostgreSQL · Prisma 7 · Zod 4 (Portuguese messages) · jose (JWT sessions) · bcrypt ·
Vitest · Playwright · Anthropic SDK (optional, server-only). Dark mode first, responsive.

> This project uses a recent Next.js with breaking changes. `AGENTS.md` asks contributors (human or AI) to read the guides in
> `node_modules/next/dist/docs/` before changing framework-level code (e.g. `src/proxy.ts` replaces `middleware.ts`).

---

## Quick start

Requirements: **Node ≥ 22** and **PostgreSQL** (developed and tested on 16).

```bash
npm install                      # also runs `prisma generate`
cp .env.example .env             # then edit it (see the table below)
createdb academy                 # or any database name you put in DATABASE_URL
npm run db:deploy                # apply the migrations
npm run db:seed                  # curriculum, glossary, achievements, demo economic events
SEED_ADMIN_EMAIL=you@example.com SEED_ADMIN_PASSWORD='a long passphrase' npm run db:seed   # optionally also create an admin
npm run dev                      # http://localhost:3000
```

`AUTH_SECRET` is required (≥ 32 chars): `openssl rand -base64 48`. Re-running the seed is safe: content edited in the admin
area is flagged `managedBySeed = false` and is skipped unless you set `SEED_FORCE=1`.

### Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | PostgreSQL connection string. |
| `AUTH_SECRET` | yes | Signs the session JWT (≥ 32 chars). |
| `APP_URL` | no | Public base URL (OAuth redirect, e-mail links, same-origin checks). Default `http://localhost:3000`. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | no | Enables "Sign in with Google" (redirect URI `${APP_URL}/api/auth/google/callback`). |
| `SMTP_URL` / `EMAIL_FROM` | no | Password-recovery e-mails. Without `SMTP_URL` the reset link is printed to the server console (development only). |
| `MARKET_DATA_PROVIDER` / `MARKET_DATA_API_KEY` | no | `demo` (default) or a registered provider — see [`docs/MARKET_DATA.md`](docs/MARKET_DATA.md). |
| `ANTHROPIC_API_KEY` / `AI_MODEL` | no | Enables the AI tutor and the AI narrative of the chart analyzer. **There is no default model**: both must be set, otherwise the endpoints answer `503 NOT_CONFIGURED` and the chart analyzer still shows its deterministic reading. Never sent to the browser. |
| `STORAGE_DIR` | no | Where uploaded screenshots / PDFs are stored. Use a persistent volume in production. |
| `TRUST_PROXY` | no | `true` only behind a trusted reverse proxy (enables per-IP rate limiting from `X-Forwarded-For`). |

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js dev server / production build / production server. |
| `npm run typecheck` · `npm run lint` · `npm test` | `tsc --noEmit` · ESLint · Vitest (pure logic: engine, stats, guardrails, curriculum, assessment…). |
| `npm run content:validate` | Validates the curriculum (add `-- --strict` to require all 26 modules). Checks explanations, one correct option, chart references, forbidden claims, framework notice, setup structure. |
| `npm run e2e` | Browser smoke test against a running server (see the header of `scripts/e2e-smoke.ts`). |
| `npm run db:deploy` / `db:migrate` / `db:seed` / `db:generate` | Prisma. `db:reset` wipes the database: Prisma asks for explicit consent when run by an AI agent. |
| `npm run admin:create -- <email> <password> [name]` | Creates a user (or promotes an existing one) with the ADMIN role. No default credentials exist. |

---

## Architecture

```
src/
  app/                  routes: (auth) (app) (reference) pages and api/* route handlers (thin)
  features/<name>/      one folder per feature: logic/ (pure, tested) · server/ (services, Prisma) · components/ · schemas.ts · types.ts
    academy · assessment · backtest · calculators · chart · daily-plan · economic-calendar · gamification
    glossary · journal · labs · replay · sessions · simulator · stats · trading (shared engine) · ai · admin · auth · profile
  modules/              content as code: curriculum/NN-*.ts (26 modules), glossary, sources, scenarios, instruments, legal
  lib/                  http wrappers, env, auth/session, rate limiting, errors, market-data (provider boundary + DEMO generator)
  proxy.ts              optimistic route protection (Next 16 "proxy"); the real checks happen in every page/API
prisma/                 schema.prisma, hand-reviewed migrations (with CHECK constraints), seed.ts
scripts/                validate-content, create-admin, e2e-smoke
docs/MARKET_DATA.md     how market data works and how to plug a real provider
```

Design rules that recur across the code base:

- **Pure logic first.** Engine, statistics, evaluation, guardrails and chart analysis are pure functions with unit tests;
  services only orchestrate Prisma and call them.
- **The server owns the truth.** Replay, backtest and assessment send the browser only the candles up to the cursor; the
  "prepared" flag, process scores, sizes and outcomes are recomputed on the server; progress moves with compare-and-swap.
- **One execution engine** (`features/trading`) for Simulator, Replay, Backtest and Assessment: spread/commission, quote space,
  gap-aware stop/target resolution where the **stop wins ties**.
- **Process over outcome.** `evaluateTrade` scores stop (20), R:R (15), risk (15), checklist (15), preparation (15), entry reason
  (10) and exit discipline (10). The final assessment scores 12 steps (100 points) from the answers and the *visible* chart only.
- **Honest data.** Synthetic data is labelled DEMO; margins/costs are labelled illustrative; sources carry a verification level.

### Curriculum

Content lives in code (`src/modules/curriculum`) with a small DSL (`mc`, `tf`, `num`, `sizing`, `rr`, `chart`), is validated
by `npm run content:validate` and seeded into PostgreSQL. Level mapping: 1 Foundations (01–02) · 2 Technical Analysis (03–06) ·
3 Market Structure (07–09) · 4 Confluence (10–11) · 5 US30/Futures (12–14) · 6 Strategy Development (15–16) ·
7 Risk, Trade Management, Psychology (17–19) · 8 Plan/Checklist, Replay, Simulator (20–22) · 9 Journal, Backtesting (23–24) ·
10 Professional Development, Final Assessment (25–26). Admins can edit everything afterwards from the UI.

---

## Security

- **Passwords**: bcrypt with a SHA-256 pre-hash (no 72-byte truncation); minimum length of 10 and a deny-list of common passwords.
- **Sessions**: signed JWT in an `HttpOnly`, `SameSite=Lax` cookie with a per-user `sessionVersion`, so disabling a user or changing a
  password invalidates existing sessions immediately. Google OAuth uses `state` + PKCE stored in a short-lived signed cookie.
- **Authorisation on every request**: pages call `requireUserPage()`, APIs go through `userRoute` / `adminRoute`. Every query is scoped by
  the user id (another user's resource answers **404**). The proxy is only a UX redirect, never the boundary.
- **CSRF / Origin** checks on unsafe methods, JSON body size limit, Zod validation everywhere, rate limiting (auth, API, AI, uploads).
- **Uploads**: type sniffing by magic bytes (an SVG renamed `.png` is rejected), size limits, served with a `default-src 'none'; sandbox` CSP.
- **Headers**: CSP, `X-Frame-Options: DENY`, `nosniff`, HSTS in production, strict `Permissions-Policy`.
- **Secrets** (`AUTH_SECRET`, `ANTHROPIC_API_KEY`, vendor keys) are read on the server only (`server-only`); nothing reaches the browser.
- **AI guardrails**: a request for a signal is refused deterministically **before** any model call; the model output is screened for
  signal/promise language; provider errors are never leaked to the user.
- **Content safety**: lesson markdown is rendered without raw HTML; the curriculum validator rejects "buy now", guaranteed-profit,
  "90% win rate"-style claims.

Not included (decide before going to production): e-mail verification of new accounts, CAPTCHA, a distributed rate-limit
store (the shipped limiter is in-memory per instance), external file storage, observability/alerting, backups.

---

## Verification status (what has and has not been checked)

Checked in this repository:

- `tsc --noEmit`, ESLint (zero warnings) and **353 unit tests** pass; `next build` succeeds.
- Strict content validation: **26 modules · 182 lessons · 934 questions**; migrations apply on an empty database and the seed is
  repeatable.
- `npm run e2e` (45 checks) passes against both `next dev` and `next start`: public pages, auth redirects, 401/403/404 boundaries,
  CSRF origin check, level locks, simulator margin refusal, "no future candles" for simulator/replay/backtest/assessment, journal R,
  AI graceful degradation, and the final assessment end to end (including once-only XP).
- Manual browser sessions with Playwright for the labs, replay (drawings, preparation scoring), backtest, journal uploads,
  admin (roles, guards, video allow-list, quiz editor) and the AI endpoints against a **local mock** of the provider.

**Not** verified — be aware before relying on it:

- **Real AI model calls.** The Anthropic integration was only exercised against a local mock server; no real key or model was used.
- **Google OAuth and SMTP delivery** were not run against Google or a real mail server.
- **CME contract figures** (YM $5/pt, MYM $0.50/pt, 1-point tick, quarterly Mar/Jun/Sep/Dec) were confirmed on 2026-10-06 from
  official CME *search excerpts*; the CME pages themselves could not be opened. Margins, hours, fees and CFD specifications are
  illustrative or marked "to be verified". Re-check them on the CME website and with your broker.
- **No real market data**: only the DEMO provider exists; `docs/MARKET_DATA.md` explains how to add one.
- The assessment's chart reading is rule-based (swings, ATR-clustered levels). In ambiguous charts several answers are accepted and
  free text is checked for presence and length, not semantically. It is a feedback tool, not a certification.
- No load testing, accessibility audit with assistive technology, or multi-instance deployment testing was done.

---

## Content provenance

All lessons, quizzes, scenarios and the framework were written for this project. The *Confluence Trading Framework* is an original
educational synthesis of widely used technical concepts and **is not the official Cuebanks / Wall Street Academy course**. Setups
are educational rule-sets with no demonstrated edge. See the in-app *Learning Sources* page for what each reference was used for
and when (and how) it was last checked.
