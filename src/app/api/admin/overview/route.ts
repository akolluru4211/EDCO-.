import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check admin permissions
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const allowedRoles = ["ADMIN", "SUPER_ADMIN", "FOUNDER", "EXECUTIVE"];
    if (!profile || !allowedRoles.includes(profile.role)) {
      return NextResponse.json({ error: "Forbidden: Platform admin privileges required" }, { status: 403 });
    }

    // Real Live Counts from Supabase Tables
    const [
      usersCountRes,
      profilesRes,
      resumesCountRes,
      interviewsCountRes,
      applicationsCountRes,
      auditLogsRes,
      aiLogsRes
    ] = await Promise.all([
      supabase.from("users").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id, name, display_name, email, username, role, status, updated_at, created_at").order("created_at", { ascending: false }).limit(50),
      supabase.from("resumes").select("id", { count: "exact", head: true }),
      supabase.from("interview_sessions").select("id", { count: "exact", head: true }),
      supabase.from("job_applications_pipeline").select("id", { count: "exact", head: true }),
      supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(20),
      supabase.from("ai_analysis_logs").select("id, status", { count: "exact" })
    ]);

    const totalUsers = profilesRes.data?.length || usersCountRes.count || 0;
    const totalResumes = resumesCountRes.count || 0;
    const totalInterviews = interviewsCountRes.count || 0;
    const totalApplications = applicationsCountRes.count || 0;

    const profiles = profilesRes.data || [];
    const auditLogs = auditLogsRes.data || [];

    // Role breakdown
    const roleCounts: Record<string, number> = {};
    profiles.forEach((p) => {
      const r = p.role || "CLIENT";
      roleCounts[r] = (roleCounts[r] || 0) + 1;
    });

    const latencyMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      metrics: {
        totalUsers,
        totalResumes,
        totalInterviews,
        totalApplications,
        aiLogsCount: aiLogsRes.count || 0,
        roleCounts,
        dbLatencyMs: latencyMs
      },
      users: profiles.map((p) => ({
        id: p.id,
        name: p.display_name || p.name || p.username || "Registered User",
        email: p.email || (p.username ? `${p.username}@edworld.co` : "user@edworld.co"),
        role: p.role || "CLIENT",
        status: p.status === "SUSPENDED" ? "SUSPENDED" : "ACTIVE",
        lastActivity: p.updated_at ? new Date(p.updated_at).toLocaleDateString() : "Recent",
        createdAt: p.created_at ? new Date(p.created_at).toLocaleDateString() : "Recent"
      })),
      recentAuditLogs: auditLogs.map((log) => ({
        id: log.id,
        action: log.action,
        actorId: log.actor_id,
        actorRole: log.actor_role,
        targetType: log.target_type,
        targetId: log.target_id,
        timestamp: log.created_at || log.timestamp || new Date().toISOString(),
        metadata: log.metadata || {}
      }))
    });
  } catch (err: any) {
    console.error("[Admin Overview API Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to load admin overview" }, { status: 500 });
  }
}
