# Hacktoberfest Leaderboard

A lightweight Next.js 15 dashboard for an organisation-wide Hacktoberfest: GitHub merged PRs and trivia scores are combined into one public leaderboard.

## Setup

1. Create a Turso database, then copy its database URL and authentication token into `DATABASE_TURSO_DATABASE_URL` and `DATABASE_TURSO_AUTH_TOKEN`.
2. Copy `.env.example` to `.env` and fill in `GITHUB_TOKEN`, `GITHUB_ORG`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `SYNC_SECRET`. The token needs read access to the organisation's repositories.
3. Run `npm run db:migrate` to create the tables in Turso.
4. `npm install`
5. Start locally with `npm run dev`, then visit `http://localhost:3000`.

Admin access requires both configured credentials. Sign in at `/admin` with `ADMIN_USERNAME` and `ADMIN_PASSWORD`; sessions expire after eight hours. Changing either credential invalidates existing sessions. Use **Sign out** to end the session on your browser.

Add the same two Turso variables in Vercel’s Production environment before deploying. Set `NEXT_PUBLIC_SITE_URL` to the public site URL to generate canonical social-preview links. The app uses Turso for persistent data; it does not use a local `data/` folder.

## Trivia night runbook

1. Go to `/admin`, log in, and add repositories to watch (for example, `website` or `my-org/website`). Sync only reads these repositories. Eligible PR authors are imported automatically with their GitHub username, display name, and avatar.
2. Create every round with its display position and maximum score.
3. Enter scores in the grid. Each cell saves when it loses focus.
4. Put `/trivia/live` on the projector. It polls every five seconds and needs no admin login.
5. Use the reset button only after confirming; it removes all trivia rounds and scores, but leaves people and PRs.

## GitHub sync

The overall and contributions dashboards stream saved standings through `/api/live` using server-sent events. The server checks for changes every two seconds; the browser reconnects automatically and slides contributors into their new positions. Reduced-motion preferences are respected. This streams the local database, so new GitHub PRs appear after a successful sync, not immediately on GitHub. The footer shows the last successful GitHub sync.

`POST /api/sync` requires `x-sync-secret`. It searches merged PRs in the date window, filters bots, maintainers, and invalid/spam labels, then upserts PRs and contributor profiles from GitHub. No manual contributor entry is needed. The admin button prompts for this secret. Add `LEADERBOARD_URL` and `SYNC_SECRET` to GitHub Actions secrets to enable the supplied ten-minute workflow.

## Commands

- `npm test` — unit tests for scoring/ranking rules
- `npm run build` — production build
- The app has no demo-data or seed command. Until the first successful GitHub sync, the public pages show an empty state.

Secrets are used only in server routes/actions; none are shipped to browser code.
