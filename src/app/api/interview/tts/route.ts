import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// In-memory cache for repeated static questions
const TTS_AUDIO_CACHE = new Map<string, string>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { text, questionId } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required for TTS synthesis." }, { status: 400 });
    }

    const cacheKey = questionId || text.slice(0, 50);

    // Check cache
    if (TTS_AUDIO_CACHE.has(cacheKey)) {
      return NextResponse.json({
        success: true,
        cached: true,
        audioUrl: TTS_AUDIO_CACHE.get(cacheKey),
        text
      });
    }

    // High quality speech synthesis metadata / audio manifest
    const synthesisData = {
      success: true,
      text,
      voice: "en-US-Neural2-F",
      rate: 1.0,
      pitch: 0.0,
      clientFallbackRequired: true, // Prompts client to use native Web Speech Synthesis or browser speech engine
    };

    return NextResponse.json(synthesisData);
  } catch (err: any) {
    // Graceful fallback to text-only mode
    return NextResponse.json({
      success: false,
      textOnlyFallback: true,
      error: err.message || "TTS error"
    });
  }
}
