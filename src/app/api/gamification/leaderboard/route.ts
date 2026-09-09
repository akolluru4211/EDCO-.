import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required." }, { status: 400 });
    }

    // 1. Age-Band Security: 18+ Adult Career Track Only
    const { data: userProfile } = await supabase
      .from("users")
      .select("id, name, age_band")
      .eq("id", userId)
      .maybeSingle();

    if (!userProfile || userProfile.age_band !== "18+") {
      return NextResponse.json(
        { error: "Leaderboard is disabled for student safety tracks per Edworld Co wellbeing policies." },
        { status: 403 }
      );
    }

    // 2. Fetch User's Accepted Connections Only (Connection-Scoped)
    const { data: connData } = await supabase
      .from("connections")
      .select("requester_id, recipient_id")
      .eq("status", "accepted")
      .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`);

    const connectedUserIds = new Set<string>([userId]);
    connData?.forEach((c) => {
      if (c.requester_id === userId) connectedUserIds.add(c.recipient_id);
      if (c.recipient_id === userId) connectedUserIds.add(c.requester_id);
    });

    const targetUserIds = Array.from(connectedUserIds);

    // 3. Aggregate points earned in the current calendar week
    const now = new Date();
    const dayOfWeek = now.getUTCDay(); // 0 is Sunday
    const startOfWeek = new Date(now);
    startOfWeek.setUTCDate(now.getUTCDate() - dayOfWeek);
    startOfWeek.setUTCHours(0, 0, 0, 0);

    // Fetch user profiles & stats
    const { data: usersData } = await supabase
      .from("users")
      .select("id, name")
      .in("id", targetUserIds);

    const { data: statsData } = await supabase
      .from("user_stats")
      .select("user_id, points, current_streak")
      .in("user_id", targetUserIds);

    const { data: weeklyEvents } = await supabase
      .from("point_events")
      .select("user_id, points, created_at")
      .in("user_id", targetUserIds)
      .gte("created_at", startOfWeek.toISOString());

    // Build weekly leaderboard
    const weeklyPointsMap: Record<string, number> = {};
    weeklyEvents?.forEach((ev) => {
      weeklyPointsMap[ev.user_id] = (weeklyPointsMap[ev.user_id] || 0) + ev.points;
    });

    const statsMap: Record<string, any> = {};
    statsData?.forEach((s) => {
      statsMap[s.user_id] = s;
    });

    const leaderboard = (usersData || []).map((u) => {
      const uStats = statsMap[u.id] || { points: 0, current_streak: 0 };
      const weeklyPoints = weeklyPointsMap[u.id] || 0;
      return {
        userId: u.id,
        name: u.name || "Candidate",
        isCurrentUser: u.id === userId,
        weeklyPoints: weeklyPoints,
        totalPoints: uStats.points || 0,
        currentStreak: uStats.current_streak || 0,
      };
    });

    // Sort descending by weekly points, then total points
    leaderboard.sort((a, b) => {
      if (b.weeklyPoints !== a.weeklyPoints) return b.weeklyPoints - a.weeklyPoints;
      return b.totalPoints - a.totalPoints;
    });

    // Add rank
    const rankedLeaderboard = leaderboard.map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));

    return NextResponse.json({
      success: true,
      data: {
        scope: "Connection-Scoped (Weekly)",
        weekStart: startOfWeek.toISOString(),
        totalConnectionsInRank: rankedLeaderboard.length,
        leaderboard: rankedLeaderboard,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Leaderboard fetch error" }, { status: 500 });
  }
}
