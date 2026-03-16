# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

Tinies is a Next.js 16 (App Router) pet services marketplace and rescue adoption platform for Cyprus. See `.cursorrules` for full business rules and conventions.

### Running services

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server on port 3000 (Turbopack) |
| `npm run build` | Production build |
| `npm run lint` | ESLint checks |

### Key caveats

- **Env vars**: The app requires a `.env.local` file with at minimum `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `DATABASE_URL`, and `DIRECT_URL`. Without these the middleware and Header component will throw at runtime. Placeholder values are sufficient for rendering pages that don't hit Supabase or the database.
- **Prisma**: `npm install` triggers `prisma generate` via the `postinstall` script. If the Prisma schema changes, run `npx prisma generate` manually.
- **`prisma.config.ts` imports `dotenv/config`** which is not a direct dependency — it comes in as a transitive dep of Prisma. If this breaks after a Prisma upgrade, install `dotenv` explicitly.
- **Middleware deprecation**: Next.js 16 warns that `middleware` is deprecated in favor of `proxy`. This is a pre-existing warning and does not affect functionality.
- **No database required for UI development**: The homepage, services, adopt, giving, blog, about, and how-it-works pages render with static/hardcoded data. A live PostgreSQL/Supabase connection is only needed for auth flows and dashboard pages.
- **No automated test suite**: The project currently has no test framework or test files. Validation is done via `npm run lint` and manual testing.
