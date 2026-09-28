import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const requestId = req.headers.get("x-request-id") || `req-${Date.now()}`;
  const start = Date.now();

  try {
    const { count, error } = await supabase
      .from("connected_accounts")
      .select("id", { count: "exact", head: true });

    const latencyMs = Date.now() - start;

    return NextResponse.json({
      service: "integrations",
      status: error ? "DEGRADED" : "HEALTHY",
      latencyMs,
      connectedAccountsTracked: count || 0,
      supportedProviders: ["GITHUB", "LINKEDIN", "LEETCODE"],
      timestamp: new Date().toISOString(),
      request_id: requestId
    }, { status: 200, headers: { "x-request-id": requestId, "Cache-Control": "no-store" } });
  } catch (err: any) {
    return NextResponse.json({
      service: "integrations",
      status: "UNHEALTHY",
      error: "Integrations check failed",
      timestamp: new Date().toISOString(),
      request_id: requestId
    }, { status: 503, headers: { "x-request-id": requestId, "Cache-Control": "no-store" } });
  }
}
