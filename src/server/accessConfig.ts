export type AccessTier = 'anonymous' | 'free' | 'trial' | 'active';

export type AccessConfig = Readonly<{
  version: 1;
  surfaces: Readonly<
    Record<
      'onboarding' | 'guide' | 'renderer',
      Readonly<{ worstCaseTokens: number; perRequestTokenCeiling: number }>
    >
  >;
  perIdentityDailyTokens: Readonly<Record<AccessTier, number>>;
  globalDailyTokens: number;
  anonymousIpDailyTokens: number;
  anonymousDeviceDailyTokens: number;
  reservationTtlSeconds: number;
}>;

function envNumber(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;

  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${name} must be a non-negative safe integer`);
  }
  return value;
}

export function loadAccessConfig(): AccessConfig {
  return Object.freeze({
    version: 1 as const,
    surfaces: Object.freeze({
      onboarding: Object.freeze({
        worstCaseTokens: envNumber('ACCESS_ONBOARDING_WORST_CASE_TOKENS', 2_000),
        perRequestTokenCeiling: envNumber('ACCESS_ONBOARDING_REQUEST_TOKEN_CEILING', 2_000),
      }),
      guide: Object.freeze({
        worstCaseTokens: envNumber('ACCESS_GUIDE_WORST_CASE_TOKENS', 4_000),
        perRequestTokenCeiling: envNumber('ACCESS_GUIDE_REQUEST_TOKEN_CEILING', 4_000),
      }),
      renderer: Object.freeze({
        worstCaseTokens: envNumber('ACCESS_RENDERER_WORST_CASE_TOKENS', 3_000),
        perRequestTokenCeiling: envNumber('ACCESS_RENDERER_REQUEST_TOKEN_CEILING', 3_000),
      }),
    }),
    perIdentityDailyTokens: Object.freeze({
      anonymous: envNumber('ACCESS_IDENTITY_DAILY_TOKENS_ANONYMOUS', 8_000),
      free: envNumber('ACCESS_IDENTITY_DAILY_TOKENS_FREE', 16_000),
      trial: envNumber('ACCESS_IDENTITY_DAILY_TOKENS_TRIAL', 50_000),
      active: envNumber('ACCESS_IDENTITY_DAILY_TOKENS_ACTIVE', 100_000),
    }),
    globalDailyTokens: envNumber('ACCESS_GLOBAL_DAILY_TOKENS', 1_000_000),
    anonymousIpDailyTokens: envNumber('ACCESS_ANONYMOUS_IP_DAILY_TOKENS', 24_000),
    anonymousDeviceDailyTokens: envNumber('ACCESS_ANONYMOUS_DEVICE_DAILY_TOKENS', 12_000),
    reservationTtlSeconds: envNumber('ACCESS_RESERVATION_TTL_SECONDS', 120),
  });
}

export const accessConfig = loadAccessConfig();
