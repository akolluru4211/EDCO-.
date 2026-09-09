import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { draftText, targetProgram, effectiveLevel = 0 } = body;

    if (!draftText || typeof draftText !== "string") {
      return NextResponse.json({ error: "Draft text is required." }, { status: 400 });
    }

    const words = draftText.trim().split(/\s+/).filter(Boolean);

    // ANTI-GHOSTWRITING GUARD: Refuse to generate essays from minimal prompts
    if (words.length < 25) {
      return NextResponse.json({
        success: false,
        isDraftingAidOnly: true,
        error: "To provide meaningful feedback, the assistant requires your original draft (at least 2-3 substantive sentences or paragraphs). Edworld Co is an educational feedback tool, not a ghostwriting service. Please draft your personal story first!"
      }, { status: 400 });
    }

    const lower = draftText.toLowerCase();

    // Check narrative structure components
    const hasMotivation = lower.includes("inspired") || lower.includes("passion") || lower.includes("curious") || lower.includes("began") || lower.includes("interest");
    const hasConcreteExperience = lower.includes("project") || lower.includes("built") || lower.includes("researched") || lower.includes("experience") || lower.includes("team");
    const hasFutureVision = lower.includes("goal") || lower.includes("aspire") || lower.includes("future") || lower.includes("contribute") || lower.includes("learn");

    const feedback = {
      strengths: [
        hasMotivation ? "Authentic personal motivation and clear initial spark." : "Clear, direct writing tone.",
        hasConcreteExperience ? "Effective mention of hands-on project exploration." : "Thoughtful articulation of academic interests."
      ],
      structuralImprovements: [
        !hasFutureVision
          ? "Strengthen your concluding paragraph by explicitly linking your past projects to how this college program will help achieve your long-term goals."
          : "Ensure smooth transitions between your foundational discovery moment and recent advanced achievements.",
        "Use active voice verbs (e.g. 'designed', 'orchestrated') instead of passive framing."
      ],
      paragraphByParagraphCritique: [
        { section: "Introduction / Hook", tip: "Ensure your opening sentence draws the admissions reader in with a specific moment of curiosity rather than a generic statement." },
        { section: "Body / Technical Evidence", tip: "Mention 1-2 specific challenges you overcame in your projects to demonstrate resilience." },
        { section: "Conclusion / Program Fit", tip: `Mention specific faculty, labs, or courses at ${targetProgram || "your target institution"} that align with your background.` }
      ],
      encouragingNote: "Your voice is strong! Revise with these structural tweaks to make your personal narrative stand out.",
      effectiveLevelAdapted: effectiveLevel
    };

    return NextResponse.json({
      success: true,
      isDraftingAidOnly: true,
      feedback
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Essay assistant error" }, { status: 500 });
  }
}
