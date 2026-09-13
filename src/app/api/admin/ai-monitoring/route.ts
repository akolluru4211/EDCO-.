import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const role = (profile?.role || "CLIENT").toUpperCase();
    const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN" || role === "FOUNDER";

    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden: Admin privileges required." }, { status: 403 });
    }

    const { data: logs, error } = await supabase
      .from("ai_analysis_logs")
      .select("id, analysis_id, feature, analysis_type, model, prompt_version, latency_ms, status, created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error || !logs) {
      return NextResponse.json({
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageLatencyMs: 0,
        activeModel: process.env.ANTHROPIC_MODEL || "claude-3-7-sonnet-20250219",
        activeFastModel: process.env.ANTHROPIC_FAST_MODEL || "claude-3-5-haiku-20241022",
        featureBreakdown: {},
        recentLogs: []
      });
    }

    const total = logs.length;
    const successful = logs.filter(l => l.status === "SUCCESS").length;
    const failed = logs.filter(l => l.status === "FAILED").length;
    const totalLatency = logs.reduce((acc, curr) => acc + (curr.latency_ms || 0), 0);
    const avgLatency = total > 0 ? Math.round(totalLatency / total) : 0;

    const featureBreakdown: Record<string, number> = {};
    logs.forEach(l => {
      featureBreakdown[l.feature] = (featureBreakdown[l.feature] || 0) + 1;
    });

    return NextResponse.json({
      totalRequests: total,
      successfulRequests: successful,
      failedRequests: failed,
      averageLatencyMs: avgLatency,
      activeModel: process.env.ANTHROPIC_MODEL || "claude-3-7-sonnet-20250219",
      activeFastModel: process.env.ANTHROPIC_FAST_MODEL || "claude-3-5-haiku-20241022",
      featureBreakdown,
      recentLogs: logs.slice(0, 25)
    });
  } catch (err: any) {
    console.error("[AI Monitoring Route Error]:", err);
    return NextResponse.json({ error: "Failed to retrieve AI monitoring metrics." }, { status: 500 });
  }
}
