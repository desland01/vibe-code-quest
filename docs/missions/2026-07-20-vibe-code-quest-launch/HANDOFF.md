# HANDOFF — Vibe Code Quest launch mission

**Date:** 2026-07-24
**Repo:** `/Users/thebeast/code-tutor`
**Branch:** `main`
**Status:** L-001 → L-004 closed. L-005 comps gate closing in this docs commit. Next = L-005 implementation (collectibles + map glow). L-006→L-011 remaining.

---

## 1. Mission source of truth

1. [`KICKOFF.md`](./KICKOFF.md) — Amendment A4 owner decisions, L-001→L-011 spine, leaderboard constraints, forbidden list, **§6 stop conditions only**.
2. [`EXECUTION_PLAN.md`](./EXECUTION_PLAN.md) — ordered closeout + commit sequence for the wrap.
3. [`../2026-07-19-code-tutor-engagement-v2/DESIGN_CONTRACT.md`](../2026-07-19-code-tutor-engagement-v2/DESIGN_CONTRACT.md) — frozen design law. Never edit.
4. [`WORK_LEDGER.md`](../../../WORK_LEDGER.md) — dated session history.
5. This file — resume state for the next session.
6. [`evidence/L-005/comp-judgement.md`](./evidence/L-005/comp-judgement.md) — L-005 design-artifact gate (must land before impl).

Product name (A4.3 amended 2026-07-21): **Vibe Code Quest by Truline**
Byline: [https://truline.io](https://truline.io)
Spelling: **Truline**, never Trueline.

---

## 2. What is committed / closed

| Slice | Commit / state | Result |
|---|---|---|
| **L-001** Live SQL concurrency proof | `3ab22f5` | Disposable Neon branch proof PASS (3/3 incl. 8-way race). Branch deleted + verified absent. QA-MATRIX concurrent-write → LIVE SQL PASS. A4.3 Truline spelling locked. Constance R039–R041 declared. |
| **L-002** Beat factory (48 landmarks) | `4f1616f` | 2 hand-authored overrides + 46 provenance-locked derives. Source-aware feedback. Anti-spoiler quiz isolation. Invalid `?format=` → overview. Full Playwright **44/44** on `http://localhost:3100`. Gates green. |
| **L-003** Competence XP | `b8663cc` (+ docs `28b5aa3`) | Additive `0009_xp.sql` on main Neon. Server-derived XP (15+15+20+50=100). Disposable branch proof PASS + verified delete. Map HUD + `xp_awarded`. Full Playwright **46/46** workers=1 on `:3100`. R042–R047 declared. |
| **L-004** Opt-in leaderboard | `b13717a` | Additive `0010_leaderboard.sql` on main Neon (`mig_count` 10). Fresh disposable proof PASS (HMAC write-limiter final SQL) + verified delete. Weekly/all-time board, soft opt-out, positive-only copy, map Quest-board link. Full Playwright **48/48** workers=1 on `:3100`. |
| **L-005 comps** | scoped docs commit this handoff | HTML comps + 6 captures + renderer + judge record. Mechanical/source PASS. No production UI yet. |

Evidence:

- [`evidence/L-001.md`](./evidence/L-001.md)
- [`evidence/L-002.md`](./evidence/L-002.md)
- [`evidence/L-003.md`](./evidence/L-003.md)
- [`evidence/L-003-branch-proof.md`](./evidence/L-003-branch-proof.md)
- [`evidence/L-004.md`](./evidence/L-004.md)
- [`evidence/L-004-branch-proof.md`](./evidence/L-004-branch-proof.md)
- [`evidence/L-005/comp-judgement.md`](./evidence/L-005/comp-judgement.md)

Comps artifacts:

- `designs/comps/vibe-launch-l005/collectible-glow-comps.html`
- `designs/comps/vibe-launch-l005/captures/*.png` (6)
- `docs/missions/2026-07-20-vibe-code-quest-launch/scripts/render-l005-comps.mjs`

---

## 3. L-004 close state (still true)

### Locked shape

- Scores from `xp_awards` only via SECURITY DEFINER `leaderboard_board`
- Opt-in handle 3–24; soft opt-out keeps row for cooldown history
- Partial unique index on active handles only
- HMAC write limiter table: no app_user table privs; PUBLIC execute revoked on both definer fns
- Mutation cooldown 10s under profile lock; leave not write-limited
- No-DB: GET `unavailable`, PUT refuses hosted writes
- Positive-only copy only (`leaderboard_shame_copy == false`)

### Main Neon

- Branch id: `br-raspy-bread-atcew3is`
- Endpoint base: `ep-wandering-mouse-atbkiw6k` (pooled + unpooled)
- Migrations through `0010_leaderboard.sql` (`mig_count` 10)
- Leave alone: `rls-test` (`br-round-dust-atu1vnt5`)
- No disposable `vibe-launch-l004-*` branches remain

### Leave uncommitted / untouched

- `CLAUDE.md`, `constants.md`, `constants.md.reground-log.jsonl`
- `.claude/*`, `.agents/skills/code-tutor-agent-lessons/SKILL.md`
- `public/content-manifest.v1.json` timestamp churn
- `next-env.d.ts` build churn

---

## 4. L-005 comps locked decisions (from judge record)

1. **Ownership:** derive from server progress `state.completed === true` only. Prefer no new Neon table. Static registry of 48 landmark → keepsake id/name/sigil.
2. **Collectible grant:** static badge inside existing stamp moment. No third celebration animation. Fresh grant only after successful PUT confirms `completed`. Resume of already-stamped → static keepsake, no grant replay.
3. **Map glow surface:** `SubMapScene` DOM landmark cards only (not Pixi overworld for L-005 v1).
4. **Glow motion:** 1200ms ease-in-out × 3, then settled warm highlight. Animated only for just-confirmed stamp this session; prior completed = settled immediately. Reduced-motion = settled + labels, animation none.
5. **Shelf:** region sub-map; 3-col desktop / 1-col mobile; Earned vs Open; positive-only copy; quiet-hide on no-DB/progress failure (XpHud posture).
6. **Color never sole signal:** Stamped text + collectible name; Open label on unfinished cards.
7. **Do not edit** canonical landmark content or `VOICE.md`.

---

## 5. Exact resume order (L-005 implementation next)

1. Constance session-start:
   `node /Users/thebeast/Constance/dist/constance.mjs session-start`
2. Dirty-work audit. Preserve foreign/self-written files listed above.
3. Confirm L-005 comps commit is on main (judge record + captures present).
4. Implement L-005 per locked decisions above:
   - Browser-safe registry `src/lib/collectibles.ts` (48 landmarks, unique ids)
   - Client fetch `/api/progress` on region page (quiet-fail; do not force region page fully dynamic unless needed)
   - BeatPlayer: collectible only after server-confirmed completed
   - sessionStorage one-shot glow marker after confirmed stamp; consume on region scene
   - Collection shelf on SubMapScene; stamped card glow + labels
   - Tests: registry 48, ownership from completed only, no optimistic grant, idempotent resume, reduced-motion, mobile overflow, shame-free
   - Four gates + Playwright on `http://localhost:3100` workers=1
   - Evidence `evidence/L-005.md` + ledger + HANDOFF
   - Commit: `feat(launch): L-005 collectibles and stamped map glow`
5. Continue L-006 → L-011 in packet order from EXECUTION_PLAN.
6. Fresh dev server: `npm run dev -- -p 3100 -H localhost`
   Playwright **only** against `http://localhost:3100` (never `127.0.0.1`).
7. Full e2e: `--workers=1`.

---

## 6. Remaining spine

| Slice | Work |
|---|---|
| **L-005 impl** | Collectibles + map glow (comps already gated) |
| L-006 | Free-tier conversion (remove paywall from user path; billing dormant; fix/skip-guard fixtures honestly) |
| L-007 | Rebrand to Vibe Code Quest by Truline |
| L-008 | Self-host/no-DB mode + MIT + **full-history** secret scan + public GitHub |
| L-009 | Guide default → Kimi K2 + conservative caps |
| L-010 | Vercel production deploy + live smoke QA (AI keys may need REST env write) |
| L-011 | Closeout (QA-MATRIX, HANDOFF, ledger, gate evidence) |

Treat owner GO from original mission as still in force for all remaining slices including public GitHub + Vercel deploy.

---

## 7. Guardrails (turn-one)

- Constance fallback CLI: `node /Users/thebeast/Constance/dist/constance.mjs …`
  Bare `constance` may be missing; do not invent `cli/constance.ts` under code-tutor.
- Use `bunx` (PATH includes `~/.bun/bin`), not `npx` (global R010).
- No heredoc multi-line scripts in terminal if the harness approval path wedges — write a file, run the file bare.
- Never commit Constance self-writes or content-manifest timestamp churn.
- Brand: **Truline** only.
- Playwright origin: **`http://localhost:3100` only**.
- Full e2e canonical run: **workers=1** (default parallel can flake onboarding under load).
- Vision-analyze may be OpenRouter 402 — use geometry + screenshots + honest non-PASS claim; do not spend to fix.
- Stop only for KICKOFF §6: missing unmintable credential, spend >$5, custom-domain DNS, real leaked secret pre-publish, or owner-decision change.

---

## 8. Neon / access notes (no secrets)

- Neon project id is in `.env.local` as `NEON_PROJECT_ID` (set).
- Main branch id: `br-raspy-bread-atcew3is`.
- Existing non-mission branch: `rls-test` (`br-round-dust-atu1vnt5`) — leave alone.
- neonctl connection-string needs `--role-name neondb_owner` (multi-role ambiguity with `app_user` NOLOGIN).
- Main endpoint base last verified: `ep-wandering-mouse-atbkiw6k` (pooled + unpooled).
- Main migrations through `0010_leaderboard.sql`.
- GitHub: `gh` auth as `desland01` existed previously.
- Vercel project: `code-tutor` linked; progress env vars present; AI keys may still need L-010 REST env write.

---

## Kickoff (paste into fresh session)

```text
Resume the Vibe Code Quest launch mission AFK in /Users/thebeast/code-tutor on branch main. FIRST run `node /Users/thebeast/Constance/dist/constance.mjs session-start`, then read in order: /Users/thebeast/code-tutor/docs/missions/2026-07-20-vibe-code-quest-launch/KICKOFF.md, /Users/thebeast/code-tutor/docs/missions/2026-07-20-vibe-code-quest-launch/EXECUTION_PLAN.md, /Users/thebeast/code-tutor/docs/missions/2026-07-20-vibe-code-quest-launch/HANDOFF.md, /Users/thebeast/code-tutor/docs/missions/2026-07-20-vibe-code-quest-launch/evidence/L-005/comp-judgement.md, and the frozen /Users/thebeast/code-tutor/docs/missions/2026-07-19-code-tutor-engagement-v2/DESIGN_CONTRACT.md.
First perform a dirty-work audit without touching Constance self-writes. L-001–L-004 are done (main Neon through 0010_leaderboard; L-004 at b13717a). L-005 comps gate is committed. Implement L-005 collectibles + stamped map glow per judge record, then L-006→L-011 in order. Treat this message as GO.
Guardrails: Truline spelling only; use bunx, never npx; never expose secrets; leave CLAUDE.md/constants.md/.claude/*/.agents/* and manifest timestamp churn uncommitted; Playwright only against http://localhost:3100 with workers=1 for full suite; STOP only for KICKOFF §6.
```
