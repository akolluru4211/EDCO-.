"use server";

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { experienceId, moderatorId, action, moderationNote } = body;

    if (!experienceId || !action || !['approved', 'rejected'].includes(action)) {
      return NextResponse.json({ error: "experienceId and valid action ('approved' | 'rejected') are required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("interview_experiences")
      .update({
        moderation_status: action,
        moderation_note: moderationNote || null,
        reviewed_by: moderatorId || null,
        reviewed_at: new Date().toISOString()
      })
      .eq("id", experienceId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, experience: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to moderate experience" }, { status: 500 });
  }
}
