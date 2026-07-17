import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  checkAccess,
  expireStaleReservations,
  reconcileUsage,
  reserveUsage,
  type AccessIdentity,
} from '@/server/access';
import { accessConfig, type AccessConfig } from '@/server/accessConfig';

const connectionString = process.env.TEST_DATABASE_URL;
const describeWithDatabase = connectionString ? describe : describe.skip;

if (!connectionString) console.info('Skipping access integration tests: TEST_DATABASE_URL is unset.');

function testConfig(overrides: Partial<AccessConfig> = {}): AccessConfig {
  return {
    ...accessConfig,
    surfaces: {
      onboarding: { worstCaseTokens: 1_000, perRequestTokenCeiling: 1_000 },
      guide: { worstCaseTokens: 1_000, perRequestTokenCeiling: 1_000 },
      renderer: { worstCaseTokens: 1_000, perRequestTokenCeiling: 1_000 },
    },
    perIdentityDailyTokens: { anonymous: 100_000, free: 100_000, trial: 100_000, active: 100_000 },
    globalDailyTokens: 1_000_000,
    anonymousIpDailyTokens: 100_000,
    anonymousDeviceDailyTokens: 100_000,
    reservationTtlSeconds: 120,
    ...overrides,
  };
}

describeWithDatabase('VAL-035 access ledger integration', () => {
  const pool = new pg.Pool({ connectionString, max: 10 });
  const ids = Array.from({ length: 12 }, (_, index) =>
    `70000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`
  );
  const options = (config: AccessConfig, now?: Date) => ({ config, pool, ...(now ? { now } : {}) });
  const identity = (index: number, extra: Partial<AccessIdentity> = {}): AccessIdentity => ({
    userId: ids[index], tier: 'anonymous', ...extra,
  });

  beforeAll(async () => {
    await pool.query('DELETE FROM profiles WHERE id = ANY($1::uuid[])', [ids]);
    await pool.query('INSERT INTO profiles (id) SELECT unnest($1::uuid[])', [ids]);
  });

  afterAll(async () => {
    await pool.query('DELETE FROM profiles WHERE id = ANY($1::uuid[])', [ids]);
    await pool.end();
  });

  it('concurrency: parallel requests near the limit cannot overspend', async () => {
    const config = testConfig({ perIdentityDailyTokens: { anonymous: 2_000, free: 2_000, trial: 2_000, active: 2_000 } });
    const results = await Promise.all(Array.from({ length: 5 }, () => reserveUsage(identity(0), 'guide', options(config))));
    expect(results.filter((result) => result.ok)).toHaveLength(2);
  });

  it('shared ledger: reservations across surfaces share one identity cap', async () => {
    const config = testConfig({ perIdentityDailyTokens: { anonymous: 1_500, free: 1_500, trial: 1_500, active: 1_500 } });
    expect((await reserveUsage(identity(1), 'onboarding', options(config))).ok).toBe(true);
    const second = await reserveUsage(identity(1), 'renderer', options(config));
    expect(second).toMatchObject({ ok: false, reason: 'identity daily cap exceeded' });
  });

  it('reconciliation: returns over-reservation and double reconcile is a no-op', async () => {
    const config = testConfig({ perIdentityDailyTokens: { anonymous: 1_500, free: 1_500, trial: 1_500, active: 1_500 } });
    const reserved = await reserveUsage(identity(2), 'guide', options(config));
    expect(reserved.ok).toBe(true);
    if (!reserved.ok) throw new Error('reservation failed');
    await expect(reconcileUsage(reserved.reservationId, 100, options(config))).resolves.toEqual({ reconciled: true });
    await expect(reconcileUsage(reserved.reservationId, 100, options(config))).resolves.toEqual({ reconciled: false });
    expect(await checkAccess(identity(2), 'guide', options(config))).toMatchObject({ allowed: true });
    const ledger = await pool.query<{ tokens_reconciled: string }>(
      'SELECT tokens_reconciled FROM usage_ledger WHERE profile_id = $1', [ids[2]]
    );
    expect(Number(ledger.rows[0].tokens_reconciled)).toBe(100);
  });

  it('UTC midnight rollover: yesterday usage does not affect today', async () => {
    const now = new Date('2026-07-18T00:00:01Z');
    await pool.query(
      `INSERT INTO usage_ledger (profile_id, day, surface, tokens_reconciled)
       VALUES ($1, '2026-07-17', 'guide', 100000)`, [ids[3]]
    );
    await expect(checkAccess(identity(3), 'guide', options(testConfig(), now))).resolves.toMatchObject({ allowed: true });
  });

  it('cap=0: refuses reservation with the surface banner', async () => {
    const config = testConfig({ perIdentityDailyTokens: { anonymous: 0, free: 0, trial: 0, active: 0 } });
    await expect(reserveUsage(identity(4), 'guide', options(config))).resolves.toMatchObject({ ok: false, banner: 'guide_disabled' });
    await expect(reserveUsage(identity(4), 'renderer', options(config))).resolves.toMatchObject({ ok: false, banner: 'capped' });
  });

  it('multi-anonymous aggregate: profiles sharing an IP hit one throttle', async () => {
    const config = testConfig({ anonymousIpDailyTokens: 2_000 });
    const shared = { ip: '203.0.113.7' };
    expect((await reserveUsage(identity(5, shared), 'guide', options(config))).ok).toBe(true);
    expect((await reserveUsage(identity(6, shared), 'guide', options(config))).ok).toBe(true);
    expect(await reserveUsage(identity(7, shared), 'guide', options(config))).toMatchObject({ ok: false, reason: 'anonymous IP daily cap exceeded' });
    expect(await reserveUsage(identity(8, shared), 'guide', options(config))).toMatchObject({ ok: false, reason: 'anonymous IP daily cap exceeded' });
  });

  it('global hard cap: identities cannot collectively pass the cap', async () => {
    const isolatedDay = new Date('2030-01-01T12:00:00Z');
    const config = testConfig({ globalDailyTokens: 1_000 });
    expect((await reserveUsage(identity(9), 'guide', options(config, isolatedDay))).ok).toBe(true);
    expect(await reserveUsage(identity(10), 'guide', options(config, isolatedDay))).toMatchObject({ ok: false, reason: 'global daily cap exceeded' });
  });

  it('expiry: stale reservation is released and no longer counts', async () => {
    const start = new Date('2031-01-01T12:00:00Z');
    const config = testConfig({ reservationTtlSeconds: 1, perIdentityDailyTokens: { anonymous: 1_000, free: 1_000, trial: 1_000, active: 1_000 } });
    expect((await reserveUsage(identity(11), 'guide', options(config, start))).ok).toBe(true);
    await expect(expireStaleReservations(options(config, new Date(start.getTime() + 2_000)))).resolves.toBe(1);
    expect((await reserveUsage(identity(11), 'guide', options(config, new Date(start.getTime() + 2_000)))).ok).toBe(true);
  });
});
