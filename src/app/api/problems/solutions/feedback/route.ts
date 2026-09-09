import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const solutionId = searchParams.get("solutionId");
    const callerId = searchParams.get("callerId");

    if (!solutionId || !callerId) {
      return NextResponse.json({ error: "solutionId and callerId are required." }, { status: 400 });
    }

    // 1. Fetch solution to check ownership
    const { data: solution } = await supabase
      .from("problem_solutions")
      .select("user_id")
      .eq("id", solutionId)
      .maybeSingle();

    if (!solution) {
      return NextResponse.json({ error: "Solution not found." }, { status: 404 });
    }

    // 2. Check if caller is owner, admin, or author of feedback
    const { data: callerRec } = await supabase
      .from("users")
      .select("is_admin, is_teacher")
      .eq("id", callerId)
      .maybeSingle();

    const isOwner = solution.user_id === callerId;
    const isAdmin = Boolean(callerRec?.is_admin);

    const { data: feedbackList, error } = await supabase
      .from("solution_feedback")
      .select("*, users:given_by(name, email)")
      .eq("solution_id", solutionId);

    if (error) throw error;

    // Filter feedback: Only owner, feedback author, or admin can see it
    const authorizedFeedback = (feedbackList || []).filter((fb) => {
      if (isOwner || isAdmin || fb.given_by === callerId) return true;
      return false;
    });

    if (!isOwner && !isAdmin && authorizedFeedback.length === 0) {
      return NextResponse.json({ 
        error: "Forbidden: You are not authorized to view feedback on this solution." 
      }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      feedback: authorizedFeedback
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { solutionId, givenBy, comment } = body;

    if (!solutionId || !givenBy || !comment) {
      return NextResponse.json({ error: "solutionId, givenBy, and comment are required." }, { status: 400 });
    }

    // Verify caller has clearance (Admin, Teacher, or Mentor)
    const { data: userRec } = await supabase
      .from("users")
      .select("is_admin, is_teacher")
      .eq("id", givenBy)
      .maybeSingle();

    const isAdminOrTeacher = userRec?.is_admin || userRec?.is_teacher;

    const { data, error } = await supabase
      .from("solution_feedback")
      .insert({
        solution_id: solutionId,
        given_by: givenBy,
        comment: comment.trim()
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      feedback: data,
      message: "Constructive feedback recorded."
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
