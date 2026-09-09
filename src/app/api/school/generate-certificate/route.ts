import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, projectId, projectTitle, userName } = body;

    if (!userId || !projectTitle) {
      return NextResponse.json({ error: "Missing required certificate parameters." }, { status: 400 });
    }

    const certificateId = `CERT-EDW-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const issuedAt = new Date().toISOString();

    const certificateRecord = {
      id: undefined, // let postgres generate or insert
      user_id: userId,
      project_id: projectId || null,
      project_title: projectTitle,
      certificate_url: `/certificates/${certificateId}`,
      issued_at: issuedAt,
    };

    try {
      await supabase.from("micro_project_certificates").insert(certificateRecord);
    } catch (e) {
      console.warn("Supabase certificate insert note:", e);
    }

    return NextResponse.json({
      success: true,
      data: {
        certificateId,
        userName: userName || "Student Learner",
        projectTitle,
        issuedAt,
        issuer: "Edworld Co School Track Learning Lab",
        disclaimer: "Edworld Co Skill Completion Certificate. This acknowledges project completion for practical skills development and is not an accredited academic degree or formal government credential."
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Certificate generation error" }, { status: 500 });
  }
}
