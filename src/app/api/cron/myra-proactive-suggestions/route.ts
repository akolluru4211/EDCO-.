import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { buildMyraUserContext } from "@/lib/ai/myra-context-builder";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return handleProactiveCron(req);
}

export async function POST(req: NextRequest) {
  return handleProactiveCron(req);
}

async function handleProactiveCron(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      const url = new URL(req.url);
      if (url.searchParams.get("key") !== cronSecret && process.env.NODE_ENV === "production") {
        return NextResponse.json({ error: "Unauthorized cron execution" }, { status: 401 });
      }
    }

    const todayDateStr = new Date().toISOString().split("T")[0];

    // 1. Fetch active career-track user profiles (excluding minors)
    const { data: users, error: userErr } = await supabase
      .from("profiles")
      .select("id, name, target_role, age_band, career_stage")
      .or("age_band.eq.18+,age_band.is.null")
      .limit(100);

    if (userErr || !users) {
      return NextResponse.json({ error: "Failed to fetch candidate profiles" }, { status: 500 });
    }

    let generatedCount = 0;

    for (const u of users) {
      try {
        // Check if suggestion already exists for today
        const { data: existing } = await supabase
          .from("myra_proactive_suggestions")
          .select("id")
          .eq("user_id", u.id)
          .eq("date_bucket", todayDateStr)
          .maybeSingle();

        if (existing) continue; // Skip if already created for today

        const context = await buildMyraUserContext(u.id, "proactive_suggestion");
        const signals = context.longitudinalSignals;
        const candidateName = u.name ? u.name.split(" ")[0] : "Learner";
        const targetRole = u.target_role || "Software Engineer";

        let suggestionText = `Ready to accelerate for ${targetRole}? Keep your engineering streak going with a quick mock interview!`;
        let actionLabel = "Start Practice Drill";
        let actionUrl = "/interviews";
        let contextReason = "scheduled_daily_nudge";

        if (signals?.scoreTrend === "dipping") {
          suggestionText = `Hey ${candidateName}, your recent mock interview scores dipped slightly on answer structure. Want to do a focused 10-minute STAR drill?`;
          actionLabel = "Practice STAR Method";
          actionUrl = "/interviews/star-method";
          contextReason = "interview_structure_dip";
        } else if (signals?.hasUnlistedProjects) {
          suggestionText = `You have newly verified projects not yet listed on your primary resume. Align your resume keywords to boost match rates!`;
          actionLabel = "Update Resume";
          actionUrl = "/resumes";
          contextReason = "unlisted_projects";
        }

        await supabase.from("myra_proactive_suggestions").upsert(
          {
            user_id: u.id,
            suggestion_text: suggestionText,
            action_label: actionLabel,
            action_url: actionUrl,
            context_reason: contextReason,
            dismissed: false,
            acted_on: false,
            date_bucket: todayDateStr,
          },
          { onConflict: "user_id,date_bucket" }
        );

        generatedCount++;
      } catch (singleErr) {
        console.warn(`[Proactive Cron User ${u.id} Note]:`, singleErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Generated daily proactive suggestions for ${generatedCount} user(s).`,
      generatedCount,
      date: todayDateStr,
    });
  } catch (err: any) {
    console.error("[Proactive Cron Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to run proactive cron" }, { status: 500 });
  }
}
