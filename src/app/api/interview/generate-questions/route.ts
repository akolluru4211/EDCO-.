import { NextRequest, NextResponse } from "next/server";
import { SEED_INTERVIEW_QUESTIONS } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export interface GeneratedQuestion {
  id: string;
  text: string;
  category: string;
  difficultyLevel: 0 | 1 | 2;
  keyPoints?: string[];
  suggestedDurationSeconds?: number;
  isWarmup?: boolean;
  type: "warmup" | "behavioral" | "technical";
}

const FIXED_OPENING_QUESTION: GeneratedQuestion = {
  id: "warmup-opening-1",
  text: "Tell me about yourself, your background, and what drives your passion for this domain.",
  category: "General",
  difficultyLevel: 0,
  keyPoints: ["Clear professional overview", "Key achievements", "Alignment with career goals"],
  suggestedDurationSeconds: 120,
  isWarmup: true,
  type: "warmup"
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { jobDescription, category = "Software Engineering", effectiveLevel = 0 } = body;

    const questions: GeneratedQuestion[] = [FIXED_OPENING_QUESTION];

    // If JD is provided, generate role-specific tailored questions tagged with difficulty_level (0-2)
    if (jobDescription && typeof jobDescription === "string" && jobDescription.trim().length > 20) {
      try {
        const jdLower = jobDescription.toLowerCase();
        
        // Extract key focus areas from JD
        const hasBackend = jdLower.includes("api") || jdLower.includes("database") || jdLower.includes("sql") || jdLower.includes("node") || jdLower.includes("python") || jdLower.includes("backend");
        const hasFrontend = jdLower.includes("react") || jdLower.includes("ui") || jdLower.includes("ux") || jdLower.includes("frontend") || jdLower.includes("css") || jdLower.includes("web");
        const hasSystemDesign = jdLower.includes("scalable") || jdLower.includes("architecture") || jdLower.includes("microservices") || jdLower.includes("distributed") || jdLower.includes("system design");
        const hasLeadership = jdLower.includes("lead") || jdLower.includes("cross-functional") || jdLower.includes("mentor") || jdLower.includes("stakeholder");

        // Question 2: Technical tailored question
        if (hasBackend) {
          questions.push({
            id: `jd-tech-${Date.now()}-1`,
            text: "Based on the role's backend requirements, how do you design RESTful APIs and handle database query optimization under high load?",
            category,
            difficultyLevel: Math.min(2, Math.max(0, effectiveLevel)) as 0 | 1 | 2,
            keyPoints: ["Endpoint design", "Indexing & caching", "Error handling"],
            suggestedDurationSeconds: 150,
            type: "technical"
          });
        } else if (hasFrontend) {
          questions.push({
            id: `jd-tech-${Date.now()}-1`,
            text: "Looking at the frontend focus of this position, describe how you optimize web rendering performance, state management, and component reusability.",
            category,
            difficultyLevel: Math.min(2, Math.max(0, effectiveLevel)) as 0 | 1 | 2,
            keyPoints: ["Core Web Vitals", "State architecture", "Component modularity"],
            suggestedDurationSeconds: 150,
            type: "technical"
          });
        } else {
          questions.push({
            id: `jd-tech-${Date.now()}-1`,
            text: `In relation to the responsibilities described in this job posting, walk me through your technical workflow when diagnosing and resolving complex issues in ${category}.`,
            category,
            difficultyLevel: Math.min(2, Math.max(0, effectiveLevel)) as 0 | 1 | 2,
            keyPoints: ["Root cause analysis", "Systematic debugging", "Verification"],
            suggestedDurationSeconds: 150,
            type: "technical"
          });
        }

        // Question 3: Behavioral / Architecture question
        if (hasLeadership || hasSystemDesign) {
          questions.push({
            id: `jd-behav-${Date.now()}-2`,
            text: "Describe a situation from your past experience where you had to balance trade-offs between delivery speed, technical debt, and team alignment.",
            category,
            difficultyLevel: Math.min(2, Math.max(0, effectiveLevel + 1)) as 0 | 1 | 2,
            keyPoints: ["STAR format", "Stakeholder communication", "Long-term maintainability"],
            suggestedDurationSeconds: 150,
            type: "behavioral"
          });
        } else {
          questions.push({
            id: `jd-behav-${Date.now()}-2`,
            text: "Tell me about a challenging project requirement you encountered and how you broke it down into achievable milestones.",
            category,
            difficultyLevel: Math.min(2, Math.max(0, effectiveLevel)) as 0 | 1 | 2,
            keyPoints: ["Problem breakdown", "Action steps", "Measured result"],
            suggestedDurationSeconds: 150,
            type: "behavioral"
          });
        }

        return NextResponse.json({
          success: true,
          source: "jd_tailored",
          questions
        });
      } catch (genErr) {
        console.warn("[JD Generation Fallback to Static Bank]:", genErr);
      }
    }

    // Fallback cleanly to Static Question Bank
    const matchingStatic = SEED_INTERVIEW_QUESTIONS.filter(
      q => q.category.toLowerCase().includes(category.toLowerCase()) && q.difficultyLevel === effectiveLevel
    );

    if (matchingStatic.length > 0) {
      matchingStatic.slice(0, 2).forEach(sq => {
        questions.push({
          id: sq.id,
          text: sq.text,
          category: sq.category,
          difficultyLevel: sq.difficultyLevel as 0 | 1 | 2,
          keyPoints: sq.keyPoints,
          suggestedDurationSeconds: sq.suggestedDurationSeconds || 120,
          type: "technical"
        });
      });
    } else {
      questions.push({
        id: `static-fallback-${effectiveLevel}`,
        text: `Can you describe your technical approach and problem-solving methodology when building solutions in ${category}?`,
        category,
        difficultyLevel: effectiveLevel as 0 | 1 | 2,
        keyPoints: ["Methodology", "Decomposition", "Measurable outcome"],
        suggestedDurationSeconds: 120,
        type: "technical"
      });
    }

    return NextResponse.json({
      success: true,
      source: "static_bank",
      questions
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to generate questions",
      questions: [FIXED_OPENING_QUESTION]
    }, { status: 500 });
  }
}
