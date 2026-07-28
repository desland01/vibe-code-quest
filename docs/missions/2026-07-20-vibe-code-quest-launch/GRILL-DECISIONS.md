# GRILL-DECISIONS — closed agenda G-1…G-7, open G-8

**Grill held:** 2026-07-26 · **Verified again:** 2026-07-28
**Repo:** `/Users/thebeast/code-tutor` · **Branch:** `main` · **HEAD:** `0ddf784`

Answers to the agenda posed in `GRILL-KICKOFF.md` §3. Where an answer changes a
recorded owner decision, the superseded amendment is named explicitly.

---

## 1. Verified state (2026-07-28, from disk)

| Item | State |
|---|---|
| HEAD | `0ddf784` — one commit past the packet's stated `04299b2` (that commit *is* GRILL-KICKOFF.md) |
| L-001 → L-005 | Committed |
| **L-006 free product path** | **MID-SLICE, uncommitted** — unchanged since the grill |
| L-007 → L-011 | Not started |
| Git remote | **None** — repo is local-only; L-008 creates the GitHub remote from scratch |
| `AI_GATEWAY_API_KEY` | **ABSENT** — blocks the live-proof path chosen in G-6 |
| Vercel auth | ✅ `desmond-5183` |
| Deploy permission | ✅ allowlisted in `.claude/settings.local.json` (gitignored, never committed) |

L-006 working set (unchanged, 232 insertions / 61 deletions):

```
D  src/components/Paywall.tsx          ← deletion STAGED; zero dangling references
 M src/server/access.ts
 M app/api/guide/route.ts
 M src/components/landmark/GuideChat.tsx
 M src/__tests__/access.test.ts
 M e2e/paywall.spec.ts
```

Foreign dirt — never stage: `CLAUDE.md`, `constants.md`, `constants.md.reground-log.jsonl`,
`.claude/*`, `.agents/*`, `?? .claude/commands/constance-report.md`. **Never `git add -A`.**

---

## 2. Closed decisions

| # | Decision |
|---|---|
| **G-1** | **Rewrite all three legal docs inside L-006** to describe a free, no-payment product. Refund page becomes "nothing is billed, so there is nothing to refund" — keep the route so footer links stay valid. |
| **G-2** | Operator is **"Truline, operated by Desmond Landry"** (trade name; no LLC claimed). Governing law **Florida**. Contact `admin@truline.io`. Date the pages. **Drop the ⚠ draft banner**, keep one plain "this is not legal advice" line. |
| **G-3** | Billing stays **dormant through L-006**, **stripped at L-008** packaging. |
| **G-4** | Rebrand **user-visible surfaces only**. **Rename the Vercel project to `vibe-code-quest`** (safe: `.vercel/project.json` links by `projectId`, and nothing has launched). Public GitHub repo: `vibe-code-quest`. |
| **G-5** | **Publish everything, full history** — code, mission packets, WORK_LEDGER, Constance rules. Gated on a clean `gitleaks` full-history scan; a real hit is a hard STOP per KICKOFF §6.4. |
| **G-6** | Owner **provides `AI_GATEWAY_API_KEY`** so L-009 gets live verification. Owner sets it in `.env.local` directly; the agent never reads the value, only tests behavior. |
| **G-6b** | Guide models: executor **`openai/gpt-5.6-luna`**, advisor **`openai/gpt-5.6-sol`**, fallback **`openai/gpt-5.4-nano`**. |
| **G-7** | Deploy via **Vercel CLI at L-010**; permission allowlisted so the AFK run does not stall. |

### Superseded owner decisions

- **A4.7 AMENDED** (was: *"keep the draft-review warnings visible… never remove those warnings in this mission"*).
  Now: warnings removed, placeholders filled. Rationale: after G-1 the pages no longer promise a
  subscription, take payment, or owe refunds, so the risk the banner hedged has largely gone; bracketed
  placeholders on a public asset are the greater defect.
- **A4.8 AMENDED** (was: *"AI cost posture: hosted guide default model becomes Kimi K2"*).
  Now: OpenAI general family per G-6b. Rationale: A4.8's sole recorded justification was cost posture,
  and the measured gap is ~$6 per 1000 guide turns — the owner declined to trade quality for it.
  **EXECUTION_PLAN §2 commit #7 message changes** from `feat(launch): L-009 Kimi K2 guide default`
  to name the real models.

---

## 3. Defects and packet corrections found during the grill

1. **All three AI model slugs are invalid on the gateway** — `src/server/ai.ts:15-17` uses dashes
   (`anthropic/claude-sonnet-4-5`) where the gateway uses dots (`anthropic/claude-sonnet-4.5`).
   Verified against the public, no-auth `GET https://ai-gateway.vercel.sh/v1/models`.
   **Consequence: the AI guide has never executed a real request.** Every call would fail on
   unknown-model, fall through to an equally invalid fallback, and land in `gateway_down` →
   offline canonical text. The offline path is good enough that it masked the defect entirely.
   Fixed in L-009 regardless of the model choice.
2. **`code-tutor` is load-bearing in auth** — `src/lib/auth/session.ts:16-17` uses it as JWT
   `TOKEN_AUDIENCE` / `TOKEN_ISSUER`. **Do not rename**: it invalidates every existing session token.
3. **No root `README.md` and no `LICENSE`.** Plan §7 says "README overhaul" — both must be
   *created* in L-008, not edited.
4. **`gitleaks` is not installed** (nor trufflehog). L-008's secret-scan gate needs it —
   `brew install gitleaks` first. Free; not a stop condition.
5. **`.env.example` is a bare list of 28 variable names** with no `KEY=` form. L-008 should convert
   it to proper commented `KEY=` format.
6. **Legal payment references number 77, not 54** (terms 21 / refund 39 / privacy 17), counting
   occurrences rather than matching lines. Nine placeholder kinds, 26 instances.
7. **Stale worktree** at `.claude/worktrees/interesting-gates-7f6ac8/` is a full repo copy but is
   excluded via `.git/info/exclude` and untracked — it cannot leak into the public repo.
8. **The guide has two model tiers, not one** — `executor` per turn, `advisor` on escalation
   (cross-region or `[[LOW_CONFIDENCE]]`, capped at 3). L-009 as originally written named only one.
9. **`REAL_MODEL_TIMEOUT_MS = 8_000`** (`ai.ts:42`) — any reasoning-heavy model will routinely blow
   it and degrade silently to offline text. Raise it deliberately if a thinking model is ever chosen.

---

## 4. OPEN — must be answered before the AFK run closes

**G-8 — does "done means" gain a live-guide criterion?**

EXECUTION_PLAN §1's seven criteria are otherwise unchanged. But #5 ("deployed and visually inspected
at desktop + mobile") **cannot distinguish a working guide from a broken one** — a visual pass
succeeds while the guide silently serves offline text, which is exactly today's state. Options put to
the owner:

- **(recommended)** Extend #5: L-010 smoke must show a real guide turn returning model-generated text
  on the production URL — not the offline banner — captured as evidence.
- Keep §1 exactly as written.
- Recommended **plus** an escalation test forcing the advisor tier (`gpt-5.6-sol`) via a cross-region
  question, covering the `[[LOW_CONFIDENCE]]` contract.

---

## 5. Build order after the grill closes

`L-006` (finish: free path + legal rewrite) → `L-007` rebrand → `L-008` OSS + self-host + gitleaks +
README/LICENSE → `L-009` model fix + OpenAI defaults → `L-010` production deploy → `L-011` closeout.

Per slice: dated evidence + `WORK_LEDGER.md` entry + four green gates (`typecheck`, `lint`, `test`,
`build`) + **one scoped commit of that slice's paths only**.

Guardrails: `bunx` never `npx` · Playwright on `http://localhost:3100` only, full suite `--workers=1` ·
`neonctl` needs `--org-id org-soft-forest-80534150` or it hangs · never print secrets ·
known flake `landmark-formats.spec.ts` under parallel load, passes solo, do **not** bump timeouts ·
STOP only for KICKOFF §6.

---

## 6. Kickoff

```text
Finish the Vibe Code Quest launch mission at /Users/thebeast/code-tutor (branch main, HEAD 0ddf784).
Read /Users/thebeast/code-tutor/docs/missions/2026-07-20-vibe-code-quest-launch/GRILL-DECISIONS.md first (closed grill G-1..G-7, amendments to A4.7/A4.8, nine verified defects), then EXECUTION_PLAN.md for per-slice detail and KICKOFF.md §6 for stop conditions.
FIRST: run `node /Users/thebeast/Constance/dist/constance.mjs session-start`, then re-verify the dirty tree — the 6 mission-owned L-006 files are WIP to finish, Constance self-writes stay uncommitted, never `git add -A`.
The grill is closed and IS execution approval — do not re-ask. Answer G-8 (§4) only if the owner has not already; otherwise assume the recommended option and note it.
Then finish L-006 (free path + full legal rewrite per G-1/G-2), then L-007 through L-011 in packet order, each with dated evidence, a WORK_LEDGER entry, four green gates, and one scoped commit.
Guardrails: bunx never npx; Playwright on http://localhost:3100 with --workers=1; neonctl needs --org-id org-soft-forest-80534150; never print secrets; STOP only for KICKOFF.md §6.
```
