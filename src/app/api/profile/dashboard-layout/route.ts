import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * POST /api/profile/dashboard-layout
 * Saves user's custom dashboard layout preferences (order & hidden sections).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, preference } = body;

    if (!userId || !preference || !Array.isArray(preference.order)) {
      return NextResponse.json(
        { error: "userId and preference.order array are required" },
        { status: 400 }
      );
    }

    const cleanPreference = {
      order: preference.order,
      hidden: Array.isArray(preference.hidden) ? preference.hidden : [],
    };

    const { data, error } = await supabase
      .from("profiles")
      .update({ dashboard_layout_preference: cleanPreference })
      .eq("id", userId)
      .select("id, dashboard_layout_preference")
      .single();

    if (error) {
      console.error("[Dashboard Layout Save Error]:", error);
      return NextResponse.json(
        { error: "Failed to update dashboard layout preference: " + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      preference: cleanPreference,
    });
  } catch (err: any) {
    console.error("[Dashboard Layout POST Error]:", err);
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/profile/dashboard-layout?userId=<uid>
 * Resets user's dashboard layout to the smart default.
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("profiles")
      .update({ dashboard_layout_preference: null })
      .eq("id", userId);

    if (error) {
      return NextResponse.json(
        { error: "Failed to reset dashboard layout: " + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Dashboard layout reset to smart defaults",
    });
  } catch (err: any) {
    console.error("[Dashboard Layout DELETE Error]:", err);
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
