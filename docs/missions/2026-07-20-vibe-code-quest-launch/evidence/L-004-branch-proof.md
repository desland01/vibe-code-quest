# L-004 — Disposable Neon leaderboard proof

**UTC start:** 2026-07-24T14:38:24.123Z
**UTC close:** 2026-07-24T14:38:51.791Z
**Result:** PASS

## Disposable Neon branch

- name: `vibe-launch-l004-2026-07-24T14-38-24-121Z`
- id: `br-sweet-glitter-atu37lne`
- parent: `main` (`br-raspy-bread-atcew3is`)
- role: `neondb_owner`
- migrations: exit 0 — applied 0010_leaderboard.sql
- deleted: yes (verified absent from branches list)

## Post-migrate probe (no secrets)

```json
{
  "leaderboard_entries": "leaderboard_entries",
  "migrated_0010": true,
  "mig_count": 10,
  "can_select": true,
  "can_insert": true,
  "can_update": true,
  "can_delete": false,
  "rls_enabled": true,
  "partial_unique_index": true,
  "security_definer": true,
  "app_user_exec": true,
  "public_exec": false,
  "leaderboard_write_limits": "leaderboard_write_limits",
  "wl_rls_enabled": true,
  "wl_can_select": false,
  "wl_can_insert": false,
  "wl_can_update": false,
  "wl_can_delete": false,
  "wl_security_definer": true,
  "wl_app_user_exec": true,
  "wl_public_exec": false,
  "wl_window_index": true
}
```

## Tests

1. `src/__tests__/leaderboard.integration.test.ts` — table, privileges, RLS, SECURITY DEFINER, partial unique index, weekly/all-time, soft opt-out, reclaim, cooldown, concurrent mutate
2. `src/__tests__/xp.integration.test.ts` — regression that 0010 did not break XP awards

## Results

- leaderboard.integration exit: 0
- leaderboard.integration passed: 11
- xp.integration exit: 0
- xp.integration passed: 6
- failure_reason: none

## Secret hygiene

- connection string captured in process memory only
- not printed, not written to evidence, not committed
- `TEST_DATABASE_URL` unset after process exit

## Constance

- destructive branch delete checked before execution (ownership_verified=true, created_this_run=true, external_spend_usd=0)
