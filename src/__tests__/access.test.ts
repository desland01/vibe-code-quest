import { afterEach, describe, expect, it, vi } from 'vitest';

import { bannerFor, checkAccess, dayUtc } from '@/server/access';
import { accessConfig, loadAccessConfig, type AccessConfig } from '@/server/accessConfig';

function withIdentityCap(cap: number): AccessConfig {
  return {
    ...accessConfig,
    perIdentityDailyTokens: { ...accessConfig.perIdentityDailyTokens, anonymous: cap },
  };
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('access config', () => {
  it('parses ACCESS_* overrides once per load', () => {
    vi.stubEnv('ACCESS_GUIDE_WORST_CASE_TOKENS', '777');
    vi.stubEnv('ACCESS_GLOBAL_DAILY_TOKENS', '9876');
    const config = loadAccessConfig();
    expect(config.surfaces.guide.worstCaseTokens).toBe(777);
    expect(config.globalDailyTokens).toBe(9876);
    expect(Object.isFrozen(config)).toBe(true);
    expect(Object.isFrozen(config.surfaces.guide)).toBe(true);
  });

  it('rejects negative and non-integer overrides', () => {
    vi.stubEnv('ACCESS_GLOBAL_DAILY_TOKENS', '-1');
    expect(() => loadAccessConfig()).toThrow(/non-negative safe integer/);
  });
});

describe('access helpers', () => {
  it('uses UTC midnight as the day boundary', () => {
    expect(dayUtc(new Date('2026-07-17T23:59:59.999Z'))).toBe('2026-07-17');
    expect(dayUtc(new Date('2026-07-18T00:00:01.000Z'))).toBe('2026-07-18');
  });

  it('maps allowed, trial, capped, and guide-disabled banners', () => {
    expect(bannerFor('renderer', 'free', true)).toBe('ok');
    expect(bannerFor('onboarding', 'trial', true)).toBe('trial');
    expect(bannerFor('renderer', 'free', false)).toBe('capped');
    expect(bannerFor('guide', 'free', false)).toBe('guide_disabled');
  });

  it('short-circuits cap=0 without touching the database', async () => {
    const throwingPool = {
      query: vi.fn(() => {
        throw new Error('database must not be touched');
      }),
      connect: vi.fn(() => {
        throw new Error('database must not be touched');
      }),
    };
    await expect(
      checkAccess(
        { userId: '10000000-0000-4000-8000-000000000001', tier: 'anonymous' },
        'guide',
        { config: withIdentityCap(0), pool: throwingPool as never }
      )
    ).resolves.toEqual({ allowed: false, banner: 'guide_disabled', reason: 'identity daily cap is zero' });
    expect(throwingPool.query).not.toHaveBeenCalled();
    expect(throwingPool.connect).not.toHaveBeenCalled();
  });

  it('L-006: expired/canceled entitlements stay free-allowed; active trial keeps trial banner', async () => {
    const now = new Date('2026-07-24T12:00:00.000Z');
    type EntRow = {
      tier: string;
      status: string;
      trial_starts_at: Date | null;
      trial_ends_at: Date | null;
    };
    const expired: EntRow = {
      tier: 'trial',
      status: 'trialing',
      trial_starts_at: new Date('2026-07-01T00:00:00.000Z'),
      trial_ends_at: new Date('2026-07-15T00:00:00.000Z'),
    };
    const active: EntRow = {
      tier: 'trial',
      status: 'trialing',
      trial_starts_at: new Date('2026-07-20T00:00:00.000Z'),
      trial_ends_at: new Date('2026-08-03T00:00:00.000Z'),
    };
    // Canceled with a future window must not inherit elevated trial caps.
    const canceledFuture: EntRow = {
      tier: 'trial',
      status: 'canceled',
      trial_starts_at: new Date('2026-07-20T00:00:00.000Z'),
      trial_ends_at: new Date('2026-08-03T00:00:00.000Z'),
    };

    function poolFor(row: EntRow | null) {
      return {
        query: vi.fn(async (text: string) => {
          const sql = String(text);
          if (sql.includes('FROM entitlements')) {
            return { rows: row ? [row] : [], rowCount: row ? 1 : 0 };
          }
          // expireStaleReservations path may attempt connect; checkAccess itself
          // should only need query for entitlement + spent aggregates.
          if (sql.includes('usage_reservations') || sql.includes('expires_at')) {
            return { rows: [], rowCount: 0 };
          }
          return { rows: [{ spent: '0', tokens: '0' }], rowCount: 1 };
        }),
        connect: vi.fn(async () => {
          const client = {
            query: vi.fn(async () => ({ rows: [], rowCount: 0 })),
            release: vi.fn(),
          };
          return client;
        }),
      };
    }

    const expiredResult = await checkAccess(
      { userId: '10000000-0000-4000-8000-0000000000aa' },
      'guide',
      { pool: poolFor(expired) as never, now },
    );
    expect(expiredResult.allowed).toBe(true);
    expect(expiredResult.banner).toBe('ok');
    expect(expiredResult.reason).toBeUndefined();
    expect(JSON.stringify(expiredResult)).not.toMatch(/subscription required/i);

    const activeResult = await checkAccess(
      { userId: '10000000-0000-4000-8000-0000000000bb' },
      'guide',
      { pool: poolFor(active) as never, now },
    );
    expect(activeResult.allowed).toBe(true);
    expect(activeResult.banner).toBe('trial');
    expect(JSON.stringify(activeResult)).not.toMatch(/subscription required/i);

    const canceledResult = await checkAccess(
      { userId: '10000000-0000-4000-8000-0000000000cc' },
      'guide',
      { pool: poolFor(canceledFuture) as never, now },
    );
    expect(canceledResult.allowed).toBe(true);
    expect(canceledResult.banner).toBe('ok'); // free, not trial
    expect(JSON.stringify(canceledResult)).not.toMatch(/subscription required/i);
  });
});
