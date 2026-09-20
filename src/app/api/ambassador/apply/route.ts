"use server";

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const { data: appData, error: appError } = await supabase
      .from("ambassador_applications")
      .select("id, user_id, college_name, why_ambassador, social_links, relevant_experience, status, reviewed_at, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (appError) {
      return NextResponse.json({ error: appError.message }, { status: 500 });
    }

    const { data: ambData } = await supabase
      .from("ambassadors")
      .select("user_id, college_name, referral_code, is_active, joined_at")
      .eq("user_id", userId)
      .maybeSingle();

    return NextResponse.json({
      application: appData || null,
      ambassador: ambData || null
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch application" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, college_name, why_ambassador, social_links, relevant_experience } = body;

    if (!userId || !college_name || !why_ambassador) {
      return NextResponse.json({ error: "userId, college_name, and why_ambassador are required" }, { status: 400 });
    }

    const { data: userProfile } = await supabase
      .from("profiles")
      .select("career_stage, age_band")
      .eq("user_id", userId)
      .maybeSingle();

    const isCollegeTrack = userProfile?.career_stage === "STUDENT" || userProfile?.career_stage === "college";
    if (!isCollegeTrack && userProfile) {
      return NextResponse.json({ error: "Ambassador applications are exclusively for College track students." }, { status: 403 });
    }

    const { data: existingApp } = await supabase
      .from("ambassador_applications")
      .select("id, status")
      .eq("user_id", userId)
      .in("status", ["pending", "approved"])
      .maybeSingle();

    if (existingApp) {
      return NextResponse.json({
        error: "You already have an active application with status: " + existingApp.status
      }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("ambassador_applications")
      .insert({
        user_id: userId,
        college_name: college_name.trim(),
        why_ambassador: why_ambassador.trim(),
        social_links: social_links || {},
        relevant_experience: relevant_experience?.trim() || null,
        status: "pending"
      })
      .select("id, user_id, college_name, why_ambassador, social_links, relevant_experience, status, created_at")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, application: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to submit application" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { applicationId, userId, action } = body;

    if (!applicationId || !userId || action !== "withdraw") {
      return NextResponse.json({ error: "Invalid request parameters" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("ambassador_applications")
      .update({ status: "withdrawn" })
      .eq("id", applicationId)
      .eq("user_id", userId)
      .eq("status", "pending")
      .select("id, status")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, application: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to withdraw application" }, { status: 500 });
  }
}
