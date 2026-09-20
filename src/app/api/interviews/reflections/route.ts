"use server";

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("interview_reflections")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ reflections: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch reflections" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, company, role, interview_date, went_well, difficult_aspects, difficult_questions, improvement_areas, personal_notes } = body;

    if (!userId || !company || !role) {
      return NextResponse.json({ error: "userId, company, and role are required" }, { status: 400 });
    }

    const summaryPoints = [];
    if (went_well) summaryPoints.push("Identified strength area: " + went_well);
    if (difficult_aspects) summaryPoints.push("Challenge encountered: " + difficult_aspects);
    if (improvement_areas) summaryPoints.push("Actionable follow-up: " + improvement_areas);

    const aiSummary = summaryPoints.length > 0 
      ? "AI Summary of Candidate Reflection:\n- " + summaryPoints.join("\n- ")
      : "Reflection recorded successfully.";

    const { data, error } = await supabase
      .from("interview_reflections")
      .insert({
        user_id: userId,
        company,
        role,
        interview_date: interview_date || new Date().toISOString().split("T")[0],
        went_well: went_well || "",
        difficult_aspects: difficult_aspects || "",
        difficult_questions: Array.isArray(difficult_questions) ? difficult_questions : [],
        improvement_areas: improvement_areas || "",
        personal_notes: personal_notes || "",
        ai_summary: aiSummary
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, reflection: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to save reflection" }, { status: 500 });
  }
}
