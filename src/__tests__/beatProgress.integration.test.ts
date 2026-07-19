import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';

import { BEAT_PROGRESS_UPSERT_SQL } from '@/server/beatProgress';

const connectionString = process.env.TEST_DATABASE_URL;
const describeWithDatabase = connectionString ? describe : describe.skip;

if (!connectionString) {
  console.info('Skipping beat-progress SQL integration tests: TEST_DATABASE_URL is unset.');
}

// Proves the SQL upsert in src/server/beatProgress.ts behaves like the pure merge in
// content/beats/schema.ts. Guarded: requires a Neon branch with the v1 schema applied.
describeWithDatabase('beat progress SQL merge', () => {
  const pool = new pg.Pool({ connectionString, max: 2 });
  const userId = randomUUID();
  const region = 'git';
  const landmark = 'commits-as-checkpoints';

  const beatState = (overrides: Record<string, unknown> = {}) => JSON.stringify({
    v: 1,
    kind: 'beat-sequence',
    furthestBeatIndex: 0,
    checked: false,
    completed: false,
    stampedAt: null,
    ...overrides,
  });

  async function upsert(stateJson: string) {
    const result = await pool.query(BEAT_PROGRESS_UPSERT_SQL, [userId, region, landmark, stateJson]);
    return result.rows[0].state as Record<string, unknown>;
  }

  beforeAll(async () => {
    await pool.query('DELETE FROM progress WHERE profile_id = $1', [userId]);
    await pool.query('INSERT INTO profiles (id, email) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING', [userId, 'beat-merge@example.invalid']);
  });

  afterAll(async () => {
    await pool.query('DELETE FROM progress WHERE profile_id = $1', [userId]);
    await pool.query('DELETE FROM profiles WHERE id = $1', [userId]);
    await pool.end();
  });

  it('inserts, merges indexes/flags, and never regresses terminal state', async () => {
    // insert path
    let state = await upsert(beatState({ furthestBeatIndex: 3 }));
    expect(state.furthestBeatIndex).toBe(3);
    expect(state.checked).toBe(false);
    expect(state.stampedAt).toBeNull();

    // higher index wins
    state = await upsert(beatState({ furthestBeatIndex: 5 }));
    expect(state.furthestBeatIndex).toBe(5);

    // stale lower index absorbed
    state = await upsert(beatState({ furthestBeatIndex: 1 }));
    expect(state.furthestBeatIndex).toBe(5);

    // equal-index checked latches via OR
    state = await upsert(beatState({ furthestBeatIndex: 6, checked: true }));
    expect(state.furthestBeatIndex).toBe(6);
    expect(state.checked).toBe(true);

    // terminal stamp lands over stored JSON null
    const stamp = '2026-07-19T05:00:00.000Z';
    state = await upsert(beatState({ furthestBeatIndex: 7, checked: true, completed: true, stampedAt: stamp }));
    expect(state.completed).toBe(true);
    expect(String(state.stampedAt)).toContain('2026-07-19T05:00:00');

    // stale write cannot unset terminal completion or stamp
    state = await upsert(beatState({ furthestBeatIndex: 2 }));
    expect(state.furthestBeatIndex).toBe(7);
    expect(state.completed).toBe(true);
    expect(String(state.stampedAt)).toContain('2026-07-19T05:00:00');
  });

  it('replaces non-beat legacy state wholesale on first beat write', async () => {
    await pool.query(
      `INSERT INTO progress (profile_id, region, landmark, state)
       VALUES ($1, $2, $3, $4::jsonb)
       ON CONFLICT (profile_id, region, landmark) DO UPDATE SET state = EXCLUDED.state`,
      [userId, region, landmark, JSON.stringify({ old: 'legacy', completed: false })]
    );
    const state = await upsert(beatState({ furthestBeatIndex: 4 }));
    expect(state.kind).toBe('beat-sequence');
    expect(state.furthestBeatIndex).toBe(4);
    expect('old' in state).toBe(false);
  });
});
