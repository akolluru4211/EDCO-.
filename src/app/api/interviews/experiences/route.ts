import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { rateLimit, getClientIp } from "@/lib/rate-limiter";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const company = searchParams.get("company");
    const role = searchParams.get("role");
    const userId = req.headers.get("x-user-id");

    let query = supabase
      .from("interview_experiences")
      .select("*")
      .order("created_at", { ascending: false });

    if (company) {
      query = query.ilike("company", "%" + company + "%");
    }
    if (role) {
      query = query.ilike("role", "%" + role + "%");
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const filtered = (data || []).filter((item: any) => {
      if (item.moderation_status === "approved") return true;
      if (userId && item.user_id === userId) return true;
      return false;
    });

    const sanitized = filtered.map((item: any) => {
      const isAuthor = userId && item.user_id === userId;
      return {
        id: item.id,
        company: item.company,
        role: item.role,
        rounds: item.rounds || [],
        overallNotes: item.overall_notes,
        difficultyRating: item.difficulty_rating || 3,
        isAnonymous: item.is_anonymous,
        moderationStatus: isAuthor ? item.moderation_status : "approved",
        createdAt: item.created_at,
        isAuthor,
        authorLabel: item.is_anonymous ? (isAuthor ? "You (Anonymous)" : "Anonymous Candidate") : (item.user_name || "Verified Candidate"),
      };
    });

    return NextResponse.json({ success: true, count: sanitized.length, experiences: sanitized });
  } catch (err: any) {
    return NextResponse.json({ error: "FETCH_FAILED", message: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const limiter = rateLimit("exp_submit_" + ip, { limit: 10, windowMs: 60 * 1000 });
    if (!limiter.allowed) {
      return NextResponse.json({ error: "RATE_LIMIT_EXCEEDED" }, { status: 429 });
    }

    const body = await req.json();
    const { userId, company, role, rounds, overallNotes, difficultyRating, isAnonymous } = body;

    if (!company || !role || !overallNotes) {
      return NextResponse.json({ error: "MISSING_FIELDS", message: "Company, role, and overall notes are required." }, { status: 400 });
    }

    const { data, error } = await supabase.from("interview_experiences").insert({
      user_id: userId || null,
      company: company.trim(),
      role: role.trim(),
      rounds: rounds || [],
      overall_notes: overallNotes.trim(),
      difficulty_rating: difficultyRating || 3,
      is_anonymous: isAnonymous ?? true,
      moderation_status: "pending",
    }).select().single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Your interview experience was submitted for moderation. It will become visible once verified by our team.",
      experience: data,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "SUBMISSION_FAILED", message: err.message }, { status: 500 });
  }
}
