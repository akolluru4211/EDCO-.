import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const requestId = req.headers.get("x-request-id") || `req-${Date.now()}`;
  const start = Date.now();

  try {
    const { data, error } = await supabase.from("profiles").select("id").limit(1);
    const latencyMs = Date.now() - start;

    if (error) {
      return NextResponse.json({
        service: "postgresql",
        status: "DEGRADED",
        latencyMs,
        error: error.message,
        timestamp: new Date().toISOString(),
        request_id: requestId
      }, { status: 503, headers: { "x-request-id": requestId, "Cache-Control": "no-store" } });
    }

    return NextResponse.json({
      service: "postgresql",
      status: "HEALTHY",
      latencyMs,
      pool: "active",
      timestamp: new Date().toISOString(),
      request_id: requestId
    }, { status: 200, headers: { "x-request-id": requestId, "Cache-Control": "no-store" } });
  } catch (err: any) {
    return NextResponse.json({
      service: "postgresql",
      status: "UNHEALTHY",
      error: "Connection failed",
      timestamp: new Date().toISOString(),
      request_id: requestId
    }, { status: 503, headers: { "x-request-id": requestId, "Cache-Control": "no-store" } });
  }
}
