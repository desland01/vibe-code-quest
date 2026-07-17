You are a bounded worker agent executing exactly ONE issue in the repo at /Users/thebeast/code-tutor (you are already in it). Implement only this issue; make no commits.

# ISSUE-005 — Anonymous session plumbing (amendment A1: app-issued JWTs; Neon Auth rejected — no anonymous plugin)

Bound: src/lib/auth/** (new), src/app/api/session/route.ts (new), src/app/api/progress/route.ts (new), a small client SessionProvider component wired into the root layout, e2e/anon-session.spec.ts (new Playwright test), playwright.config.ts (new), package.json (deps: jose; devDeps: @playwright/test only), .env.example (add AUTH_SECRET name only — never a value).

Context (zero chat context assumed):
- REQ-005 (excerpt): first visit → anonymous identity, profile row created server-side, progress read/write helpers, persistence across reload, ZERO signup UI.
- Amendment A1 decision: Neon managed BetterAuth lacks the anonymous plugin, so sessions are app-issued JWTs: jose, HS256, secret from env AUTH_SECRET, httpOnly cookie. `sub` = visitor UUID (crypto.randomUUID()).
- ISSUE-004 already shipped: Neon Postgres schema + RLS. src/lib/db.ts exports `pool`, `withUserTransaction(userId, fn)`, `queryAsUser(userId, text, values)` — these run under RLS role app_user with app.user_id bound. profiles policy allows INSERT of own row (id = app.user_id). progress table: UNIQUE(profile_id, region, landmark), columns region text, landmark text, state jsonb, updated_at.
- .env.local (gitignored — DO NOT print any value from it) has DATABASE_URL and AUTH_SECRET.
- Next.js 16 App Router, React 19, TypeScript, vitest for unit tests, eslint flat config.

Tasks:
1. src/lib/auth/session.ts (server-only): issueSessionToken(userId) → jose SignJWT HS256 (HMAC key from the AUTH_SECRET env var, required — throw if unset), aud/iss "code-tutor", 400-day expiry; verifySessionToken(token) → { userId } or null (never throws on bad input). Cookie name `ct_session`; cookie options httpOnly, secure in production, sameSite lax, path /, maxAge 400 days.
2. GET /api/session (route handler): read ct_session cookie → verify. If missing/invalid: userId = crypto.randomUUID(), set cookie with fresh token. Either way: ensure profile row exists via `withUserTransaction(userId, …)` with `INSERT INTO profiles (id) VALUES ($1) ON CONFLICT (id) DO NOTHING`. Respond { userId }. No caching (dynamic).
3. /api/progress route handler, both under the verified cookie (401 JSON if absent/invalid — never create sessions here):
   - GET: return { items: [...] } — all progress rows for the user (region, landmark, state, updated_at) via queryAsUser.
   - PUT: body { region, landmark, state } (validate: region/landmark non-empty strings ≤64 chars, state is a JSON object ≤2KB serialized; 400 otherwise). Upsert: INSERT … ON CONFLICT (profile_id, region, landmark) DO UPDATE SET state = EXCLUDED.state, updated_at = now(). Return the saved row.
4. SessionProvider client component (src/lib/auth/SessionProvider.tsx): on mount, fetch('/api/session') once; expose { userId, status } via context hook useSession(). Wire it into src/app/layout.tsx wrapping children. NO visible UI, no signup UI anywhere.
5. Playwright: playwright.config.ts (testDir e2e, baseURL from env PLAYWRIGHT_BASE_URL default http://localhost:3000, webServer: `npm run dev` reuseExistingServer when no PLAYWRIGHT_BASE_URL — keep it simple and standard). e2e/anon-session.spec.ts proves VAL-020:
   a. First visit to / → /api/session responds 200 with a userId; ct_session cookie is set httpOnly.
   b. PUT /api/progress (via page.request with the browser context cookies) saves a row; GET returns it.
   c. Reload the page → same userId from /api/session; progress GET still returns the row (persistence across reload).
   d. Assert no signup/sign-in UI: page has no text matching /sign in|sign up|log in|register/i.
   npm script "test:e2e": "playwright test".
6. Keep `npm run test` (vitest) excluding e2e/** (vitest config or script glob) so the baseline gate stays green. Add a small vitest unit test for issueSessionToken/verifySessionToken round-trip + tamper rejection (set AUTH_SECRET in the test via vi.stubEnv).

Validation to satisfy:
- VAL-020: Playwright spec green (will be run by the orchestrator locally and against the Vercel preview).
- VAL-001/003: npm run typecheck && lint && test && build all green.
- VAL-002: NO secret values in committed files or printed output. .env.example gains AUTH_SECRET (name only).

Stop conditions: if src/lib/db.ts or the migrations don't match what's described, or a command fails twice, STOP and report instead of improvising.

Print EXACTLY this structured handoff as your final message:
- Completed work:
- Unresolved work:
- Files touched:
- Commands run (with exit codes):
- Issues / surprises discovered:
- Next Context Slice:
