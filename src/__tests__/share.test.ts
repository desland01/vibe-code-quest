import { describe, expect, it, vi } from 'vitest';

import { createShareService, type ShareSnapshotPayload } from '@/server/share';

const manifest = [
  { id: 'db-世界', title: 'Databases 世界'.repeat(20), landmarks: [{ id: 'sql' }, { id: 'graph-🧭' }] },
  { id: 'infra', title: 'Infra', landmarks: [{ id: 'edge' }] }
];

function setup(progress: Array<{ region: string; landmark: string; state: unknown }> = []) {
  const stored = new Map<string, { owner: string; payload: ShareSnapshotPayload; revoked: boolean }>();
  const queryForUser = vi.fn(async (userId: string, text: string, values: unknown[] = []): Promise<{ rows: Record<string, unknown>[] }> => {
    if (text.startsWith('SELECT region')) return { rows: progress };
    if (text.startsWith('INSERT INTO share_snapshots')) {
      stored.set(String(values[0]), { owner: userId, payload: JSON.parse(String(values[2])), revoked: false });
      return { rows: [] };
    }
    if (text.startsWith('UPDATE share_snapshots')) {
      const entry = stored.get(String(values[0]));
      if (!entry || entry.owner !== userId || entry.revoked) return { rows: [] };
      entry.revoked = true;
      return { rows: [{ payload: entry.payload }] };
    }
    throw new Error(`Unexpected query: ${text}`);
  });
  const privilegedQuery = vi.fn(async (_text: string, values: unknown[] = []) => {
    const entry = stored.get(String(values[0]));
    return { rows: entry && !entry.revoked ? [{ payload: entry.payload }] : [] };
  });
  const emit = vi.fn();
  const service = createShareService({
    queryForUser,
    privilegedQuery,
    manifestRegions: manifest,
    now: () => new Date('2026-07-18T12:00:00.000Z'),
    tokenBytes: () => Buffer.from('0123456789abcdef01234567'),
    emit
  });
  return { service, stored, queryForUser, privilegedQuery, emit };
}

describe('share snapshots', () => {
  it('stores only approved aggregate fields and handles unicode/long values', async () => {
    const { service, stored, emit } = setup([
      { region: 'db-世界', landmark: 'sql', state: { completed: true, email: 'never@example.test', raw: 'secret' } },
      { region: 'db-世界', landmark: 'graph-🧭', state: { completed: false } }
    ]);
    const { token } = await service.createSnapshot('profile-secret');
    expect(token).toMatch(/^[A-Za-z0-9_-]{22,}$/);
    const serialized = JSON.stringify(stored.get(token)?.payload);
    expect(serialized).toContain('Databases 世界');
    expect(serialized).not.toContain('profile-secret');
    expect(serialized).not.toContain('never@example.test');
    expect(serialized).not.toContain('raw');
    expect(Object.keys(stored.get(token)?.payload ?? {})).toEqual(['version', 'createdAt', 'regions', 'totals']);
    expect(stored.get(token)?.payload.totals).toEqual({ regionsStarted: 1, landmarksCompleted: 1, landmarksTotal: 3 });
    expect(emit).toHaveBeenCalledWith('share_card_created', { regionsStarted: 1, landmarksCompleted: 1 });
  });

  it('creates a zero-count snapshot for empty progress', async () => {
    const { service, stored } = setup();
    const { token } = await service.createSnapshot('owner');
    expect(stored.get(token)?.payload.totals).toEqual({ regionsStarted: 0, landmarksCompleted: 0, landmarksTotal: 3 });
  });

  it('returns null for unknown and revoked tokens', async () => {
    const { service } = setup();
    expect(await service.getSnapshotByToken('unknown')).toBeNull();
    const { token } = await service.createSnapshot('owner');
    expect(await service.getSnapshotByToken(token)).not.toBeNull();
    expect(await service.revokeSnapshot('owner', token)).toBe(true);
    expect(await service.getSnapshotByToken(token)).toBeNull();
  });

  it('scopes revocation to the owner', async () => {
    const { service, queryForUser } = setup();
    const { token } = await service.createSnapshot('owner-a');
    expect(await service.revokeSnapshot('owner-b', token)).toBe(false);
    expect(await service.getSnapshotByToken(token)).not.toBeNull();
    expect(queryForUser).toHaveBeenLastCalledWith('owner-b', expect.stringContaining('profile_id = $2'), [token, 'owner-b']);
  });
});
