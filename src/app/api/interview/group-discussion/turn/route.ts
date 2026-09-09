import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export interface DiscussionTurn {
  speaker: "moderator" | "persona_1" | "persona_2" | "user";
  name: string;
  text: string;
  timestamp: string;
  voiceId?: string;
}

export interface PersonaConfig {
  id: string;
  name: string;
  role: string;
  stance: string;
  voiceId: string;
}

const DEFAULT_PERSONAS: PersonaConfig[] = [
  {
    id: "persona_1",
    name: "Maya Chen",
    role: "Tech Innovation Lead",
    stance: "Advocates for rapid adoption, AI-first transformation, and iterative deployment.",
    voiceId: "en-US-JennyNeural"
  },
  {
    id: "persona_2",
    name: "David Miller",
    role: "Risk & Governance Director",
    stance: "Emphasizes security, regulatory compliance, data privacy, and ethical guardrails.",
    voiceId: "en-US-GuyNeural"
  }
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      topic = "The Role of Generative AI in Enterprise Software Engineering",
      transcript = [],
      userMessage = "",
      step = 0,
      personaConfigs = DEFAULT_PERSONAS
    } = body;

    const persona1 = personaConfigs[0] || DEFAULT_PERSONAS[0];
    const persona2 = personaConfigs[1] || DEFAULT_PERSONAS[1];

    let nextTurn: DiscussionTurn;
    let nextStep = step + 1;
    let isUserTurn = false;

    // Structured State Machine for Group Discussion Turn-Taking
    switch (step) {
      case 0:
        // Moderator opening
        nextTurn = {
          speaker: "moderator",
          name: "Dr. Elena Vance (Moderator)",
          text: `Welcome everyone to today's group discussion on: "${topic}". Let's start with initial perspectives on both innovation opportunities and implementation risks. Maya, would you like to open the discussion?`,
          timestamp: new Date().toISOString(),
          voiceId: "en-US-AriaNeural"
        };
        break;

      case 1:
        // Persona 1 (Innovation perspective)
        nextTurn = {
          speaker: "persona_1",
          name: persona1.name,
          text: `Thanks Elena. From my perspective, generative AI is a massive force multiplier for engineering velocity. Teams adopting AI code generation are seeing a 30% reduction in boilerplate time, allowing developers to focus on higher-order architecture.`,
          timestamp: new Date().toISOString(),
          voiceId: persona1.voiceId
        };
        break;

      case 2:
        // Persona 2 (Counter/Governance perspective)
        nextTurn = {
          speaker: "persona_2",
          name: persona2.name,
          text: `While I agree on velocity, Maya, we cannot overlook the compliance and security liabilities. AI code generators frequently hallucinate vulnerable dependencies or reproduce proprietary code patterns without clean provenance.`,
          timestamp: new Date().toISOString(),
          voiceId: persona2.voiceId
        };
        break;

      case 3:
        // Moderator cues candidate (User Turn)
        isUserTurn = true;
        nextTurn = {
          speaker: "moderator",
          name: "Dr. Elena Vance (Moderator)",
          text: `Those are two compelling sides of the debate. Let's bring in our candidate. How do you reconcile accelerating developer velocity while enforcing strict security and compliance standards?`,
          timestamp: new Date().toISOString(),
          voiceId: "en-US-AriaNeural"
        };
        break;

      case 4:
        // Persona 1 reacts to user message
        const userSnippet = userMessage.length > 10 ? `building on what was just mentioned regarding "${userMessage.substring(0, 30)}..."` : "building on that insightful point";
        nextTurn = {
          speaker: "persona_1",
          name: persona1.name,
          text: `I really like that angle. Exactly as you highlighted, ${userSnippet}, continuous automated auditing in the CI/CD pipeline gives developers freedom without creating security blindspots.`,
          timestamp: new Date().toISOString(),
          voiceId: persona1.voiceId
        };
        break;

      case 5:
        // Persona 2 adds concluding thoughts
        nextTurn = {
          speaker: "persona_2",
          name: persona2.name,
          text: `Agreed. When governance is treated as code rather than an afterthought, organizations can safely scale these technologies.`,
          timestamp: new Date().toISOString(),
          voiceId: persona2.voiceId
        };
        break;

      default:
        // Discussion Wrap-Up
        nextTurn = {
          speaker: "moderator",
          name: "Dr. Elena Vance (Moderator)",
          text: `Thank you all for an engaging and balanced group discussion. This concludes our session. Proceed to view your individual communication and collaboration analytics.`,
          timestamp: new Date().toISOString(),
          voiceId: "en-US-AriaNeural"
        };
        break;
    }

    return NextResponse.json({
      success: true,
      turn: nextTurn,
      nextStep,
      isUserTurn,
      discussionFinished: step >= 6
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Group discussion engine error" }, { status: 500 });
  }
}
