# ISSUE-007 handoff — Access seam: entitlements + ledger + caps (VAL-035)

## Completed work

- Worker slice (codex gpt-5.6-sol, workspace-write): `db/migrations/0004_access.sql` (usage_reservations, anon_usage, global_usage — all RLS-enabled, privileged-only with documented denials), `src/server/accessConfig.ts` (versioned frozen config, ACCESS_* env-name overrides), `src/server/access.ts` (checkAccess / reserveUsage / reconcileUsage / expireStaleReservations; per-key pg advisory xact locks for concurrency; UTC dayUtc; banner enum; NO gateway import — the seam is the future sole gateway caller), unit + 8 integration tests.
- **Bug found by orchestrator debugging, fixed via bounded codex slice:** `bumpAnon`'s `INSERT … ON CONFLICT DO UPDATE` threw on negative deltas because Postgres evaluates the `tokens >= 0` CHECK on the proposed INSERT tuple *before* ON CONFLICT resolution; the seam's catch masked it as `banner: offline` refusals on any reserve following a reservation release. Fix: INSERT arm clamps `GREATEST(0, $4)`, UPDATE arm keeps the raw delta. (Probes preserved the diagnosis chain in-session; scratch files cleaned.)

## Evidence

- `evidence/ISSUE-007/VAL-035-ledger-caps.txt` — 8/8 integration tests green on Neon branch rls-test: concurrency exact-2-of-5, shared cross-surface ledger, reconciliation + idempotent double-reconcile, UTC rollover, cap=0 banners, multi-anon IP aggregate, global hard cap, expiry release.
- `evidence/ISSUE-007/VAL-001-gate.txt` — typecheck/lint/test/build exit 0.
- Fresh-context validator (codex sol, read-only): 6/6 criteria PASS.

## Issues / surprises discovered

- Postgres CHECK-before-ON-CONFLICT semantics (above) — worth remembering for every counter table with a non-negativity CHECK.
- The seam's broad `catch → offline` masks real defects; acceptable per contract (fail-closed) but debugging requires bypassing it. Consider structured error logging when the gateway client lands (ISSUE-008).

## Unresolved work

- None for this issue.

## Next Context Slice

ISSUE-008 — AI Gateway client + fallback chain + drill harness (first act: verify AI SDK v6 GA status, design-doc O3).
