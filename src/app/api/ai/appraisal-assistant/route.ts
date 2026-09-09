import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { draftText, roleTitle = "Software Professional", reviewPeriod = "Annual" } = body;

    if (!draftText || typeof draftText !== "string") {
      return NextResponse.json({ error: "Draft text is required." }, { status: 400 });
    }

    const words = draftText.trim().split(/\s+/).filter(Boolean);

    // ANTI-GHOSTWRITING GUARD
    if (words.length < 20) {
      return NextResponse.json({
        success: false,
        isDraftingAidOnly: true,
        error: "To provide actionable review feedback, please share your self-written draft (at least 2-3 substantive sentences detailing your work). Edworld Co helps you refine and articulate your achievements, but will not ghostwrite reviews from scratch."
      }, { status: 400 });
    }

    const lower = draftText.toLowerCase();
    const hasMetrics = lower.includes("%") || lower.includes("percent") || lower.includes("reduced") || lower.includes("increased") || lower.includes("delivered") || lower.includes("saved");
    const hasCollaboration = lower.includes("team") || lower.includes("cross-functional") || lower.includes("mentored") || lower.includes("collaborated") || lower.includes("stakeholder");

    const feedback = {
      strengths: [
        "Clear outline of primary deliverables and operational responsibilities.",
        hasCollaboration ? "Strong articulation of cross-functional alignment and teamwork." : "Direct professional tone."
      ],
      impactQuantificationTips: [
        !hasMetrics
          ? "Add measurable business impact metrics (e.g., latency reduction %, uptime improvement, cost savings, or sprint velocity)."
          : "Quantified metrics are clear! Ensure you explain your direct personal contribution versus team-wide deliverables.",
        "Use strong impact action verbs (e.g., 'Spearheaded', 'Optimized', 'Standardized')."
      ],
      selfAppraisalSections: [
        { section: "Key Deliverables & Business Impact", recommendation: "Highlight your top 2-3 highest leverage outcomes with before/after benchmarks." },
        { section: "Leadership & Team Enablement", recommendation: "Describe how you unblocked peers, improved code health, or mentored teammates." },
        { section: "Growth Goals & Next Milestones", recommendation: "Articulate specific target skills (e.g. system architecture, distributed storage) you plan to deepen in the upcoming cycle." }
      ],
      encouragingNote: "Your draft provides a great factual foundation. Refine with quantified metrics for maximum impact!",
      roleTitle,
      reviewPeriod
    };

    return NextResponse.json({
      success: true,
      isDraftingAidOnly: true,
      feedback
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Appraisal assistant error" }, { status: 500 });
  }
}
