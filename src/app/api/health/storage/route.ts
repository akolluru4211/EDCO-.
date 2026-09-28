import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const requestId = req.headers.get("x-request-id") || `req-${Date.now()}`;
  const start = Date.now();

  try {
    const { data, error } = await supabase.storage.listBuckets();
    const latencyMs = Date.now() - start;

    return NextResponse.json({
      service: "storage",
      status: error ? "DEGRADED" : "HEALTHY",
      latencyMs,
      bucketCount: data ? data.length : 0,
      timestamp: new Date().toISOString(),
      request_id: requestId
    }, { status: 200, headers: { "x-request-id": requestId, "Cache-Control": "no-store" } });
  } catch (err: any) {
    return NextResponse.json({
      service: "storage",
      status: "UNHEALTHY",
      error: "Storage check failed",
      timestamp: new Date().toISOString(),
      request_id: requestId
    }, { status: 503, headers: { "x-request-id": requestId, "Cache-Control": "no-store" } });
  }
}
