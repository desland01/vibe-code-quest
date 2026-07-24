# HANDOFF — Vibe Code Quest launch mission

**Date:** 2026-07-24
**Repo:** `/Users/thebeast/code-tutor`
**Branch:** `main`
**Status:** L-001 → L-005 closed (this handoff ships in the L-005 impl commit). Next = L-006 free product path. L-007→L-011 remaining.

---

## 1. Mission source of truth

1. [`KICKOFF.md`](./KICKOFF.md) — Amendment A4 owner decisions, L-001→L-011 spine, leaderboard constraints, forbidden list, **§6 stop conditions only**.
2. [`EXECUTION_PLAN.md`](./EXECUTION_PLAN.md) — ordered closeout + commit sequence for the wrap.
3. [`../2026-07-19-code-tutor-engagement-v2/DESIGN_CONTRACT.md`](../2026-07-19-code-tutor-engagement-v2/DESIGN_CONTRACT.md) — frozen design law. Never edit.
4. [`WORK_LEDGER.md`](../../../WORK_LEDGER.md) — dated session history.
5. This file — resume state for the next session.

Product name (A4.3 amended 2026-07-21): **Vibe Code Quest by Truline**
Byline: [https://truline.io](https://truline.io)
Spelling: **Truline**, never Trueline.

---

## 2. What is committed / closed

| Slice | Commit / state | Result |
|---|---|---|
| **L-001** Live SQL concurrency proof | `3ab22f5` | Disposable Neon branch proof PASS. Branch deleted + verified absent. |
| **L-002** Beat factory (48 landmarks) | `4f1616f` | 48 landmarks registered. Full Playwright 44/44 on `:3100`. |
| **L-003** Competence XP | `b8663cc` (+ docs `28b5aa3`) | Main Neon `0009_xp.sql`. Full Playwright 46/46 workers=1. |
| **L-004** Opt-in leaderboard | `b13717a` | Main Neon `0010_leaderboard.sql`. Full Playwright 48/48 workers=1. |
| **L-005 comps** | `3fac3a0` | HTML comps + 6 captures + judge record. Mechanical/source PASS. |
| **L-005 impl** | scoped commit this handoff | Collectibles + stamped map glow from server `completed`. Full Playwright **50/50** workers=1. No new migration. |

Evidence:

- [`evidence/L-001.md`](./evidence/L-001.md)
- [`evidence/L-002.md`](./evidence/L-002.md)
- [`evidence/L-003.md`](./evidence/L-003.md)
- [`evidence/L-003-branch-proof.md`](./evidence/L-003-branch-proof.md)
- [`evidence/L-004.md`](./evidence/L-004.md)
- [`evidence/L-004-branch-proof.md`](./evidence/L-004-branch-proof.md)
- [`evidence/L-005/comp-judgement.md`](./evidence/L-005/comp-judgement.md)
- [`evidence/L-005.md`](./evidence/L-005.md)

---

## 3. L-005 close state

### Locked shape

- Ownership: server `progress.state.completed === true` only
- 48 unique collectibles; no Neon table
- Fresh stamp: static grant + optional live status; glow marker only after stamp gesture
- Resume: static stamp + static collectible; no celebration replay
- Glow: SubMapScene cards; 1200ms × 3 then settle; region-overview consume; multi-marker OK
- Shelf: region overview only; quiet-hide unauth/no-progress
- Positive-only copy; color never sole signal

### Main Neon

- Migrations through `0010_leaderboard.sql` (unchanged by L-005)
- Leave alone: `rls-test`

### Leave uncommitted / untouched

- `CLAUDE.md`, `constants.md`, `constants.md.reground-log.jsonl`
- `.claude/*`, `.agents/skills/code-tutor-agent-lessons/SKILL.md`
- `public/content-manifest.v1.json` timestamp churn
- `next-env.d.ts` build churn

---

## 4. Exact resume order (L-006 next)

1. Constance session-start:
   `node /Users/thebeast/Constance/dist/constance.mjs session-start`
2. Dirty-work audit. Preserve foreign/self-written files listed above.
3. Re-read KICKOFF A4.2 + EXECUTION_PLAN §5 (L-006) + this HANDOFF.
4. **L-006 — Free product path:**
   - Inventory paywall/access surfaces first: `e2e/paywall.spec.ts`, GuideChat gating, `/api/guide`, `/api/lesson`, access server logic, UpgradeAccountModal, billing fixtures
   - Remove paywall/upgrade from user journey
   - Keep billing code dormant when Stripe unconfigured (do not delete)
   - Keep guide caps + offline completion (R036)
   - Fix or skip-guard fixture tests honestly (paywall.spec currently asserts gated guide — invert as part of slice)
   - Four gates, Playwright workers=1 on `http://localhost:3100`, evidence, ledger, commit
   - Commit: `feat(launch): L-006 free product path`
5. Continue L-007 → L-011 in packet order.

---

## 5. Remaining spine

| Slice | Work |
|---|---|
| **L-006** | Free-tier conversion (remove paywall from user path; billing dormant) |
| L-007 | Rebrand to Vibe Code Quest by Truline |
| L-008 | Self-host/no-DB mode + MIT + full-history secret scan + public GitHub |
| L-009 | Guide default → Kimi K2 + conservative caps |
| L-010 | Vercel production deploy + live smoke QA |
| L-011 | Closeout (QA-MATRIX, HANDOFF, ledger, gate evidence) |

Treat owner GO from original mission as still in force for all remaining slices including public GitHub + Vercel deploy.

---

## 6. Guardrails (turn-one)

- Constance fallback CLI: `node /Users/thebeast/Constance/dist/constance.mjs …`
- Use `bunx` (PATH includes `~/.bun/bin`), not `npx` (global R010).
- Never commit Constance self-writes or content-manifest timestamp churn.
- Brand: **Truline** only.
- Playwright origin: **`http://localhost:3100` only**.
- Full e2e: **workers=1**.
- Vision-analyze may be OpenRouter 402 — geometry + screenshots + honest non-PASS claim.
- Stop only for KICKOFF §6.

---

## 7. Neon / access notes (no secrets)

- Main branch id: `br-raspy-bread-atcew3is`
- Endpoint base: `ep-wandering-mouse-atbkiw6k`
- Migrations through `0010_leaderboard.sql`
- `rls-test` leave alone
- Vercel project: `code-tutor` linked; AI keys may need L-010 REST env write

---

## Kickoff (paste into fresh session)

```text
Resume the Vibe Code Quest launch mission AFK in /Users/thebeast/code-tutor on branch main. FIRST run `node /Users/thebeast/Constance/dist/constance.mjs session-start`, then read in order: KICKOFF.md, EXECUTION_PLAN.md, HANDOFF.md under docs/missions/2026-07-20-vibe-code-quest-launch/, and the frozen engagement-v2 DESIGN_CONTRACT.md.
Dirty-work audit without touching Constance self-writes. L-001–L-005 done (main Neon through 0010; L-005 collectibles/glow shipped). Start at L-006 free product path: inventory paywall/access/GuideChat/billing surfaces, remove user-path paywall, keep billing dormant unconfigured, fix/skip-guard fixtures honestly, then L-007→L-011. Treat this message as GO.
Guardrails: Truline only; bunx never npx; no secrets; leave CLAUDE.md/constants.md/.claude/*/.agents/* and manifest churn uncommitted; Playwright only http://localhost:3100 workers=1; STOP only for KICKOFF §6.
```
