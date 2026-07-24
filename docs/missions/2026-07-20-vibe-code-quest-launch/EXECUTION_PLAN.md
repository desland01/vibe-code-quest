# EXECUTION PLAN — Vibe Code Quest launch wrap

**Date:** 2026-07-21
**Repo:** `/Users/thebeast/code-tutor`
**Branch:** `main`
**HEAD at plan write:** `28b5aa3`
**Purpose:** finish L-004 → L-011 end to end without redesign thrash.

---

## 0. Actual state (ground truth)

| Item | State |
|---|---|
| L-001 | Committed `3ab22f5` |
| L-002 | Committed `4f1616f` |
| L-003 | Committed `b8663cc` + docs `28b5aa3` |
| L-004 | Closed 2026-07-24 — fresh disposable proof PASS + main Neon `0010` + 48/48 e2e |
| Main Neon | Migrations through `0010_leaderboard.sql` |
| L-004 disposable proof | Fresh PASS `vibe-launch-l004-2026-07-24T14-38-24-121Z` / `br-sweet-glitter-atu37lne` (deleted+verified) |
| Next | L-005 comps gate commit **before** collectible/glow implementation |
| Preview | Must run on `http://localhost:3100` only |
| Foreign dirt | Leave alone and uncommitted: `CLAUDE.md`, `constants.md*`, `.claude/*`, `.agents/*`, manifest/next-env churn |

**Hard rule (satisfied 2026-07-24):** do **not** apply `0010` to main Neon until a fresh disposable-branch proof PASSes with verified branch deletion. Fresh proof PASS + main migrate + postcheck completed this session.

---

## 1. Done means

Mission complete only when all are true:

1. L-004 → L-011 finished in packet order.
2. Each slice has dated evidence, WORK_LEDGER entry, green applicable gates, scoped commit.
3. L-005 comps + judge record committed **before** collectible/glow implementation.
4. Repo is public only after full-history secret scan is clean (or owner stop under KICKOFF §6).
5. Production deployed and inspected at desktop + mobile (build ≠ visual proof).
6. Final QA / HANDOFF / ledger / evidence match real code, Neon, GitHub, Vercel.
7. Constance/self-write dirt remains uncommitted.

---

## 2. Commit sequence (one scoped commit per slice)

1. `feat(launch): L-004 opt-in leaderboard`
2. `docs(launch): L-005 collectible and map-glow comps gate`
3. `feat(launch): L-005 collectibles and stamped map glow`
4. `feat(launch): L-006 free product path`
5. `feat(launch): L-007 Vibe Code Quest by Truline rebrand`
6. `feat(launch): L-008 open-source and self-host packaging`
7. `feat(launch): L-009 Kimi K2 guide default`
8. `docs(launch): L-010 production deploy evidence`
9. `docs(launch): L-011 mission closeout`

Never stage: `CLAUDE.md`, `constants.md`, `constants.md.reground-log.jsonl`, `.claude/*`, `.agents/*`, `next-env.d.ts`, content-manifest timestamp churn.

---

## 3. L-004 closeout (do this first)

### 3.1 Narrow checks

```bash
export PATH="$HOME/.bun/bin:$PATH"
bunx vitest run src/__tests__/leaderboard.test.ts
npm run typecheck
npm run lint
git diff --check -- app/ db/ src/ e2e/ docs/missions/2026-07-20-vibe-code-quest-launch/
```

### 3.2 Fresh disposable Neon proof (mandatory; overwrites stale evidence)

```bash
node --check docs/missions/2026-07-20-vibe-code-quest-launch/scripts/l004-branch-proof.mjs
node docs/missions/2026-07-20-vibe-code-quest-launch/scripts/l004-branch-proof.mjs
```

Require:

- exit 0 / **PASS**
- mig_count **10** on disposable branch
- `leaderboard_entries` + `leaderboard_write_limits` present
- RLS on both
- least-privilege grants (entries: select/insert/update, no delete; write_limits: no app_user table privs)
- both SECURITY DEFINER functions verified; PUBLIC execute revoked
- partial unique index on active handles
- limiter concurrency/cap tests green
- XP regression green
- disposable branch deleted and **verified absent**

Evidence path:
`docs/missions/2026-07-20-vibe-code-quest-launch/evidence/L-004-branch-proof.md`

### 3.3 Main Neon migrate (only after §3.2 PASS)

Repo-local helper (never `/tmp`):

```bash
node docs/missions/2026-07-20-vibe-code-quest-launch/scripts/l004-main-migrate.mjs precheck
# Constance check is inside the migrate helper
node docs/missions/2026-07-20-vibe-code-quest-launch/scripts/l004-main-migrate.mjs migrate
node docs/missions/2026-07-20-vibe-code-quest-launch/scripts/l004-main-migrate.mjs postcheck
```

Require pooled + unpooled:

- mig_count **10**
- `0010_leaderboard.sql` recorded
- board + write-limit probes green

### 3.4 Preview + Playwright

Server already target: `http://localhost:3100` (never `127.0.0.1`).

```bash
export PATH="$HOME/.bun/bin:$PATH"
PLAYWRIGHT_BASE_URL=http://localhost:3100 bunx playwright test e2e/leaderboard.spec.ts --workers=1
PLAYWRIGHT_BASE_URL=http://localhost:3100 bunx playwright test --workers=1
```

Notes:

- Full suite **workers=1** only (onboarding parallel flake).
- 429 rename assertion stays **before** screenshots/reload (cooldown timing).
- Soft opt-out cleanup in e2e is fine; do not hand-delete main rows.

### 3.5 Gates + evidence + commit

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

Then:

1. Write `evidence/L-004.md` (API surface, formula, throttle design, gates, geometry/screenshots; vision-analyze may be 402 — say so honestly).
2. Dated WORK_LEDGER entry.
3. Update HANDOFF to L-004 complete / L-005 next.
4. Scoped commit of L-004 paths only.

L-004 path set (expected):

- `db/migrations/0010_leaderboard.sql`
- `src/server/leaderboard.ts`
- `src/lib/leaderboard.ts`
- `app/api/leaderboard/route.ts`
- `app/leaderboard/page.tsx`
- `src/components/LeaderboardPanel.tsx`
- `src/components/MapExperience.tsx`
- `app/globals.css`
- `src/__tests__/leaderboard.test.ts`
- `src/__tests__/leaderboard.integration.test.ts`
- `e2e/leaderboard.spec.ts`
- mission evidence / HANDOFF / WORK_LEDGER / this plan if needed
- `docs/missions/.../scripts/l004-branch-proof.mjs`

---

## 4. L-005 — Collectibles + map glow

1. **Comps gate first** (desktop + mobile) + judge record commit.
2. Stay in cozy-pixel vocabulary; celebration budget = one stamp + one glow per landmark.
3. Reduced-motion fallbacks required.
4. Collectible granted only from server-authoritative stamp.
5. Collection shelf surface + stamped landmark glow on region map.
6. Tests: idempotent stamp, resume, a11y, mobile overflow.
7. Four gates, rendered inspection, evidence, ledger, commit.

---

## 5. L-006 — Free product path

1. Remove paywall/upgrade from user journey.
2. Keep billing code dormant when Stripe unconfigured.
3. Keep guide caps + offline completion (R036).
4. Fix/skip-guard fixture tests honestly.
5. Gates, Playwright, evidence, ledger, commit.

---

## 6. L-007 — Rebrand

Apply **Vibe Code Quest by Truline** exactly to:

- metadata, map/header, footer
- README, share page, OG image
- legal pages (draft warnings stay)
- byline → https://truline.io
- “governed by Constance”

Repo spelling scan: **Truline** only on current public surfaces. Historical immutable ledger lines may keep old spelling.

---

## 7. L-008 — OSS + self-host

1. No-DB mode playable (local progress; hide share/leaderboard gracefully).
2. Self-host never writes hosted leaderboard.
3. MIT LICENSE, README overhaul, `.env.example` (no secrets).
4. Working-tree + full-history secret scan (`gitleaks` or equivalent).
5. Real leak → **STOP** (KICKOFF §6) before publish.
6. If clean: publish public GitHub as `desland01`, verify visibility/license/clone.
7. Evidence + commit before public mutation if possible; publish is the live side-effect.

---

## 8. L-009 — Guide default Kimi K2

1. Confirm official gateway model id (do not invent slug).
2. Config-only swap through existing seam.
3. Conservative production caps.
4. Landmark completion still works with guide/lesson blocked.
5. Gates, evidence, ledger, commit.

---

## 9. L-010 — Production deploy

1. Clean tree + green verification.
2. Vercel project `code-tutor` linked.
3. Env via REST only (never `vercel env add` stdin); never print secrets.
4. Mint `AI_DRILL_SECRET` fresh; 600-perm storage.
5. Constance deploy/live-mutation checks.
6. Deploy production; read back URL/state.
7. Live smoke (desktop + mobile rendered):
   - full landmark → stamp
   - XP total
   - leaderboard opt-in + rank + weekly/all-time
   - share + OG
   - reduced motion + keyboard-only
8. Dated evidence.

---

## 10. L-011 — Closeout

1. QA-MATRIX from actual results.
2. Usability protocol → post-launch.
3. Reconcile HANDOFF, WORK_LEDGER, evidence, Neon, GitHub, Vercel.
4. Final secret scan.
5. Four gates + full Playwright workers=1.
6. No orphan disposable Neon branches; leave `rls-test` alone.
7. Confirm only intentional foreign dirt remains.
8. Closeout commit + plain-English final report.

---

## 11. Guardrails (every step)

- Truline spelling only
- `bunx`, never `npx`
- Playwright origin: `http://localhost:3100` only; full suite `--workers=1`
- Never print secrets
- Stop only for KICKOFF §6
- No redesign of settled L-004 limiter shape after proof

---

## 12. Immediate kickoff prompt (next session)

```text
Resume Vibe Code Quest launch wrap from docs/missions/2026-07-20-vibe-code-quest-launch/EXECUTION_PLAN.md on main.
FIRST: node /Users/thebeast/Constance/dist/constance.mjs session-start
Then dirty-work audit (leave Constance self-writes alone).
L-001–L-003 done. L-004 is uncommitted; prior disposable proof is STALE after write-limiter edit.
Re-run docs/missions/2026-07-20-vibe-code-quest-launch/scripts/l004-branch-proof.mjs; require PASS + verified delete; only then run docs/missions/2026-07-20-vibe-code-quest-launch/scripts/l004-main-migrate.mjs precheck/migrate/postcheck; finish L-004 e2e/gates/evidence/scoped commit; then L-005→L-011 in order.
Preview must be http://localhost:3100. bunx only. Truline only. STOP only for KICKOFF §6.
```
