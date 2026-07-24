import 'server-only';

import { createHmac } from 'node:crypto';
import type { PoolClient } from 'pg';

import {
  LEADERBOARD_COPY,
  LEADERBOARD_HANDLE_MAX,
  LEADERBOARD_HANDLE_MIN,
  LEADERBOARD_TOP_N,
  type LeaderboardPeriod,
  type LeaderboardRow,
} from '@/lib/leaderboard';

export {
  LEADERBOARD_COPY,
  LEADERBOARD_HANDLE_MAX,
  LEADERBOARD_HANDLE_MIN,
  LEADERBOARD_TOP_N,
  type LeaderboardPeriod,
  type LeaderboardRow,
};

export type LeaderboardBoard = {
  period: LeaderboardPeriod;
  entries: LeaderboardRow[];
  own: LeaderboardRow | null;
  optedIn: boolean;
  handle: string | null;
  tone: string;
};

export type LeaderboardClient = Pick<PoolClient, 'query'>;

/** Minimum seconds between handle mutations (join / rename / rejoin). */
export const LEADERBOARD_MUTATION_COOLDOWN_SECONDS = 10;

/** Max join/rename PUTs per hashed IP per UTC hour (KICKOFF write-abuse coverage). */
export const LEADERBOARD_IP_WRITE_MAX_DEFAULT = 20;

/** Domain-separated HMAC input prefix — never store raw IPs. */
export const LEADERBOARD_WRITE_KEY_DOMAIN = 'leaderboard-write-ip:v1';

export function leaderboardIpWriteMax(): number {
  const raw = process.env.LEADERBOARD_IP_WRITE_MAX;
  if (raw === undefined || raw === '') return LEADERBOARD_IP_WRITE_MAX_DEFAULT;
  const n = Number(raw);
  if (!Number.isSafeInteger(n) || n < 1) return LEADERBOARD_IP_WRITE_MAX_DEFAULT;
  return Math.min(n, LEADERBOARD_IP_WRITE_MAX_DEFAULT);
}

/**
 * Extract a client address for write-abuse accounting.
 * Prefer the leftmost x-forwarded-for hop (Vercel/proxy trust boundary in prod),
 * then x-real-ip. Never throws, never logs the value.
 * Callers should fall back to a session-scoped bucket when this returns empty.
 */
export function extractClientAddress(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim() ?? '';
    if (first.length > 0 && first.length <= 128) return first;
  }
  const realIp = headers.get('x-real-ip')?.trim() ?? '';
  if (realIp.length > 0 && realIp.length <= 128) return realIp;
  return '';
}

/**
 * Abuse identity for join/rename PUTs.
 * IP when present; otherwise session:<userId> so local/direct traffic does not
 * share one global bucket. Never logs the raw value.
 */
export function leaderboardAbuseIdentity(headers: Headers, userId: string): string {
  const ip = extractClientAddress(headers);
  if (ip) return ip;
  const id = String(userId || '').trim();
  if (id) return `session:${id}`;
  return 'unknown';
}

/** HMAC-SHA256 hex key for a client address. Requires AUTH_SECRET. */
export function leaderboardWriteKeyHash(address: string, secret = process.env.AUTH_SECRET): string {
  if (!secret) {
    throw new Error('AUTH_SECRET is required for leaderboard write limiting');
  }
  const normalized = String(address || 'unknown').trim().toLowerCase() || 'unknown';
  return createHmac('sha256', secret)
    .update(LEADERBOARD_WRITE_KEY_DOMAIN)
    .update('\0')
    .update(normalized)
    .digest('hex');
}

export const LEADERBOARD_REGISTER_WRITE_SQL = `
SELECT leaderboard_register_write($1, $2) AS allowed
`;

/**
 * Atomically register a join/rename attempt against the hourly IP bucket.
 * Returns true when under the cap. Never receives or stores a raw address.
 */
export async function registerLeaderboardWrite(
  client: LeaderboardClient,
  keyHash: string,
  max: number = leaderboardIpWriteMax(),
): Promise<boolean> {
  const result = await client.query<{ allowed: boolean }>(LEADERBOARD_REGISTER_WRITE_SQL, [
    keyHash,
    max,
  ]);
  return Boolean(result.rows[0]?.allowed);
}

export function writeLimitTone(): string {
  return LEADERBOARD_COPY.cooldownFallback;
}

const PERIOD_ALIASES: Record<string, LeaderboardPeriod> = {
  weekly: 'weekly',
  all_time: 'all_time',
  'all-time': 'all_time',
  alltime: 'all_time',
};

/** Collapse whitespace, trim. Does not validate. */
export function normalizeHandle(raw: string): string {
  return String(raw ?? '')
    .normalize('NFKC')
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Server-side handle validation.
 * Length 3–24, letters/numbers/space/_/-, alphanumeric start/end,
 * no @, no URLs, no control chars, no double spaces, no phone-like digit runs.
 */
export function validateHandle(raw: unknown):
  | { ok: true; handle: string }
  | { ok: false; error: string } {
  if (typeof raw !== 'string') {
    return { ok: false, error: 'Handle must be text.' };
  }
  // Reject control chars on the raw input before normalizeHandle collapses \s → space.
  if (/[\u0000-\u001f\u007f]/.test(raw)) {
    return { ok: false, error: 'Handle cannot include control characters.' };
  }
  const handle = normalizeHandle(raw);
  if (handle.length < LEADERBOARD_HANDLE_MIN) {
    return { ok: false, error: `Handle needs at least ${LEADERBOARD_HANDLE_MIN} characters.` };
  }
  if (handle.length > LEADERBOARD_HANDLE_MAX) {
    return { ok: false, error: `Handle max is ${LEADERBOARD_HANDLE_MAX} characters.` };
  }
  // Defense in depth after normalization.
  if (/[\u0000-\u001f\u007f]/.test(handle)) {
    return { ok: false, error: 'Handle cannot include control characters.' };
  }
  if (handle.includes('@') || /https?:\/\//i.test(handle)) {
    return { ok: false, error: 'Handle cannot look like an email or link.' };
  }
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw.trim())) {
    return { ok: false, error: 'Handle cannot look like an email or link.' };
  }
  // 3–24 ASCII alnum/space/_/- ; must start and end alnum.
  // Double spaces are collapsed by normalizeHandle before this check.
  if (!/^[A-Za-z0-9](?:[A-Za-z0-9 _-]*[A-Za-z0-9])?$/.test(handle)) {
    return {
      ok: false,
      error: 'Use letters, numbers, spaces, _ or -. Start and end with a letter or number.',
    };
  }
  // Reject phone-like digit runs (public handle should not look like a number).
  const digitsOnly = handle.replace(/\D/g, '');
  if (digitsOnly.length >= 7 && digitsOnly.length === handle.replace(/[\s_-]/g, '').length) {
    return { ok: false, error: 'Handle cannot look like a phone number.' };
  }
  return { ok: true, handle };
}

export function parseLeaderboardPeriod(raw: unknown): LeaderboardPeriod | null {
  if (typeof raw !== 'string') return null;
  return PERIOD_ALIASES[raw.trim().toLowerCase()] ?? null;
}

/**
 * Positive-only copy for rank states. Never negative framing, never red/negative deltas.
 * Climb/drop deltas are intentionally absent: prior rank is not stored, so
 * fabricating "you leapt 3 spots" would be dishonest. Warm static copy only.
 */
export function leaderboardTone(row: LeaderboardRow | null, period: LeaderboardPeriod): string {
  if (!row) {
    return period === 'weekly'
      ? LEADERBOARD_COPY.defaultToneWeekly
      : LEADERBOARD_COPY.defaultToneAllTime;
  }
  if (row.points <= 0) {
    return `You’re on the board as ${row.handle}. Stamp a landmark and watch the XP stack.`;
  }
  if (row.rank === 1) {
    return period === 'weekly'
      ? `Rank 1 this week — ${row.handle}, what a quest!`
      : `Rank 1 all-time — ${row.handle}, legendary pace.`;
  }
  if (row.rank <= 10) {
    return `Rank ${row.rank} — strong quest energy, ${row.handle}.`;
  }
  if (row.rank <= 25) {
    return `Rank ${row.rank} — you’re in the top pack. Keep stamping.`;
  }
  return `Rank ${row.rank} — your quest continues, and every stamp moves you.`;
}

/** Warm copy when a handle is already taken (409). */
export function handleTakenTone(handle: string): string {
  return `“${handle}” is already on a quest. Try a small twist — still you, still fun.`;
}

export function mutationCooldownTone(): string {
  return LEADERBOARD_COPY.cooldownFallback;
}

/**
 * Forbidden negative-framing substrings for regression tests (R041).
 * Keep short whole-word-ish tokens; tests scan with word-boundary-ish matching.
 */
export const LEADERBOARD_SHAME_TERMS = [
  'lost',
  'dropped',
  'fell',
  'behind',
  'shame',
  'last place',
  'you lost',
  'falling',
  'slipped',
  'worst',
] as const;

/** All static UI strings that must stay free of LEADERBOARD_SHAME_TERMS. */
export function leaderboardStaticCopyValues(): string[] {
  return Object.values(LEADERBOARD_COPY);
}

export const LEADERBOARD_UPSERT_SQL = `
INSERT INTO leaderboard_entries (profile_id, handle, opted_in, opted_in_at, updated_at)
VALUES ($1, $2, true, now(), now())
ON CONFLICT (profile_id) DO UPDATE
  SET handle = EXCLUDED.handle,
      opted_in = true,
      opted_in_at = CASE
        WHEN leaderboard_entries.opted_in = false THEN now()
        ELSE leaderboard_entries.opted_in_at
      END,
      updated_at = now()
RETURNING handle, opted_in, opted_in_at, updated_at
`;

export const LEADERBOARD_OPTOUT_SQL = `
UPDATE leaderboard_entries
SET opted_in = false,
    updated_at = now()
WHERE profile_id = $1
  AND opted_in = true
RETURNING handle
`;

export const LEADERBOARD_OWN_SQL = `
SELECT handle, opted_in, updated_at
FROM leaderboard_entries
WHERE profile_id = $1
`;

export const LEADERBOARD_BOARD_SQL = `
SELECT rank, handle, points, is_self, is_top
FROM leaderboard_board($1, $2)
`;

type BoardDbRow = {
  rank: number;
  handle: string;
  points: number;
  is_self: boolean;
  is_top: boolean;
};

export type OwnEntry = {
  handle: string;
  optedIn: boolean;
  updatedAt: Date;
};

export async function getOwnEntry(
  client: LeaderboardClient,
  userId: string,
): Promise<OwnEntry | null> {
  const result = await client.query<{
    handle: string;
    opted_in: boolean;
    updated_at: Date;
  }>(LEADERBOARD_OWN_SQL, [userId]);
  const row = result.rows[0];
  if (!row) return null;
  return {
    handle: row.handle,
    optedIn: Boolean(row.opted_in),
    updatedAt: row.updated_at,
  };
}

export async function getOwnHandle(
  client: LeaderboardClient,
  userId: string,
): Promise<string | null> {
  const entry = await getOwnEntry(client, userId);
  if (!entry || !entry.optedIn) return null;
  return entry.handle;
}

/**
 * Reject rapid handle churn. Returns seconds remaining if still cooling down.
 * Soft-opted-out rows keep updated_at so rejoin cannot bypass the cooldown.
 */
export async function mutationCooldownRemaining(
  client: LeaderboardClient,
  userId: string,
  now: Date = new Date(),
): Promise<number> {
  const entry = await getOwnEntry(client, userId);
  if (!entry) return 0;
  const elapsedMs = now.getTime() - new Date(entry.updatedAt).getTime();
  const remaining = LEADERBOARD_MUTATION_COOLDOWN_SECONDS - elapsedMs / 1000;
  return remaining > 0 ? Math.ceil(remaining) : 0;
}

export async function fetchLeaderboardBoard(
  client: LeaderboardClient,
  period: LeaderboardPeriod,
  limit: number = LEADERBOARD_TOP_N,
): Promise<{ entries: LeaderboardRow[]; own: LeaderboardRow | null }> {
  const result = await client.query<BoardDbRow>(LEADERBOARD_BOARD_SQL, [period, limit]);
  const entries: LeaderboardRow[] = [];
  let own: LeaderboardRow | null = null;

  for (const row of result.rows) {
    const mapped: LeaderboardRow = {
      rank: Number(row.rank),
      handle: row.handle,
      points: Number(row.points),
      isSelf: Boolean(row.is_self),
    };
    if (mapped.isSelf) own = mapped;
    // is_top is the SQL display_ord slice — use it so tied ranks at the cutoff
    // never leave a own-beyond-N row in the main list just because rank <= limit.
    if (Boolean(row.is_top)) {
      entries.push(mapped);
    }
  }

  if (!own) {
    own = entries.find((e) => e.isSelf) ?? null;
  }

  return { entries, own };
}

/**
 * Serialize leaderboard mutations for one profile inside the open transaction.
 * Prevents concurrent first-time joins / renames from racing the cooldown check.
 */
export async function lockLeaderboardProfile(
  client: LeaderboardClient,
  userId: string,
): Promise<void> {
  await client.query(`SELECT id FROM profiles WHERE id = $1 FOR UPDATE`, [userId]);
}

export async function upsertLeaderboardHandle(
  client: LeaderboardClient,
  userId: string,
  handle: string,
): Promise<{ handle: string }> {
  const result = await client.query<{ handle: string }>(LEADERBOARD_UPSERT_SQL, [userId, handle]);
  return { handle: result.rows[0]!.handle };
}

/** Soft opt-out: keep the row so cooldown history cannot be wiped. */
export async function optOutLeaderboard(
  client: LeaderboardClient,
  userId: string,
): Promise<boolean> {
  const result = await client.query(LEADERBOARD_OPTOUT_SQL, [userId]);
  return (result.rowCount ?? 0) > 0;
}

export function isUniqueViolation(error: unknown): boolean {
  return Boolean(
    error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code?: string }).code === '23505',
  );
}

export function isCheckViolation(error: unknown): boolean {
  return Boolean(
    error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code?: string }).code === '23514',
  );
}
