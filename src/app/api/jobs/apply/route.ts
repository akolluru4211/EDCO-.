import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { calculateJobMatch } from "@/lib/services/job-match-scorer";
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
    const { jobId, resumeId, resumeSnapshot, coverNote, mockUserId, mockUserEmail, mockUserName } = body;

    const applicantId = user?.id || mockUserId;
    if (!applicantId) {
      return NextResponse.json({ error: "Authentication required to apply" }, { status: 401 });
    }

    if (!jobId) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
    }

    const db = getDbPool();
    const client = await db.connect();

    try {
      // 1. Fetch Job
      const jobRes = await client.query(
        "SELECT id, title, description, skills_required, experience_level, category, is_active, application_deadline FROM public.jobs WHERE id = $1",
        [jobId]
      );

      if (jobRes.rowCount === 0) {
        return NextResponse.json({ error: "Job listing not found" }, { status: 404 });
      }

      const job = jobRes.rows[0];

      if (!job.is_active) {
        return NextResponse.json({ error: "This job listing is no longer active" }, { status: 400 });
      }

      if (job.application_deadline && new Date(job.application_deadline).getTime() < Date.now()) {
        return NextResponse.json({ error: "The application deadline for this position has passed" }, { status: 400 });
      }

      // 2. Check for duplicate application
      const dupRes = await client.query(
        "SELECT id, status FROM public.job_applications WHERE job_id = $1 AND user_id = $2",
        [jobId, applicantId]
      );

      if ((dupRes.rowCount ?? 0) > 0 && dupRes.rows[0].status !== "withdrawn") {
        return NextResponse.json({ error: "You have already submitted an active application for this role" }, { status: 409 });
      }

      // 3. Compute authoritative match score
      const matchAnalysis = calculateJobMatch(
        {
          id: job.id,
          title: job.title,
          description: job.description,
          skillsRequired: job.skills_required || [],
          experienceLevel: job.experience_level,
          category: job.category,
        },
        resumeSnapshot,
        null
      );

      // 4. Save immutable resume snapshot & application with initial 'submitted' status
      const insertRes = await client.query(
        `INSERT INTO public.job_applications (
          job_id,
          user_id,
          resume_id,
          resume_snapshot,
          cover_note,
          status,
          match_score,
          applied_at,
          status_updated_at
        ) VALUES ($1, $2, $3, $4, $5, 'submitted', $6, NOW(), NOW())
        ON CONFLICT (id) DO NOTHING
        RETURNING *;`,
        [
          jobId,
          applicantId,
          (resumeId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(resumeId)) ? resumeId : null,
          JSON.stringify(resumeSnapshot || {}),
          (coverNote || "").trim(),
          matchAnalysis.score,
        ]
      );

      const application = insertRes.rows[0];

      return NextResponse.json({
        success: true,
        application,
        matchAnalysis,
      });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error("[Job Apply Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to submit application" }, { status: 500 });
  }
}
