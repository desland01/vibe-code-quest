import pg, { type PoolClient, type QueryResult, type QueryResultRow } from 'pg';

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
});

export async function withUserTransaction<T>(
  userId: string,
  operation: (client: PoolClient) => Promise<T>
): Promise<T> {
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

export function queryAsUser<R extends QueryResultRow = QueryResultRow>(
  userId: string,
  text: string,
  values: unknown[] = []
): Promise<QueryResult<R>> {
  return withUserTransaction(userId, (client) => client.query<R>(text, values));
}

