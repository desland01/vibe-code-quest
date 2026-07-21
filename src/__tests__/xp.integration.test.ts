import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';

import { BEAT_PROGRESS_UPSERT_SQL } from '@/server/beatProgress';
import {
  XP_AWARD_INSERT_SQL,
  XP_PER_LANDMARK,
  XP_TOTAL_SQL,
  applyXpAwards,
  deriveXpAwardsForLandmark,
} from '@/server/xp';

const connectionString = process.env.TEST_DATABASE_URL;
const describeWithDatabase = connectionString ? describe : describe.skip;

if (!connectionString) {
  console.info('Skipping XP SQL integration tests: TEST_DATABASE_URL is unset.');
}

const beatState = (overrides: Record<string, unknown> = {}) =>
  JSON.stringify({
    v: 1,
    kind: 'beat-sequence',
    furthestBeatIndex: 0,
    checked: false,
    completed: false,
    stampedAt: null,
    ...overrides,
  });

describeWithDatabase('L-003 xp_awards SQL + RLS', () => {
  const pool = new pg.Pool({ connectionString, max: 3 });
  const userA = randomUUID();
  const userB = randomUUID();
  const region = 'git';
  const landmark = 'commits-as-checkpoints';

  beforeAll(async () => {
    await pool.query(
      `INSERT INTO profiles (id, email) VALUES ($1, $2), ($3, $4)
       ON CONFLICT (id) DO NOTHING`,
      [userA, 'xp-a@example.invalid', userB, 'xp-b@example.invalid'],
    );
    await pool.query(`DELETE FROM xp_awards WHERE profile_id = ANY($1::uuid[])`, [
      [userA, userB],
    ]);
    await pool.query(`DELETE FROM progress WHERE profile_id = ANY($1::uuid[])`, [
      [userA, userB],
    ]);
  });

  afterAll(async () => {
    await pool.query(`DELETE FROM xp_awards WHERE profile_id = ANY($1::uuid[])`, [
      [userA, userB],
    ]);
    await pool.query(`DELETE FROM progress WHERE profile_id = ANY($1::uuid[])`, [
      [userA, userB],
    ]);
    await pool.query(`DELETE FROM profiles WHERE id = ANY($1::uuid[])`, [[userA, userB]]);
    await pool.end();
  });

  it('table exists with award_key uniqueness and positive points check', async () => {
    const reg = await pool.query(`SELECT to_regclass('public.xp_awards') AS name`);
    expect(reg.rows[0].name).toBe('xp_awards');

    await pool.query(XP_AWARD_INSERT_SQL, [userA, region, landmark, 'scenario_solved', 15]);
    const second = await pool.query(XP_AWARD_INSERT_SQL, [
      userA,
      region,
      landmark,
      'scenario_solved',
      15,
    ]);
    expect(second.rows).toHaveLength(0);

    const total = await pool.query(XP_TOTAL_SQL, [userA]);
    expect(total.rows[0].total).toBe(15);
  });

  it('app_user has SELECT/INSERT only (no UPDATE/DELETE grants)', async () => {
    const priv = await pool.query<{
      can_select: boolean;
      can_insert: boolean;
      can_update: boolean;
      can_delete: boolean;
    }>(`
      SELECT
        has_table_privilege('app_user', 'xp_awards', 'SELECT') AS can_select,
        has_table_privilege('app_user', 'xp_awards', 'INSERT') AS can_insert,
        has_table_privilege('app_user', 'xp_awards', 'UPDATE') AS can_update,
        has_table_privilege('app_user', 'xp_awards', 'DELETE') AS can_delete
    `);
    expect(priv.rows[0]).toEqual({
      can_select: true,
      can_insert: true,
      can_update: false,
      can_delete: false,
    });
  });

  it('applyXpAwards is idempotent and reaches 100 for one stamped landmark', async () => {
    await pool.query(`DELETE FROM xp_awards WHERE profile_id = $1`, [userA]);

    const client = await pool.connect();
    try {
      const stamped = {
        v: 1,
        kind: 'beat-sequence',
        furthestBeatIndex: 7,
        checked: true,
        completed: true,
        stampedAt: '2026-07-21T12:00:00.000Z',
      };
      expect(deriveXpAwardsForLandmark(region, landmark, stamped)).toHaveLength(4);

      const first = await applyXpAwards(client, userA, region, landmark, stamped);
      expect(first.newPoints).toBe(XP_PER_LANDMARK);
      expect(first.total).toBe(100);
      expect(first.awarded.map((a) => a.awardKey).sort()).toEqual([
        'check_passed',
        'gotcha_solved',
        'landmark_stamped',
        'scenario_solved',
      ]);

      const replay = await applyXpAwards(client, userA, region, landmark, stamped);
      expect(replay.newPoints).toBe(0);
      expect(replay.total).toBe(100);
      expect(replay.awarded).toEqual([]);
    } finally {
      client.release();
    }
  });

  it('progress merge + awards from RETURNING state (atomic path simulation)', async () => {
    await pool.query(`DELETE FROM xp_awards WHERE profile_id = $1`, [userA]);
    await pool.query(`DELETE FROM progress WHERE profile_id = $1`, [userA]);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(BEAT_PROGRESS_UPSERT_SQL, [
        userA,
        region,
        landmark,
        beatState({ furthestBeatIndex: 3 }),
      ]);
      const merged = await client.query(BEAT_PROGRESS_UPSERT_SQL, [
        userA,
        region,
        landmark,
        beatState({ furthestBeatIndex: 4 }),
      ]);
      const state = merged.rows[0].state;
      const xp = await applyXpAwards(client, userA, region, landmark, state);
      expect(xp.newPoints).toBe(15);
      expect(xp.total).toBe(15);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  });

  it('RLS: app_user only sees own awards', async () => {
    await pool.query(`DELETE FROM xp_awards WHERE profile_id = ANY($1::uuid[])`, [
      [userA, userB],
    ]);
    await pool.query(XP_AWARD_INSERT_SQL, [userA, region, landmark, 'scenario_solved', 15]);
    await pool.query(XP_AWARD_INSERT_SQL, [userB, region, landmark, 'scenario_solved', 15]);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('SET LOCAL ROLE app_user');
      await client.query(`SELECT set_config('app.user_id', $1, true)`, [userA]);

      const mine = await client.query(
        `SELECT profile_id, award_key FROM xp_awards ORDER BY award_key`,
      );
      expect(mine.rows).toHaveLength(1);
      expect(mine.rows[0].profile_id).toBe(userA);

      // Denied UPDATE must raise insufficient_privilege (42501), not a leftover aborted-tx error.
      let updateCode: string | undefined;
      try {
        await client.query('SAVEPOINT before_update');
        await client.query(`UPDATE xp_awards SET points = 1 WHERE profile_id = $1`, [userA]);
      } catch (error) {
        updateCode = (error as { code?: string }).code;
        await client.query('ROLLBACK TO SAVEPOINT before_update');
      }
      expect(updateCode).toBe('42501');

      let deleteCode: string | undefined;
      try {
        await client.query('SAVEPOINT before_delete');
        await client.query(`DELETE FROM xp_awards WHERE profile_id = $1`, [userA]);
      } catch (error) {
        deleteCode = (error as { code?: string }).code;
        await client.query('ROLLBACK TO SAVEPOINT before_delete');
      }
      expect(deleteCode).toBe('42501');

      // Still only own row after denied mutations
      const stillMine = await client.query(`SELECT count(*)::int AS n FROM xp_awards`);
      expect(stillMine.rows[0].n).toBe(1);

      await client.query('ROLLBACK');
    } finally {
      client.release();
    }

    const still = await pool.query(
      `SELECT count(*)::int AS n FROM xp_awards WHERE profile_id = ANY($1::uuid[])`,
      [[userA, userB]],
    );
    expect(still.rows[0].n).toBe(2);
  });

  it('rejects invalid award_key/points pairs via CHECK', async () => {
    let failed = false;
    try {
      await pool.query(
        `INSERT INTO xp_awards (profile_id, region, landmark, award_key, points)
         VALUES ($1, $2, $3, 'scenario_solved', 99)`,
        [userA, region, landmark],
      );
    } catch {
      failed = true;
    }
    expect(failed).toBe(true);
  });
});
