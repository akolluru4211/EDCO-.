import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { resumeId, requesterId, reviewerId, comments } = body;

    if (!resumeId || !requesterId || !reviewerId) {
      return NextResponse.json({ error: "resumeId, requesterId, and reviewerId are required." }, { status: 400 });
    }

    const { data: review, error } = await supabase
      .from("resume_reviews")
      .insert({
        resume_id: resumeId,
        requester_id: requesterId,
        reviewer_id: reviewerId,
        comments: comments || [],
        status: "in_review"
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      review
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Resume review error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const resumeId = req.nextUrl.searchParams.get("resumeId");
    if (!resumeId) {
      return NextResponse.json({ error: "resumeId is required." }, { status: 400 });
    }

    const { data: reviews, error } = await supabase
      .from("resume_reviews")
      .select("*")
      .eq("resume_id", resumeId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ reviews: reviews || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
