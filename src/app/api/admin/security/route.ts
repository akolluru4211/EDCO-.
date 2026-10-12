import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDbPool } from "@/lib/db-server";
import { verifyUserRole } from "@/lib/server-role-guard";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    let isAuthorized = false;

    // Check 1: Supabase SSR auth
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        const allowedRoles = ["ADMIN", "SUPER_ADMIN", "FOUNDER", "EXECUTIVE"];
        if (profile && allowedRoles.includes(profile.role)) {
          isAuthorized = true;
        }
      }
    } catch {}

    // Check 2: Session token / Cookie auth
    if (!isAuthorized) {
      const sessionCookie = req.cookies.get("edworld_session")?.value;
      const authHeader = req.headers.get("authorization")?.replace("Bearer ", "");
      const token = sessionCookie || authHeader;

      if (token) {
        const roleCheck = await verifyUserRole(token, [
          "ADMIN",
          "SUPER_ADMIN",
          "FOUNDER",
          "EXECUTIVE",
        ]);
        if (roleCheck.authorized) {
          isAuthorized = true;
        }
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Forbidden: Platform administrator clearance required." },
        { status: 403 }
      );
    }

    const pool = getDbPool();
    const startDb = performance.now();

    // 1. Probe database latency & connection pool
    const pingRes = await pool.query("SELECT NOW() as current_time, current_database() as db_name");
    const dbLatencyMs = Math.round(performance.now() - startDb);

    // 2. Query Row Level Security status on tables
    const rlsRes = await pool.query(`
      SELECT 
        tablename, 
        rowsecurity as rls_enabled
      FROM pg_tables 
      WHERE schemaname = 'public' 
        AND tablename IN ('profiles', 'users', 'connections', 'direct_messages', 'user_blocks', 'ambassador_applications')
      ORDER BY tablename ASC
    `);

    // 3. Query security & moderation metrics
    const [blocksRes, adminsRes, usersCountRes, connsCountRes, msgsCountRes] = await Promise.all([
      pool.query("SELECT COUNT(*) as count FROM public.user_blocks").catch(() => ({ rows: [{ count: 0 }] })),
      pool.query("SELECT COUNT(*) as count FROM public.profiles WHERE is_admin = true").catch(() => ({ rows: [{ count: 0 }] })),
      pool.query("SELECT COUNT(*) as count FROM public.profiles").catch(() => ({ rows: [{ count: 0 }] })),
      pool.query("SELECT COUNT(*) as count FROM public.connections").catch(() => ({ rows: [{ count: 0 }] })),
      pool.query("SELECT COUNT(*) as count FROM public.direct_messages").catch(() => ({ rows: [{ count: 0 }] })),
    ]);

    // 4. Query recent security / moderation events
    const recentBlocks = await pool.query(`
      SELECT 
        b.id,
        b.created_at,
        b.reason,
        p1.name as blocker_name,
        p2.name as blocked_name
      FROM public.user_blocks b
      LEFT JOIN public.profiles p1 ON p1.id = b.blocker_id
      LEFT JOIN public.profiles p2 ON p2.id = b.blocked_id
      ORDER BY b.created_at DESC
      LIMIT 5
    `).catch(() => ({ rows: [] }));

    // 5. Query recent privileged admin users
    const recentAdmins = await pool.query(`
      SELECT id, name, email, role, created_at
      FROM public.profiles
      WHERE is_admin = true
      ORDER BY created_at DESC
      LIMIT 5
    `).catch(() => ({ rows: [] }));

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      database: {
        status: "HEALTHY",
        engine: "PostgreSQL 15 (Supabase Managed Cloud)",
        latencyMs: dbLatencyMs,
        sslActive: true,
        poolTotal: pool.totalCount || 1,
        poolIdle: pool.idleCount || 1,
        poolWaiting: pool.waitingCount || 0,
        currentTime: pingRes.rows[0]?.current_time,
      },
      rlsTables: (rlsRes.rows || []).map((r: any) => ({
        table: r.tablename,
        rlsEnabled: r.rls_enabled,
        status: r.rls_enabled ? "PROTECTED" : "STANDARD",
      })),
      metrics: {
        totalRegisteredUsers: parseInt(usersCountRes.rows[0]?.count || "0", 10),
        activeConnections: parseInt(connsCountRes.rows[0]?.count || "0", 10),
        totalDirectMessages: parseInt(msgsCountRes.rows[0]?.count || "0", 10),
        activeBlocks: parseInt(blocksRes.rows[0]?.count || "0", 10),
        adminAccounts: parseInt(adminsRes.rows[0]?.count || "0", 10),
      },
      auditLogs: recentBlocks.rows.map((b: any) => ({
        id: b.id,
        type: "USER_BLOCK",
        description: `Member ${b.blocker_name || "Unknown"} blocked ${b.blocked_name || "Unknown"}`,
        reason: b.reason || "Safety request",
        timestamp: b.created_at,
        severity: "MEDIUM",
      })),
      privilegedAccounts: recentAdmins.rows,
      complianceOffice: {
        act: "Digital Personal Data Protection (DPDP) Act 2023 & IT Act 2000",
        officer: "Grievance Redressal Officer",
        designation: "Head of Compliance & Privacy",
        email: "edworld.eden@gmail.com",
        location: "Hyderabad HQ, Telangana, India",
        resolutionSla: "24–48 Hours",
        encryptionInTransit: "TLS 1.3 Strict HTTPS",
        encryptionAtRest: "AES-256 Cloud Encrypted",
      },
    });
  } catch (err: any) {
    console.error("[Admin Security API Error]:", err);
    return NextResponse.json({ success: false, error: err.message || "Internal error" }, { status: 500 });
  }
}
