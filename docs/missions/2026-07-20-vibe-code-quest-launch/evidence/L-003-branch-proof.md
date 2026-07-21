# L-003 — Disposable Neon XP/RLS proof

**UTC start:** 2026-07-21T20:51:01.081Z
**UTC close:** 2026-07-21T20:51:14.990Z
**Result:** PASS

## Disposable Neon branch

- name: `vibe-launch-l003-2026-07-21T20-51-01-079Z`
- id: `br-summer-math-at3m4811`
- parent: `main` (`br-raspy-bread-atcew3is`)
- role: `neondb_owner`
- migrations: exit 0 — applied 0009_xp.sql
- deleted: yes (verified absent from branches list)

## Post-migrate probe (no secrets)

```json
{
  "xp_awards": "xp_awards",
  "migrated_0009": true,
  "mig_count": 9,
  "can_select": true,
  "can_insert": true,
  "can_update": false,
  "can_delete": false,
  "award_rows": 438,
  "weekly_window_rows": 0
}
```

## Tests

1. `src/__tests__/xp.integration.test.ts` — table, privileges, idempotent applyXpAwards to 100, atomic progress+award path, RLS own-row only, CHECK reject
2. `src/__tests__/beatProgress.integration.test.ts` — regression that 0009 did not break GREATEST/OR/stamp merge (incl. concurrent race)

## Results

- xp.integration exit: 0
- xp.integration passed: 1
- beatProgress.integration exit: 0
- beatProgress.integration passed: 1
- failure_reason: none

## Secret hygiene

- connection string captured in process memory only
- not printed, not written to evidence, not committed
- `TEST_DATABASE_URL` unset after process exit

## Constance

- destructive branch delete checked before execution (ownership_verified=true, created_this_run=true, external_spend_usd=0)
