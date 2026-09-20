"use server";

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, targetRole } = body;

    if (!userId || !targetRole) {
      return NextResponse.json({ error: "userId and targetRole are required" }, { status: 400 });
    }

    const roleSkillMap: Record<string, string[]> = {
      "Frontend Engineer": ["React", "TypeScript", "Next.js", "CSS/Tailwind", "REST APIs", "Performance Optimization", "Accessibility"],
      "Backend Engineer": ["Node.js", "PostgreSQL", "System Design", "REST/GraphQL APIs", "Distributed Systems", "Docker", "Authentication"],
      "Full Stack Engineer": ["TypeScript", "React", "Node.js", "SQL/PostgreSQL", "REST APIs", "CI/CD", "System Architecture"],
      "AI / ML Engineer": ["Python", "PyTorch/TensorFlow", "Data Structures", "LLM Fine-tuning", "Vector Databases", "MLOps", "Model Evaluation"],
      "DevOps / SRE": ["Linux", "Docker", "Kubernetes", "AWS/Cloud", "CI/CD Pipelines", "Terraform", "Monitoring & Observability"],
      "Engineering Manager": ["System Architecture", "Agile Leadership", "Team Mentorship", "Technical Strategy", "Hiring & Performance Management"]
    };

    const requiredSkills = roleSkillMap[targetRole] || [
      "Data Structures & Algorithms",
      "System Architecture",
      "API Design",
      "Testing & Quality Assurance",
      "Git & Version Control"
    ];

    const [evidenceRes, projectsRes, certsRes] = await Promise.all([
      supabase.from("career_evidence").select("skills, title, type").eq("user_id", userId),
      supabase.from("projects").select("tags, title").eq("user_id", userId),
      supabase.from("certifications").select("title").eq("user_id", userId)
    ]);

    const userSkillSet = new Set<string>();

    (evidenceRes.data || []).forEach(e => {
      (e.skills || []).forEach((s: string) => userSkillSet.add(s.toLowerCase()));
      if (e.title) userSkillSet.add(e.title.toLowerCase());
    });

    (projectsRes.data || []).forEach(p => {
      (p.tags || []).forEach((s: string) => userSkillSet.add(s.toLowerCase()));
    });

    (certsRes.data || []).forEach(c => {
      if (c.title) userSkillSet.add(c.title.toLowerCase());
    });

    const verifiedSkills: string[] = [];
    const missingGaps: { skill: string; suggestion: string; practiceUrl: string }[] = [];

    requiredSkills.forEach(skill => {
      const match = Array.from(userSkillSet).some(s => s.includes(skill.toLowerCase()) || skill.toLowerCase().includes(s));
      if (match) {
        verifiedSkills.push(skill);
      } else {
        missingGaps.push({
          skill,
          suggestion: 'Practice ' + skill + ' exercises and build evidence via a dedicated project module or certification.',
          practiceUrl: skill.includes("SQL") || skill.includes("PostgreSQL") || skill.includes("System") 
            ? "/problems" 
            : "/interviews"
        });
      }
    });

    return NextResponse.json({
      targetRole,
      totalRequired: requiredSkills.length,
      verifiedCount: verifiedSkills.length,
      gapCount: missingGaps.length,
      verifiedSkills,
      missingGaps
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to analyze skills gap" }, { status: 500 });
  }
}
