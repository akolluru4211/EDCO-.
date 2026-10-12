import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
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

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await req.json();
    const { applicationId, status, feedbackNote, mockEmployerId } = body;

    const employerId = user?.id || mockEmployerId;
    if (!employerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!applicationId || !status) {
      return NextResponse.json({ error: "Application ID and new status are required" }, { status: 400 });
    }

    const validStatuses = ["viewed_by_employer", "shortlisted", "rejected"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` }, { status: 400 });
    }

    const db = getDbPool();
    const client = await db.connect();
    try {
      // 1. Verify ownership: Job must be posted by this employer
      const checkRes = await client.query(
        `SELECT a.id, a.status, j.posted_by 
         FROM public.job_applications a
         JOIN public.jobs j ON j.id = a.job_id
         WHERE a.id = $1`,
        [applicationId]
      );

      if (checkRes.rowCount === 0) {
        return NextResponse.json({ error: "Application not found" }, { status: 404 });
      }

      const row = checkRes.rows[0];
      if (row.posted_by !== employerId) {
        return NextResponse.json({ error: "Forbidden: You do not own the job for this applicant" }, { status: 403 });
      }

      // If current status is already shortlisted/rejected and trying to mark viewed, leave it
      if (status === "viewed_by_employer" && ["shortlisted", "rejected"].includes(row.status)) {
        return NextResponse.json({ success: true, status: row.status });
      }

      // 2. Perform status update
      const updateRes = await client.query(
        `UPDATE public.job_applications
         SET status = $1,
             feedback_note = COALESCE($2, feedback_note),
             viewed_at = CASE WHEN $1 = 'viewed_by_employer' AND viewed_at IS NULL THEN NOW() ELSE viewed_at END,
             status_updated_at = NOW()
         WHERE id = $3
         RETURNING *`,
        [status, feedbackNote ? feedbackNote.trim() : null, applicationId]
      );

      return NextResponse.json({
        success: true,
        application: updateRes.rows[0],
      });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error("[Employer Status Update Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to update status" }, { status: 500 });
  }
}
