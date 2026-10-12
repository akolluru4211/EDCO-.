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

// Maximum postings allowed per 24 hours per employer account
const MAX_POSTINGS_PER_DAY = 5;

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const url = new URL(req.url);
    const mockEmployerId = url.searchParams.get("employerId");
    const employerId = user?.id || mockEmployerId;

    if (!employerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDbPool();
    const client = await db.connect();
    try {
      const res = await client.query(
        `SELECT j.*, 
                count(a.id) FILTER (WHERE a.status != 'withdrawn') as applicant_count,
                count(a.id) FILTER (WHERE a.status = 'submitted') as pending_count
         FROM public.jobs j
         LEFT JOIN public.job_applications a ON a.job_id = j.id
         WHERE j.posted_by = $1
         GROUP BY j.id
         ORDER BY j.created_at DESC`,
        [employerId]
      );

      return NextResponse.json({
        success: true,
        jobs: res.rows,
      });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error("[Employer Jobs GET Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch jobs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await req.json();
    const {
      title,
      company,
      description,
      location,
      type = "full-time",
      skillsRequired = [],
      salaryRange,
      experienceLevel = "Mid-Level",
      category = "General Tech",
      applicationDeadline,
      mockEmployerId,
    } = body;

    const employerId = user?.id || mockEmployerId;
    if (!employerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validation
    if (!title || !company || !description || description.trim().length < 50) {
      return NextResponse.json(
        { error: "Title, company, and substantial description (minimum 50 characters) are required" },
        { status: 400 }
      );
    }

    const db = getDbPool();
    const client = await db.connect();
    try {
      // Rate Limit Check: max 5 postings per 24 hours
      const rateLimitRes = await client.query(
        `SELECT count(*) as count 
         FROM public.jobs 
         WHERE posted_by = $1 
           AND created_at > NOW() - INTERVAL '24 hours'`,
        [employerId]
      );

      const recentPostings = parseInt(rateLimitRes.rows[0]?.count || "0", 10);
      if (recentPostings >= MAX_POSTINGS_PER_DAY) {
        return NextResponse.json(
          { error: `Posting rate limit reached (${MAX_POSTINGS_PER_DAY} postings per 24 hours). Please try again tomorrow.` },
          { status: 429 }
        );
      }

      // Auto-assign source fields to employer_posted
      const insertRes = await client.query(
        `INSERT INTO public.jobs (
          title,
          company,
          description,
          location,
          type,
          skills_required,
          salary_range,
          experience_level,
          category,
          posted_by,
          source_type,
          source_name,
          posted_at,
          last_verified_at,
          application_deadline,
          is_active,
          moderation_status
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          'employer_posted', $11, NOW(), NOW(), $12, TRUE, 'pending'
        ) RETURNING *`,
        [
          title.trim(),
          company.trim(),
          description.trim(),
          location || "Remote",
          type,
          JSON.stringify(Array.isArray(skillsRequired) ? skillsRequired : [skillsRequired]),
          salaryRange || "Disclosed on Interview",
          experienceLevel,
          category,
          employerId,
          company.trim(),
          applicationDeadline || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        ]
      );

      return NextResponse.json({
        success: true,
        job: insertRes.rows[0],
      });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error("[Employer Job Create Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to create job posting" }, { status: 500 });
  }
}
