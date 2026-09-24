import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { 
  getOrInitializeCareerPlan, 
  generateUnifiedRoadmap, 
  generateDailyTimetable 
} from "@/lib/services/career-learning-os";
import { UserDomainItem, UserCareerGoal } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id") || req.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized: User ID is required" }, { status: 401 });
    }

    const plan = await getOrInitializeCareerPlan(userId, supabase);
    return NextResponse.json({
      success: true,
      plan
    });
  } catch (err: any) {
    console.error("[Career OS GET Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to load Career Learning OS" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { 
      userId, 
      targetRole, 
      targetIndustry, 
      timeframeMonths, 
      availableHoursPerDay, 
      preferredScheduleBlocks,
      domains,
      regenerateRoadmap 
    } = body;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized: User ID is required" }, { status: 401 });
    }

    // 1. Update Career Goal if provided
    let updatedGoal: UserCareerGoal | null = null;
    if (targetRole || availableHoursPerDay || timeframeMonths) {
      const goalPayload = {
        user_id: userId,
        target_role: targetRole || "Full Stack Software Engineer",
        target_industry: targetIndustry || "Technology & High Growth Startups",
        target_timeframe_months: timeframeMonths || 6,
        available_hours_per_day: availableHoursPerDay || 2,
        weekly_target_hours: (availableHoursPerDay || 2) * 7,
        preferred_schedule_blocks: preferredScheduleBlocks || ["morning", "evening"],
        updated_at: new Date().toISOString()
      };

      const { data: gData } = await supabase
        .from("user_career_goals")
        .upsert(goalPayload, { onConflict: "user_id" })
        .select("*")
        .single();
      updatedGoal = gData;
    }

    // 2. Update Domains if provided
    if (domains && Array.isArray(domains)) {
      for (const d of domains) {
        await supabase
          .from("user_domains")
          .upsert({
            user_id: userId,
            domain_id: d.domain_id || d.id,
            domain_name: d.domain_name || d.name,
            priority: d.priority || "primary",
            self_level: d.self_level ?? 1,
            effective_level: d.effective_level ?? d.self_level ?? 1,
            updated_at: new Date().toISOString()
          }, { onConflict: "user_id,domain_id" });
      }
    }

    // 3. Regenerate Roadmap if requested
    if (regenerateRoadmap) {
      const { data: currentDomains } = await supabase
        .from("user_domains")
        .select("*")
        .eq("user_id", userId);

      const { data: currentGoal } = await supabase
        .from("user_career_goals")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (currentDomains && currentGoal) {
        const newRoadmap = generateUnifiedRoadmap(userId, currentDomains, currentGoal);
        await supabase
          .from("learning_roadmaps")
          .upsert({
            user_id: userId,
            title: newRoadmap.title,
            target_role: newRoadmap.target_role,
            total_phases: newRoadmap.total_phases,
            current_phase_index: 0,
            progress_percent: 0,
            status: "active",
            phases: newRoadmap.phases,
            version: newRoadmap.version + 1,
            updated_at: new Date().toISOString()
          }, { onConflict: "user_id" });

        // Refresh today's timetable
        const todayStr = new Date().toISOString().split("T")[0];
        await supabase.from("daily_plans").delete().eq("user_id", userId).eq("plan_date", todayStr);
        const freshTasks = generateDailyTimetable(userId, todayStr, newRoadmap, currentGoal);
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

    const plan = await getOrInitializeCareerPlan(userId, supabase);
    return NextResponse.json({
      success: true,
      message: "Career Plan updated successfully",
      plan
    });
  } catch (err: any) {
    console.error("[Career OS POST Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to update Career Plan" }, { status: 500 });
  }
}
