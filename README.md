# Vibe Code Quest

**A Map for Post-AI Builders** — a free, open-source learning map for people who build software
with AI agents but never went through a traditional engineering path.

Eight regions, 48 landmarks, one cozy pixel map. Each landmark is a short interactive run of
5–8 "beats" — predict, reveal, scenario, gotcha, check — that teaches one idea and ends with a
stamp. No paywall, no subscription, no streaks, no timers, no fake urgency.

Built by [Truline](https://truline.io) and governed by Constance.

---

## Contents

- [Play it](#play-it)
- [What's inside](#whats-inside)
- [Self-host quickstart](#self-host-quickstart)
- [Running with a database](#running-with-a-database)
- [The AI guide is optional](#the-ai-guide-is-optional)
- [Architecture tour](#architecture-tour)
- [Development](#development)
- [Environment variables](#environment-variables)
- [Why this exists](#why-this-exists)
- [License](#license)

---

## Play it

The hosted instance is free and needs no account. Start anonymously; add an email later only if
you want your progress to follow you across devices.

## What's inside

| Feature | What it does |
|---|---|
| **The map** | Eight regions rendered on a Pixi.js canvas, with a fully interactive DOM fallback and a screen-reader region list. Keyboard-only play is a supported path, not an afterthought. |
| **Beats** | Every landmark is a 5–8 beat sequence built strictly from that landmark's canonical content — no invented facts. One focal action per screen, deterministic grading, per-option feedback. |
| **XP** | Competence-indexed points for correct beat interactions and stamps. Zero penalties, zero decay. Derived on the server from recorded progress, never set by the browser. |
| **Leaderboard** | Opt-in, handle-only, weekly and all-time. Top-N plus your own rank, always. Copy is positive in both directions by design — no "you lost your spot", ever. |
| **Collectibles** | A unique pixel prop per landmark, granted at the stamp, plus a glow on the stamped landmark on the region map. Reduced-motion fallbacks throughout. |
| **Share cards** | An unguessable public link showing completion counts only — no email, no account details. Revocable. |
| **AI guide** | An optional non-blocking side rail. Landmarks always complete with the guide switched off or the network blocked. |

## Self-host quickstart

No database, no accounts, no API keys:

```bash
git clone https://github.com/desland01/vibe-code-quest.git
cd vibe-code-quest
npm install
npm run dev
```

Open <http://localhost:3000>.

That's the whole setup. With `DATABASE_URL` unset the app runs in **self-host mode**:

- every region, landmark, beat, quiz and stamp works
- progress is stored **in your browser only** (`localStorage`)
- the leaderboard, share cards, cross-device resume, email save and the XP HUD are hidden
  rather than broken, because they need shared server state
- a self-hosted instance never writes to the hosted leaderboard

The map header says "Self-host mode" so it is never ambiguous which mode you are in.

## Running with a database

Hosted mode adds cross-device progress, XP totals, the leaderboard and share cards. It expects
Postgres — the hosted instance runs [Neon](https://neon.tech).

```bash
cp .env.example .env.local          # then fill in the values you need
npm run db:migrate                  # needs DATABASE_URL_UNPOOLED
npm run dev
```

Minimum for hosted mode:

- `DATABASE_URL` — pooled Postgres connection string
- `DATABASE_URL_UNPOOLED` — direct connection, used by migrations only
- `AUTH_SECRET` — signing key for anonymous session tokens

Migrations live in `db/migrations/` and run in filename order. They are additive and immutable —
never edit one that has shipped; add a new file instead.

Row-level security is not optional in this schema. Application queries run as the `app_user`
role with `app.user_id` set per transaction, so a bug in application code still cannot read
another profile's rows.

## The AI guide is optional

The guide is a side rail, never a gate. If it is unavailable — no key, an outage, a usage cap,
a blocked network — the landmark falls back to its canonical written explanation and you can
still finish it. That behaviour is covered by tests, not just intent.

To enable it, set `AI_GATEWAY_API_KEY` and bring your own budget. Requests go through the
[Vercel AI Gateway](https://vercel.com/docs/ai-gateway); models are configured by environment
variable (`AI_MODEL_EXECUTOR`, `AI_MODEL_ADVISOR`, `AI_MODEL_FALLBACK`) so swapping providers is
config, not code.

Usage accounting — worst-case token reservations, reconciliation against actual usage, and
per-identity, per-IP, per-device and global daily caps — lives in the database. Self-host mode
therefore has no guide accounting, and the guide serves canonical text instead.

## Architecture tour

```
app/                      Next.js App Router routes and API handlers
  api/                    session · progress · onboarding · quiz · guide · leaderboard · share
  map/[region]/[landmark] the landmark surface (overview / play / quiz)
  legal/                  terms · privacy · cancellation & refund
  s/[token]/              public share card + its OG image
src/
  components/             map canvas, beat player, leaderboard panel, guide rail
  content/                48 typed landmark modules + the beat sequences derived from them
  server/                 access seam, xp, leaderboard, share, onboarding, ai transport
  lib/                    session tokens, db pool, analytics taxonomy, browser-safe helpers
db/migrations/            additive SQL, RLS policies, SECURITY DEFINER board functions
e2e/                      Playwright suites
docs/missions/            how this was actually built, slice by slice
```

A few load-bearing decisions worth knowing before you change things:

- **Content is a build artifact.** Typed landmark modules are compiled into
  `public/content-manifest.v1.json` at build time and validated with Zod. The build fails on a
  malformed sequence, so bad content cannot ship.
- **The beat registry is server-side.** The client only ever receives the selected landmark's
  beats, and the server — not a client-supplied `kind` — decides how a progress write is
  validated.
- **Progress merges are monotonic.** Concurrent writes resolve with `GREATEST` and OR-latches in
  a single SQL statement; the first stamp wins and a stale write is absorbed rather than
  clobbering a newer one.
- **Motion is CSS only.** No animation dependencies. Every celebration has a reduced-motion
  fallback, and colour is never the only signal.
- **The `entitlements` table is vestigial.** It survives in the migration history and is still
  read by the access seam, but nothing writes it — the product takes no payment. It resolves
  every profile to the free tier.

## Development

```bash
npm run dev          # dev server on :3000
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm run test         # vitest unit suite (no network, no database)
npm run test:db      # integration suites against a disposable Postgres branch
npm run build        # content manifest + next build
npm run test:e2e     # Playwright
```

Tests that need a database are guarded and skip themselves when `TEST_DATABASE_URL` is unset, so
`npm run test` is green and fast on a clean clone with no network.

`npm run test:db` runs the seven `*.integration.test.ts` suites for real. If `TEST_DATABASE_URL`
is already set it uses that database; otherwise it provisions a **disposable Neon branch**, runs
the suites against it, and deletes the branch afterwards — including on failure and on Ctrl-C.
The wrapper is [`scripts/with-neon-branch.mjs`](scripts/with-neon-branch.mjs); point it at another
project with `NEON_ORG_ID` / `NEON_PROJECT_ID`.

### Running it as a push gate (opt-in)

`package.json` also exposes `gate:prepush`, which just calls `test:db`. **Nothing in this
repository invokes it** — it is a convention a pre-push hook can call, and a fresh clone has no
such hook. To wire it up yourself:

```bash
cat > .git/hooks/pre-push <<'SH'
#!/bin/sh
npm run gate:prepush
rc=$?
# 78 means the gate could not run (no Neon login, no network). Warn, don't block.
if [ "$rc" -eq 78 ]; then
  echo "pre-push: gate:prepush could not run — allowing push." >&2
  exit 0
fi
exit "$rc"
SH
chmod +x .git/hooks/pre-push
```

That `78` branch is the whole point and is easy to drop by accident: a hook that just
`exec npm run gate:prepush` propagates 78 to git, which blocks the push — so losing a Neon login
or boarding a plane would make an unrelated docs fix unpushable. The exit codes are `0` passes,
**`78` the gate could not run** (warn and allow), any other non-zero a real failure (block). A
child process that exits 78 on its own is remapped to 1, so the two can never be confused.

If you already set `core.hooksPath` globally, writing to `.git/hooks/` above will do nothing;
add the call to the hook that path points at instead, rather than overriding it locally and
losing whatever else it does.

Two things about that script are load-bearing and should not be "simplified":

- It runs vitest with `--no-file-parallelism`. Several suites `TRUNCATE ... CASCADE` in a
  `beforeEach`, so running the files concurrently against one database makes them delete each
  other's fixtures and fail on foreign keys.
- It uses `return await` before the child process call. `return promise` inside a `try` whose
  `finally` performs teardown runs that `finally` *before* the promise settles, which would drop
  the database branch while the tests were still connected to it.

Without a Neon CLI login, `npm run test:db` fails at branch creation; set `TEST_DATABASE_URL` to
any Postgres database with the migrations applied and it will use that instead.

For the Playwright suite, run the preview on port 3100 and use one worker:

```bash
npm run dev -- --port 3100
PLAYWRIGHT_BASE_URL=http://localhost:3100 npx playwright test --workers=1
```

Contributions are welcome. The content rule is strict: landmark beats must derive from that
landmark's canonical fields. No invented facts, no borrowed text from a sibling landmark.

## Environment variables

See [`.env.example`](./.env.example) for the annotated list. Nothing there is required for
self-host mode.

## Why this exists

Most programming education assumes you are becoming a professional engineer. A growing number of
people are not — they are founders and operators shipping real software with AI agents, and they
need a mental map of the terrain rather than a syllabus.

Vibe Code Quest is that map, and it doubles as a demonstration of what
[Truline](https://truline.io) plus the Constance operating harness can build with a founder who
does not write the code by hand. The full build history, mission packets and work ledger are in
this repository on purpose — `docs/missions/` is the honest record, including the parts that
went wrong.

## License

[MIT](./LICENSE) — © 2026 Desmond Landry (Truline).
