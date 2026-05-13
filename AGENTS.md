# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

Analog Hive is a Next.js 15.5 (App Router + Turbopack) film development calculator web app. See `README.md` for basic setup commands (`npm install`, `npm run dev`).

### Running services

| Service | Command | Notes |
|---------|---------|-------|
| Dev server | `npm run dev` | Runs on port 3000. Core calculator/timer features work without valid Supabase credentials. |
| Lint | `npm run lint` | Uses ESLint via `next lint` |
| Tests | `npm test` | Jest + React Testing Library (240 tests across 41 suites) |

### Environment variables

A `.env.local` file is required. Copy from `.env.example`. The dev server starts with placeholder Supabase values — authenticated features (favorites, recipes, logs, AI chat) require real `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. The `REPLICATE_API_TOKEN` is only needed for the AI chat assistant.

### Non-obvious caveats

- The project uses **npm** (lockfile is `package-lock.json`). Do not use pnpm/yarn.
- `next lint` is deprecated in Next.js 16; the warning is expected and non-blocking.
- No local Supabase CLI setup exists (no `supabase/config.toml`). The project targets a hosted Supabase instance.
- Film development data is stored as static JSON/TS files in `src/data/` — no database seeding required for the calculator to work.
- The timer and development calculator features are fully functional without authentication or external services.
