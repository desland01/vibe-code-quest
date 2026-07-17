import 'server-only';

import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';

import type { Pool, PoolClient, QueryResultRow } from 'pg';

import { recordEvent } from '@/server/events';

type Database = Pool | PoolClient;

export class InvalidEmailError extends Error {
  constructor() {
    super('Invalid email');
    this.name = 'InvalidEmailError';
  }
}

export type VerifyOtpResult =
  | { ok: true; challengeId: string; email: string }
  | { ok: false; error: 'not_found' | 'expired' | 'attempts_exceeded' | 'invalid_code' | 'replay' };

export type UpgradeResult =
  | { kind: 'upgraded'; userId: string }
  | { kind: 'merged'; userId: string };

function authSecret(): string {
  if (!process.env.AUTH_SECRET) throw new Error('AUTH_SECRET is required');
  return process.env.AUTH_SECRET;
}

export function normalizeEmail(email: string): string {
  const normalized = email.trim().toLowerCase();
  if (
    normalized.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)
  ) {
    throw new InvalidEmailError();
  }
  return normalized;
}

export function hashOtpCode(code: string): string {
  return createHmac('sha256', authSecret()).update(code).digest('hex');
}

async function transaction<T>(database: Database, operation: (client: PoolClient) => Promise<T>): Promise<T> {
  if (!('connect' in database)) return operation(database);
  const client = await (database as Pool).connect();
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

export async function createOtpChallenge(database: Database, profileId: string, email: string) {
  const normalizedEmail = normalizeEmail(email);
  const code = randomInt(0, 1_000_000).toString().padStart(6, '0');

  return transaction(database, async (client) => {
    await client.query(
      'UPDATE otp_challenges SET consumed_at = now() WHERE profile_id = $1 AND consumed_at IS NULL',
      [profileId]
    );
    const result = await client.query<{ id: string }>(
      `INSERT INTO otp_challenges (profile_id, email, code_hash, expires_at)
       VALUES ($1, $2, $3, now() + interval '10 minutes') RETURNING id`,
      [profileId, normalizedEmail, hashOtpCode(code)]
    );
    return { challengeId: result.rows[0].id, code };
  });
}

export async function verifyOtpChallenge(
  database: Database,
  profileId: string,
  code: string
): Promise<VerifyOtpResult> {
  return transaction(database, async (client) => {
    const latest = await client.query<{
      id: string; email: string; code_hash: string; expires_at: Date; consumed_at: Date | null; attempts: number;
    }>(
      `SELECT id, email, code_hash, expires_at, consumed_at, attempts
       FROM otp_challenges WHERE profile_id = $1 ORDER BY created_at DESC LIMIT 1 FOR UPDATE`,
      [profileId]
    );
    const challenge = latest.rows[0];
    if (!challenge) return { ok: false, error: 'not_found' };
    if (challenge.consumed_at) return { ok: false, error: 'replay' };

    const incremented = await client.query<{ attempts: number }>(
      `UPDATE otp_challenges SET attempts = attempts + 1
       WHERE id = $1 AND attempts < 5 RETURNING attempts`,
      [challenge.id]
    );
    if (!incremented.rows[0]) return { ok: false, error: 'attempts_exceeded' };
    if (challenge.expires_at.getTime() <= Date.now()) return { ok: false, error: 'expired' };

    const suppliedHash = hashOtpCode(code);
    const expected = Buffer.from(challenge.code_hash, 'hex');
    const supplied = Buffer.from(suppliedHash, 'hex');
    if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) {
      return { ok: false, error: 'invalid_code' };
    }

    await client.query('UPDATE otp_challenges SET consumed_at = now() WHERE id = $1', [challenge.id]);
    return { ok: true, challengeId: challenge.id, email: challenge.email };
  });
}

export async function applyUpgrade(database: Database, profileId: string, email: string): Promise<UpgradeResult> {
  const normalizedEmail = normalizeEmail(email);
  const result = await transaction(database, async (client) => {
    const existing = await client.query<{ id: string }>(
      'SELECT id FROM profiles WHERE email = $1 FOR UPDATE',
      [normalizedEmail]
    );
    const targetId = existing.rows[0]?.id;
    if (!targetId || targetId === profileId) {
      await client.query('UPDATE profiles SET email = $1 WHERE id = $2', [normalizedEmail, profileId]);
      return { kind: 'upgraded', userId: profileId } as const;
    }

    await client.query(
      `INSERT INTO progress (profile_id, region, landmark, state, updated_at)
       SELECT $1, region, landmark, state, updated_at FROM progress WHERE profile_id = $2
       ON CONFLICT (profile_id, region, landmark) DO UPDATE
       SET state = EXCLUDED.state, updated_at = EXCLUDED.updated_at
       WHERE EXCLUDED.updated_at > progress.updated_at`,
      [targetId, profileId]
    );
    return { kind: 'merged', userId: targetId } as const;
  });
  recordEvent('account_upgraded', { sourceUserId: profileId, userId: result.userId, kind: result.kind });
  return result;
}

export async function wasOtpRequestedRecently(database: Database, profileId: string): Promise<boolean> {
  const result = await database.query<QueryResultRow>(
    `SELECT 1 FROM otp_challenges
     WHERE profile_id = $1 AND created_at > now() - interval '30 seconds' LIMIT 1`,
    [profileId]
  );
  return Boolean(result.rows[0]);
}
