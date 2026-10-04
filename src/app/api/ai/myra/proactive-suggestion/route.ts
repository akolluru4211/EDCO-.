import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { buildMyraUserContext } from "@/lib/ai/myra-context-builder";
import { MyraOrchestrator } from "@/lib/ai/myra-orchestration";

export const dynamic = "force-dynamic";

/**
 * GET /api/ai/myra/proactive-suggestion?userId=<uid>
 * Returns exactly one active contextual proactive suggestion for today.
 * If not yet generated, generates it on-the-fly and saves with date_bucket = CURRENT_DATE.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId || userId === "guest" || userId === "learner-user") {
      return NextResponse.json({ suggestion: null });
    }

    const todayDateStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    // 1. Check if suggestion already exists for today
    const { data: existing } = await supabase
      .from("myra_proactive_suggestions")
      .select("*")
      .eq("user_id", userId)
      .eq("date_bucket", todayDateStr)
      .maybeSingle();

    if (existing) {
      if (existing.dismissed) {
        return NextResponse.json({ suggestion: null, dismissedToday: true });
      }
      return NextResponse.json({ suggestion: existing });
    }

    // 2. Build scoped longitudinal context
    const context = await buildMyraUserContext(userId, "proactive_suggestion");
    const p = context.profileSnapshot;
    const signals = context.longitudinalSignals;
    const candidateName = p?.name ? p.name.split(" ")[0] : "Learner";
    const targetRole = p?.targetRole || "Software Engineer";

    // Rule-based high-confidence suggestions based on actual facts
    let suggestionText = "";
    let actionLabel = "";
    let actionUrl = "";
    let contextReason = "";

    if (signals?.scoreTrend === "dipping") {
      suggestionText = `Hey ${candidateName}, your recent mock interview scores dipped slightly on answer structure. Want to do a quick 10-minute STAR method behavioral drill for ${targetRole}?`;
      actionLabel = "Practice STAR Method";
      actionUrl = "/interviews/star-method";
      contextReason = "interview_structure_dip";
    } else if (signals?.hasUnlistedProjects) {
      suggestionText = `You recently added new verified projects that aren't highlighted in your primary resume yet. Want to align your resume keywords for ${targetRole}?`;
      actionLabel = "Update Resume";
      actionUrl = "/resumes";
      contextReason = "unlisted_projects";
    } else if (signals?.daysSinceLastInterview && signals.daysSinceLastInterview > 5) {
      suggestionText = `It's been ${signals.daysSinceLastInterview} days since your last technical drill. Keep your interview reflexes sharp with a 3D mock session!`;
      actionLabel = "Start 3D Mock Interview";
      actionUrl = "/interviews";
      contextReason = "interview_cadence";
    } else if (signals?.daysSinceLastResumeUpdate && signals.daysSinceLastResumeUpdate > 14) {
      suggestionText = `Top hiring teams are posting new openings in your sector. Check your ATS match score against live job descriptions today!`;
      actionLabel = "Check Job Matches";
      actionUrl = "/resumes";
      contextReason = "resume_freshness";
    } else {
      suggestionText = `You're on track for ${targetRole}! Review high-frequency system design and distributed caching patterns to elevate your technical bar.`;
      actionLabel = "Review System Design";
      actionUrl = "/interviews";
      contextReason = "general_acceleration";
    }

    // 3. Insert single suggestion for today with UNIQUE(user_id, date_bucket)
    const { data: newSuggestion, error: insertErr } = await supabase
      .from("myra_proactive_suggestions")
      .upsert(
        {
          user_id: userId,
          suggestion_text: suggestionText,
          action_label: actionLabel,
          action_url: actionUrl,
          context_reason: contextReason,
          dismissed: false,
          acted_on: false,
          date_bucket: todayDateStr,
        },
        { onConflict: "user_id,date_bucket" }
      )
      .select()
      .maybeSingle();

    if (insertErr) {
      console.warn("[Myra Proactive Suggestion Upsert Note]:", insertErr);
    }

    return NextResponse.json({
      suggestion: newSuggestion || {
        id: "temp_today",
        suggestion_text: suggestionText,
        action_label: actionLabel,
        action_url: actionUrl,
        dismissed: false,
      },
    });
  } catch (err: any) {
    console.error("[Proactive Suggestion GET Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to load proactive suggestion" }, { status: 500 });
  }
}

/**
 * POST /api/ai/myra/proactive-suggestion
 * Dismiss or mark as acted upon.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { suggestionId, userId, action = "dismiss" } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const todayDateStr = new Date().toISOString().split("T")[0];

    if (action === "dismiss") {
      if (suggestionId && suggestionId !== "temp_today") {
        await supabase
          .from("myra_proactive_suggestions")
          .update({ dismissed: true })
          .eq("id", suggestionId)
          .eq("user_id", userId);
      } else {
        await supabase
          .from("myra_proactive_suggestions")
          .update({ dismissed: true })
          .eq("user_id", userId)
          .eq("date_bucket", todayDateStr);
      }

      return NextResponse.json({ success: true, message: "Suggestion dismissed for today." });
    }

    if (action === "act") {
      if (suggestionId && suggestionId !== "temp_today") {
        await supabase
          .from("myra_proactive_suggestions")
          .update({ acted_on: true })
          .eq("id", suggestionId)
          .eq("user_id", userId);
      }
      return NextResponse.json({ success: true, message: "Suggestion marked as acted on." });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("[Proactive Suggestion POST Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to update suggestion" }, { status: 500 });
  }
}
