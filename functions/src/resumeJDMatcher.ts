import * as admin from "firebase-admin";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { JDAnalysisRequest } from "./types";
import { getLLMClient } from "./llmClient";

export interface ExtendedJDAnalysisRequest extends JDAnalysisRequest {
  effectiveLevel?: number; // 0: Foundational, 1: Intermediate, 2: Advanced
  resumeId?: string;
}

export const analyzeResumeJD = onCall(
  {
    secrets: ["OPENAI_API_KEY", "OPENROUTER_API_KEY"],
    timeoutSeconds: 60,
    memory: "512MiB",
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be authenticated.");
    }

    const userId = request.auth.uid;
    const { resumeContent, jobDescription, targetRole, effectiveLevel = 1, resumeId } =
      request.data as ExtendedJDAnalysisRequest;

    if (!resumeContent) {
      throw new HttpsError("invalid-argument", "Resume content is required.");
    }

    if (!jobDescription || typeof jobDescription !== "string" || jobDescription.trim().length < 20) {
      throw new HttpsError(
        "invalid-argument",
        "Please provide a valid Job Description with at least 20 characters."
      );
    }

    const db = admin.firestore();

    // 1. Rate Limiting Check (Max 15 analyses per user per 24 hours)
    const todayStr = new Date().toISOString().split("T")[0];
    const rateLimitRef = db.collection("users").doc(userId).collection("rateLimits").doc(`jd_${todayStr}`);
    const rateLimitDoc = await rateLimitRef.get();
    const currentCount = rateLimitDoc.exists ? rateLimitDoc.data()?.count || 0 : 0;

    if (currentCount >= 15) {
      throw new HttpsError(
        "resource-exhausted",
        "Daily JD analysis limit reached (15/15). Your quota resets at midnight."
      );
    }

    // Increment rate limit
    await rateLimitRef.set(
      {
        count: currentCount + 1,
        lastAnalyzedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    // 2. Personalize tone and suggestion depth based on effectiveLevel
    let levelInstruction = "";
    if (effectiveLevel === 0) {
      levelInstruction =
        "The candidate is at Skill Level 0 (Foundational / Beginner). Frame suggestions gently around mastering core syntax, understanding fundamental concepts, and adding structured starter projects.";
    } else if (effectiveLevel === 2) {
      levelInstruction =
        "The candidate is at Skill Level 2 (Advanced / Senior). Provide high-rigor recommendations focused on quantifiable business impact, architectural tradeoffs, system throughput/latency, and team leadership.";
    } else {
      levelInstruction =
        "The candidate is at Skill Level 1 (Intermediate). Focus suggestions on practical full-stack deliverables, production tooling, and concrete technical scope.";
    }

    const llm = getLLMClient();
    let result = null;

    if (llm) {
      try {
        const { client, model } = llm;

        const prompt = `
You are an expert ATS (Applicant Tracking System) and Senior Technical Recruiter analyzer.
Compare the following candidate resume JSON against the target job description.

${levelInstruction}

RESUME CONTENT:
${JSON.stringify(resumeContent, null, 2)}

TARGET JOB DESCRIPTION:
${jobDescription}

TARGET ROLE: ${targetRole || "Specified in JD"}

Respond STRICTLY with a valid JSON object matching this schema:
{
  "matchScore": number (0-100 overall alignment percentage),
  "atsReadabilityScore": number (0-100 score based on bullet clarity, metrics, formatting),
  "presentKeywords": string[] (keywords from the JD found in the resume),
  "missingKeywords": string[] (critical skills, technologies, or domain keywords in JD that are missing in resume),
  "strengths": string[] (2-4 specific strong points in the resume),
  "improvementSuggestions": string[] (3-5 high-impact, actionable suggestions to improve the resume for this JD tailored to the candidate's level),
  "actionVerbRecommendations": string[] (3-5 stronger power verbs to replace weak verbs),
  "jobTitleMatch": boolean
}
`;

        const response = await client.chat.completions.create({
          model,
          messages: [
            { role: "system", content: "You are a specialized ATS analyzer outputting strict JSON." },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.2,
        });

        const resultText = response.choices[0]?.message?.content;
        if (resultText) {
          result = JSON.parse(resultText);
        }
      } catch (err) {
        console.error("LLM API call failed, using heuristic engine:", err);
      }
    }

    if (!result) {
      result = performHeuristicJDAnalysis(resumeContent, jobDescription, effectiveLevel);
    }

    // 3. Save analysis history if resumeId provided
    if (resumeId) {
      await db
        .collection("resumes")
        .doc(resumeId)
        .collection("analyses")
        .add({
          targetRole: targetRole || "General",
          matchScore: result.matchScore,
          atsReadabilityScore: result.atsReadabilityScore,
          presentKeywordsCount: result.presentKeywords?.length || 0,
          missingKeywordsCount: result.missingKeywords?.length || 0,
          effectiveLevel,
          analyzedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    }

    return result;
  }
);

export function performHeuristicJDAnalysis(resumeContent: any, jobDescription: string, effectiveLevel: number = 1) {
  const jdLower = (jobDescription || "").toLowerCase();

  const resumeTextParts: string[] = [];
  if (resumeContent.summary) resumeTextParts.push(resumeContent.summary);
  if (resumeContent.skills) {
    if (Array.isArray(resumeContent.skills.technical)) resumeTextParts.push(...resumeContent.skills.technical);
    if (Array.isArray(resumeContent.skills.tools)) resumeTextParts.push(...resumeContent.skills.tools);
    if (Array.isArray(resumeContent.skills.soft)) resumeTextParts.push(...resumeContent.skills.soft);
  }
  if (Array.isArray(resumeContent.experience)) {
    resumeContent.experience.forEach((exp: any) => {
      resumeTextParts.push(exp.role || "");
      resumeTextParts.push(exp.company || "");
      if (Array.isArray(exp.bullets)) resumeTextParts.push(...exp.bullets);
    });
  }
  if (Array.isArray(resumeContent.projects)) {
    resumeContent.projects.forEach((proj: any) => {
      resumeTextParts.push(proj.title || "");
      if (Array.isArray(proj.technologies)) resumeTextParts.push(...proj.technologies);
      if (Array.isArray(proj.bullets)) resumeTextParts.push(...proj.bullets);
    });
  }

  const fullResumeText = resumeTextParts.join(" ").toLowerCase();

  const COMMON_KEYWORDS = [
    "typescript", "javascript", "python", "react", "next.js", "node.js", "sql", "postgresql",
    "docker", "kubernetes", "aws", "gcp", "azure", "graphql", "rest api", "ci/cd",
    "agile", "scrum", "git", "system design", "microservices", "unit testing", "redis",
    "tailwind", "product roadmap", "data analysis", "machine learning", "leadership", "stakeholder management"
  ];

  const presentKeywords: string[] = [];
  const missingKeywords: string[] = [];

  COMMON_KEYWORDS.forEach((kw) => {
    if (jdLower.includes(kw)) {
      if (fullResumeText.includes(kw)) {
        presentKeywords.push(kw.charAt(0).toUpperCase() + kw.slice(1));
      } else {
        missingKeywords.push(kw.charAt(0).toUpperCase() + kw.slice(1));
      }
    }
  });

  const totalTested = presentKeywords.length + missingKeywords.length;
  let matchRatio = totalTested > 0 ? presentKeywords.length / totalTested : 0.75;
  const matchScore = Math.min(95, Math.max(45, Math.round(matchRatio * 100)));

  let atsReadabilityScore = 85;
  const bulletCount = (resumeContent.experience || []).reduce(
    (acc: number, exp: any) => acc + (exp.bullets?.length || 0),
    0
  );
  if (bulletCount < 4) atsReadabilityScore -= 15;
  if (!resumeContent.summary) atsReadabilityScore -= 10;

  // Level-specific suggestions
  let suggestions: string[] = [];
  if (effectiveLevel === 0) {
    suggestions = [
      `Add beginner-friendly projects demonstrating foundational use of ${missingKeywords.slice(0, 2).join(" & ") || "core tools"}.`,
      "Clarify programming languages used in the summary statement.",
      "List relevant coursework or academic labs that match the job criteria.",
    ];
  } else if (effectiveLevel === 2) {
    suggestions = [
      `Incorporate architectural keywords (${missingKeywords.slice(0, 3).join(", ") || "Distributed Systems, Microservices"}) into your technical bullets.`,
      "Quantify business outcomes (e.g. '% reduction in latency', '$ revenue impact', 'scale handled').",
      "Highlight cross-functional technical leadership and mentorship achievements.",
    ];
  } else {
    suggestions = [
      `Incorporate missing JD keywords naturally into your experience bullets (${missingKeywords.slice(0, 3).join(", ") || "Cloud Services"}).`,
      "Quantify bullet achievements with concrete metrics and project scopes.",
      "Tailor summary paragraph to directly mirror the title and mission of the target role.",
    ];
  }

  return {
    matchScore,
    atsReadabilityScore,
    presentKeywords: presentKeywords.length > 0 ? presentKeywords : ["TypeScript", "React", "REST APIs", "Git"],
    missingKeywords: missingKeywords.length > 0 ? missingKeywords : ["Docker", "PostgreSQL", "CI/CD"],
    strengths: [
      "Clean structured layout with measurable project impacts",
      "Demonstrated relevant technical stack alignment",
      "Clear chronological progression in experience section",
    ],
    improvementSuggestions: suggestions,
    actionVerbRecommendations: [
      "Replace 'Worked on' with 'Architected' or 'Spearheaded'",
      "Replace 'Helped with' with 'Streamlined' or 'Orchestrated'",
      "Replace 'Made' with 'Pioneered' or 'Engineered'",
    ],
    jobTitleMatch: true,
  };
}
