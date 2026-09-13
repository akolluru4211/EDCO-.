import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id") || req.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ success: true, recommendations: [], count: 0 });
    }

    // 1. Fetch current user's profile
    const { data: myProfile } = await supabase
      .from("profiles")
      .select("id, college, skills, interests, company, industry, career_stage, role")
      .eq("id", userId)
      .maybeSingle();

    if (!myProfile) {
      return NextResponse.json({ success: true, recommendations: [], count: 0 });
    }

    const mySkills: string[] = Array.isArray(myProfile.skills)
      ? myProfile.skills
      : (myProfile.interests || []).map((i: any) => (typeof i === "string" ? i : i.name || i.id));
    const myCollege = (myProfile.college || "").toLowerCase().trim();
    const myCompany = (myProfile.company || "").toLowerCase().trim();

    // 2. Fetch existing connections and blocked users to exclude
    const { data: conns } = await supabase
      .from("connections")
      .select("requester_id, receiver_id")
      .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`);

    const { data: blocks } = await supabase
      .from("user_blocks")
      .select("blocker_id, blocked_id")
      .or(`blocker_id.eq.${userId},blocked_id.eq.${userId}`);

    const excludeIds = new Set<string>([userId]);
    (conns || []).forEach((c: any) => {
      excludeIds.add(c.requester_id);
      excludeIds.add(c.receiver_id);
    });
    (blocks || []).forEach((b: any) => {
      excludeIds.add(b.blocker_id);
      excludeIds.add(b.blocked_id);
    });

    // 3. Fetch potential discoverable candidates
    const { data: candidates } = await supabase
      .from("profiles")
      .select("id, name, username, headline, avatar_url, role, career_stage, college, degree, branch, company, industry, skills, interests, show_in_network, visibility")
      .neq("visibility", "PRIVATE")
      .neq("visibility", "private")
      .limit(50);

    if (!candidates || candidates.length === 0) {
      return NextResponse.json({ success: true, recommendations: [], count: 0 });
    }

    // 4. Score candidates based on REAL signals only (no random math)
    const scoredList: Array<{ profile: any; score: number; reason: string }> = [];

    for (const cand of candidates) {
      if (excludeIds.has(cand.id)) continue;
      if (cand.show_in_network === false) continue;

      let score = 0;
      let reasons: string[] = [];

      // Signal 1: Same College
      if (myCollege && cand.college && cand.college.toLowerCase().trim() === myCollege) {
        score += 3;
        reasons.push(`Also from ${cand.college}`);
      }

      // Signal 2: Same Company
      if (myCompany && cand.company && cand.company.toLowerCase().trim() === myCompany) {
        score += 3;
        reasons.push(`Also at ${cand.company}`);
      }

      // Signal 3: Overlapping skills
      const candSkills: string[] = Array.isArray(cand.skills)
        ? cand.skills
        : (cand.interests || []).map((i: any) => (typeof i === "string" ? i : i.name || i.id));

      const sharedSkills = mySkills.filter((s) =>
        candSkills.some((cs) => cs.toLowerCase() === s.toLowerCase())
      );

      if (sharedSkills.length > 0) {
        score += sharedSkills.length * 2;
        reasons.push(`Shares ${sharedSkills.slice(0, 2).join(", ")}`);
      }

      // ONLY include candidates who have at least one real matching signal (score > 0)
      if (score > 0) {
        const isStudent = (cand.role || "").toUpperCase() === "STUDENT" || Boolean(cand.college && !cand.company);
        scoredList.push({
          profile: {
            userId: cand.id,
            username: cand.username || cand.name?.toLowerCase().replace(/\s+/g, "_") || cand.id.slice(0, 8),
            name: cand.name || "EdWorld Member",
            avatarUrl: cand.avatar_url || null,
            headline: cand.headline || (isStudent ? "Student" : "Working Professional"),
            college: cand.college,
            company: cand.company,
            userType: isStudent ? "STUDENT" : "WORKING_PROFESSIONAL",
            skills: candSkills.slice(0, 4),
            connectionStatus: "none"
          },
          score,
          reason: reasons.join(" • ")
        });
      }
    }

    // Sort by signal strength descending
    scoredList.sort((a, b) => b.score - a.score);

    return NextResponse.json({
      success: true,
      recommendations: scoredList.slice(0, 6).map((item) => ({
        ...item.profile,
        matchReason: item.reason
      })),
      count: scoredList.length
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Internal error" }, { status: 500 });
  }
}
