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
});
