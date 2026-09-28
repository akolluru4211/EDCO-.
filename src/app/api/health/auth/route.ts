import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const requestId = req.headers.get("x-request-id") || `req-${Date.now()}`;
  const start = Date.now();

  try {
    const { data: sessionData, error } = await supabase.auth.getSession();
    const latencyMs = Date.now() - start;

    return NextResponse.json({
      service: "authentication",
      status: error ? "DEGRADED" : "HEALTHY",
      latencyMs,
      provider: "supabase_auth",
      timestamp: new Date().toISOString(),
      request_id: requestId
    }, { status: 200, headers: { "x-request-id": requestId, "Cache-Control": "no-store" } });
  } catch (err: any) {
    return NextResponse.json({
      service: "authentication",
      status: "UNHEALTHY",
      error: "Auth health check failed",
      timestamp: new Date().toISOString(),
      request_id: requestId
    }, { status: 503, headers: { "x-request-id": requestId, "Cache-Control": "no-store" } });
  }
}
