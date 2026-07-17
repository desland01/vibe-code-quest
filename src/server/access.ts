import 'server-only';

import { createHash } from 'node:crypto';
import type { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

import { pool as privilegedPool } from '@/lib/db';
import {
  accessConfig,
  type AccessConfig,
  type AccessTier,
} from '@/server/accessConfig';

export type Surface = 'onboarding' | 'guide' | 'renderer';
export type BannerState = 'ok' | 'trial' | 'capped' | 'guide_disabled' | 'offline';
export type AccessIdentity = {
  userId: string;
  tier?: AccessTier;
  ip?: string;
  deviceCookieId?: string;
};

type Queryable = {
  query<R extends QueryResultRow = QueryResultRow>(
    text: string,
    values?: readonly unknown[]
  ): Promise<QueryResult<R>>;
};
type AccessPool = Queryable & { connect(): Promise<PoolClient> };
export type AccessOptions = {
  config?: AccessConfig;
  pool?: AccessPool;
  now?: Date;
};

type ReservationRow = {
  id: string;
  profile_id: string;
  day: string | Date;
  surface: Surface;
  tokens: string | number;
  anonymous_ip_key: string | null;
  anonymous_device_key: string | null;
  reconciled?: boolean;
};

export function dayUtc(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function bannerFor(surface: Surface, tier: AccessTier, allowed: boolean): BannerState {
  if (!allowed) return surface === 'guide' ? 'guide_disabled' : 'capped';
  return tier === 'trial' ? 'trial' : 'ok';
}

function configFor(options?: AccessOptions): AccessConfig {
  return options?.config ?? accessConfig;
}

function poolFor(options?: AccessOptions): AccessPool {
  return options?.pool ?? (privilegedPool as Pool);
}

function anonymousKey(value: string | undefined): string | undefined {
  return value ? createHash('sha256').update(value).digest('hex') : undefined;
}

async function resolveTier(
  identity: AccessIdentity,
  database: Queryable,
  now: Date
): Promise<AccessTier> {
  if (identity.tier) return identity.tier;
  const result = await database.query<{
    tier: string;
    status: string;
    trial_starts_at: Date | null;
    trial_ends_at: Date | null;
  }>(
    `SELECT tier, status, trial_starts_at, trial_ends_at
       FROM entitlements WHERE profile_id = $1`,
    [identity.userId]
  );
  const entitlement = result.rows[0];
  if (!entitlement) return 'anonymous';
  if (
    entitlement.status === 'trial' ||
    (entitlement.trial_starts_at &&
      entitlement.trial_ends_at &&
      entitlement.trial_starts_at <= now &&
      entitlement.trial_ends_at > now)
  ) {
    return 'trial';
  }
  if (entitlement.status === 'active' && entitlement.tier !== 'free') return 'active';
  return 'free';
}

function capZero(config: AccessConfig, tier: AccessTier, surface: Surface): string | undefined {
  if (config.surfaces[surface].worstCaseTokens === 0) return 'surface cap is zero';
  if (config.surfaces[surface].perRequestTokenCeiling === 0) return 'request cap is zero';
  if (config.perIdentityDailyTokens[tier] === 0) return 'identity daily cap is zero';
  if (config.globalDailyTokens === 0) return 'global daily cap is zero';
  return undefined;
}

async function spentForIdentity(database: Queryable, userId: string, day: string): Promise<number> {
  const result = await database.query<{ spent: string }>(
    `SELECT
       COALESCE((SELECT SUM(tokens_reconciled) FROM usage_ledger
                  WHERE profile_id = $1 AND day = $2), 0) +
       COALESCE((SELECT SUM(tokens) FROM usage_reservations
                  WHERE profile_id = $1 AND day = $2 AND reconciled = false
                    AND expires_at > now()), 0) AS spent`,
    [userId, day]
  );
  return Number(result.rows[0]?.spent ?? 0);
}

async function aggregateSpent(
  database: Queryable,
  table: 'global_usage' | 'anon_usage',
  day: string,
  key?: string,
  kind?: 'ip' | 'device'
): Promise<number> {
  const result =
    table === 'global_usage'
      ? await database.query<{ tokens: string }>('SELECT tokens FROM global_usage WHERE day = $1', [day])
      : await database.query<{ tokens: string }>(
          'SELECT tokens FROM anon_usage WHERE key = $1 AND kind = $2 AND day = $3',
          [key, kind, day]
        );
  return Number(result.rows[0]?.tokens ?? 0);
}

type Decision = { allowed: boolean; banner: BannerState; reason?: string; tier: AccessTier };

async function decide(
  identity: AccessIdentity,
  surface: Surface,
  database: Queryable,
  config: AccessConfig,
  now: Date
): Promise<Decision> {
  const tier = await resolveTier(identity, database, now);
  const zeroReason = capZero(config, tier, surface);
  if (zeroReason) return { allowed: false, banner: bannerFor(surface, tier, false), reason: zeroReason, tier };

  const request = config.surfaces[surface];
  if (request.worstCaseTokens > request.perRequestTokenCeiling) {
    return { allowed: false, banner: bannerFor(surface, tier, false), reason: 'request token ceiling exceeded', tier };
  }

  const day = dayUtc(now);
  if ((await spentForIdentity(database, identity.userId, day)) + request.worstCaseTokens > config.perIdentityDailyTokens[tier]) {
    return { allowed: false, banner: bannerFor(surface, tier, false), reason: 'identity daily cap exceeded', tier };
  }
  if ((await aggregateSpent(database, 'global_usage', day)) + request.worstCaseTokens > config.globalDailyTokens) {
    return { allowed: false, banner: bannerFor(surface, tier, false), reason: 'global daily cap exceeded', tier };
  }

  if (tier === 'anonymous') {
    const ipKey = anonymousKey(identity.ip);
    const deviceKey = anonymousKey(identity.deviceCookieId);
    if (ipKey && (await aggregateSpent(database, 'anon_usage', day, ipKey, 'ip')) + request.worstCaseTokens > config.anonymousIpDailyTokens) {
      return { allowed: false, banner: bannerFor(surface, tier, false), reason: 'anonymous IP daily cap exceeded', tier };
    }
    if (deviceKey && (await aggregateSpent(database, 'anon_usage', day, deviceKey, 'device')) + request.worstCaseTokens > config.anonymousDeviceDailyTokens) {
      return { allowed: false, banner: bannerFor(surface, tier, false), reason: 'anonymous device daily cap exceeded', tier };
    }
  }
  return { allowed: true, banner: bannerFor(surface, tier, true), tier };
}

export async function checkAccess(
  identity: AccessIdentity,
  surface: Surface,
  options?: AccessOptions
): Promise<{ allowed: boolean; banner: BannerState; reason?: string }> {
  const config = configFor(options);
  const explicitTier = identity.tier;
  if (explicitTier) {
    const reason = capZero(config, explicitTier, surface);
    if (reason) return { allowed: false, banner: bannerFor(surface, explicitTier, false), reason };
  }
  try {
    const database = poolFor(options);
    const now = options?.now ?? new Date();
    await expireStaleReservations({ ...options, pool: database, now });
    const decision = await decide(identity, surface, database, config, now);
    return { allowed: decision.allowed, banner: decision.banner, ...(decision.reason ? { reason: decision.reason } : {}) };
  } catch {
    return { allowed: false, banner: 'offline', reason: 'access service unavailable' };
  }
}

async function advisoryLocks(client: Queryable, keys: string[]): Promise<void> {
  for (const key of [...new Set(keys)].sort()) {
    await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))', [key]);
  }
}

async function transaction<T>(database: AccessPool, operation: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await database.connect();
  try {
    await client.query('BEGIN');
    const result = await operation(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function reserveUsage(
  identity: AccessIdentity,
  surface: Surface,
  options?: AccessOptions
): Promise<{ ok: true; reservationId: string } | { ok: false; banner: BannerState; reason: string }> {
  const config = configFor(options);
  const now = options?.now ?? new Date();
  if (identity.tier) {
    const reason = capZero(config, identity.tier, surface);
    if (reason) return { ok: false, banner: bannerFor(surface, identity.tier, false), reason };
  }
  const database = poolFor(options);
  try {
    await expireStaleReservations({ ...options, pool: database, now });
    return await transaction(database, async (client) => {
      const day = dayUtc(now);
      const ipKey = anonymousKey(identity.ip);
      const deviceKey = anonymousKey(identity.deviceCookieId);
      await advisoryLocks(client, [
        `access:global:${day}`,
        `access:identity:${identity.userId}:${day}`,
        ...(ipKey ? [`access:ip:${ipKey}:${day}`] : []),
        ...(deviceKey ? [`access:device:${deviceKey}:${day}`] : []),
      ]);
      const decision = await decide(identity, surface, client, config, now);
      if (!decision.allowed) {
        return { ok: false as const, banner: decision.banner, reason: decision.reason ?? 'access denied' };
      }

      const tokens = config.surfaces[surface].worstCaseTokens;
      const expiresAt = new Date(now.getTime() + config.reservationTtlSeconds * 1_000);
      const reservation = await client.query<{ id: string }>(
        `INSERT INTO usage_reservations
          (profile_id, day, surface, tokens, anonymous_ip_key, anonymous_device_key, created_at, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
        [identity.userId, day, surface, tokens, decision.tier === 'anonymous' ? ipKey : null,
          decision.tier === 'anonymous' ? deviceKey : null, now, expiresAt]
      );
      await client.query(
        `INSERT INTO global_usage (day, tokens) VALUES ($1, $2)
         ON CONFLICT (day) DO UPDATE SET tokens = global_usage.tokens + EXCLUDED.tokens`,
        [day, tokens]
      );
      if (decision.tier === 'anonymous' && ipKey) await bumpAnon(client, ipKey, 'ip', day, tokens);
      if (decision.tier === 'anonymous' && deviceKey) await bumpAnon(client, deviceKey, 'device', day, tokens);
      return { ok: true as const, reservationId: reservation.rows[0].id };
    });
  } catch {
    return { ok: false, banner: 'offline', reason: 'access service unavailable' };
  }
}

async function bumpAnon(database: Queryable, key: string, kind: 'ip' | 'device', day: string, delta: number) {
  await database.query(
    `INSERT INTO anon_usage (key, kind, day, tokens) VALUES ($1, $2, $3, GREATEST(0, $4))
     ON CONFLICT (key, kind, day) DO UPDATE SET tokens = GREATEST(0, anon_usage.tokens + $4)`,
    [key, kind, day, delta]
  );
}

async function adjustReservationCounters(database: Queryable, row: ReservationRow, delta: number) {
  const day = typeof row.day === 'string' ? row.day : dayUtc(row.day);
  await database.query('UPDATE global_usage SET tokens = GREATEST(0, tokens + $2) WHERE day = $1', [row.day, delta]);
  if (row.anonymous_ip_key) await bumpAnon(database, row.anonymous_ip_key, 'ip', day, delta);
  if (row.anonymous_device_key) await bumpAnon(database, row.anonymous_device_key, 'device', day, delta);
}

export async function reconcileUsage(
  reservationId: string,
  actualTokens: number,
  options?: AccessOptions
): Promise<{ reconciled: boolean }> {
  if (!Number.isSafeInteger(actualTokens) || actualTokens < 0) throw new Error('actualTokens must be a non-negative safe integer');
  const database = poolFor(options);
  return transaction(database, async (client) => {
    const result = await client.query<ReservationRow>(
      'SELECT * FROM usage_reservations WHERE id = $1 FOR UPDATE',
      [reservationId]
    );
    const row = result.rows[0];
    if (!row || row.reconciled) {
      return { reconciled: false };
    }
    if (actualTokens > configFor(options).surfaces[row.surface].perRequestTokenCeiling) {
      throw new Error('actualTokens exceeds the request token ceiling');
    }
    const day = typeof row.day === 'string' ? row.day : dayUtc(row.day);
    await advisoryLocks(client, [
      `access:global:${day}`,
      `access:identity:${row.profile_id}:${day}`,
      ...(row.anonymous_ip_key ? [`access:ip:${row.anonymous_ip_key}:${day}`] : []),
      ...(row.anonymous_device_key ? [`access:device:${row.anonymous_device_key}:${day}`] : []),
    ]);
    const updated = await client.query(
      'UPDATE usage_reservations SET reconciled = true WHERE id = $1 AND reconciled = false',
      [reservationId]
    );
    if (updated.rowCount === 0) return { reconciled: false };
    await client.query(
      `INSERT INTO usage_ledger (profile_id, day, surface, tokens_reconciled, updated_at)
       VALUES ($1, $2, $3, $4, now())
       ON CONFLICT (profile_id, day, surface) DO UPDATE
       SET tokens_reconciled = usage_ledger.tokens_reconciled + EXCLUDED.tokens_reconciled,
           updated_at = now()`,
      [row.profile_id, day, row.surface, actualTokens]
    );
    await adjustReservationCounters(client, row, actualTokens - Number(row.tokens));
    return { reconciled: true };
  });
}

export async function expireStaleReservations(options?: AccessOptions): Promise<number> {
  const database = poolFor(options);
  const now = options?.now ?? new Date();
  return transaction(database, async (client) => {
    const stale = await client.query<ReservationRow>(
      `SELECT id, profile_id, day, surface, tokens, anonymous_ip_key, anonymous_device_key
       FROM usage_reservations WHERE reconciled = false AND expires_at <= $1
       FOR UPDATE SKIP LOCKED`,
      [now]
    );
    if (stale.rows.length === 0) return 0;
    const lockKeys = stale.rows.flatMap((row) => {
      const day = typeof row.day === 'string' ? row.day : dayUtc(row.day);
      return [`access:global:${day}`, `access:identity:${row.profile_id}:${day}`,
        ...(row.anonymous_ip_key ? [`access:ip:${row.anonymous_ip_key}:${day}`] : []),
        ...(row.anonymous_device_key ? [`access:device:${row.anonymous_device_key}:${day}`] : [])];
    });
    await advisoryLocks(client, lockKeys);
    for (const row of stale.rows) await adjustReservationCounters(client, row, -Number(row.tokens));
    await client.query('DELETE FROM usage_reservations WHERE id = ANY($1::uuid[])', [stale.rows.map((row) => row.id)]);
    return stale.rows.length;
  });
}
