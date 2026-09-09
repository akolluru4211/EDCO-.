import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const PROFANITY_AND_SENSITIVE_TERMS = [
  "violence", "weapon", "hate", "attack", "exploit", "hack", "bypass", "leak", "cheat"
];

function filterContent(text: string): { safe: boolean; reason?: string } {
  const lower = text.toLowerCase();
  for (const term of PROFANITY_AND_SENSITIVE_TERMS) {
    if (lower.includes(term)) {
      return { safe: false, reason: `Message contains restricted content (${term}).` };
    }
  }
  return { safe: true };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { classroomId, senderId, senderName, content } = body;

    if (!classroomId || !senderId || !content || !content.trim()) {
      return NextResponse.json({ error: "classroomId, senderId, and content are required." }, { status: 400 });
    }

    // Safety & Content Filtering Check
    const filter = filterContent(content);
    if (!filter.safe) {
      return NextResponse.json({ safe: false, error: filter.reason }, { status: 400 });
    }

    const { data: message, error } = await supabase
      .from("study_group_messages")
      .insert({
        classroom_id: classroomId,
        sender_id: senderId,
        sender_name: senderName || "Classmate",
        content: content.trim()
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Study group error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const classroomId = req.nextUrl.searchParams.get("classroomId");
    if (!classroomId) {
      return NextResponse.json({ error: "classroomId is required." }, { status: 400 });
    }

    const { data: messages, error } = await supabase
      .from("study_group_messages")
      .select("*")
      .eq("classroom_id", classroomId)
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ messages: messages || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
