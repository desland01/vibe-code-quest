# HANDOFF — Vibe Code Quest launch mission

**Date:** 2026-07-21
**Repo:** `/Users/thebeast/code-tutor`
**Branch:** `main`
**Status:** L-001 + L-002 + L-003 committed. L-004→L-011 not started.

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
| **L-003** Competence XP | *(this commit)* | Additive `0009_xp.sql` on main Neon. Server-derived XP (15+15+20+50=100). Disposable branch proof PASS + verified delete. Map HUD + `xp_awarded`. Full Playwright **46/46** workers=1 on `:3100`. R042–R047 declared. |

Evidence:

- [`evidence/L-001.md`](./evidence/L-001.md)
- [`evidence/L-002.md`](./evidence/L-002.md)
- [`evidence/L-003.md`](./evidence/L-003.md)
- [`evidence/L-003-branch-proof.md`](./evidence/L-003-branch-proof.md)

---

## 3. L-003 close state

### Formula (locked)

- scenario_solved: **15** · gotcha_solved: **15** · check_passed: **20** · landmark_stamped: **50**
- **100** max per landmark · zero penalties · zero decay · predict never awards
- Awards from **server-merged** progress RETURNING state only
- Unique `(profile_id, region, landmark, award_key)` → idempotent
- Main Neon: `xp_awards` present, `schema_migrations` has `0009_xp.sql`, 438 backfill rows, weekly window 0

### WIP backup

Local dangling ref (if still present): `refs/backup/l003-wip`.
Delete after L-003 lands: `git update-ref -d refs/backup/l003-wip`.

### Leave uncommitted / untouched

- `CLAUDE.md`, `constants.md`, `constants.md.reground-log.jsonl`
- `.claude/*`, `.agents/skills/code-tutor-agent-lessons/SKILL.md`
- `public/content-manifest.v1.json` timestamp churn
- `next-env.d.ts` build churn

---

## 4. Exact resume order (L-004 next)

1. Constance session-start:
   `node /Users/thebeast/Constance/dist/constance.mjs session-start`
2. Dirty-work audit. Preserve foreign/self-written files listed above.
3. Re-read KICKOFF + this HANDOFF + frozen DESIGN_CONTRACT (leaderboard §4 in full).
4. Implement L-004 Leaderboard per KICKOFF:
   - opt-in handle (length-capped, sanitized, no email/PII display)
   - weekly + all-time boards; top-N + own rank always visible when opted in
   - server-derived from XP rows; self-hosted never writes hosted board
   - positive-only copy both directions (`leaderboard_shame_copy == false`)
   - non-participants never see themselves ranked; map/beat never references other players
5. If a new migration is required: disposable Neon branch proof first → verified delete → endpoint-base match → `npm run db:migrate` on main → postcheck.
6. Fresh dev server on port 3100: `npm run dev -- -p 3100`
   Playwright **only** against `http://localhost:3100` (never `127.0.0.1`).
7. Four gates: `typecheck`, `lint`, `test`, `build`.
8. Desktop + mobile rendered inspection (vision may be 402 — geometry + screenshots + honest non-PASS claim).
9. Dated WORK_LEDGER + evidence; scoped main commit.
10. Continue L-005 → L-011 in packet order.

---

## 5. Remaining spine

| Slice | Work |
|---|---|
| **L-004** | Leaderboard (opt-in handle, weekly + all-time, positive-only copy) |
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
- Full e2e canonical run: **workers=1** (default parallel can flake onboarding under load).
- Stop only for KICKOFF §6: missing unmintable credential, spend >$5, custom-domain DNS, real leaked secret pre-publish, or owner-decision change.

---

## 7. Neon / access notes (no secrets)

- Neon project id is in `.env.local` as `NEON_PROJECT_ID` (set).
- Main branch id: `br-raspy-bread-atcew3is`.
- Existing non-mission branch: `rls-test` (`br-round-dust-atu1vnt5`) — leave alone.
- neonctl connection-string needs `--role-name neondb_owner` (multi-role ambiguity with `app_user` NOLOGIN).
- Main endpoint base last verified: `ep-wandering-mouse-atbkiw6k` (pooled + unpooled).
- GitHub: `gh` auth as `desland01` existed previously.
- Vercel project: `code-tutor` linked; progress env vars present; AI keys may still need L-010 REST env write.

---

## Kickoff (paste into fresh session)

```text
Resume the Vibe Code Quest launch mission AFK in /Users/thebeast/code-tutor on branch main. FIRST run `node /Users/thebeast/Constance/dist/constance.mjs session-start`, then read in order: /Users/thebeast/code-tutor/docs/missions/2026-07-20-vibe-code-quest-launch/KICKOFF.md, /Users/thebeast/code-tutor/docs/missions/2026-07-20-vibe-code-quest-launch/HANDOFF.md, and the frozen /Users/thebeast/code-tutor/docs/missions/2026-07-19-code-tutor-engagement-v2/DESIGN_CONTRACT.md.
First perform a dirty-work audit without touching Constance self-writes. L-001–L-003 are done; start at L-004 Leaderboard and execute through L-011 in order. Treat this message as GO.
Guardrails: Truline spelling only; use bunx, never npx; never expose secrets; leave CLAUDE.md/constants.md/.claude/*/.agents/* and manifest timestamp churn uncommitted; Playwright only against http://localhost:3100 with workers=1 for full suite; STOP only for KICKOFF §6.
```
