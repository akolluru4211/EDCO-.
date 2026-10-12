import { Pool } from "pg";

let pool: Pool | null = null;
function getDbPool() {
  if (!pool) {
    const connStr =
      process.env.DATABASE_URL ||
      process.env.POSTGRES_URL ||
      "postgresql://postgres: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@db.wgyscapdywroefsjenno.supabase.co:5432/postgres";
    pool = new Pool({
      connectionString: connStr,
      ssl: { rejectUnauthorized: false },
    });
  }
  return pool;
}

export interface StalenessAuditResult {
  totalChecked: number;
  markedStale: number;
  autoExpired: number;
  activeCount: number;
  timestamp: string;
}

/**
 * Sweeps job listings in public.jobs:
 * 1. Listings older than staleThresholdDays (default 45 days) without verification are flagged as is_stale = true.
 * 2. Listings older than expiryThresholdDays (default 90 days) or past application_deadline / expires_at are deactivated (is_active = false).
 */
export async function runJobStalenessSweep(options?: {
  staleThresholdDays?: number;
  expiryThresholdDays?: number;
}): Promise<StalenessAuditResult> {
  const staleDays = options?.staleThresholdDays ?? 45;
  const expiryDays = options?.expiryThresholdDays ?? 90;
  const db = getDbPool();

  const client = await db.connect();
  try {
    // 1. Mark stale if posted_at or last_verified_at > staleDays ago and not yet marked stale
    const staleRes = await client.query(`
      UPDATE public.jobs
      SET is_stale = TRUE, updated_at = NOW()
      WHERE is_active = TRUE
        AND is_stale = FALSE
        AND (
          COALESCE(last_verified_at, posted_at, created_at) < NOW() - INTERVAL '${staleDays} days'
        )
      RETURNING id;
    `);

    // 2. Auto-expire if past application_deadline or older than expiryDays
    const expireRes = await client.query(`
      UPDATE public.jobs
      SET is_active = FALSE, updated_at = NOW()
      WHERE is_active = TRUE
        AND (
          (expires_at IS NOT NULL AND expires_at < NOW())
          OR (application_deadline IS NOT NULL AND application_deadline < NOW())
          OR (COALESCE(posted_at, created_at) < NOW() - INTERVAL '${expiryDays} days')
        )
      RETURNING id;
    `);

    // 3. Current active count
    const countRes = await client.query(`
      SELECT count(*) as total,
             count(*) FILTER (WHERE is_active = TRUE) as active
      FROM public.jobs;
    `);

    return {
      totalChecked: parseInt(countRes.rows[0]?.total || "0", 10),
      markedStale: staleRes.rowCount || 0,
      autoExpired: expireRes.rowCount || 0,
      activeCount: parseInt(countRes.rows[0]?.active || "0", 10),
      timestamp: new Date().toISOString(),
    };
  } finally {
    client.release();
  }
}
