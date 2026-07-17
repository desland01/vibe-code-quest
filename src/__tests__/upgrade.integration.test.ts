import { randomUUID } from 'node:crypto';

import pg from 'pg';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { applyUpgrade, createOtpChallenge, verifyOtpChallenge } from '../server/upgrade';

const connectionString = process.env.TEST_DATABASE_URL;
const describeWithDatabase = connectionString ? describe : describe.skip;

if (!connectionString) console.info('Skipping upgrade integration tests: TEST_DATABASE_URL is unset.');

describeWithDatabase('email OTP upgrade and merge', () => {
  const pool = new pg.Pool({ connectionString, max: 3 });

  beforeEach(async () => {
    vi.stubEnv('AUTH_SECRET', 'integration-test-auth-secret');
    await pool.query('TRUNCATE otp_challenges, progress, profiles CASCADE');
  });

  afterAll(async () => pool.end());

  async function profile(email?: string) {
    const id = randomUUID();
    await pool.query('INSERT INTO profiles (id, email) VALUES ($1, $2)', [id, email ?? null]);
    return id;
  }

  it('upgrades in place while preserving progress', async () => {
    const userId = await profile();
    await pool.query(
      `INSERT INTO progress (profile_id, region, landmark, state) VALUES ($1, 'basics', 'loops', '{"done":true}')`,
      [userId]
    );
    const { code } = await createOtpChallenge(pool, userId, ' Learner@Example.com ');
    const verified = await verifyOtpChallenge(pool, userId, code);
    expect(verified.ok).toBe(true);
    if (!verified.ok) return;
    expect(await applyUpgrade(pool, userId, verified.email)).toEqual({ kind: 'upgraded', userId });
    expect((await pool.query('SELECT email FROM profiles WHERE id = $1', [userId])).rows[0].email).toBe('learner@example.com');
    expect((await pool.query('SELECT state FROM progress WHERE profile_id = $1', [userId])).rows[0].state).toEqual({ done: true });
  });

  it('increments attempts for a wrong code without touching profile data', async () => {
    const userId = await profile();
    await pool.query(`INSERT INTO progress (profile_id, region, landmark) VALUES ($1, 'a', 'b')`, [userId]);
    await createOtpChallenge(pool, userId, 'wrong@example.com');
    expect(await verifyOtpChallenge(pool, userId, '999999')).toEqual({ ok: false, error: 'invalid_code' });
    expect((await pool.query('SELECT attempts FROM otp_challenges WHERE profile_id = $1', [userId])).rows[0].attempts).toBe(1);
    expect((await pool.query('SELECT email FROM profiles WHERE id = $1', [userId])).rows[0].email).toBeNull();
    expect((await pool.query('SELECT count(*)::int AS count FROM progress WHERE profile_id = $1', [userId])).rows[0].count).toBe(1);
  });

  it('rejects expired codes and leaves the profile untouched', async () => {
    const userId = await profile();
    const { challengeId, code } = await createOtpChallenge(pool, userId, 'expired@example.com');
    await pool.query("UPDATE otp_challenges SET expires_at = now() - interval '1 minute' WHERE id = $1", [challengeId]);
    expect(await verifyOtpChallenge(pool, userId, code)).toEqual({ ok: false, error: 'expired' });
    expect((await pool.query('SELECT email FROM profiles WHERE id = $1', [userId])).rows[0].email).toBeNull();
  });

  it('rejects replay after a successful verification', async () => {
    const userId = await profile();
    const { code } = await createOtpChallenge(pool, userId, 'replay@example.com');
    expect((await verifyOtpChallenge(pool, userId, code)).ok).toBe(true);
    expect(await verifyOtpChallenge(pool, userId, code)).toEqual({ ok: false, error: 'replay' });
  });

  it('leaves an abandoned challenge and profile untouched', async () => {
    const userId = await profile();
    await createOtpChallenge(pool, userId, 'abandoned@example.com');
    expect((await pool.query('SELECT consumed_at FROM otp_challenges WHERE profile_id = $1', [userId])).rows[0].consumed_at).toBeNull();
    expect((await pool.query('SELECT email FROM profiles WHERE id = $1', [userId])).rows[0].email).toBeNull();
  });

  it('merges conflict-free progress and resolves conflicts newest-wins without deleting source rows', async () => {
    const sourceId = await profile();
    const targetId = await profile('merge@example.com');
    await pool.query(
      `INSERT INTO progress (profile_id, region, landmark, state, updated_at) VALUES
       ($1, 'source', 'only', '{"owner":"source"}', now()),
       ($1, 'shared', 'newer-source', '{"owner":"source"}', now()),
       ($2, 'shared', 'newer-source', '{"owner":"target"}', now() - interval '1 day'),
       ($1, 'shared', 'newer-target', '{"owner":"source"}', now() - interval '1 day'),
       ($2, 'shared', 'newer-target', '{"owner":"target"}', now())`,
      [sourceId, targetId]
    );
    const { code } = await createOtpChallenge(pool, sourceId, 'merge@example.com');
    const verified = await verifyOtpChallenge(pool, sourceId, code);
    if (!verified.ok) throw new Error('Expected verification success');
    expect(await applyUpgrade(pool, sourceId, verified.email)).toEqual({ kind: 'merged', userId: targetId });

    const target = await pool.query(
      'SELECT region, landmark, state FROM progress WHERE profile_id = $1 ORDER BY landmark',
      [targetId]
    );
    expect(target.rows).toHaveLength(3);
    expect(target.rows.find((row) => row.landmark === 'newer-source')?.state).toEqual({ owner: 'source' });
    expect(target.rows.find((row) => row.landmark === 'newer-target')?.state).toEqual({ owner: 'target' });
    expect((await pool.query('SELECT count(*)::int AS count FROM progress WHERE profile_id = $1', [sourceId])).rows[0].count).toBe(3);
  });

  it('invalidates the old challenge when re-requested', async () => {
    const userId = await profile();
    const first = await createOtpChallenge(pool, userId, 'first@example.com');
    const second = await createOtpChallenge(pool, userId, 'second@example.com');
    expect(await verifyOtpChallenge(pool, userId, first.code)).toEqual({ ok: false, error: 'invalid_code' });
    expect((await verifyOtpChallenge(pool, userId, second.code)).ok).toBe(true);
    expect((await pool.query('SELECT consumed_at FROM otp_challenges WHERE id = $1', [first.challengeId])).rows[0].consumed_at).not.toBeNull();
  });
});
