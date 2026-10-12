/**
 * Myra AI Agent Configuration & Educational Guardrail Engine
 * Edworld Co.'s dedicated Academic Mentor, Doubt Solver, and Personal Career Companion.
 */

export interface StudentProfileContext {
  name?: string;
  gradeLevel?: string;
  careerStage?: string;
  cgpa?: number | string;
  targetRole?: string;
  targetSector?: string;
  interests?: Array<{ name: string; effectiveLevel?: number; category?: string }>;
  dailyStudyHours?: number;
  learningGoals?: string;
  institution?: string;
  resumeSkills?: string[];
  recentInterviewScore?: number;
  recentWeakPoints?: string[];
  currentStreak?: number;
  totalXp?: number;
  
  // Learned Behavioral Memory Signals
  frequentTopics?: Array<{ topic: string; queryCount: number; estimatedMastery?: string }>;
  searchedTechnologies?: Array<{ tech: string; searchCount: number }>;
  strugglePoints?: Array<{ concept: string; severity?: string; advice?: string }>;
  learningStylePreference?: string;
}

export const MYRA_SYSTEM_PROMPT = `
You are Myra, the official AI Academic Mentor and Career Guide for Edworld Co. (https://edworld.co).

### CORE BEHAVIOR AND TONE
- Always respond in a good, polite, courteous, and welcoming manner.
- Answer directly and specifically what the user asks.
- Do NOT include unnecessary filler, repetitive boilerplate intros, unsolicited promotional pitches, or forced multi-stage essays.
- Keep your answers high-signal, helpful, and concise. If the user asks for code or an in-depth breakdown, provide clean, accurate, production-quality code.

### STRICT NO-ASTERISKS FORMATTING RULE
- NEVER use asterisks (*, **, ***) anywhere in your reply.
- Do not use asterisks for bolding.
- Do not use asterisks for italics.
- Do not use asterisks as bullet points.
- Output clean, natural text. For lists, use numbers (1., 2.) or clean hyphens (- ).
- The asterisk character (*) must never appear in your response under any circumstance.

### ACCURACY & KNOWLEDGE
- Provide accurate, verified information in computer science, software architecture, technical interviews, and career navigation.
- If you are unsure or do not know something, politely and honestly say so.
`.trim();

export function buildMyraContextPrompt(
  query: string,
  profile?: StudentProfileContext,
  chatHistory: Array<{ role: "user" | "assistant"; content: string }> = [],
  webReachContext?: { url: string; title?: string; content: string } | null
): { systemPrompt: string; prompt: string } {
  const userName = profile?.name || "Learner";
  const targetRole = profile?.targetRole || "Software Engineer";
  const careerStage = profile?.careerStage === "PROFESSIONAL" || profile?.careerStage === "working_professional"
    ? "Working Professional"
    : "College Student";

  const profileSummary = `
USER CONTEXT:
- Name: ${userName}
- Career Stage: ${careerStage}
- Target Role: ${targetRole}
- Skills: ${profile?.resumeSkills?.join(", ") || profile?.interests?.map((i) => i.name).join(", ") || "Software Engineering"}
`.trim();

  const historyFormatted =
    chatHistory.length > 0
      ? `\nRECENT CONVERSATION HISTORY:\n` +
        chatHistory
          .slice(-6)
          .map((m) => `${m.role === "user" ? userName : "Myra"}: ${m.content}`)
          .join("\n\n")
      : "";

  const webReachFormatted = webReachContext
    ? `
LIVE WEB DATA:
Source: ${webReachContext.title || webReachContext.url}
Content:
"""
${webReachContext.content.slice(0, 2000)}
"""
`
    : "";

  const finalPrompt = `
${profileSummary}
${historyFormatted}
${webReachFormatted}

USER QUERY:
"${query}"

Instructions for your response:
1. Greet ${userName} politely and answer their query directly and clearly.
2. Provide only what is asked without unnecessary matter or filler.
3. STRICT FORMATTING: Do NOT use any asterisks (* or **) anywhere in your reply. Use clean plain text.
`.trim();

  return {
    systemPrompt: MYRA_SYSTEM_PROMPT,
    prompt: finalPrompt,
  };
}
