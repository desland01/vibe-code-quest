import { describe, expect, it } from 'vitest';

import { LEADERBOARD_COPY } from '@/lib/leaderboard';
import {
  LEADERBOARD_IP_WRITE_MAX_DEFAULT,
  LEADERBOARD_SHAME_TERMS,
  LEADERBOARD_WRITE_KEY_DOMAIN,
  extractClientAddress,
  fetchLeaderboardBoard,
  handleTakenTone,
  isCheckViolation,
  isUniqueViolation,
  leaderboardAbuseIdentity,
  leaderboardIpWriteMax,
  leaderboardStaticCopyValues,
  leaderboardTone,
  leaderboardWriteKeyHash,
  mutationCooldownRemaining,
  mutationCooldownTone,
  normalizeHandle,
  parseLeaderboardPeriod,
  registerLeaderboardWrite,
  validateHandle,
  writeLimitTone,
  type LeaderboardRow,
} from '@/server/leaderboard';

function hasShame(text: string): string[] {
  const lower = text.toLowerCase();
  return LEADERBOARD_SHAME_TERMS.filter((term) => {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Word-boundary-ish: avoid "fellow" matching "fell".
    return new RegExp(`(?:^|[^a-z])${escaped}(?:$|[^a-z])`, 'i').test(lower);
  });
}

describe('L-004 leaderboard pure helpers', () => {
  it('normalizes whitespace and unicode form', () => {
    expect(normalizeHandle('  Vibe   Coder  ')).toBe('Vibe Coder');
    expect(normalizeHandle('\u0041\u030A')).toBe(normalizeHandle('Å'));
  });

  it('accepts valid handles (including after whitespace normalization)', () => {
    const cases: Array<[string, string]> = [
      ['abc', 'abc'],
      ['VibeCoder', 'VibeCoder'],
      ['Vibe_Coder', 'Vibe_Coder'],
      ['Vibe-Coder', 'Vibe-Coder'],
      ['Vibe Coder', 'Vibe Coder'],
      ['a'.repeat(24), 'a'.repeat(24)],
      // normalizeHandle collapses runs of whitespace before validation.
      ['has  two', 'has two'],
      [' spaced ', 'spaced'],
      ['  multi   space  ', 'multi space'],
    ];
    for (const [raw, expected] of cases) {
      const result = validateHandle(raw);
      expect(result.ok, raw).toBe(true);
      if (result.ok) expect(result.handle).toBe(expected);
    }
  });

  it('rejects invalid handles that remain invalid after normalization', () => {
    const bad: Array<[unknown, string]> = [
      [null, 'Handle must be text'],
      [12, 'Handle must be text'],
      ['ab', 'at least'],
      ['a'.repeat(25), 'max is'],
      ['@vibe', 'email or link'],
      ['vibe@host.com', 'email or link'],
      ['https://evil.test', 'email or link'],
      ['http://x', 'email or link'],
      ['_lead', 'Start and end'],
      ['trail-', 'Start and end'],
      ['1234567', 'phone'],
      ['123-456-7890', 'phone'],
      ['bad\nname', 'control'],
    ];
    for (const [raw, needle] of bad) {
      const result = validateHandle(raw);
      expect(result.ok, String(raw)).toBe(false);
      if (!result.ok) expect(result.error.toLowerCase()).toContain(needle.toLowerCase());
    }
  });

  it('parses period aliases', () => {
    expect(parseLeaderboardPeriod('weekly')).toBe('weekly');
    expect(parseLeaderboardPeriod('WEEKLY')).toBe('weekly');
    expect(parseLeaderboardPeriod('all_time')).toBe('all_time');
    expect(parseLeaderboardPeriod('all-time')).toBe('all_time');
    expect(parseLeaderboardPeriod('alltime')).toBe('all_time');
    expect(parseLeaderboardPeriod('monthly')).toBeNull();
    expect(parseLeaderboardPeriod(1)).toBeNull();
  });

  it('emits positive-only tone across rank bands', () => {
    const samples: Array<LeaderboardRow | null> = [
      null,
      { rank: 40, handle: 'Fresh', points: 0, isSelf: true },
      { rank: 1, handle: 'Top', points: 500, isSelf: true },
      { rank: 7, handle: 'Strong', points: 200, isSelf: true },
      { rank: 18, handle: 'Pack', points: 120, isSelf: true },
      { rank: 99, handle: 'Quest', points: 30, isSelf: true },
    ];
    for (const period of ['weekly', 'all_time'] as const) {
      for (const row of samples) {
        const tone = leaderboardTone(row, period);
        expect(hasShame(tone), tone).toEqual([]);
        expect(tone.length).toBeGreaterThan(10);
      }
    }
    expect(hasShame(handleTakenTone('TakenName'))).toEqual([]);
    expect(hasShame(mutationCooldownTone())).toEqual([]);
  });

  it('static UI copy has no shame framing', () => {
    const values = [...leaderboardStaticCopyValues(), ...Object.values(LEADERBOARD_COPY)];
    for (const value of values) {
      expect(hasShame(value), value).toEqual([]);
    }
  });

  it('detects unique/check violations', () => {
    expect(isUniqueViolation({ code: '23505' })).toBe(true);
    expect(isCheckViolation({ code: '23514' })).toBe(true);
    expect(isUniqueViolation({ code: '23503' })).toBe(false);
    expect(isCheckViolation(null)).toBe(false);
  });

  it('maps board rows with is_top separating own-beyond-N', async () => {
    const client = {
      query: async () => ({
        rows: [
          { rank: 1, handle: 'Alpha', points: 300, is_self: false, is_top: true },
          { rank: 2, handle: 'Beta', points: 200, is_self: false, is_top: true },
          { rank: 40, handle: 'Me', points: 10, is_self: true, is_top: false },
        ],
      }),
    };
    const board = await fetchLeaderboardBoard(client as never, 'weekly', 25);
    expect(board.entries).toHaveLength(2);
    expect(board.entries.every((row) => row.handle !== 'Me' || row.rank <= 25)).toBe(true);
    expect(board.own).toEqual({ rank: 40, handle: 'Me', points: 10, isSelf: true });
  });

  it('cooldown remaining uses updated_at', async () => {
    const now = new Date('2026-07-21T18:00:00.000Z');
    const recent = new Date(now.getTime() - 3_000);
    const client = {
      query: async () => ({
        rows: [{ handle: 'Cool', opted_in: true, updated_at: recent }],
      }),
    };
    const remaining = await mutationCooldownRemaining(client as never, 'user', now);
    expect(remaining).toBeGreaterThan(0);
    expect(remaining).toBeLessThanOrEqual(10);

    const cold = {
      query: async () => ({
        rows: [{ handle: 'Cool', opted_in: false, updated_at: new Date(now.getTime() - 60_000) }],
      }),
    };
    expect(await mutationCooldownRemaining(cold as never, 'user', now)).toBe(0);
    expect(await mutationCooldownRemaining({ query: async () => ({ rows: [] }) } as never, 'user', now)).toBe(0);
  });

  it('extracts client address from leftmost x-forwarded-for then x-real-ip', () => {
    expect(
      extractClientAddress(
        new Headers({ 'x-forwarded-for': ' 203.0.113.9, 10.0.0.1 ' }),
      ),
    ).toBe('203.0.113.9');
    expect(extractClientAddress(new Headers({ 'x-real-ip': '198.51.100.4' }))).toBe(
      '198.51.100.4',
    );
    expect(extractClientAddress(new Headers())).toBe('');
  });

  it('abuse identity prefers IP and falls back to session bucket', () => {
    expect(
      leaderboardAbuseIdentity(
        new Headers({ 'x-forwarded-for': '203.0.113.9' }),
        'user-a',
      ),
    ).toBe('203.0.113.9');
    expect(leaderboardAbuseIdentity(new Headers(), 'user-a')).toBe('session:user-a');
    expect(leaderboardAbuseIdentity(new Headers(), '')).toBe('unknown');
  });

  it('HMAC write key is deterministic 64-hex and domain-separated', () => {
    const secret = 'unit-test-secret-not-production';
    const a = leaderboardWriteKeyHash('203.0.113.9', secret);
    const b = leaderboardWriteKeyHash('203.0.113.9', secret);
    const c = leaderboardWriteKeyHash('203.0.113.10', secret);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(a).toBe(b);
    expect(a).not.toBe(c);
    expect(a.includes('203.0.113.9')).toBe(false);
    expect(LEADERBOARD_WRITE_KEY_DOMAIN.length).toBeGreaterThan(0);
    expect(() => leaderboardWriteKeyHash('203.0.113.9', '')).toThrow(/AUTH_SECRET/);
  });

  it('IP write max defaults to 20 and never exceeds the ceiling', () => {
    const prev = process.env.LEADERBOARD_IP_WRITE_MAX;
    try {
      delete process.env.LEADERBOARD_IP_WRITE_MAX;
      expect(leaderboardIpWriteMax()).toBe(LEADERBOARD_IP_WRITE_MAX_DEFAULT);
      process.env.LEADERBOARD_IP_WRITE_MAX = '5';
      expect(leaderboardIpWriteMax()).toBe(5);
      process.env.LEADERBOARD_IP_WRITE_MAX = '999';
      expect(leaderboardIpWriteMax()).toBe(LEADERBOARD_IP_WRITE_MAX_DEFAULT);
      process.env.LEADERBOARD_IP_WRITE_MAX = 'nope';
      expect(leaderboardIpWriteMax()).toBe(LEADERBOARD_IP_WRITE_MAX_DEFAULT);
    } finally {
      if (prev === undefined) delete process.env.LEADERBOARD_IP_WRITE_MAX;
      else process.env.LEADERBOARD_IP_WRITE_MAX = prev;
    }
  });

  it('registerLeaderboardWrite maps SQL allowed boolean', async () => {
    const calls: unknown[][] = [];
    const client = {
      query: async (_sql: string, params: unknown[]) => {
        calls.push(params);
        return { rows: [{ allowed: params[1] === 2 }] };
      },
    };
    await expect(registerLeaderboardWrite(client as never, 'a'.repeat(64), 2)).resolves.toBe(
      true,
    );
    expect(calls[0]?.[0]).toMatch(/^[0-9a-f]{64}$/);
    expect(hasShame(writeLimitTone())).toEqual([]);
  });
});
