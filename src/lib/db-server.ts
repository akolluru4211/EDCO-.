import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  "postgresql://postgres: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@db.wgyscapdywroefsjenno.supabase.co:5432/postgres";

export function getDbPool(): Pool {
  if (!global.__pgPool) {
    global.__pgPool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false,
      },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }
  return global.__pgPool;
}

export async function queryDb<T = any>(text: string, params?: any[]): Promise<{ rows: T[]; rowCount: number | null }> {
  const pool = getDbPool();
  const res = await pool.query(text, params);
  return { rows: res.rows, rowCount: res.rowCount };
}
