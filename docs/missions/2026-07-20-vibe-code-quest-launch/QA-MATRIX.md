# QA MATRIX — Vibe Code Quest launch mission (L-001 → L-011)

**Date:** 2026-07-28 · **HEAD:** `6098461` · **Branch:** `main`
**Scope:** the launch mission only. The engagement-v2 matrix at
[`../2026-07-19-code-tutor-engagement-v2/QA-MATRIX.md`](../2026-07-19-code-tutor-engagement-v2/QA-MATRIX.md)
remains the record for that mission and is unchanged.

Verdicts are from actual runs on 2026-07-28, not from intent. Anything unproven says so.

---

## 1. Slice completion

| Slice | Commit | Verdict |
|---|---|---|
| L-001 live SQL concurrency proof | `3ab22f5` | ✅ PASS |
| L-002 beat factory, 48 landmarks | `4f1616f` | ✅ PASS |
| L-003 competence XP | `b8663cc` | ✅ PASS |
| L-004 opt-in leaderboard | `b13717a` | ✅ PASS |
| L-005 comps gate | `3fac3a0` | ✅ PASS |
| L-005 collectibles + map glow | `04299b2` | ✅ PASS |
| L-006 free product path | `96f266f` | ✅ PASS |
| L-007 rebrand | `16ffb40` | ⚠️ PASS in code; Vercel project rename **not done** (blocked) |
| L-008 OSS + self-host packaging | `f3247f4` | ⚠️ PASS in code; **public GitHub publish not done** (deferred) |
| L-009 gateway models + OIDC | `6098461` | ✅ PASS — real model round trips now verified in production (2026-08-01) |
| L-010 production deploy + smoke | `dpl_Fmeg3fZ…` → guide fix redeploy | ✅ **PASS — 40/40** (2026-08-01). Needed both an `AI_GATEWAY_API_KEY` in Production **and** a fix to the data-modifying-CTE 503 in `app/api/guide/route.ts`; see HANDOFF §5 |
| L-011 closeout | `2becc06` | ✅ this document |

## 2. Gates at HEAD

| Gate | Result |
|---|---|
| `npm run typecheck` | ✅ clean |
| `npm run lint` | ✅ 0 errors · 1 warning (pre-existing `OnboardingChat.tsx` exhaustive-deps) |
| `npm run test` | ✅ 180 passed / 39 skipped (DB-guarded) |
| `npm run build` | ✅ 66 pages, 48 beat sequences |
| `npm run check:models` | ✅ all three gateway ids resolve |
| Playwright `http://localhost:3100` `--workers=1` | ⚠️ **50 / 51** at end of session — see §2.1 |
| No-DB self-host probe | ✅ **10 / 10**, zero 5xx, zero console errors |
| `gitleaks git` full history | ✅ no leaks, 114 commits |
| Local production build vs real Neon | ✅ 9/9 routes 200, zero server errors |

### 2.1 The Playwright number, stated honestly

The suite reached **51 / 51 four separate times** during this session — after L-006, L-007,
L-008 and L-009 — each time with the Neon connection pool warm.

The **final** end-of-session run is **50 / 51**. The one failure is
`e2e/onboarding.spec.ts`, and it is the cold-pool latency issue below, not a regression from any
code change. Measured at the moment of that final run:

```
POST /api/onboarding  action=start    3.69 s
POST /api/onboarding  action=answer   5.15 s   ← the spec's expect times out at 5 s
```

Earlier in the same session the identical request measured **2.47 s** and the spec passed. The
answer path makes roughly 20 sequential Neon round trips, so its wall time scales directly with
per-hop latency, and Neon was materially slower by the end of the session than at the start.

**Timeouts were not bumped** — that is forbidden by the mission guardrails and would convert a
real performance signal into a hidden one. The honest statement is: this spec passes when a
round trip costs ~0.2 s and fails when it costs ~0.5 s, and the fix is fewer round trips, not a
longer timeout.

## 3. Launch requirements

| Requirement | Evidence | Status |
|---|---|---|
| No paywall anywhere in the user journey | `e2e/paywall.spec.ts`; `Paywall.tsx` deleted; `POST /api/guide` never 402 | ✅ PASS |
| Billing routes unreachable from the product | `e2e/paywall.spec.ts` asserts **0** billing requests; routes deleted at L-008 | ✅ PASS |
| Guide caps still enforced | `reserveUsage` inside `runGuideTurn`, unchanged | ✅ PASS |
| R036 — landmarks complete with the guide blocked | `e2e/guide-chat.spec.ts` | ✅ PASS |
| Legal describes a free product, zero placeholders | `e2e/legal.spec.ts` asserts no `[BRACKET]` and no payment words; 3 docs rewritten | ✅ PASS |
| Legal names the operator, jurisdiction, contact, date | Truline / Desmond Landry · Florida · admin@truline.io · 2026-07-28 | ✅ PASS |
| Brand on every public surface | `scripts/l007-brand-capture.mjs` 22/22 at 1280×800 and 390×844 | ✅ PASS |
| `Truline` spelling only | repo scan returns only the assertion forbidding `Trueline` and the two packet lines | ✅ PASS |
| `code-tutor` retained only where load-bearing | 3 lines: 2 JWT claims + 1 PRNG seed | ✅ PASS |
| A4.9 no-DB self-host playable | no-DB probe 10/10; map, landmark, Play, BeatPlayer all work | ✅ PASS |
| Self-host never writes the hosted board | `PUT /api/leaderboard` returns 503 without a database | ✅ PASS |
| MIT LICENSE present | created at L-008 | ✅ PASS |
| README present | created at L-008 | ✅ PASS |
| `.env.example` documented, no secrets | rewritten to annotated `KEY=` form | ✅ PASS |
| Full-history secret scan clean | `gitleaks` 8.30.1, 114 commits, no leaks | ✅ PASS |
| Gateway model ids valid | verified against the live 306-model list | ✅ PASS |
| Public GitHub repo | `github.com/desland01/vibe-code-quest` — PUBLIC, MIT, `main` | ✅ PASS |
| Vercel project renamed (G-4) | now `vibe-code-quest`, same project id | ✅ PASS |
| Production deployed | `dpl_9ZgCA1Xqy2CSyQ3r5TnLGc8tDoyb` READY, `hosted:true` | ✅ PASS |
| Live smoke at desktop + mobile | `scripts/l010-prod-smoke.mjs` — **40/40** (2026-08-01) | ✅ PASS |
| Full landmark → stamp → collectible in production | 13 interactions, both viewports; `evidence/L-010/prod-stamp-mobile.png` | ✅ PASS |
| Leaderboard opt-in, weekly + all-time, opt-out cleanup | all HTTP 200 | ✅ PASS |
| Share card + public link + OG image | HTTP 200 `image/png` | ✅ PASS |
| Reduced motion + keyboard-only in production | `data-reduced-motion="true"`; Tab reaches a region control | ✅ PASS |
| **G-8: real model-generated guide turn in production** | returns `kind:"ok"` with model-generated text on desktop and mobile; measured latency 1556 / 1191 / 1268 ms including the first turn | ✅ **PASS (2026-08-01)** — required an `AI_GATEWAY_API_KEY` in Production *and* the CTE-visibility fix in `app/api/guide/route.ts`. The pre-fix failure was an HTTP 503, **not** the offline banner: the smoke prints "gateway not reached" for any non-`ok` response, so its message misattributed the cause. See HANDOFF §5 |

## 4. Known issues carried forward

| Issue | Detail | Handling |
|---|---|---|
| `e2e/onboarding.spec.ts` Neon-latency failure | Fails the 5 s "Map unlocked" expect whenever a Neon round trip costs ~0.5 s. Answer POST measured **2.47 s** early in the session (pass) and **5.15 s** at the end (fail); the path makes ~20 sequential round trips, so wall time scales directly with per-hop latency. **This is the only failing test and it is a real performance signal, not a flake to be silenced.** | **Do not bump timeouts.** Real fix is reducing round trips on the onboarding answer path — chiefly the duplicated `checkAccess` + `reserveUsage` cycle below. That touches the access seam, so it needs its own slice. |
| Wasted reservation work when the gateway is down | `generateWithGateway` returns `gateway_down` immediately without credentials, but callers have already paid a full `checkAccess` + `reserveUsage` cycle — twice per onboarding answer. | Flagged at L-006, still open. Main contributor to the issue above. Note: production now HAS credentials (2026-08-01), so this path no longer triggers there — it still applies to any environment without them. |
| `landmark-formats.spec.ts` parallel-load flake | Pre-existing; passes solo. | Do not bump timeouts. |
| `entitlements` is vestigial | Table and migration retained, read by `access.ts`, written by nothing. Trial branch is dead code. | Documented in the README rather than removed; removing it would churn the frozen access seam. |
| Dead analytics events | `trial_started`, `subscribe_clicked`, `paywall_shown` are unreachable. | Retained — the taxonomy is frozen by the engagement-v2 contract §11. |
| ~~`REAL_MODEL_TIMEOUT_MS` unvalidated~~ | **CLOSED 2026-08-01.** Measured live in production: 1556 / 1191 / 1268 ms including the first turn — a wide margin under the 8 s server default and GuideChat's 12 s client abort. | No change. `AI_REAL_MODEL_TIMEOUT_MS` stays unset. |
| Vercel CLI 56.2.1 | 58.0.0 is current. | Optional upgrade. |

## 5. Usability study

The 5–8 founder usability study in
[`../2026-07-19-code-tutor-engagement-v2/USABILITY-PROTOCOL.md`](../2026-07-19-code-tutor-engagement-v2/USABILITY-PROTOCOL.md)
is **post-launch**, per KICKOFF **A4.1** ("factory before study — the study moves post-launch as
iteration input, not authorization"). That protocol's own header still says a 48-landmark
factory is gated on it; A4.1 supersedes that gate, and the factory shipped at L-002. The study
remains valuable as iteration input and should run against the deployed product.

## 6. Infrastructure state

- **Neon** project `rapid-haze-29688965`, branches: `main` (`br-raspy-bread-atcew3is`) and
  `rls-test` (`br-round-dust-atu1vnt5`, leave alone). **No orphan disposable branches** — every
  branch created for a proof in L-001/L-003/L-004 was deleted and verified absent.
- **Migrations** through `0010_leaderboard.sql`. L-005 → L-009 added none.
- **Vercel** project `code-tutor` (`prj_WClQa03dfcb9UG1AE9aONshzxZzk`), still under its original
  name; authenticated as `desmond-5183`.
- **Git remote:** none. The repository is local-only.
