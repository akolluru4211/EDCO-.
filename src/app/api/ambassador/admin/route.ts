"use server";

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    let query = supabase
      .from("ambassador_applications")
      .select("*, users:user_id(name, email)")
      .order("created_at", { ascending: false });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data: apps, error: appsError } = await query;
    if (appsError) {
      return NextResponse.json({ error: appsError.message }, { status: 500 });
    }

    const { data: ambassadors } = await supabase
      .from("ambassadors")
      .select("*, users:user_id(name, email)")
      .order("joined_at", { ascending: false });

    return NextResponse.json({
      applications: apps || [],
      ambassadors: ambassadors || []
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch admin data" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { applicationId, reviewerId, action, reviewNotes } = body;

    if (!applicationId || !['approved', 'rejected'].includes(action)) {
      return NextResponse.json({ error: "applicationId and valid action ('approved' | 'rejected') are required" }, { status: 400 });
    }

    const { data: app, error: appErr } = await supabase
      .from("ambassador_applications")
      .select("*")
      .eq("id", applicationId)
      .single();

    if (appErr || !app) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const now = new Date().toISOString();

    const { error: updateErr } = await supabase
      .from("ambassador_applications")
      .update({
        status: action,
        reviewed_by: reviewerId || null,
        reviewed_at: now,
        review_notes: reviewNotes || null
      })
      .eq("id", applicationId);

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    if (action === "approved") {
      const cleanCollege = app.college_name.replace(/[^a-zA-Z0-9]/g, "").substring(0, 4).toUpperCase() || "CAMPUS";
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const referralCode = "EDW-" + cleanCollege + "-" + randomSuffix;

      const { data: ambData, error: ambErr } = await supabase
        .from("ambassadors")
        .upsert({
          user_id: app.user_id,
          college_name: app.college_name,
          referral_code: referralCode,
          is_active: true,
          joined_at: now
        })
        .select()
        .single();

      if (ambErr) {
        return NextResponse.json({ error: ambErr.message }, { status: 500 });
      }

      const { data: badge } = await supabase
        .from("badges")
        .select("id")
        .eq("code", "campus_ambassador")
        .maybeSingle();

      if (badge) {
        await supabase
          .from("user_badges")
          .upsert({
            user_id: app.user_id,
            badge_id: badge.id,
            earned_at: now
          });
      }

      return NextResponse.json({
        success: true,
        status: "approved",
        ambassador: ambData
      });
    }

    return NextResponse.json({
      success: true,
      status: "rejected"
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process review" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, isActive } = body;

    if (!userId || typeof isActive !== "boolean") {
      return NextResponse.json({ error: "userId and boolean isActive required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("ambassadors")
      .update({ is_active: isActive })
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, ambassador: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update ambassador status" }, { status: 500 });
  }
}
