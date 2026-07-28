# HANDOFF — Vibe Code Quest launch mission

**Date:** 2026-07-28
**Repo:** `/Users/thebeast/code-tutor`
**Branch:** `main`
**Status:** L-001 → L-006 closed (this handoff ships in the L-006 commit). Next = L-007 rebrand. L-008→L-011 remaining.

---

## 1. Mission source of truth

1. [`KICKOFF.md`](./KICKOFF.md) — Amendment A4 owner decisions, L-001→L-011 spine, leaderboard constraints, forbidden list, **§6 stop conditions only**.
2. [`GRILL-DECISIONS.md`](./GRILL-DECISIONS.md) — closed grill G-1…G-7, the A4.7/A4.8 supersessions, and nine verified defects. **Read before EXECUTION_PLAN**; where the two disagree, the grill wins.
3. [`EXECUTION_PLAN.md`](./EXECUTION_PLAN.md) — ordered closeout + commit sequence for the wrap.
4. [`../2026-07-19-code-tutor-engagement-v2/DESIGN_CONTRACT.md`](../2026-07-19-code-tutor-engagement-v2/DESIGN_CONTRACT.md) — frozen design law. Never edit.
5. [`WORK_LEDGER.md`](../../../WORK_LEDGER.md) — dated session history.
6. This file — resume state for the next session.

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
| **L-005 impl** | `04299b2` | Collectibles + stamped map glow. Full Playwright 50/50 workers=1. |
| **Grill packet** | `0ddf784` | GRILL-KICKOFF agenda. |
| **L-006** Free product path | scoped commit this handoff | Paywall gone, billing dormant, all three legal docs rewritten free. Full Playwright **50/50** workers=1. No migration. |

Evidence:

- [`evidence/L-001.md`](./evidence/L-001.md) · [`evidence/L-002.md`](./evidence/L-002.md) · [`evidence/L-003.md`](./evidence/L-003.md) · [`evidence/L-003-branch-proof.md`](./evidence/L-003-branch-proof.md)
- [`evidence/L-004.md`](./evidence/L-004.md) · [`evidence/L-004-branch-proof.md`](./evidence/L-004-branch-proof.md)
- [`evidence/L-005/comp-judgement.md`](./evidence/L-005/comp-judgement.md) · [`evidence/L-005.md`](./evidence/L-005.md)
- [`evidence/L-006.md`](./evidence/L-006.md)

---

## 3. L-006 close state

### Locked shape

- No paywall anywhere in the user journey; `src/components/Paywall.tsx` deleted.
- Guide is free within caps. `POST /api/guide` never returns 402. Caps are enforced atomically inside `runGuideTurn` via `reserveUsage`; exhaustion degrades to canonical offline text (R036 intact).
- `resolveTier` requires a trial-like status (`trial` **or** `trialing`) **and** an open date window. Canceled entitlements with a future window no longer inherit trial caps.
- Billing code untouched and dormant (G-3); it gets stripped at L-008. `e2e/paywall.spec.ts` asserts billing routes receive 0 requests from the guide journey.
- Legal: three documents describe a free, no-payment product. Truline / Desmond Landry, Florida, admin@truline.io, dated 2026-07-28, zero `[BRACKET]` placeholders. Draft banner replaced by one `legal-not-legal-advice` line (**A4.7 superseded** — see `evidence/L-006.md` §5).
- Product name in legal prose is still `code-tutor` **on purpose** — L-007 owns the rename sweep.

### Main Neon

- Migrations through `0010_leaderboard.sql` (unchanged by L-006 — no new migration)
- Leave alone: `rls-test`

### Leave uncommitted / untouched

- `CLAUDE.md`, `constants.md`, `constants.md.reground-log.jsonl`
- `.claude/*`, `.agents/skills/code-tutor-agent-lessons/SKILL.md`
- `public/content-manifest.v1.json` timestamp churn, `next-env.d.ts` build churn
- Prior-slice evidence PNGs and `docs/missions/2026-07-10-code-tutor-v1/evidence/ISSUE-013/axe-report.json`, which the e2e suite re-renders in place on every run

---

## 4. G-8 — answered

GRILL-DECISIONS §4 left G-8 open: *does "done means" gain a live-guide criterion?* The owner had
not answered by the time this AFK run reached L-006, so per the kickoff contract the
**recommended option was adopted and is recorded here**:

> **EXECUTION_PLAN §1 criterion #5 is extended.** The L-010 production smoke must show a real
> guide turn returning **model-generated text on the production URL** — not the offline banner —
> captured as evidence. A visual pass alone cannot distinguish a working guide from a broken one.

The third option (additionally forcing the advisor tier via a cross-region question to exercise
the `[[LOW_CONFIDENCE]]` contract) was **not** adopted, to keep the criterion to one clear
pass/fail. If the owner prefers it, it is a small addition to the L-010 smoke.

**This criterion depends on `AI_GATEWAY_API_KEY`, which is still absent** — see §7.

---

## 5. Exact resume order (L-007 next)

1. Constance session-start: `node /Users/thebeast/Constance/dist/constance.mjs session-start`
2. Dirty-work audit. Preserve the foreign/self-written files listed in §3.
3. **L-007 — Rebrand** (G-4: user-visible surfaces only):
   - metadata, map/header, footer, share page, OG image, legal pages, README if present
   - byline "by Truline" → https://truline.io, plus "governed by Constance"
   - **Do NOT rename `code-tutor` in `src/lib/auth/session.ts:16-17`** — it is the JWT
     `TOKEN_AUDIENCE` / `TOKEN_ISSUER`; renaming invalidates every existing session token
     (grill defect #2)
   - Rename the Vercel project to `vibe-code-quest` (safe: `.vercel/project.json` links by
     `projectId`, and nothing has launched)
   - Finish with a repo-wide spelling scan: **Truline** only on current public surfaces;
     historical immutable ledger lines may keep the old spelling
   - Commit: `feat(launch): L-007 Vibe Code Quest by Truline rebrand`
4. Continue L-008 → L-011 in packet order.

---

## 6. Remaining spine

| Slice | Work |
|---|---|
| L-007 | Rebrand to Vibe Code Quest by Truline (user-visible only) |
| L-008 | No-DB self-host mode + **create** root `README.md` and MIT `LICENSE` (neither exists — grill defect #3) + convert `.env.example` from a bare name list to commented `KEY=` form (defect #5) + strip billing (G-3) + `brew install gitleaks` (defect #4) + working-tree and full-history scan + publish public GitHub `vibe-code-quest` with full history (G-5) |
| L-009 | Fix the invalid gateway model slugs (defect #1: dashes vs dots — the guide has **never** executed a real request) + OpenAI defaults per G-6b + honour the two tiers, executor and advisor (defect #8) + reconsider `REAL_MODEL_TIMEOUT_MS = 8_000` (defect #9) |
| L-010 | Vercel CLI production deploy (G-7) + live smoke desktop/mobile + the G-8 live-guide criterion |
| L-011 | Closeout (QA-MATRIX, HANDOFF, ledger, gate evidence) |

Treat owner GO from the original mission plus the closed grill as still in force for all
remaining slices, including the public GitHub publish and the Vercel deploy.

---

## 7. Open items and known conditions

- **`AI_GATEWAY_API_KEY` is still absent** from `.env.local`. G-6 says the owner sets it there
  directly; the agent never reads the value, only tests behaviour. Without it,
  `generateWithGateway` short-circuits to `gateway_down` (`src/server/ai.ts:99`) and the L-009
  live verification and the G-8 L-010 criterion cannot pass. This is the one owner action that
  gates a "done means" criterion. It is **not** a KICKOFF §6.1 stop for L-007/L-008, which do
  not need it.
- **`e2e/onboarding.spec.ts` is latency-sensitive.** It fails the 5 s "Map unlocked" expect when
  the Neon pool is cold (answer POST 5–7 s cold vs 2.47 s warm) and passes once warm. Not caused
  by L-006 — the onboarding path issues an identical number of DB round trips before and after.
  Timeouts must **not** be bumped. Warm the DB before a full-suite run. Carry to the L-011
  QA-MATRIX.
- **Known flake:** `landmark-formats.spec.ts` under parallel load; passes solo; do not bump timeouts.
- **Terms §1 calls the product "open-source."** True only once L-008 publishes under MIT. If
  L-008 stops under KICKOFF §6.4, revise that sentence before L-010 deploys.
- **No git remote yet** — the repo is local-only; L-008 creates the GitHub remote from scratch.
- `gitleaks` and trufflehog are **not installed**; L-008 needs one (`brew install gitleaks`, free).
- Stale worktree at `.claude/worktrees/interesting-gates-7f6ac8/` is a full repo copy but is
  excluded via `.git/info/exclude` and untracked — it cannot leak into the public repo.

---

## 8. Guardrails (turn-one)

- Constance fallback CLI: `node /Users/thebeast/Constance/dist/constance.mjs …`
- Use `bunx` (PATH includes `~/.bun/bin`), never `npx` (global R010).
- `neonctl` needs `--org-id org-soft-forest-80534150` or it hangs.
- Never print secrets.
- Never commit Constance self-writes or content-manifest / next-env churn. Never `git add -A`.
- Brand: **Truline** only.
- Playwright origin: **`http://localhost:3100` only**. Full e2e: **workers=1**.
- Vision-analyze may be OpenRouter 402 — geometry + screenshots + an honest non-PASS claim.
- Stop only for KICKOFF §6.
- **Frugal-fable delegation guard is active on this machine:** the orchestrator cannot write
  `.ts/.tsx/.mjs/.sql` files directly. Dispatch through
  `constance-worker-wrap codex-worker …` (add `~/.claude/bin` to PATH) and vet every diff.
  Copywriting slices go to `codex-worker --sol` per global R013.

---

## 9. Neon / access notes (no secrets)

- Main branch id: `br-raspy-bread-atcew3is`
- Endpoint base: `ep-wandering-mouse-atbkiw6k`
- Migrations through `0010_leaderboard.sql`
- `rls-test` leave alone
- Vercel: authenticated as `desmond-5183`; project `code-tutor` linked; deploy permission
  allowlisted in `.claude/settings.local.json` (gitignored, never committed)

---

## Kickoff (paste into fresh session)

```text
Resume the Vibe Code Quest launch mission AFK in /Users/thebeast/code-tutor on branch main.
FIRST run `node /Users/thebeast/Constance/dist/constance.mjs session-start`, then read docs/missions/2026-07-20-vibe-code-quest-launch/GRILL-DECISIONS.md, HANDOFF.md, KICKOFF.md §6, and EXECUTION_PLAN.md.
L-001–L-006 are done (paywall removed, billing dormant, legal rewritten free; main Neon through 0010). Start at L-007 rebrand, then L-008→L-011 in packet order.
Per slice: dated evidence + WORK_LEDGER entry + four green gates + one scoped commit of that slice's paths only.
Guardrails: Truline only; bunx never npx; Playwright only http://localhost:3100 workers=1; neonctl needs --org-id org-soft-forest-80534150; never print secrets; leave CLAUDE.md/constants.md/.claude/*/.agents/* and manifest churn uncommitted, never git add -A; the frugal delegation guard means .ts/.tsx edits go through `constance-worker-wrap codex-worker` and you vet the diff; STOP only for KICKOFF §6.
```
