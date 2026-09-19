import { NextRequest, NextResponse } from "next/server";
import { UniversalAI } from "@/lib/ai/universal-ai";

export const dynamic = "force-dynamic";

export interface PanelTurn {
  speaker: "moderator" | "tech_lead" | "hiring_manager" | "culture_lead" | "user";
  name: string;
  role: string;
  text: string;
  timestamp: string;
  voiceId?: string;
}

const PANEL_INTERVIEWERS = [
  {
    id: "tech_lead",
    name: "Alex Rivera",
    role: "Principal Systems Architect",
    focus: "Technical depth, concurrency, algorithm efficiency, and architecture trade-offs",
    voiceId: "en-US-GuyNeural"
  },
  {
    id: "hiring_manager",
    name: "Samantha Wright",
    role: "Engineering Director",
    focus: "Roadmap prioritization, system scale, delivery deadlines, and cross-team alignment",
    voiceId: "en-US-JennyNeural"
  },
  {
    id: "culture_lead",
    name: "Marcus Vance",
    role: "Head of People & Engineering Culture",
    focus: "Mentorship, leadership empathy, handling production failures, and values",
    voiceId: "en-US-AriaNeural"
  }
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { targetRole = "Senior Full Stack Engineer", step = 0, userMessage = "", transcript = [] } = body;

    let nextTurn: PanelTurn;
    let nextStep = step + 1;
    let isUserTurn = false;

    switch (step) {
      case 0:
        nextTurn = {
          speaker: "moderator",
          name: "Interview Panel Coordinator",
          role: "Panel Lead",
          text: "Welcome! Today you are meeting with our senior interview panel for the " + targetRole + " position. Alex Rivera (Principal Systems Architect), Samantha Wright (Engineering Director), and Marcus Vance (Head of Culture) will each conduct a sequential evaluation round. Alex, please open with the technical architecture round.",
          timestamp: new Date().toISOString(),
          voiceId: "en-US-AriaNeural"
        };
        break;

      case 1:
        nextTurn = {
          speaker: "tech_lead",
          name: PANEL_INTERVIEWERS[0].name,
          role: PANEL_INTERVIEWERS[0].role,
          text: "Hi! Let's start with architecture. Suppose our microservice handling payment webhooks experiences sudden 10x traffic spikes with intermittent downstream 504 gateway timeouts. How would you design a resilient retry and backpressure mechanism to prevent cascade failures without dropping events?",
          timestamp: new Date().toISOString(),
          voiceId: PANEL_INTERVIEWERS[0].voiceId
        };
        isUserTurn = true;
        break;

      case 2:
        nextTurn = {
          speaker: "hiring_manager",
          name: PANEL_INTERVIEWERS[1].name,
          role: PANEL_INTERVIEWERS[1].role,
          text: "Thank you for walking through that architectural trade-off. From an engineering delivery standpoint, suppose your team is 3 weeks away from a major customer-facing release, and a critical bug requires rewriting a core caching layer. How do you decide whether to slip the date or ship a scoped fallback?",
          timestamp: new Date().toISOString(),
          voiceId: PANEL_INTERVIEWERS[1].voiceId
        };
        isUserTurn = true;
        break;

      case 3:
        nextTurn = {
          speaker: "culture_lead",
          name: PANEL_INTERVIEWERS[2].name,
          role: PANEL_INTERVIEWERS[2].role,
          text: "Great perspective on prioritization. Lastly from a culture & team standpoint: Tell me about a time when a junior engineer disagreed with your architectural proposal, and how you navigated the discussion while fostering their technical growth.",
          timestamp: new Date().toISOString(),
          voiceId: PANEL_INTERVIEWERS[2].voiceId
        };
        isUserTurn = true;
        break;

      default:
        nextTurn = {
          speaker: "moderator",
          name: "Interview Panel Coordinator",
          role: "Panel Lead",
          text: "Thank you for completing all three panel rounds! The panel is now synthesizing technical, delivery, and culture insights to generate your consolidated calibration report.",
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
      panelComplete: step >= 4
    });
  } catch (err: any) {
    return NextResponse.json({ error: "PANEL_TURN_FAILED", message: err.message }, { status: 500 });
  }
}
