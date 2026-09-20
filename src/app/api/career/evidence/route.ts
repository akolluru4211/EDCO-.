"use server";

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const visibility = searchParams.get("visibility");

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    let query = supabase
      .from("career_evidence")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (visibility) {
      query = query.eq("visibility", visibility);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ evidence: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch career evidence" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, type, title, description, date, evidence_url, skills, visibility } = body;

    if (!userId || !type || !title) {
      return NextResponse.json({ error: "userId, type, and title are required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("career_evidence")
      .insert({
        user_id: userId,
        type,
        title,
        description: description || "",
        date: date || new Date().toISOString().split("T")[0],
        evidence_url: evidence_url || null,
        skills: Array.isArray(skills) ? skills : [],
        visibility: visibility || "private"
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, item: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create evidence" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const userId = searchParams.get("userId");

    if (!id || !userId) {
      return NextResponse.json({ error: "id and userId required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("career_evidence")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete evidence" }, { status: 500 });
  }
}
