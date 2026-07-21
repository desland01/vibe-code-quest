# KICKOFF — Vibe Code Quest launch mission (2026-07-20)

**Mission:** take code-tutor from its completed engagement-v2 pilot state to the fully
gamified, free, open-source, production-deployed **"Vibe Code Quest by Truline"** —
a marketing asset demonstrating what Truline (https://truline.io) + Constance tooling
can build with a no-code founder. Full AFK execution; every stop condition is listed in §6.

**Authorization:** owner (Desmond) decisions recorded 2026-07-20 in this file, the
WORK_LEDGER, and Constance user-decision constants. This mission is the amendment path
(Amendment A4) for the engagement-v2 contract — that contract file itself stays frozen
and unmodified (Constance R001).

---

## 1. Inherited law (unchanged — read these first)

1. `docs/missions/2026-07-19-code-tutor-engagement-v2/DESIGN_CONTRACT.md` — **still the
   design law** for beat grammar (§4), motion vocabulary (§6), visual tokens (§7),
   persistence model (§8), AI role (§9), accessibility (§10), analytics (§11).
   Frozen; never edit it.
2. `docs/missions/2026-07-19-code-tutor-engagement-v2/HANDOFF.md` — completed state
   (E-000→E-005 all shipped; gates green at `d30ae5f`).
3. `docs/missions/2026-07-19-code-tutor-engagement-v2/QA-MATRIX.md` — honest gaps.
4. Project `CLAUDE.md`/`AGENTS.md` + Constance: run `constance session-start` at every
   session start and operate inside the printed constants. Gates before finalizing:
   `npm run typecheck` · `npm run lint` · `npm run test` · `npm run build` (R008–R011).
   Update `WORK_LEDGER.md` with dated entries (R012/R013); never delete past entries (R018).

**Constants that still bind hard:** progress persists to the `progress` table only
(R019); back-review writes nothing (R020); monotonic `GREATEST` merge (R021–R023);
one `quiz_completed` per graded attempt (R024–R026); beat registry server-side, client
gets only the selected landmark's beats (R027–R028); BeatPlayer motion is CSS `steps()`
only (R029); region progress renders 6 pips (R030); GuideChat stays an optional
non-blocking side rail and completion works with guide APIs blocked (R035–R036).

## 2. Amendment A4 — owner decisions of 2026-07-20 (supersede where they conflict)

| # | Decision |
|---|---|
| A4.1 | **Factory before study.** The 48-landmark beat factory builds NOW. The 5–8 founder usability study moves post-launch as iteration input, not authorization. |
| A4.2 | **Free + open source.** No paywall. Stripe gating removed from the user path; billing seam stays dormant behind its existing "unconfigured" graceful path (do not delete the code). Public GitHub repo under **MIT license**. |
| A4.3 | **Name.** Public product name string is exactly **"Vibe Code Quest by Truline"** ("Vibe Code Quest" standalone where the full string is too long; "by Truline" links https://truline.io). Deploys on the existing Vercel project URL; custom domain is a later owner step. **Amended 2026-07-21:** owner corrected brand spelling Truline (never Trueline). |
| A4.4 | **Leaderboard authorized** (overrides engagement-v2 forbidden pattern #5 by explicit owner decision). Design constraints in §4. New API routes allowed for it. |
| A4.5 | **Ship everything:** XP, collectible pixel props, map-canvas glow, leaderboard. **Streaks stay excluded.** No lives/timers/fake urgency/sound — the rest of the forbidden-pattern table (§2 of the design contract) still holds. |
| A4.6 | **Production deploy authorized** from this mission (Vercel project `code-tutor`, already public). |
| A4.7 | **Legal:** ship the drafted Terms/Privacy pages adapted for a free product (remove payment/refund obligations language), but **keep the draft-review warnings visible** until a lawyer signs off. Never remove those warnings in this mission. |
| A4.8 | **AI cost posture:** hosted guide default model becomes **Kimi K2** via the existing gateway transport seam (ISSUE-008 made model strings config — this is config, not code). Existing hard caps + per-IP/device throttles (ISSUE-007) stay active with conservative production values. Self-hosters bring their own key via env; document it. |
| A4.9 | **Self-host story:** the app must run playable with `DATABASE_URL` unset — localStorage-only progress, share/cross-device-resume/leaderboard surfaces hidden gracefully. `git clone && npm install && npm run dev` works for a no-code founder with zero infra. |
| A4.10 | **Hosted DB stays Neon** (leaderboard requires it). Disposable Neon branch authorized for the live SQL concurrency proof. |

## 3. Issue spine (execute in order; commit per slice on main with gates green)

- **L-001 — Live SQL proof.** Create a disposable Neon branch, set `TEST_DATABASE_URL`,
  run the guarded concurrency integration test live (E-001 carryover), record evidence
  in QA-MATRIX, delete the branch. Closes the last honest gap in the progress-merge story.
- **L-002 — Beat factory.** Author beat sequences for the remaining 46 landmarks
  (2 of 48 exist: `git/commits-as-checkpoints`, `security/trust-boundaries`).
  **Copy loyalty is absolute:** beats derive strictly from each landmark's canonical
  fields (`hook`, `definition`, `example`, `when_to_use`, `tradeoffs`, `gotchas`,
  `vibe_coder_default`, `quiz`) — no new facts, no LLM-invented content. 5–8 beats each,
  one focal action per screen, deterministic grading, per-option feedback, ≤4 choices.
  Work region-by-region (8 regions); after each region: typecheck + unit + build
  (manifest validates every sequence) + one Playwright spot-check of a landmark in that
  region. Canonical landmark files and VOICE.md are never edited.
- **L-003 — XP.** Competence-indexed points (correct beat interactions + stamps; zero
  penalties, zero decay). Server-derived from progress rows — never client-authoritative.
  Personal XP counter in the map HUD, cozy-pixel styling. Extend the typed analytics
  seam (4 files, Amendment A3 pattern) for any new events.
- **L-004 — Leaderboard.** §4 design constraints. New route(s) allowed. Ranked by XP;
  weekly + all-time boards; top-N plus your own rank always visible. Opt-in via a
  user-chosen handle (length-capped, sanitized, no email/PII display). Server-derived
  from progress/XP rows so scores can't be forged client-side; existing IP/device
  throttles cover write abuse. Self-hosted instances never write to the hosted board.
- **L-005 — Collectibles + map glow.** Per-landmark collectible pixel prop granted at
  stamp + a collection shelf surface; stamped landmarks glow on the region map.
  Comps-gate this slice the way E-002 was gated (render comps, judge desktop+mobile,
  commit the judge record) before building — R007's design-artifact discipline applies
  to map visuals. Reduced-motion fallbacks per the motion table; celebration budget
  still one stamp + one glow per landmark.
- **L-006 — Free-tier conversion.** Remove paywall gating from the user path (guide
  rail free within caps); billing code stays dormant behind unconfigured-Stripe path;
  keep fixture tests passing or skip-guard them explicitly.
- **L-007 — Rebrand.** "Vibe Code Quest by Truline" across metadata, OG/share cards,
  header, README; "by Truline" footer attribution linking https://truline.io plus a
  "governed by Constance" mention. Legal pages adapted per A4.7 (warnings stay).
- **L-008 — Self-host + OSS packaging.** A4.9 no-DB mode; `.env.example` with BYO-key
  docs (gateway key, `DATABASE_URL` optional, `AUTH_SECRET`); README overhaul (what it
  is, play link, self-host quickstart, architecture tour, Truline/Constance story);
  MIT `LICENSE`; secret scan of full git history before publish (`gitleaks` or
  equivalent read-only tool); then create/publish the public GitHub repo and push.
- **L-009 — Guide model swap.** Hosted default → Kimi K2 through the gateway seam;
  conservative production cap values; verify the offline/blocked-API path still
  completes landmarks (R036).
- **L-010 — Production deploy.** Vercel prod deploy: env vars via REST (never
  `vercel env add` stdin), mint `AI_DRILL_SECRET` fresh (full-scope, 600-perm storage
  rule), production `DATABASE_URL` (Neon), gateway key. Post-deploy smoke QA on the
  live URL at desktop + mobile widths (visual proof required — build ≠ visual proof):
  play a full landmark to stamp, leaderboard opt-in + rank render, share card OG image,
  reduced-motion pass, keyboard-only pass.
- **L-011 — Closeout.** QA-MATRIX updated; usability protocol repointed to post-launch;
  HANDOFF for this mission; WORK_LEDGER entries; final gate evidence recorded.

## 4. Leaderboard design constraints (owner-specified, verbatim intent)

The ADHD read: highly sensitive to criticism, loves competition. Therefore:

- **Overtly positive no matter what.** Every rank state gets celebratory or warm copy.
  Climbing = dopamine ("You leapt 3 spots!"). Dropping = praise anyway ("Still in the
  top 12% — <name> had a big day, your quest continues"). Never show red/negative
  deltas, never "you lost your spot", never shame framing (`leaderboard_shame_copy ==
  false` is a locked constant).
- "Everyone's a winner" surface tone; competition is the pull, not the punishment.
- Opt-in with chosen handle; non-participants never see themselves ranked.
- No forced social comparison outside the leaderboard surface itself; the map/beat
  experience never references other players.

## 5. What is still forbidden

Streaks · lives · timers/fake urgency · sound · leaderboard shame copy · new motion
dependencies (CSS/WAAPI only) · editing canonical landmark content or VOICE.md ·
editing the frozen v2 DESIGN_CONTRACT.md · `profiles.lesson_progress` writes ·
removing legal draft warnings · deleting past WORK_LEDGER entries · touching
`~/.claude` global rules/skills.

## 6. Stop conditions (the ONLY reasons to stop and ask the owner)

1. A required credential is missing and cannot be minted with existing access
   (e.g., no GitHub auth for the public repo push, no Neon API access).
2. Spend beyond existing subscriptions/infra would exceed $5.
3. Custom-domain DNS (not in this mission — flag, don't block).
4. The secret-history scan (L-008) finds a real leaked secret — stop before publishing
   the repo and report it (scrub is an owner-visible decision).
5. Anything requiring a change to this packet's owner decisions.

Everything else — including test flakes (known: `landmark-formats.spec.ts` parallel-load
flake, passes solo, do NOT timeout-bump), foreign dirty files (Constance self-writes:
`CLAUDE.md`, `constants.md`, `.claude/*` — leave them alone, never commit them), and
ordinary engineering judgment — is yours to handle inside the constants.
