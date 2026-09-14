import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { actorUserId, actorRole, action, resourceType, resourceId, metadata } = body;

    if (!action || !resourceType) {
      return NextResponse.json({ error: "Missing required audit fields: action and resourceType" }, { status: 400 });
    }

    const { data, error } = await supabase.from("internal_audit_logs").insert({
      actor_user_id: actorUserId || null,
      actor_role: actorRole || "EMPLOYEE",
      action,
      resource_type: resourceType,
      resource_id: resourceId || null,
      metadata: metadata || {},
    }).select().single();

    if (error) {
      console.error("Internal audit log insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, log: data });
  } catch (err: any) {
    console.error("POST /api/internal/audit exception:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "50", 10);
    const { data, error } = await supabase
      .from("internal_audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, logs: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
