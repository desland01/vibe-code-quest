# HANDOFF — Vibe Code Quest launch mission

**Date:** 2026-07-28
**Repo:** `/Users/thebeast/code-tutor` · **Branch:** `main` · **HEAD:** `6098461`
**Status:** L-001 → L-009 closed and committed. **L-010 blocked on owner approval.**
L-011 closeout is this document plus [`QA-MATRIX.md`](./QA-MATRIX.md).

---

## 1. The short version

**Shipped and live.** The repo is public at
[github.com/desland01/vibe-code-quest](https://github.com/desland01/vibe-code-quest) (MIT), the
Vercel project is renamed `vibe-code-quest`, and production is deployed and smoked at
**38 / 40 criteria**.

**One thing is left, and it is one environment variable.** The G-8 criterion fails: the
production AI guide returns canonical offline text because the runtime has no gateway
credentials — neither `AI_GATEWAY_API_KEY` nor `VERCEL_OIDC_TOKEN`. Set either one and redeploy.
Full diagnosis and both fixes: [`evidence/L-010.md`](./evidence/L-010.md) §4.

The guide has still never executed a single real request. Everything else — map, 48 landmarks,
beats, stamps, collectibles, XP, leaderboard, share cards, OG images, legal, reduced motion,
keyboard-only — is verified working on the live URL at desktop and mobile.

## 2. Mission source of truth

1. [`KICKOFF.md`](./KICKOFF.md) — Amendment A4 owner decisions, the L-001→L-011 spine, the
   forbidden list, **§6 stop conditions only**.
2. [`GRILL-DECISIONS.md`](./GRILL-DECISIONS.md) — closed grill G-1…G-7, the A4.7/A4.8
   supersessions, nine verified defects. **Where this disagrees with EXECUTION_PLAN, the grill
   wins.**
3. [`EXECUTION_PLAN.md`](./EXECUTION_PLAN.md) — per-slice detail. §2 commit #7 and §9.4 are both
   now stale; see §6 below.
4. [`QA-MATRIX.md`](./QA-MATRIX.md) — honest verdicts from real runs, and the carried-forward
   issue list.
5. [`../2026-07-19-code-tutor-engagement-v2/DESIGN_CONTRACT.md`](../2026-07-19-code-tutor-engagement-v2/DESIGN_CONTRACT.md)
   — frozen design law. Never edit.
6. [`WORK_LEDGER.md`](../../../WORK_LEDGER.md) — dated session history.

Product name (A4.3, amended 2026-07-21): **Vibe Code Quest by Truline** ·
byline [https://truline.io](https://truline.io) · spelling **Truline**, never Trueline.

## 3. What is committed

| Slice | Commit | Result |
|---|---|---|
| L-001 live SQL proof | `3ab22f5` | Disposable Neon branch PASS, deleted + verified absent |
| L-002 beat factory | `4f1616f` | 48 landmarks registered |
| L-003 competence XP | `b8663cc` | Neon `0009_xp.sql` |
| L-004 opt-in leaderboard | `b13717a` | Neon `0010_leaderboard.sql` |
| L-005 comps + impl | `3fac3a0`, `04299b2` | Collectibles + stamped map glow |
| Grill packet | `0ddf784` | Agenda |
| **L-006** free product path | `96f266f` | Paywall gone, billing dormant, all 3 legal docs rewritten free |
| **L-007** rebrand | `16ffb40` | Vibe Code Quest by Truline on every public surface |
| **L-008** OSS + self-host | `f3247f4` | Billing stripped, no-DB mode works, README + MIT LICENSE created, history scan clean |
| **L-009** gateway models | `6098461` | Valid model ids + OIDC-aware credential guard |

Evidence: [`evidence/L-006.md`](./evidence/L-006.md) · [`L-007.md`](./evidence/L-007.md) ·
[`L-008.md`](./evidence/L-008.md) · [`L-009.md`](./evidence/L-009.md) ·
[`L-010.md`](./evidence/L-010.md) (prepared, not performed).

## 4. G-8 — answered

GRILL-DECISIONS §4 left G-8 open. The owner had not answered when this run reached L-006, so per
the kickoff contract the **recommended option was adopted and is recorded here**:

> **EXECUTION_PLAN §1 criterion #5 is extended.** The L-010 smoke must show a real guide turn
> returning **model-generated text on the production URL** — not the offline banner — captured
> as evidence.

The third option (additionally forcing the advisor tier via a cross-region question to exercise
the `[[LOW_CONFIDENCE]]` contract) was **not** adopted, to keep the criterion one clear
pass/fail. It is a small addition to the smoke if the owner prefers it.

This turned out to be the right call: L-009 proved the guide had never executed a real request
at all, and a visual-only pass would never have revealed that.

## 5. The one remaining owner action

Give the production runtime gateway credentials, then redeploy and re-run the smoke. Either
option works:

- **A (recommended)** — add `AI_GATEWAY_API_KEY` to the **Production** environment in the Vercel
  dashboard (Project → Settings → Environment Variables). Use the dashboard, **not**
  `vercel env add` piped from stdin: that path is known on this machine to store an empty value,
  and `echo` adds a trailing newline.
- **B** — enable **OIDC Federation** (Settings → Security). Vercel then injects
  `VERCEL_OIDC_TOKEN` automatically and no key is needed; L-009 made the code accept it.

```bash
cd /Users/thebeast/code-tutor
vercel deploy --prod
PROD_URL=<new production URL> \
  node docs/missions/2026-07-20-vibe-code-quest-launch/scripts/l010-prod-smoke.mjs
```

A pass reads `G-8 guide returns MODEL-GENERATED text — live model reply`.

While it runs, note the latency of that first real guide turn. If turns approach or exceed 8 s,
set `AI_REAL_MODEL_TIMEOUT_MS` above the default **and** raise `GuideChat`'s 12 000 ms client
abort to stay ahead of it — the open follow-up from grill defect #9.

**Already published, for the record:** the public repo carries the full history by G-5's
explicit choice, which includes Neon branch and endpoint identifiers, the Vercel project id, and
ledger lines noting that a Gemini API key was once pasted into a chat transcript and should be
rotated. None are secrets — `gitleaks` is clean across all 116 commits — but that rotation is
still worth doing.

## 6. Packet corrections — EXECUTION_PLAN is stale in two places

- **§2 commit #7** says `feat(launch): L-009 Kimi K2 guide default`. A4.8 was superseded by
  G-6b; the models are OpenAI. The commit landed as
  `feat(launch): L-009 valid gateway models and OIDC-aware credentials`.
- **§9.4** says to mint `AI_DRILL_SECRET` fresh. **Not needed.** `app/api/guide/route.ts:70`
  passes `process.env.AI_DRILL_SECRET ?? ''`, and `parseDrillHeader` ignores an empty secret —
  so unset means the failure-drill harness is simply disabled, which is the correct production
  posture.

Also worth recording: **`AI_GATEWAY_API_KEY` is no longer a hard dependency.** L-009 made the
credential guard accept the `VERCEL_OIDC_TOKEN` Vercel injects automatically, so a Vercel
deployment can reach the gateway with no key set. G-6's "owner provides the key" is now an
option rather than a blocker.

## 7. Leave uncommitted / untouched

- `CLAUDE.md`, `constants.md`, `constants.md.reground-log.jsonl`
- `.claude/*`, `.agents/skills/code-tutor-agent-lessons/SKILL.md`
- `public/content-manifest.v1.json` and `next-env.d.ts` build churn
- Prior-slice evidence PNGs and `docs/missions/2026-07-10-code-tutor-v1/evidence/ISSUE-013/axe-report.json`,
  which the e2e suite re-renders in place on every run

**Never `git add -A`.**

## 8. Guardrails (turn-one)

- Constance: `node /Users/thebeast/Constance/dist/constance.mjs session-start`
- `bunx`, never `npx` (global R010)
- `neonctl` needs `--org-id org-soft-forest-80534150` **and** `--project-id rapid-haze-29688965`
- Never print secrets. `gitleaks` scans must use `--redact`.
- Playwright origin **`http://localhost:3100` only**, full suite **`--workers=1`**
- **Warm the Neon pool before a full e2e run** — see the cold-pool issue in `QA-MATRIX.md` §4.
  Never bump timeouts.
- Brand: **Truline** only
- Stop only for KICKOFF §6
- **Frugal-fable delegation guard is active on this machine:** the orchestrator cannot write
  `.ts/.tsx/.mjs/.sql` directly. Dispatch via
  `constance-worker-wrap codex-worker …` with `~/.claude/bin` on PATH, and vet every diff.
  Copywriting slices go to `codex-worker --sol` per global R013.

## 9. Infrastructure (no secrets)

- **Neon** project `rapid-haze-29688965`; branches `main` (`br-raspy-bread-atcew3is`) and
  `rls-test` (`br-round-dust-atu1vnt5`, leave alone). No orphan branches. Endpoint base
  `ep-wandering-mouse-atbkiw6k`. Migrations through `0010_leaderboard.sql`.
- **Vercel** project `code-tutor` `prj_WClQa03dfcb9UG1AE9aONshzxZzk`, team
  `team_nlF2ZXKWNjzMtLm84ZH2N0Sm`, Next.js preset, Node 24.x. Authenticated `desmond-5183`.
  Deploy permission allowlisted in `.claude/settings.local.json` (gitignored, never committed).
  Local CLI 56.2.1; 58.0.0 is current.
- **Git remote:** none.

---

## Kickoff (paste into a fresh session, after the owner has published and deployed)

```text
Close out the Vibe Code Quest launch mission at /Users/thebeast/code-tutor (branch main).
FIRST run `node /Users/thebeast/Constance/dist/constance.mjs session-start`, then read docs/missions/2026-07-20-vibe-code-quest-launch/HANDOFF.md and evidence/L-010.md §4.
L-001–L-011 are committed. The repo is public (github.com/desland01/vibe-code-quest, MIT) and production is deployed and smoked at 38/40. The ONLY open item is G-8: the production guide returns offline canonical text because the runtime has no gateway credentials. Once the owner has set AI_GATEWAY_API_KEY for Production (via the Vercel dashboard, never `vercel env add` stdin) or enabled OIDC Federation, redeploy and re-run `PROD_URL=<url> node docs/missions/2026-07-20-vibe-code-quest-launch/scripts/l010-prod-smoke.mjs` — it must report "G-8 guide returns MODEL-GENERATED text — live model reply". Record that turn's latency; if it approaches 8s, set AI_REAL_MODEL_TIMEOUT_MS and raise GuideChat's 12s client abort together (grill defect #9). Then update QA-MATRIX.md, WORK_LEDGER.md and this HANDOFF with the real result and commit.
Guardrails: Truline only; bunx never npx; Playwright only http://localhost:3100 workers=1 and warm the Neon pool first; neonctl needs --org-id org-soft-forest-80534150 --project-id rapid-haze-29688965; never print secrets; leave Constance self-writes uncommitted and never git add -A; .ts/.tsx edits go through `constance-worker-wrap codex-worker` and you vet the diff; STOP only for KICKOFF §6.
```
