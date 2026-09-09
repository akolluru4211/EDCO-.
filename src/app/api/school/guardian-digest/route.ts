import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentId, guardianEmail, frequency = "weekly" } = body;

    if (!studentId || !guardianEmail) {
      return NextResponse.json({ error: "studentId and guardianEmail are required." }, { status: 400 });
    }

    // 1. Fetch user stats (Aggregated & non-invasive only)
    const { data: stats } = await supabase
      .from("user_stats")
      .select("points, current_streak, longest_streak")
      .eq("user_id", studentId)
      .maybeSingle();

    const { data: questsProgress } = await supabase
      .from("user_quest_progress")
      .select("quest_id, points_earned")
      .eq("user_id", studentId);

    const completedQuestsCount = questsProgress ? new Set(questsProgress.map(q => q.quest_id)).size : 0;

    // 2. Construct Safe, Non-Invasive Digest Payload
    // NEVER contains journal entries, private messages, or specific quiz answers
    const digestPayload = {
      studentId,
      guardianEmail,
      frequency,
      digestDate: new Date().toISOString().split("T")[0],
      summary: {
        totalPointsEarned: stats?.points || 0,
        activeStreakDays: stats?.current_streak || 0,
        completedQuestsCount,
        learningPillarsPracticed: ["Digital & Logic Exploration", "Communication Practice"]
      },
      privacyNote: "Edworld Co Youth Privacy Standard: This digest contains high-level aggregate learning milestones only. Reflective journals, private messages, and individual question responses remain strictly confidential to the student."
    };

    // Save or update subscription
    await supabase.from("guardian_digest_subscriptions").upsert({
      student_id: studentId,
      guardian_email: guardianEmail,
      frequency,
      enabled: true
    });

    return NextResponse.json({
      success: true,
      digest: digestPayload
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Guardian digest error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const studentId = req.nextUrl.searchParams.get("studentId");
    if (!studentId) {
      return NextResponse.json({ error: "studentId is required." }, { status: 400 });
    }

    const { data: subscription } = await supabase
      .from("guardian_digest_subscriptions")
      .select("*")
      .eq("student_id", studentId)
      .maybeSingle();

    return NextResponse.json({
      subscription: subscription || null
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
