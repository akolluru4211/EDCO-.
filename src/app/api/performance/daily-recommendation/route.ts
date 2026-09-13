import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getOrGenerateDailyRecommendation, getDailyAISummary } from "@/lib/services/performance-intelligence";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
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

    const { data: profile } = await supabase.from("profiles").select("display_name, full_name").eq("id", user.id).maybeSingle();
    const userName = profile?.display_name || profile?.full_name || user.user_metadata?.full_name || "there";

    const [recommendation, summary] = await Promise.all([
      getOrGenerateDailyRecommendation(user.id, supabase, userName),
      getDailyAISummary(user.id, supabase)
    ]);

    return NextResponse.json({
      success: true,
      recommendation,
      summary
    });
  } catch (error: any) {
    console.error("GET /api/performance/daily-recommendation error:", error);
    return NextResponse.json({ error: error.message || "Failed to load daily recommendation" }, { status: 500 });
  }
}

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
    const { recommendationId, isCompleted } = body;

    if (recommendationId) {
      await supabase
        .from("daily_ai_recommendations")
        .update({
          is_completed: isCompleted ?? true,
          completed_at: isCompleted ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq("id", recommendationId)
        .eq("user_id", user.id);
    }

    return NextResponse.json({ success: true, updated: true });
  } catch (error: any) {
    console.error("POST /api/performance/daily-recommendation error:", error);
    return NextResponse.json({ error: error.message || "Failed to update daily recommendation" }, { status: 500 });
  }
}
