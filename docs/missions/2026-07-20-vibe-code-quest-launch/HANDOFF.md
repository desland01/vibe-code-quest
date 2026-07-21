# HANDOFF — Vibe Code Quest launch mission

**Date:** 2026-07-21  
**Repo:** `/Users/thebeast/code-tutor`  
**Branch:** `main`  
**Status:** L-001 + L-002 committed. L-003 mid-slice on disk, uncommitted. L-004→L-011 not started.

---

## 1. Mission source of truth

1. [`KICKOFF.md`](./KICKOFF.md) — Amendment A4 owner decisions, L-001→L-011 spine, leaderboard constraints, forbidden list, **§6 stop conditions only**.
2. [`../2026-07-19-code-tutor-engagement-v2/DESIGN_CONTRACT.md`](../2026-07-19-code-tutor-engagement-v2/DESIGN_CONTRACT.md) — frozen design law. Never edit.
3. [`WORK_LEDGER.md`](../../../WORK_LEDGER.md) — dated session history.
4. This file — resume state for the next session.

Product name (A4.3 amended 2026-07-21): **Vibe Code Quest by Truline**  
Byline: [https://truline.io](https://truline.io)  
Spelling: **Truline**, never Trueline.

---

## 2. What is committed

| Slice | Commit | Result |
|---|---|---|
| **L-001** Live SQL concurrency proof | `3ab22f5` | Disposable Neon branch proof PASS (3/3 incl. 8-way race). Branch deleted + verified absent. QA-MATRIX concurrent-write → LIVE SQL PASS. A4.3 Truline spelling locked. Constance R039–R041 declared. |
| **L-002** Beat factory (48 landmarks) | `4f1616f` | 2 hand-authored overrides + 46 provenance-locked derives. Source-aware feedback. Anti-spoiler quiz isolation. Invalid `?format=` → overview. Full Playwright **44/44** on `http://localhost:3100`. Gates green. |

Evidence:

- [`evidence/L-001.md`](./evidence/L-001.md)
- [`evidence/L-002.md`](./evidence/L-002.md)

---

## 3. L-003 state (uncommitted — do this next)

### On disk (mission-owned)

| Path | Role |
|---|---|
| `db/migrations/0009_xp.sql` | Additive `xp_awards` table + RLS + backfill |
| `src/server/xp.ts` | Pure formula + idempotent apply |
| `app/api/progress/route.ts` | Atomic progress upsert + XP awards; GET returns `{ items, xp: { total } }` |
| `src/components/XpHud.tsx` | Map HUD counter (server total only) |
| `src/components/MapExperience.tsx` | Mounts HUD in header actions |
| `src/components/landmark/Beats/BeatPlayer.tsx` | Emits `xp_awarded` only when `newPoints > 0` |
| `src/components/landmark/clientEvents.ts` | Client allowlist includes `xp_awarded` |
| `src/lib/analytics.ts` | 19 events incl. `xp_awarded` |
| `src/__tests__/analytics.test.ts` | 19-event contract |
| `src/__tests__/xp.test.ts` | Pure formula unit tests |
| `src/__tests__/xp.integration.test.ts` | SQL/RLS/idempotency (needs `TEST_DATABASE_URL`) |
| `e2e/xp.spec.ts` | API + HUD + mobile geometry + live-play emit |
| `app/globals.css` | `.map-header-actions` + `.xp-hud*` cozy-pixel styles |
| `user-rules.md` | Constance R042–R047 (launch XP/leaderboard/deploy flags) |
| `/Users/thebeast/code-tutor/docs/missions/2026-07-20-vibe-code-quest-launch/scripts/l003-branch-proof.mjs` | Disposable Neon branch orchestrator (syntax-checked, **not yet executed**) |

### Leave uncommitted / untouched

- `CLAUDE.md`, `constants.md`, `constants.md.reground-log.jsonl`
- `.claude/*`, `.agents/skills/code-tutor-agent-lessons/SKILL.md`
- `public/content-manifest.v1.json` timestamp churn

### Formula (locked intent)

- scenario_solved: **15** (furthest crossed scenario beat)
- gotcha_solved: **15** (furthest crossed gotcha beat)
- check_passed: **20** (`checked === true`)
- landmark_stamped: **50** (`completed === true`)
- **100** max per landmark
- Zero penalties, zero decay
- Predict never awards
- Awards derived from **server-merged** progress RETURNING state, never client authority
- Unique key `(profile_id, region, landmark, award_key)` → idempotent
- Backfill: all-time XP yes; `awarded_at` clamped before current UTC week so weekly board stays clean

### Critical blocker

Main Neon currently has:

- `xp_awards` = **null**
- `schema_migrations` entry `0009_xp.sql` = **false**

The progress route already queries `xp_awards`. Until 0009 is applied to main, **progress GET/PUT will 500**.

Do **not** start browser progress e2e against main until migration is applied.

### Last known green checks (pre-orchestrator)

- Targeted units: 66/66 (xp + analytics + beats + beatProgress.server + session)
- `npm run typecheck`: clean
- Full Playwright and full `npm run test` must be re-run after branch proof + main migrate

---

## 4. Exact resume order

1. Constance session-start (real CLI):  
   `node /Users/thebeast/Constance/dist/constance.mjs session-start`
2. Dirty-work audit. Preserve foreign/self-written files listed above.
3. Re-read KICKOFF + this HANDOFF + frozen DESIGN_CONTRACT.
4. Inspect + execute disposable proof:  
   `node --check /Users/thebeast/code-tutor/docs/missions/2026-07-20-vibe-code-quest-launch/scripts/l003-branch-proof.mjs && node /Users/thebeast/code-tutor/docs/missions/2026-07-20-vibe-code-quest-launch/scripts/l003-branch-proof.mjs`  
   Require PASS + verified branch deletion. Evidence path expected:  
   `docs/missions/2026-07-20-vibe-code-quest-launch/evidence/L-003-branch-proof.md`
5. Apply migration to **main** Neon via existing `.env.local` (never print secrets):  
   `npm run db:migrate`
6. Verify: `xp_awards` exists + `schema_migrations` has `0009_xp.sql`.
7. Targeted XP tests + `e2e/xp.spec.ts`.
8. Fresh dev server on port 3100:  
   `npm run dev -- -p 3100`  
   Playwright **only** against `http://localhost:3100` (never `127.0.0.1` — hydration/HMR blocked).
9. Four gates: `typecheck`, `lint`, `test`, `build`.
10. Render/inspect desktop + mobile XP HUD. Vision API was previously OpenRouter 402 credit-blocked — if still blocked, record that honestly; geometry checks ≠ subjective visual PASS.
11. Dated WORK_LEDGER entry + L-003 evidence; commit **only** L-003 paths on `main`.
12. Continue L-004 → L-011 in packet order.

---

## 5. Remaining spine (after L-003 commit)

| Slice | Work |
|---|---|
| L-004 | Leaderboard (opt-in handle, weekly + all-time, positive-only copy) |
| L-005 | Collectibles + map glow (comps-gate first) |
| L-006 | Free-tier conversion (remove paywall from user path; billing dormant) |
| L-007 | Rebrand to Vibe Code Quest by Truline |
| L-008 | Self-host/no-DB mode + MIT + secret-history scan + public GitHub |
| L-009 | Guide default → Kimi K2 + conservative caps |
| L-010 | Vercel production deploy + live smoke QA |
| L-011 | Closeout (QA-MATRIX, HANDOFF, ledger, gate evidence) |

Treat owner GO from original mission as still in force for all remaining slices including public GitHub + Vercel deploy.

---

## 6. Guardrails (turn-one)

- Constance fallback CLI: `node /Users/thebeast/Constance/dist/constance.mjs …`  
  Bare `constance` may be missing; do not invent `cli/constance.ts` under code-tutor.
- Use `bunx` (PATH includes `~/.bun/bin`), not `npx` (global R010).
- No heredoc multi-line scripts in terminal if the harness approval path wedges — write a file, run the file bare.
- Never commit Constance self-writes or content-manifest timestamp churn.
- Brand: **Truline** only.
- Playwright origin: **`http://localhost:3100` only**.
- Stop only for KICKOFF §6: missing unmintable credential, spend >$5, custom-domain DNS, real leaked secret pre-publish, or owner-decision change.

---

## 7. Neon / access notes (no secrets)

- Neon project id is in `.env.local` as `NEON_PROJECT_ID` (set).
- Main branch id last seen: `br-raspy-bread-atcew3is`.
- Existing non-mission branch: `rls-test` (`br-round-dust-atu1vnt5`) — leave alone.
- neonctl connection-string needs `--role-name neondb_owner` (multi-role ambiguity with `app_user` NOLOGIN).
- GitHub: `gh` auth as `desland01` existed previously.
- Vercel project: `code-tutor` linked; progress env vars present; AI keys may still need L-010 REST env write.

---

## Kickoff (paste into fresh session)

```text
Resume the Vibe Code Quest launch mission AFK in /Users/thebeast/code-tutor (git repo, branch main). FIRST run: node /Users/thebeast/Constance/dist/constance.mjs session-start and operate inside the printed constants. Then read, in order: (1) /Users/thebeast/code-tutor/docs/missions/2026-07-20-vibe-code-quest-launch/KICKOFF.md — mission packet, Amendment A4, L-001→L-011 spine, §6 stop conditions only; (2) /Users/thebeast/code-tutor/docs/missions/2026-07-20-vibe-code-quest-launch/HANDOFF.md — current resume state; (3) /Users/thebeast/code-tutor/docs/missions/2026-07-19-code-tutor-engagement-v2/DESIGN_CONTRACT.md — frozen, never edit. Landed: L-001 3ab22f5, L-002 4f1616f. L-003 is mid-slice on disk and uncommitted; progress route already queries xp_awards but main Neon does not have the table yet (progress APIs will 500 until migrate). First concrete work: dirty-work audit without touching Constance self-writes; node --check /Users/thebeast/code-tutor/docs/missions/2026-07-20-vibe-code-quest-launch/scripts/l003-branch-proof.mjs then node /Users/thebeast/code-tutor/docs/missions/2026-07-20-vibe-code-quest-launch/scripts/l003-branch-proof.mjs for disposable Neon XP/RLS proof; require PASS + verified branch deletion; apply npm run db:migrate to main Neon without printing secrets; verify xp_awards + schema_migrations 0009; run targeted XP tests and e2e/xp.spec.ts; start fresh npm run dev -- -p 3100; Playwright only against http://localhost:3100 (never 127.0.0.1); four gates typecheck/lint/test/build; render/inspect desktop+mobile XP HUD (vision may be credit-blocked — be honest); update WORK_LEDGER + L-003 evidence; commit only L-003 paths on main. Then continue L-004 through L-011 in packet order. Guardrails: bunx not npx (~/.bun/bin on PATH); Truline spelling only; leave CLAUDE.md/constants.md/.claude/*/.agents/* and content-manifest churn uncommitted; no heredoc terminal scripts if they wedge approvals; treat this message as GO for remaining slices including public GitHub + Vercel deploy; STOP only for KICKOFF §6.
```
