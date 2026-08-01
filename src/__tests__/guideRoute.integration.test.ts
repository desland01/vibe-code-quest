import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { randomUUID } from 'node:crypto';

const connectionString = process.env.TEST_DATABASE_URL;
const describeWithDatabase = connectionString ? describe : describe.skip;
const { verifySessionTokenMock } = vi.hoisted(() => ({
  verifySessionTokenMock: vi.fn(async () => ({ userId: 'guide-route-test-user' })),
}));

if (!connectionString) {
  console.info('Skipping guide route integration tests: TEST_DATABASE_URL is unset.');
}

vi.mock('next/headers', () => ({
  cookies: async () => ({ get: () => ({ value: 'token' }) }),
}));
vi.mock('@/lib/auth/session', () => ({
  SESSION_COOKIE_NAME: 'ct_session',
  verifySessionToken: verifySessionTokenMock,
}));
vi.mock('@/server/aiDrill', () => ({
  DRILL_HEADER_NAME: 'x-ai-drill',
  drillForUser: () => undefined,
}));
vi.mock('@/server/events', () => ({ recordEvent: vi.fn() }));
vi.mock('@/server/guide', () => ({
  GUIDE_OFFLINE_BANNER: 'offline',
  runGuideTurn: async () => ({
    kind: 'offline',
    canonical: 'A guide response.',
    message: 'A guide response.',
    banner: 'offline',
    escalated: false,
    reason: null,
  }),
}));

describeWithDatabase('guide route first-call integration', () => {
  const pool = new pg.Pool({ connectionString, max: 2 });
  const userId = randomUUID();
  const region = 'databases';
  const landmark = 'sql';
  let post: typeof import('../../app/api/guide/route').POST;

  beforeAll(async () => {
    vi.stubEnv('DATABASE_URL', connectionString!);
    verifySessionTokenMock.mockResolvedValue({ userId });
    ({ POST: post } = await import('../../app/api/guide/route'));
    await pool.query(
      `INSERT INTO profiles (id, email) VALUES ($1, $2)
       ON CONFLICT (id) DO NOTHING`,
      [userId, 'guide-route-test@example.invalid'],
    );
    await pool.query(
      `DELETE FROM guide_sessions WHERE profile_id = $1 AND region = $2 AND landmark = $3`,
      [userId, region, landmark],
    );
  });

  afterAll(async () => {
    await pool.query('DELETE FROM guide_sessions WHERE profile_id = $1', [userId]);
    await pool.query('DELETE FROM profiles WHERE id = $1', [userId]);
    await pool.end();
    vi.unstubAllEnvs();
  });

  it('succeeds on the first request for a fresh profile-region-landmark triple', async () => {
    const response = await post(new Request('http://localhost/api/guide', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ regionId: region, landmarkId: landmark, message: 'When should I use SQL?' }),
    }));

    expect(response.status).toBe(200);
    expect((await response.json()).kind).toBe('offline');
    const session = await pool.query(
      `SELECT profile_id, region, landmark FROM guide_sessions
       WHERE profile_id = $1 AND region = $2 AND landmark = $3`,
      [userId, region, landmark],
    );
    expect(session.rows).toHaveLength(1);
  });
});
