# GRILL-KICKOFF — harden the packet, then finish the build

**Written:** 2026-07-25 · **Repo:** `/Users/thebeast/code-tutor` · **Branch:** `main` · **HEAD:** `04299b2`

Two phases, in order:

1. **Phase 1 — grill (owner at keyboard).** Run `/grill-with-docs` against this packet and close agenda G-1…G-8 below. `grill-with-docs` is interactive: one question at a time, waiting for an answer.
2. **Phase 2 — AFK build.** Finish L-006, then L-007 → L-011 in packet order. **The closed grill IS the execution approval** (CLAUDE.md, 2026-07-24) — do not re-ask before executing.

Per-slice detail lives in `EXECUTION_PLAN.md`; stop conditions in `KICKOFF.md` §6. This file does not restate them.

---

## 1. Ground truth (verified 2026-07-25, not from memory)

| Item | State |
|---|---|
| L-001 → L-003 | Committed `3ab22f5`, `4f1616f`, `b8663cc`+`28b5aa3` |
| L-004 opt-in leaderboard | Closed `b13717a` — disposable proof PASS + main Neon `0010` + 48/48 e2e |
| L-005 comps → impl | Closed `3fac3a0` → `04299b2` — collectibles + map glow, 50/50 e2e |
| **L-006 free product path** | **MID-SLICE, uncommitted** (see §2) |
| L-007 → L-011 | Not started |
| Main Neon | Migrations through `0010_leaderboard.sql` |

### Credentials (checked by presence, never printed)

| Credential | State | Consequence |
|---|---|---|
| GitHub (`desland01`) | ✅ authed | L-008 publish can proceed |
| Vercel (`desmond-5183`) | ✅ authed | L-010 deploy possible **if authorized** (G-7) |
| Neon | ✅ authed | ⚠ interactive org picker — see guardrails |
| `DATABASE_URL` | ✅ present | — |
| `AI_GATEWAY_API_KEY` | ❌ **ABSENT** | Blocks live L-009 verification (G-6) |
| `AI_DRILL_SECRET` | ❌ absent | Expected — L-010 mints it fresh |

---

## 2. Dirty tree — already classified

**Mission-owned L-006 work-in-progress — KEEP and finish in L-006.** Matches the free-product path set exactly:

```
D  src/components/Paywall.tsx          ← deletion is STAGED
 M src/server/access.ts
 M app/api/guide/route.ts
 M src/components/landmark/GuideChat.tsx
 M src/__tests__/access.test.ts
 M e2e/paywall.spec.ts
```

**Foreign dirt — leave alone, never commit:** `CLAUDE.md`, `constants.md`, `constants.md.reground-log.jsonl`, `.claude/*`, `.agents/*`, `next-env.d.ts`, content-manifest churn.

Re-verify with `git status --porcelain` on turn one and report before editing.

---

## 3. Phase 1 — grill agenda (close every item)

Each item states the verified fact, the question, and a recommended answer.

### G-1 — Legal copy contradicts the free product ⚠ highest priority

**Fact:** `src/content/legal/{terms,refund,privacy}.ts` contain **54 references** to a paid monthly subscription, a 14-day trial, refunds, and providing a Stripe payment method (terms 15, refund 32, privacy 7). Verbatim: *"A paid monthly subscription begins only after you explicitly subscribe and provide a payment method through Stripe."* L-006 makes the product free; L-008 publishes it publicly; L-010 deploys it to production.

**Question:** what does the legal copy say at launch?

**Recommendation:** rewrite the three legal docs inside L-006 — the same slice that makes it free — to describe a free, no-payment educational product. Replace the refund policy with a short "nothing is billed, so there is nothing to refund" statement rather than deleting the route (footer links stay valid). Shipping Terms that promise a subscription you don't sell is the highest-embarrassment defect available in a public marketing asset.

### G-2 — Draft banners + bracketed placeholders go public

**Fact:** every legal page carries "⚠ Draft — pending legal review" plus `[COMPANY LEGAL NAME]`, `[JURISDICTION]`, `[CONTACT EMAIL]`, `[LAST UPDATED DATE]`. HITL-LEGAL was never closed in the predecessor mission.

**Question:** fill them, or ship honest drafts?

**Recommendation:** fill entity/contact with Truline details and set the date; keep one plain "this is not legal advice" line. Risk is genuinely low (free, no payments, email optional) — but bracketed placeholders on a public asset read as unfinished work.

### G-3 — Billing code: dormant or stripped before OSS?

**Fact:** `src/server/billing.ts`, `src/server/stripe.ts`, `app/api/billing/{checkout,cancel}`, `app/api/stripe/webhook` all still exist. Plan §5 says keep dormant when Stripe is unconfigured.

**Question:** publish dormant Stripe scaffolding, or strip it?

**Recommendation:** keep dormant through L-006 (smaller, reversible diff; fixtures already cover it), then strip at L-008 packaging. Dead payment code in a free OSS project invites "is this paid? abandoned?" confusion.

### G-4 — Rebrand blast radius

**Fact:** Vercel project is `code-tutor`; production URL will read `code-tutor-*.vercel.app`; `package.json` name is `code-tutor`.

**Question:** what actually renames?

**Recommendation:** rename **user-visible surfaces only** — metadata/title, header, footer, README, share page, OG image, legal. Leave the Vercel project id and repo directory alone (renaming mid-mission risks the deploy pipeline). Public GitHub repo name: `vibe-code-quest`. Custom domain stays out of scope per KICKOFF §6.3 (flag, don't block) — accept the `code-tutor-*.vercel.app` URL at launch unless you say otherwise.

### G-5 — What becomes public in L-008 (irreversible)

**Fact:** full git history goes public. The repo carries three mission packets, evidence, `WORK_LEDGER.md` with owner decisions, `.claude/` commands, and Constance references.

**Question:** publish everything, or a trimmed set?

**Recommendation:** publish code + README + LICENSE + `.env.example` + the mission packets — they are the proof-of-method that makes this a Truline marketing asset. The `gitleaks` full-history scan gates the push; a real hit is a hard STOP (§6.4), not a judgment call.

### G-6 — L-009 Kimi K2 with no gateway key

**Fact:** `AI_GATEWAY_API_KEY` is absent. The seam fast-fails to `gateway_down`, so the guide serves canonical offline text and the product stays fully playable.

**Question:** provide a key now, or accept a config-only swap?

**Recommendation:** paste a Vercel AI Gateway key at the grill → L-009 gets live verification and L-010 smoke covers it. No key → L-009 = confirmed model id + config swap + mock proof, guide ships in offline-fallback (honest, playable). Either way: **do not invent a model slug** (plan §8.1).

### G-7 — L-010 production deploy authorization ⚠ will stall the AFK run

**Fact:** in the predecessor mission a `target:production` deploy was **denied by the session permission classifier**. Vercel is authed.

**Question:** how does production actually get deployed?

**Recommendation:** authorize production deploy explicitly during the grill (the grill is the approval) and/or allowlist `vercel deploy`. Without it the AFK run completes L-006 → L-009 and halts at L-010.

### G-8 — Confirm done-means still holds

**Recommendation:** after G-1…G-7, confirm `EXECUTION_PLAN.md` §1 is unchanged — especially #4 (public only after a clean secret scan) and #5 (deployed **and** visually inspected at desktop + mobile; a green build is not visual proof).

---

## 4. Phase 2 — AFK build order

`L-006` (finish) → `L-007` rebrand → `L-008` OSS + self-host → `L-009` Kimi K2 → `L-010` production deploy → `L-011` closeout.

Per slice: dated evidence + `WORK_LEDGER.md` entry + four gates green (`typecheck`, `lint`, `test`, `build`) + **one scoped commit of that slice's paths only**. Commit message sequence is fixed in `EXECUTION_PLAN.md` §2.

---

## 5. Guardrails (turn-one hazards)

- **Never `git add -A`** — it would commit Constance self-writes. Stage explicit mission paths only.
- **`neonctl` opens an interactive org picker and will hang an unattended run** → always pass `--org-id org-soft-forest-80534150`.
- `bunx`, never `npx`.
- Playwright origin `http://localhost:3100` only (never `127.0.0.1`); full suite `--workers=1`.
- Known flake: `landmark-formats.spec.ts` under parallel load — passes solo, do **not** bump timeouts.
- "Truline" spelling only on public surfaces; historical ledger lines keep their original spelling.
- Never print secret values. Mint `AI_DRILL_SECRET` into 600-perm storage.
- **STOP only for `KICKOFF.md` §6.**

---

## 6. Kickoff

```text
Harden and finish the Vibe Code Quest launch mission at /Users/thebeast/code-tutor (branch main, HEAD 04299b2).
Read /Users/thebeast/code-tutor/docs/missions/2026-07-20-vibe-code-quest-launch/GRILL-KICKOFF.md first (verified state + grill agenda G-1..G-8), then EXECUTION_PLAN.md (per-slice detail) and KICKOFF.md §6 (stop conditions).
FIRST: run `node /Users/thebeast/Constance/dist/constance.mjs session-start`, then re-verify and report the dirty tree — the 6 mission-owned L-006 files are this mission's WIP to finish, Constance self-writes stay uncommitted, and never `git add -A`.
THEN invoke /grill-with-docs and walk G-1..G-8 with me one question at a time, with your recommendation each time, until every item is closed.
When the grill closes, treat it as execution approval — do NOT re-ask: finish L-006, then L-007 through L-011 in packet order, each with dated evidence, a WORK_LEDGER entry, four green gates, and one scoped commit.
Guardrails: bunx never npx; Playwright on http://localhost:3100 with --workers=1; neonctl needs --org-id org-soft-forest-80534150 or it hangs; never print secrets; STOP only for KICKOFF.md §6.
```
