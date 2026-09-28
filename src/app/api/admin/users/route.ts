import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    // Role check: Only ADMIN, SUPER_ADMIN, FOUNDER, EXECUTIVE allowed
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const allowedRoles = ["ADMIN", "SUPER_ADMIN", "FOUNDER", "EXECUTIVE"];
    if (!profile || !allowedRoles.includes(profile.role)) {
      return NextResponse.json({ error: "Forbidden: Platform administrator clearance required." }, { status: 403 });
    }

    // 1. Fetch Users
    const { data: usersData, error: usersErr } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    // 2. Fetch Profiles for contact/phone/interests
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("*");

    // 3. Fetch Gamification stats
    const { data: gamificationData } = await supabase
      .from("user_gamification")
      .select("*");

    // 4. Fetch Interviews
    const { data: interviewData } = await supabase
      .from("interview_sessions")
      .select("user_id, overall_score, score");

    // 5. Fetch Quest Completions
    const { data: questData } = await supabase
      .from("quest_completions")
      .select("user_id");

    // 6. Fetch Resumes
    const { data: resumeData } = await supabase
      .from("resumes")
      .select("user_id");

    const profilesMap = new Map((profilesData || []).map(p => [p.id || p.user_id, p]));
    const gamifyMap = new Map((gamificationData || []).map(g => [g.user_id, g]));

    const usersList = (usersData || profilesData || []).map((u: any) => {
      const p = profilesMap.get(u.id || u.user_id) || u;
      const g = gamifyMap.get(u.id || u.user_id);

      const userInterviews = (interviewData || []).filter(i => i.user_id === u.id || i.user_id === u.user_id);
      const avgScore = userInterviews.length > 0
        ? Math.round(userInterviews.reduce((sum, curr) => sum + (curr.overall_score || curr.score || 0), 0) / userInterviews.length)
        : 0;

      const userQuests = (questData || []).filter(q => q.user_id === u.id || q.user_id === u.user_id);
      const userResumes = (resumeData || []).filter(r => r.user_id === u.id || r.user_id === u.user_id);

      return {
        id: u.id || u.user_id,
        name: p.display_name || p.name || u.name || "Learner",
        email: p.email || u.email || "No email",
        phone: p.phone || u.phone || undefined,
        age_band: p.age_band || u.age_band || "18+",
        grade: p.grade_level || u.grade || "College",
        career_stage: p.career_stage || u.career_stage || undefined,
        is_admin: Boolean(u.is_admin || p.role === "ADMIN" || p.role === "SUPER_ADMIN"),
        is_employer: Boolean(u.is_employer || p.role === "EMPLOYER"),
        is_suspended: Boolean(u.is_suspended || p.status === "SUSPENDED"),
        created_at: u.created_at || p.created_at || new Date().toISOString(),
        points: g?.points || 0,
        current_streak: g?.current_streak || 0,
        longest_streak: g?.longest_streak || 0,
        badges_count: g?.badges?.length || 0,
        badges_list: g?.badges || [],
        interviews_count: userInterviews.length,
        avg_interview_score: avgScore,
        quests_completed: userQuests.length,
        resumes_count: userResumes.length,
        interests: p.interests || [],
      };
    });

    return NextResponse.json({
      success: true,
      users: usersList,
      totalCount: usersList.length
    });
  } catch (err: any) {
    console.error("[Admin Users API Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to load users list." }, { status: 500 });
  }
}
