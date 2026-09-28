import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const requestId = req.headers.get("x-request-id") || `req-${Date.now()}`;
  const start = Date.now();

  try {
    const { error } = await supabase.from("profiles").select("id").limit(1);
    const latencyMs = Date.now() - start;

    if (error) {
      return NextResponse.json({
        status: "not_ready",
        database: "unreachable",
        latencyMs,
        request_id: requestId,
        timestamp: new Date().toISOString()
      }, {
        status: 503,
        headers: { "x-request-id": requestId, "Cache-Control": "no-store" }
      });
    }

    return NextResponse.json({
      status: "ready",
      database: "connected",
      latencyMs,
      request_id: requestId,
      timestamp: new Date().toISOString()
    }, {
      status: 200,
      headers: { "x-request-id": requestId, "Cache-Control": "no-store" }
    });
  } catch (err: any) {
    return NextResponse.json({
      status: "not_ready",
      error: "Health check error",
      request_id: requestId,
      timestamp: new Date().toISOString()
    }, {
      status: 503,
      headers: { "x-request-id": requestId, "Cache-Control": "no-store" }
    });
  }
}
