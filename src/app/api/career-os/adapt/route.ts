import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateDailyTimetable } from "@/lib/services/career-learning-os";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { userId, action, newPhaseIndex, changeReason, triggeredBy } = body;

    if (!userId || !action) {
      return NextResponse.json({ error: "Missing required fields: userId, action" }, { status: 400 });
    }

    if (action === "accept") {
      const targetPhase = typeof newPhaseIndex === "number" ? newPhaseIndex : 1;

      // 1. Fetch current roadmap
      const { data: roadmap } = await supabase
        .from("learning_roadmaps")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "active")
        .maybeSingle();

      if (roadmap) {
        const updatedPhases = (roadmap.phases || []).map((p: any, idx: number) => ({
          ...p,
          is_active: idx === targetPhase,
          is_completed: idx < targetPhase
        }));

        await supabase
          .from("learning_roadmaps")
          .update({
            current_phase_index: targetPhase,
            phases: updatedPhases,
            last_adapted_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq("id", roadmap.id);

        // Record history
        await supabase
          .from("roadmap_change_history")
          .insert({
            user_id: userId,
            previous_phase_index: roadmap.current_phase_index,
            new_phase_index: targetPhase,
            change_reason: changeReason || "Performance acceleration verified through high-score drills",
            triggered_by: triggeredBy || "ai_evaluator",
            accepted_by_user: true
          });

        // Regenerate today's tasks
        const { data: goal } = await supabase
          .from("user_career_goals")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();

        const todayStr = new Date().toISOString().split("T")[0];
        await supabase.from("daily_plans").delete().eq("user_id", userId).eq("plan_date", todayStr);
        
        const freshRoadmap = { ...roadmap, current_phase_index: targetPhase, phases: updatedPhases };
        const freshTasks = generateDailyTimetable(userId, todayStr, freshRoadmap, goal || {
          target_role: roadmap.target_role,
          target_timeframe_months: 6,
          available_hours_per_day: 2,
          weekly_target_hours: 14,
          preferred_schedule_blocks: ["morning", "evening"],
          user_id: userId
        });

        await supabase.from("daily_plans").insert(freshTasks.map(t => ({
          user_id: t.user_id,
          plan_date: t.plan_date,
          title: t.title,
          time_block: t.time_block,
          estimated_minutes: t.estimated_minutes,
          task_type: t.task_type,
          status: t.status,
          domain_id: t.domain_id,
          skill_id: t.skill_id,
          resource_url: t.resource_url,
          practice_url: t.practice_url,
          project_id: t.project_id
        })));
      }
    }

    return NextResponse.json({
      success: true,
      message: action === "accept" ? "Curriculum adapted successfully" : "Proposal dismissed"
    });
  } catch (err: any) {
    console.error("[Curriculum Adapt POST Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to process curriculum adaptation" }, { status: 500 });
  }
}
