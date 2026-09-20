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

    const [evidenceRes, projectsRes, certsRes, interviewsRes] = await Promise.all([
      supabase.from("career_evidence").select("*").eq("user_id", userId),
      supabase.from("projects").select("*").eq("user_id", userId),
      supabase.from("certifications").select("*").eq("user_id", userId),
      supabase.from("interview_sessions").select("id, category, score, created_at").eq("user_id", userId)
    ]);

    const events: any[] = [];

    (evidenceRes.data || []).forEach(e => {
      events.push({
        id: "ev-" + e.id,
        type: "evidence",
        category: e.type,
        title: e.title,
        description: e.description,
        date: e.date || e.created_at,
        url: e.evidence_url,
        skills: e.skills
      });
    });

    (projectsRes.data || []).forEach(p => {
      events.push({
        id: "proj-" + p.id,
        type: "project",
        category: "Project Studio",
        title: p.title,
        description: p.description,
        date: p.created_at,
        skills: p.tags
      });
    });

    (certsRes.data || []).forEach(c => {
      events.push({
        id: "cert-" + c.id,
        type: "certification",
        category: "Credential",
        title: c.title,
        description: c.issuer ? "Issued by " + c.issuer : "Verified Certification",
        date: c.issued_date || c.target_exam_date || c.created_at
      });
    });

    (interviewsRes.data || []).forEach(i => {
      events.push({
        id: "int-" + i.id,
        type: "interview",
        category: "Mock Interview Drill",
        title: i.category + " Interview Round",
        description: "Completed technical simulation session with evaluation score " + (i.score || 'N/A') + "/100",
        date: i.created_at
      });
    });

    events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({ events });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch timeline" }, { status: 500 });
  }
}
