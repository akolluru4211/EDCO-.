import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { calculateUserPerformanceOverview } from "@/lib/services/performance-intelligence";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { eventType, source, title, metricsPayload, evidenceText } = body;

    if (!eventType || !title) {
      return NextResponse.json({ error: "eventType and title are required" }, { status: 400 });
    }

    await supabase.from("performance_events").insert({
      user_id: user.id,
      event_type: eventType,
      source: source || "SYSTEM",
      title: title,
      metrics_payload: metricsPayload || {},
      evidence_text: evidenceText || null
    });

    calculateUserPerformanceOverview(user.id, supabase).catch(console.error);

    return NextResponse.json({ success: true, recorded: true });
  } catch (error: any) {
    console.error("POST /api/performance/event error:", error);
    return NextResponse.json({ error: error.message || "Failed to record event" }, { status: 500 });
  }
}
