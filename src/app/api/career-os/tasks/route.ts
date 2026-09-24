import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { userId, taskId, status, notes } = body;

    if (!userId || !taskId || !status) {
      return NextResponse.json({ error: "Missing required fields: userId, taskId, status" }, { status: 400 });
    }

    const updatePayload: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (status === "completed") {
      updatePayload.completed_at = new Date().toISOString();
    }
    if (notes !== undefined) {
      updatePayload.notes = notes;
    }

    const { data: updatedTask, error } = await supabase
      .from("daily_plans")
      .update(updatePayload)
      .eq("id", taskId)
      .eq("user_id", userId)
      .select("*")
      .maybeSingle();

    if (error) {
      console.warn("[Daily Task Update Note]:", error.message);
    }

    // Award Gamification Points if task completed
    if (status === "completed") {
      try {
        const { data: stats } = await supabase
          .from("user_stats")
          .select("points, current_streak")
          .eq("user_id", userId)
          .maybeSingle();

        if (stats) {
          await supabase
            .from("user_stats")
            .update({
              points: (stats.points || 0) + 15,
              updated_at: new Date().toISOString()
            })
            .eq("user_id", userId);
        }
      } catch (gErr) {
        console.warn("Gamification award note:", gErr);
      }
    }

    return NextResponse.json({
      success: true,
      task: updatedTask || { id: taskId, user_id: userId, status, ...updatePayload }
    });
  } catch (err: any) {
    console.error("[Daily Task PATCH Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to update task status" }, { status: 500 });
  }
}
