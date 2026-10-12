import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDbPool } from "@/lib/db-server";
import { verifyUserRole } from "@/lib/server-role-guard";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    let isAuthorized = false;

    // Check 1: Supabase SSR auth
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        const allowedRoles = ["ADMIN", "SUPER_ADMIN", "FOUNDER", "EXECUTIVE"];
        if (profile && allowedRoles.includes(profile.role)) {
          isAuthorized = true;
        }
      }
    } catch {}

    // Check 2: Session token / Cookie auth
    if (!isAuthorized) {
      const sessionCookie = req.cookies.get("edworld_session")?.value;
      const authHeader = req.headers.get("authorization")?.replace("Bearer ", "");
      const token = sessionCookie || authHeader;

      if (token) {
        const roleCheck = await verifyUserRole(token, [
          "ADMIN",
          "SUPER_ADMIN",
          "FOUNDER",
          "EXECUTIVE",
        ]);
        if (roleCheck.authorized) {
          isAuthorized = true;
        }
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Forbidden: Platform administrator clearance required." },
        { status: 403 }
      );
    }

    // Direct Database Query for guaranteed fresh user dossier
    const pool = getDbPool();
    const query = `
      SELECT 
        COALESCE(u.id, p.id) AS id,
        COALESCE(p.name, u.name, 'Learner') AS name,
        COALESCE(u.email, p.email, 'No email') AS email,
        au.phone,
        p.dob,
        COALESCE(p.age_band, u.age_band, '18+') AS age_band,
        COALESCE(p.grade_level, u.grade, 'College') AS grade,
        COALESCE(p.career_stage, u.career_stage, 'college') AS career_stage,
        COALESCE(p.primary_goal, 'Campus Placements & Technical Mastery') AS primary_goal,
        p.interests,
        COALESCE(u.is_admin, p.is_admin, false) AS is_admin,
        COALESCE(u.is_employer, p.is_employer, false) AS is_employer,
        COALESCE(p.created_at, u.created_at, NOW()) AS created_at
      FROM public.users u
      FULL OUTER JOIN public.profiles p ON u.id = p.id
      LEFT JOIN auth.users au ON au.id = COALESCE(u.id, p.id)
      ORDER BY COALESCE(u.created_at, p.created_at) DESC;
    `;

    const result = await pool.query(query);

    const usersList = result.rows.map((r: any) => {
      const rawStage = (r.career_stage || "").toLowerCase();
      const stage =
        rawStage === "working_professional" || rawStage === "professional"
          ? "PROFESSIONAL"
          : "STUDENT";

      return {
        id: r.id,
        name: r.name,
        email: r.email,
        phone: r.phone || undefined,
        institution: undefined,
        age_band: r.age_band,
        grade: r.grade,
        career_stage: stage,
        primary_goal: r.primary_goal,
        onboarding_completed: true,
        interests: r.interests || [],
        is_admin: Boolean(r.is_admin),
        is_employer: Boolean(r.is_employer),
        is_suspended: false,
        created_at: r.created_at,
        points: 0,
        current_streak: 0,
        longest_streak: 0,
        badges_count: 0,
        badges_list: [],
        interviews_count: 0,
        avg_interview_score: 0,
        quests_completed: 0,
        resumes_count: 0,
      };
    });

    return NextResponse.json({
      success: true,
      users: usersList,
      totalCount: usersList.length,
    });
  } catch (err: any) {
    console.error("[Admin Users API Direct DB Error]:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load users list." },
      { status: 500 }
    );
  }
}
