import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const allowedRoles = ["ADMIN", "SUPER_ADMIN", "FOUNDER", "EXECUTIVE"];
    if (!profile || !allowedRoles.includes(profile.role)) {
      return NextResponse.json({ error: "Forbidden: Admin privileges required." }, { status: 403 });
    }

    const { data: logs, error } = await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.warn("[Admin Audit Logs API note]:", error);
      return NextResponse.json({ success: true, logs: [] });
    }

    const mappedLogs = (logs || []).map((log: any) => ({
      id: log.id,
      actorId: log.actor_id || "System",
      actorRole: log.actor_role || "system",
      action: log.action || "system.event",
      targetType: log.target_type || "resource",
      targetId: log.target_id || "global",
      metadata: log.metadata || {},
      ipAddress: log.ip_address || "127.0.0.1",
      timestamp: log.created_at || log.timestamp || new Date().toISOString()
    }));

    return NextResponse.json({
      success: true,
      logs: mappedLogs,
      totalCount: mappedLogs.length
    });
  } catch (err: any) {
    console.error("[Admin Audit Logs API Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to load audit logs" }, { status: 500 });
  }
}
