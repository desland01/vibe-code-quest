import pg, { type PoolClient } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const connectionString = process.env.TEST_DATABASE_URL;
const describeWithDatabase = connectionString ? describe : describe.skip;

if (!connectionString) {
  console.info('Skipping RLS integration tests: TEST_DATABASE_URL is unset.');
}

describeWithDatabase('Postgres RLS matrix', () => {
  const pool = new pg.Pool({ connectionString, max: 3 });
  const userA = '10000000-0000-4000-8000-000000000001';
  const userB = '20000000-0000-4000-8000-000000000002';
  const forgedUser = '30000000-0000-4000-8000-000000000003';

  async function asUser<T>(userId: string, operation: (client: PoolClient) => Promise<T>) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('SET LOCAL ROLE app_user');
      await client.query("SELECT set_config('app.user_id', $1, true)", [userId]);
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

  beforeAll(async () => {
    await pool.query(
      `TRUNCATE processed_webhook_events, region_clicks, share_snapshots,
        usage_ledger, entitlements, progress, profiles CASCADE`
    );
    await pool.query('INSERT INTO profiles (id, email) VALUES ($1, $2), ($3, $4)', [
      userA,
      'rls-a@example.invalid',
      userB,
      'rls-b@example.invalid',
    ]);
    await pool.query(
      `INSERT INTO progress (profile_id, region, landmark, state)
       VALUES ($1, 'foundations', 'variables', '{}'), ($2, 'systems', 'queues', '{}')`,
      [userA, userB]
    );
    await pool.query(
      `INSERT INTO entitlements (profile_id, tier, status)
       VALUES ($1, 'free', 'active'), ($2, 'pro', 'active')`,
      [userA, userB]
    );
    await pool.query(
      `INSERT INTO share_snapshots (token, profile_id, payload)
       VALUES ('share-a', $1, '{}'), ('share-b', $2, '{}')`,
      [userA, userB]
    );
  });

  afterAll(async () => {
    await pool.end();
  });

  it('limits profiles, progress, entitlements, and snapshots to the current user', async () => {
    await asUser(userA, async (client) => {
      for (const table of ['profiles', 'progress', 'entitlements', 'share_snapshots']) {
        const visible = await client.query(`SELECT * FROM ${table}`);
        expect(visible.rows).toHaveLength(1);
        expect(visible.rows[0].profile_id ?? visible.rows[0].id).toBe(userA);
      }

      expect((await client.query('UPDATE profiles SET email = email WHERE id = $1', [userB])).rowCount).toBe(0);
      expect((await client.query("UPDATE progress SET state = '{\"forged\":true}' WHERE profile_id = $1", [userB])).rowCount).toBe(0);
      expect((await client.query("UPDATE share_snapshots SET payload = '{\"forged\":true}' WHERE profile_id = $1", [userB])).rowCount).toBe(0);
      // No UPDATE policy on entitlements: default-deny filters the row set, so the
      // write silently affects 0 rows rather than raising.
      expect(
        (await client.query("UPDATE entitlements SET tier = 'pro' WHERE profile_id = $1", [userA])).rowCount
      ).toBe(0);
    });

    const unchanged = await pool.query('SELECT tier FROM entitlements WHERE profile_id = $1', [userA]);
    expect(unchanged.rows[0].tier).toBe('free');
  });

  it('rejects forged inserts and immutable owner-column updates', async () => {
    await expect(
      asUser(userA, (client) =>
        client.query(
          "INSERT INTO progress (profile_id, region, landmark, state) VALUES ($1, 'forged', 'owner', '{}')",
          [forgedUser]
        )
      )
    ).rejects.toMatchObject({ code: '42501' });

    await expect(
      asUser(userA, (client) =>
        client.query('UPDATE progress SET profile_id = $1 WHERE profile_id = $2', [userB, userA])
      )
    ).rejects.toMatchObject({ code: '42501' });
  });

  it('accepts only allowlisted, bounded insert-only telemetry', async () => {
    await asUser(userA, async (client) => {
      await expect(
        client.query(
          "INSERT INTO region_clicks (profile_id, event_name, payload) VALUES ($1, 'region_click', '{\"region\":\"foundations\"}')",
          [userA]
        )
      ).resolves.toMatchObject({ rowCount: 1 });
      expect((await client.query('SELECT * FROM region_clicks')).rows).toHaveLength(0);
    });

    await expect(
      asUser(userA, (client) =>
        client.query("INSERT INTO region_clicks (profile_id, event_name) VALUES ($1, 'unknown')", [userA])
      )
    ).rejects.toMatchObject({ code: '23514' });

    await expect(
      asUser(userA, (client) =>
        client.query(
          "INSERT INTO region_clicks (profile_id, event_name, payload) VALUES ($1, 'landmark_open', $2::jsonb)",
          [userA, JSON.stringify({ value: 'x'.repeat(3000) })]
        )
      )
    ).rejects.toMatchObject({ code: '23514' });
  });

  it('keeps entitlement and webhook writes on the privileged owner path', async () => {
    await expect(
      asUser(userA, (client) =>
        client.query("INSERT INTO processed_webhook_events (event_id) VALUES ('app-forged')")
      )
    ).rejects.toMatchObject({ code: '42501' });

    await expect(
      pool.query("UPDATE entitlements SET tier = 'pro' WHERE profile_id = $1", [userA])
    ).resolves.toMatchObject({ rowCount: 1 });
    await expect(
      pool.query("INSERT INTO processed_webhook_events (event_id) VALUES ('owner-event')")
    ).resolves.toMatchObject({ rowCount: 1 });
  });
});
