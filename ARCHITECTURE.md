# Architecture

The application is a single Next.js App Router service. Route pages read SQLite through Drizzle and render server-side. The live trivia page is the sole browser-polled view; it fetches the uncached trivia JSON endpoint every five seconds.

`src/lib/db.ts` opens the single better-sqlite3 file and ensures the small schema exists. `schema.ts` defines the Drizzle model. Query composition is centralised in `queries.ts`; pure eligibility, point, combined-score, and rank functions live in `scoring.ts` and are covered by Vitest.

GitHub access is isolated to `POST /api/sync`; Octokit and all credentials remain server-only. Admin changes use server actions guarded by an httpOnly password cookie. Public JSON routes cache for 30 seconds, except trivia for the live view.
