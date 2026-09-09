import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { awardPoints } from "@/lib/gamification-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const problemId = searchParams.get("problemId");
    const userId = searchParams.get("userId");
    const callerId = searchParams.get("callerId");

    let query = supabase.from("problem_solutions").select("*, problems(title, category)");

    if (problemId) query = query.eq("problem_id", problemId);
    if (userId) query = query.eq("user_id", userId);

    const { data: solutions, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Filter by privacy & moderation status:
    // If solution is private or pending classroom, ONLY the owner or admin can view it
    const filtered = (solutions || []).filter((s) => {
      if (callerId && s.user_id === callerId) return true;
      if (s.visibility === "classroom" || s.visibility === "public") {
        return s.moderation_status === "approved";
      }
      return false;
    });

    return NextResponse.json({ success: true, solutions: filtered });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      solutionId,
      problemId,
      userId,
      title,
      description,
      linkedProjectId,
      status = "in_progress",
      visibility = "private"
    } = body;

    if (!problemId || !userId) {
      return NextResponse.json({ error: "problemId and userId are required." }, { status: 400 });
    }

    // Check user track/age_band
    const { data: userRec } = await supabase
      .from("users")
      .select("age_band")
      .eq("id", userId)
      .maybeSingle();

    const isJunior = userRec?.age_band === "13-15";

    // For Junior track: zero linked projects allowed, and classroom visibility defaults to pending moderation
    const safeLinkedProjectId = isJunior ? null : linkedProjectId || null;
    const moderationStatus = (visibility === "classroom" || visibility === "public") ? "pending" : "approved";

    let savedRecord: any = null;

    if (solutionId) {
      // Update draft or submit
      const { data, error } = await supabase
        .from("problem_solutions")
        .update({
          title,
          description,
          linked_project_id: safeLinkedProjectId,
          status,
          visibility,
          moderation_status: moderationStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", solutionId)
        .select()
        .single();

      if (error) throw error;
      savedRecord = data;
    } else {
      // Create new
      const { data, error } = await supabase
        .from("problem_solutions")
        .insert({
          problem_id: problemId,
          user_id: userId,
          title: title || "Proposed Solution",
          description: description || "",
          linked_project_id: safeLinkedProjectId,
          status,
          visibility,
          moderation_status: moderationStatus,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      savedRecord = data;
    }

    // If submitted, award gamification reward & check Problem Solver badge
    let pointsAwarded = false;
    if (status === "submitted") {
      try {
        await awardPoints({
          userId,
          sourceFeature: "problem_solution",
          sourceId: savedRecord.id,
          points: 100,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
        });
        pointsAwarded = true;
      } catch (rewardErr) {
        console.warn("Problem solution reward note:", rewardErr);
      }
    }

    return NextResponse.json({
      success: true,
      solution: savedRecord,
      pointsAwarded,
      message: status === "submitted" 
        ? "Solution submitted successfully! +100 XP awarded." 
        : "Solution draft saved."
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
