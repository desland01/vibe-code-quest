import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth/session';
import { withUserTransaction } from '@/lib/db';
import { isHostedMode } from '@/server/hosting';
import {
  LEADERBOARD_TOP_N,
  fetchLeaderboardBoard,
  getOwnHandle,
  handleTakenTone,
  isCheckViolation,
  isUniqueViolation,
  leaderboardAbuseIdentity,
  leaderboardIpWriteMax,
  leaderboardTone,
  leaderboardWriteKeyHash,
  lockLeaderboardProfile,
  mutationCooldownRemaining,
  mutationCooldownTone,
  optOutLeaderboard,
  parseLeaderboardPeriod,
  registerLeaderboardWrite,
  upsertLeaderboardHandle,
  validateHandle,
  writeLimitTone,
  type LeaderboardPeriod,
} from '@/server/leaderboard';

export const dynamic = 'force-dynamic';

async function authenticatedUserId(): Promise<string | null> {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return (await verifySessionToken(token))?.userId ?? null;
}

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

function periodFromRequest(request: Request): LeaderboardPeriod | null {
  const url = new URL(request.url);
  const raw = url.searchParams.get('period') ?? 'weekly';
  return parseLeaderboardPeriod(raw);
}

function emptyBoard(period: LeaderboardPeriod, unavailable = false) {
  return {
    period,
    entries: [] as Array<{ rank: number; handle: string; points: number; isSelf: boolean }>,
    own: null,
    optedIn: false,
    handle: null as string | null,
    tone: leaderboardTone(null, period),
    ...(unavailable ? { unavailable: true as const } : {}),
  };
}

export async function GET(request: Request) {
  const period = periodFromRequest(request);
  if (!period) {
    return NextResponse.json(
      { error: 'period must be weekly or all_time' },
      { status: 400 },
    );
  }

  // A4.9 no-DB self-host: hide the board gracefully. Hosted DB failures must not
  // look identical to "no database" — return a generic 503 without details.
  if (!isHostedMode()) {
    return NextResponse.json(emptyBoard(period, true), { status: 200 });
  }

  const userId = await authenticatedUserId();
  // Anonymous visitors still get the public board (no is_self). Use a nil UUID
  // so SET LOCAL app.user_id is always a valid uuid string for the definer fn.
  const txnUserId = userId ?? '00000000-0000-0000-0000-000000000000';

  try {
    const payload = await withUserTransaction(txnUserId, async (client) => {
      const { entries, own } = await fetchLeaderboardBoard(client, period, LEADERBOARD_TOP_N);
      const handle = userId ? await getOwnHandle(client, userId) : null;
      return {
        period,
        entries,
        own: userId ? own : null,
        optedIn: Boolean(userId && handle),
        handle: userId ? handle : null,
        tone: leaderboardTone(userId ? own : null, period),
      };
    });
    return NextResponse.json(payload);
  } catch {
    // Never log connection strings or raw DB errors (secrets hygiene).
    return NextResponse.json({ error: 'Leaderboard unavailable.' }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  const userId = await authenticatedUserId();
  if (!userId) return unauthorized();

  // Self-hosted instances never write to the hosted board (A4.9 / KICKOFF L-004).
  if (!isHostedMode()) {
    return NextResponse.json(
      { error: 'Leaderboard opt-in needs a hosted database.' },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    const text = await request.text();
    if (Buffer.byteLength(text, 'utf8') > 512) {
      return NextResponse.json({ error: 'Request too large.' }, { status: 413 });
    }
    body = text ? JSON.parse(text) : null;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Body must be an object.' }, { status: 400 });
  }

  const validated = validateHandle((body as { handle?: unknown }).handle);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  // KICKOFF write-abuse: HMAC IP/session bucket, separate committed txn so failed
  // mutations (409/cooldown) still consume a slot. Never log the raw identity.
  let keyHash: string;
  try {
    const identity = leaderboardAbuseIdentity(request.headers, userId);
    keyHash = leaderboardWriteKeyHash(identity);
  } catch {
    return NextResponse.json({ error: 'Leaderboard unavailable.' }, { status: 503 });
  }

  try {
    const allowed = await withUserTransaction(userId, async (client) => {
      return registerLeaderboardWrite(client, keyHash, leaderboardIpWriteMax());
    });
    if (!allowed) {
      return NextResponse.json({ error: writeLimitTone() }, { status: 429 });
    }
  } catch {
    return NextResponse.json({ error: 'Leaderboard unavailable.' }, { status: 503 });
  }

  try {
    const result = await withUserTransaction(userId, async (client) => {
      await lockLeaderboardProfile(client, userId);
      const cooldown = await mutationCooldownRemaining(client, userId);
      if (cooldown > 0) {
        return { ok: false as const, seconds: cooldown };
      }
      const upserted = await upsertLeaderboardHandle(client, userId, validated.handle);
      const period: LeaderboardPeriod = 'weekly';
      const { entries, own } = await fetchLeaderboardBoard(client, period, LEADERBOARD_TOP_N);
      return {
        ok: true as const,
        handle: upserted.handle,
        optedIn: true,
        period,
        entries,
        own,
        tone: leaderboardTone(own, period),
      };
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: mutationCooldownTone(), retryAfterSeconds: result.seconds },
        { status: 429 },
      );
    }

    return NextResponse.json({
      handle: result.handle,
      optedIn: result.optedIn,
      period: result.period,
      entries: result.entries,
      own: result.own,
      tone: result.tone,
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return NextResponse.json(
        { error: handleTakenTone(validated.handle) },
        { status: 409 },
      );
    }
    if (isCheckViolation(error)) {
      return NextResponse.json(
        { error: 'Handle did not pass server checks. Try a simpler one.' },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: 'Could not save handle.' }, { status: 500 });
  }
}

export async function DELETE() {
  const userId = await authenticatedUserId();
  if (!userId) return unauthorized();

  if (!isHostedMode()) {
    return NextResponse.json({ optedIn: false, handle: null });
  }

  // Soft opt-out is immediate for the board surface, but keeps the row + updated_at
  // so a rejoin cannot wipe the mutation cooldown. Profile lock serializes vs rename.
  // Write-abuse limiter does NOT apply — privacy leave stays unrestricted.
  try {
    await withUserTransaction(userId, async (client) => {
      await lockLeaderboardProfile(client, userId);
      await optOutLeaderboard(client, userId);
    });
    return NextResponse.json({ optedIn: false, handle: null });
  } catch {
    return NextResponse.json({ error: 'Could not leave the board.' }, { status: 500 });
  }
}
