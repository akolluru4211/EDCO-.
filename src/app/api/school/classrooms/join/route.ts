import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function isValidUuid(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentId, joinCode } = body;

    if (!joinCode) {
      return NextResponse.json({ error: "Join code is required." }, { status: 400 });
    }

    const cleanCode = joinCode.trim().toUpperCase();

    // 1. Find classroom by join code
    const { data: classroom, error: findErr } = await supabase
      .from("classrooms")
      .select("id, name, subject, join_code")
      .eq("join_code", cleanCode)
      .maybeSingle();

    if (findErr) {
      console.warn("Find classroom error in API:", findErr);
    }

    if (!classroom) {
      return NextResponse.json({ error: "Invalid join code. Please check with your teacher." }, { status: 404 });
    }

    // 2. Insert into classroom_students if studentId is UUID
    if (studentId && isValidUuid(studentId)) {
      const { error: joinErr } = await supabase
        .from("classroom_students")
        .insert({
          classroom_id: classroom.id,
          student_id: studentId,
          joined_at: new Date().toISOString()
        });

      if (joinErr && joinErr.code === "23505") {
        return NextResponse.json({ error: `You are already enrolled in ${classroom.name}.`, classroom }, { status: 409 });
      }
    }

    return NextResponse.json({
      success: true,
      classroom,
      message: `Successfully joined ${classroom.name} (${classroom.subject})!`
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Enrollment failed" }, { status: 500 });
  }
}
