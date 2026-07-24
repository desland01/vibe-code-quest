import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';

import {
  LEADERBOARD_BOARD_SQL,
  LEADERBOARD_MUTATION_COOLDOWN_SECONDS,
  LEADERBOARD_OPTOUT_SQL,
  LEADERBOARD_OWN_SQL,
  LEADERBOARD_UPSERT_SQL,
  fetchLeaderboardBoard,
  lockLeaderboardProfile,
  mutationCooldownRemaining,
  registerLeaderboardWrite,
  upsertLeaderboardHandle,
} from '@/server/leaderboard';

const connectionString = process.env.TEST_DATABASE_URL;
const describeWithDatabase = connectionString ? describe : describe.skip;

if (!connectionString) {
  console.info('Skipping leaderboard SQL integration tests: TEST_DATABASE_URL is unset.');
}

async function asUser<T>(
  pool: pg.Pool,
  userId: string,
  fn: (client: pg.PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SET LOCAL ROLE app_user');
    await client.query(`SELECT set_config('app.user_id', $1, true)`, [userId]);
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/** Route-shaped mutation: lock → cooldown → upsert. Returns accepted|cooldown. */
async function mutateWithCooldown(
  pool: pg.Pool,
  userId: string,
  handle: string,
): Promise<{ kind: 'ok'; handle: string } | { kind: 'cooldown'; seconds: number }> {
  return asUser(pool, userId, async (client) => {
    await lockLeaderboardProfile(client, userId);
    const seconds = await mutationCooldownRemaining(client, userId, new Date());
    if (seconds > 0) return { kind: 'cooldown', seconds };
    const upserted = await upsertLeaderboardHandle(client, userId, handle);
    return { kind: 'ok', handle: upserted.handle };
  });
}

async function getOwn(client: pg.PoolClient, userId: string): Promise<string | null> {
  const r = await client.query<{ handle: string; opted_in: boolean }>(LEADERBOARD_OWN_SQL, [
    userId,
  ]);
  if (!r.rows[0]?.opted_in) return null;
  return r.rows[0].handle;
}

describeWithDatabase('L-004 leaderboard SQL + RLS', () => {
  const pool = new pg.Pool({ connectionString, max: 4 });
  const users = Array.from({ length: 10 }, () => randomUUID());
  const [
    userA,
    userB,
    userC,
    userD,
    userE,
    userF,
    userG,
    userH,
    userRace,
    userAnon,
  ] = users;

  beforeAll(async () => {
    await pool.query(
      `INSERT INTO profiles (id, email)
       SELECT fixture.id, fixture.id::text || '@lb.example.invalid'
       FROM unnest($1::uuid[]) AS fixture(id)
       ON CONFLICT (id) DO NOTHING`,
      [users],
    );
    await pool.query(`DELETE FROM leaderboard_entries WHERE profile_id = ANY($1::uuid[])`, [
      users,
    ]);
    await pool.query(`DELETE FROM xp_awards WHERE profile_id = ANY($1::uuid[])`, [users]);
  });

  afterAll(async () => {
    await pool.query(`DELETE FROM leaderboard_entries WHERE profile_id = ANY($1::uuid[])`, [
      users,
    ]);
    await pool.query(`DELETE FROM xp_awards WHERE profile_id = ANY($1::uuid[])`, [users]);
    await pool.query(`DELETE FROM profiles WHERE id = ANY($1::uuid[])`, [users]);
    await pool.end();
  });

  it('table + function exist with least privilege and SECURITY DEFINER', async () => {
    const reg = await pool.query(`SELECT to_regclass('public.leaderboard_entries') AS name`);
    expect(reg.rows[0].name).toBe('leaderboard_entries');

    const fn = await pool.query(`
      SELECT
        p.prosecdef AS security_definer,
        pg_get_userbyid(p.proowner) AS owner,
        has_function_privilege(
          'app_user',
          'public.leaderboard_board(text,integer)',
          'EXECUTE'
        ) AS app_user_exec,
        COALESCE((
          SELECT bool_or(a.privilege_type = 'EXECUTE' AND a.grantee = 0)
          FROM aclexplode(COALESCE(p.proacl, acldefault('f', p.proowner))) AS a
        ), false) AS public_exec
      FROM pg_proc p
      WHERE p.oid = to_regprocedure('public.leaderboard_board(text,integer)')
    `);
    expect(fn.rows).toHaveLength(1);
    expect(fn.rows[0].security_definer).toBe(true);
    expect(fn.rows[0].app_user_exec).toBe(true);
    expect(fn.rows[0].public_exec).toBe(false);

    const priv = await pool.query(`
      SELECT
        has_table_privilege('app_user', 'public.leaderboard_entries', 'SELECT') AS can_select,
        has_table_privilege('app_user', 'public.leaderboard_entries', 'INSERT') AS can_insert,
        has_table_privilege('app_user', 'public.leaderboard_entries', 'UPDATE') AS can_update,
        has_table_privilege('app_user', 'public.leaderboard_entries', 'DELETE') AS can_delete
    `);
    expect(priv.rows[0]).toMatchObject({
      can_select: true,
      can_insert: true,
      can_update: true,
      can_delete: false,
    });

    const idx = await pool.query(`
      SELECT indexdef FROM pg_indexes
      WHERE tablename = 'leaderboard_entries'
        AND indexname = 'leaderboard_entries_handle_lower_uidx'
    `);
    expect(idx.rows[0]?.indexdef).toMatch(/lower\(handle\)/i);
    expect(idx.rows[0]?.indexdef).toMatch(/opted_in\s*=\s*true/i);

    // Write-abuse limiter table: exists, RLS on, no app_user table privileges.
    const wl = await pool.query(`
      SELECT
        to_regclass('public.leaderboard_write_limits')::text AS name,
        (SELECT relrowsecurity FROM pg_class WHERE oid = 'public.leaderboard_write_limits'::regclass) AS rls_enabled,
        has_table_privilege('app_user', 'public.leaderboard_write_limits', 'SELECT') AS can_select,
        has_table_privilege('app_user', 'public.leaderboard_write_limits', 'INSERT') AS can_insert,
        has_table_privilege('app_user', 'public.leaderboard_write_limits', 'UPDATE') AS can_update,
        has_table_privilege('app_user', 'public.leaderboard_write_limits', 'DELETE') AS can_delete
    `);
    expect(wl.rows[0]).toMatchObject({
      name: 'leaderboard_write_limits',
      rls_enabled: true,
      can_select: false,
      can_insert: false,
      can_update: false,
      can_delete: false,
    });

    const regFn = await pool.query(`
      SELECT
        p.prosecdef AS security_definer,
        has_function_privilege(
          'app_user',
          'public.leaderboard_register_write(text,integer)',
          'EXECUTE'
        ) AS app_user_exec,
        COALESCE((
          SELECT bool_or(a.privilege_type = 'EXECUTE' AND a.grantee = 0)
          FROM aclexplode(COALESCE(p.proacl, acldefault('f', p.proowner))) AS a
        ), false) AS public_exec
      FROM pg_proc p
      WHERE p.oid = to_regprocedure('public.leaderboard_register_write(text,integer)')
    `);
    expect(regFn.rows).toHaveLength(1);
    expect(regFn.rows[0].security_definer).toBe(true);
    expect(regFn.rows[0].app_user_exec).toBe(true);
    expect(regFn.rows[0].public_exec).toBe(false);
  });

  it('HMAC write limiter: cap, invalid keys, independent buckets, atomic concurrency', async () => {
    const keyA = 'a'.repeat(64);
    const keyB = 'b'.repeat(64);
    const badKeys = ['short', 'G'.repeat(64), 'a'.repeat(63), 'a'.repeat(65), '', null];

    // Fresh windows for these fixture keys (owner connection).
    await pool.query(
      `DELETE FROM leaderboard_write_limits WHERE key_hash = ANY($1::text[])`,
      [[keyA, keyB]],
    );

    // Cap 2: true, true, false
    await expect(
      asUser(pool, userA, async (client) =>
        registerLeaderboardWrite(client, keyA, 2),
      ),
    ).resolves.toBe(true);
    await expect(
      asUser(pool, userA, async (client) =>
        registerLeaderboardWrite(client, keyA, 2),
      ),
    ).resolves.toBe(true);
    await expect(
      asUser(pool, userA, async (client) =>
        registerLeaderboardWrite(client, keyA, 2),
      ),
    ).resolves.toBe(false);

    // Different key is independent.
    await expect(
      asUser(pool, userB, async (client) =>
        registerLeaderboardWrite(client, keyB, 2),
      ),
    ).resolves.toBe(true);

    // Invalid keys return false and create no rows.
    for (const bad of badKeys) {
      const allowed = await asUser(pool, userA, async (client) => {
        const r = await client.query<{ allowed: boolean }>(
          `SELECT leaderboard_register_write($1, 2) AS allowed`,
          [bad],
        );
        return r.rows[0]?.allowed;
      });
      expect(allowed, String(bad)).toBe(false);
    }
    const badRows = await pool.query(
      `SELECT key_hash FROM leaderboard_write_limits
       WHERE key_hash NOT IN ($1, $2)`,
      [keyA, keyB],
    );
    // No non-hex/short keys should land; only our two fixture digests.
    expect(
      badRows.rows.every((r) => /^[0-9a-f]{64}$/.test(r.key_hash)),
    ).toBe(true);

    // Concurrent calls under cap 3: exactly 3 successes, final count 5+ (from prior 0 after wipe).
    const keyC = 'c'.repeat(64);
    await pool.query(`DELETE FROM leaderboard_write_limits WHERE key_hash = $1`, [keyC]);
    const concurrent = await Promise.all(
      Array.from({ length: 8 }, () =>
        asUser(pool, userC, async (client) =>
          registerLeaderboardWrite(client, keyC, 3),
        ),
      ),
    );
    expect(concurrent.filter(Boolean)).toHaveLength(3);
    expect(concurrent.filter((v) => !v)).toHaveLength(5);
    const countC = await pool.query<{ write_count: string }>(
      `SELECT write_count::text AS write_count FROM leaderboard_write_limits WHERE key_hash = $1`,
      [keyC],
    );
    expect(Number(countC.rows[0]?.write_count)).toBe(8);

    // Owner inspection: only hashes, never a raw test address string.
    const stored = await pool.query<{ key_hash: string }>(
      `SELECT key_hash FROM leaderboard_write_limits WHERE key_hash = ANY($1::text[])`,
      [[keyA, keyB, keyC]],
    );
    for (const row of stored.rows) {
      expect(row.key_hash).toMatch(/^[0-9a-f]{64}$/);
      expect(row.key_hash).not.toMatch(/203\.0\.113|session:|@/);
    }

    // Cleanup fixture limiter rows (owner).
    await pool.query(
      `DELETE FROM leaderboard_write_limits WHERE key_hash = ANY($1::text[])`,
      [[keyA, keyB, keyC]],
    );
  });

  it('RLS: app_user only sees own participation row', async () => {
    await asUser(pool, userA, async (client) => {
      await client.query(LEADERBOARD_UPSERT_SQL, [userA, 'AlphaOne']);
    });
    await asUser(pool, userB, async (client) => {
      await client.query(LEADERBOARD_UPSERT_SQL, [userB, 'BetaTwo']);
    });

    const aRows = await asUser(pool, userA, async (client) => {
      const r = await client.query(`SELECT handle FROM leaderboard_entries`);
      return r.rows.map((row) => row.handle);
    });
    expect(aRows).toEqual(['AlphaOne']);

    const bRows = await asUser(pool, userB, async (client) => {
      const r = await client.query(`SELECT handle FROM leaderboard_entries`);
      return r.rows.map((row) => row.handle);
    });
    expect(bRows).toEqual(['BetaTwo']);
  });

  it('board scores from xp_awards; weekly vs all_time; no PII columns', async () => {
    const preWeek = await pool.query(
      `SELECT ((date_trunc('week', now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC') - interval '1 day') AS ts`,
    );
    const pre = preWeek.rows[0].ts;
    await pool.query(
      `INSERT INTO xp_awards (profile_id, region, landmark, award_key, points, awarded_at)
       VALUES
         ($1, 'git', 'commits-as-checkpoints', 'landmark_stamped', 50, $3),
         ($2, 'git', 'branches-as-isolation', 'landmark_stamped', 50, now())
       ON CONFLICT DO NOTHING`,
      [userA, userB, pre],
    );

    const weekly = await asUser(pool, userA, async (client) => {
      return client.query(LEADERBOARD_BOARD_SQL, ['weekly', 25]);
    });
    for (const row of weekly.rows) {
      expect(Object.keys(row).sort()).toEqual(
        ['handle', 'is_self', 'is_top', 'points', 'rank'].sort(),
      );
      expect(JSON.stringify(row)).not.toMatch(/@|profile_id|email/i);
    }
    expect(weekly.rows.find((r) => r.handle === 'AlphaOne')?.points ?? null).toBe(0);
    expect(weekly.rows.find((r) => r.handle === 'BetaTwo')?.points).toBe(50);
    expect(weekly.rows.find((r) => r.handle === 'AlphaOne')?.is_self).toBe(true);

    const allTime = await asUser(pool, userA, async (client) => {
      return client.query(LEADERBOARD_BOARD_SQL, ['all_time', 25]);
    });
    expect(allTime.rows.find((r) => r.handle === 'AlphaOne')?.points).toBe(50);
    expect(allTime.rows.find((r) => r.handle === 'BetaTwo')?.points).toBe(50);

    // Anonymous / nil caller never gets is_self.
    const anon = await asUser(pool, userAnon, async (client) => {
      // Clear any accidental own row for this user; use empty board call as non-participant.
      return client.query(LEADERBOARD_BOARD_SQL, ['all_time', 25]);
    });
    // userAnon is not opted in — no self row.
    expect(anon.rows.every((r) => r.is_self === false)).toBe(true);
  });

  it('invalid period returns no rows at SQL level', async () => {
    const bad = await asUser(pool, userA, async (client) => {
      return client.query(LEADERBOARD_BOARD_SQL, ['monthly', 25]);
    });
    expect(bad.rows).toEqual([]);
  });

  it('RANK ties + own-beyond-N via is_top', async () => {
    const seed = [userC, userD, userE, userF, userG, userH];
    // Privileged fixture setup before any user txn.
    for (let i = 0; i < seed.length; i += 1) {
      const id = seed[i]!;
      await pool.query(
        `INSERT INTO leaderboard_entries (profile_id, handle, opted_in, updated_at)
         VALUES ($1, $2, true, now() - interval '2 minutes')
         ON CONFLICT (profile_id) DO UPDATE
           SET handle = EXCLUDED.handle, opted_in = true, updated_at = EXCLUDED.updated_at`,
        [id, `Runner${i}${id.slice(0, 4)}`],
      );
      await pool.query(
        `INSERT INTO xp_awards (profile_id, region, landmark, award_key, points, awarded_at)
         VALUES ($1, 'git', $2, 'scenario_solved', 15, now())
         ON CONFLICT DO NOTHING`,
        [id, `lm-${i}-${id.slice(0, 6)}`],
      );
    }
    for (const id of [userC, userD, userE, userF, userG]) {
      await pool.query(
        `INSERT INTO xp_awards (profile_id, region, landmark, award_key, points, awarded_at)
         VALUES ($1, 'security', $2, 'landmark_stamped', 50, now())
         ON CONFLICT DO NOTHING`,
        [id, `stamp-${id.slice(0, 8)}`],
      );
    }

    const board = await asUser(pool, userH, async (client) => {
      return fetchLeaderboardBoard(client, 'all_time', 3);
    });
    expect(board.entries.length).toBeLessThanOrEqual(3);
    expect(board.entries.every((row) => typeof row.rank === 'number')).toBe(true);
    expect(board.own?.isSelf).toBe(true);
    if (board.own && board.own.rank > 3) {
      expect(board.entries.some((row) => row.isSelf && row.rank === board.own!.rank)).toBe(
        false,
      );
    }
  });

  it('soft opt-out hides from board; cooldown history survives; handle reclaimable', async () => {
    // Fresh handle on A via privileged setup to avoid earlier cooldown.
    await pool.query(
      `INSERT INTO leaderboard_entries (profile_id, handle, opted_in, updated_at)
       VALUES ($1, 'ReclaimMe', true, now() - interval '2 minutes')
       ON CONFLICT (profile_id) DO UPDATE
         SET handle = 'ReclaimMe', opted_in = true, updated_at = now() - interval '2 minutes'`,
      [userA],
    );
    await asUser(pool, userA, async (client) => {
      await client.query(LEADERBOARD_OPTOUT_SQL, [userA]);
      const own = await client.query(LEADERBOARD_OWN_SQL, [userA]);
      expect(own.rows[0]?.opted_in).toBe(false);
    });

    const board = await asUser(pool, userB, async (client) => {
      return client.query(LEADERBOARD_BOARD_SQL, ['all_time', 50]);
    });
    expect(board.rows.some((r) => r.handle === 'ReclaimMe')).toBe(false);

    // B can claim the inactive handle (partial unique index). Clear B cooldown first.
    await pool.query(
      `INSERT INTO leaderboard_entries (profile_id, handle, opted_in, updated_at)
       VALUES ($1, 'BetaTwo', true, now() - interval '2 minutes')
       ON CONFLICT (profile_id) DO UPDATE
         SET updated_at = now() - interval '2 minutes', opted_in = true`,
      [userB],
    );
    await asUser(pool, userB, async (client) => {
      await upsertLeaderboardHandle(client, userB, 'ReclaimMe');
    });
    const claimed = await asUser(pool, userB, async (client) => getOwn(client, userB));
    expect(claimed).toBe('ReclaimMe');

    // Former participant A cannot reclaim the now-active handle.
    await pool.query(
      `UPDATE leaderboard_entries
       SET updated_at = now() - interval '2 minutes'
       WHERE profile_id = $1`,
      [userA],
    );
    await expect(
      asUser(pool, userA, async (client) => {
        await upsertLeaderboardHandle(client, userA, 'ReclaimMe');
      }),
    ).rejects.toMatchObject({ code: '23505' });
  });

  it('active handle uniqueness is case-insensitive', async () => {
    await pool.query(
      `INSERT INTO leaderboard_entries (profile_id, handle, opted_in, updated_at)
       VALUES ($1, 'UniqueHandle', true, now() - interval '2 minutes')
       ON CONFLICT (profile_id) DO UPDATE
         SET handle = 'UniqueHandle', opted_in = true, updated_at = now() - interval '2 minutes'`,
      [userC],
    );
    await pool.query(
      `INSERT INTO leaderboard_entries (profile_id, handle, opted_in, updated_at)
       VALUES ($1, 'OtherC', true, now() - interval '2 minutes')
       ON CONFLICT (profile_id) DO UPDATE
         SET updated_at = now() - interval '2 minutes', opted_in = true`,
      [userD],
    );
    await expect(
      asUser(pool, userD, async (client) => {
        await upsertLeaderboardHandle(client, userD, 'uniquehandle');
      }),
    ).rejects.toMatchObject({ code: '23505' });
  });

  it('CHECK rejects bad handles even if API validation is bypassed', async () => {
    await expect(
      asUser(pool, userE, async (client) => {
        await client.query(LEADERBOARD_UPSERT_SQL, [userE, 'bad@handle']);
      }),
    ).rejects.toMatchObject({ code: '23514' });

    await expect(
      asUser(pool, userE, async (client) => {
        await client.query(LEADERBOARD_UPSERT_SQL, [userE, '123-456-7890']);
      }),
    ).rejects.toMatchObject({ code: '23514' });

    await expect(
      asUser(pool, userE, async (client) => {
        await client.query(LEADERBOARD_UPSERT_SQL, [userE, '1234567']);
      }),
    ).rejects.toMatchObject({ code: '23514' });
  });

  it('mutation cooldown remains after soft opt-out', async () => {
    await pool.query(
      `INSERT INTO leaderboard_entries (profile_id, handle, opted_in, updated_at)
       VALUES ($1, 'CoolDownF', false, now())
       ON CONFLICT (profile_id) DO UPDATE
         SET opted_in = false, updated_at = now(), handle = EXCLUDED.handle`,
      [userF],
    );
    const remaining = await asUser(pool, userF, async (client) => {
      return mutationCooldownRemaining(client, userF, new Date());
    });
    expect(remaining).toBeGreaterThan(0);
    expect(remaining).toBeLessThanOrEqual(LEADERBOARD_MUTATION_COOLDOWN_SECONDS);
  });

  it('concurrent route-shaped mutations: one ok, one cooldown', async () => {
    const target = userRace!;
    // Clean slate, no prior cooldown.
    await pool.query(`DELETE FROM leaderboard_entries WHERE profile_id = $1`, [target]);

    const results = await Promise.all([
      mutateWithCooldown(pool, target, 'RaceOneG'),
      mutateWithCooldown(pool, target, 'RaceTwoG'),
    ]);

    const oks = results.filter((r) => r.kind === 'ok');
    const cools = results.filter((r) => r.kind === 'cooldown');
    expect(oks).toHaveLength(1);
    expect(cools).toHaveLength(1);

    const final = await pool.query(
      `SELECT handle, opted_in FROM leaderboard_entries WHERE profile_id = $1`,
      [target],
    );
    expect(final.rows).toHaveLength(1);
    expect(final.rows[0].opted_in).toBe(true);
    expect(['RaceOneG', 'RaceTwoG']).toContain(final.rows[0].handle);
    expect(oks[0]?.kind === 'ok' && oks[0].handle).toBe(final.rows[0].handle);
  });
});
