import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyUserRole } from "@/lib/server-role-guard";

export const dynamic = "force-dynamic";

export interface PlatformUserRecord {
  id: string;
  name: string;
  email: string;
  username?: string;
  role: string;
  career_stage?: string;
  college?: string;
  degree?: string;
  target_role?: string;
  headline?: string;
  status: "ACTIVE" | "SUSPENDED";
  created_at: string;
  updated_at?: string;
}

export async function GET(req: NextRequest) {
  try {
    const currentUserId = req.headers.get("x-user-id") || req.nextUrl.searchParams.get("userId");
    const searchQuery = (req.nextUrl.searchParams.get("query") || "").trim().toLowerCase();
    const roleFilter = (req.nextUrl.searchParams.get("role") || "ALL").toUpperCase();
    const limit = Math.min(parseInt(req.nextUrl.searchParams.get("limit") || "100", 10), 200);

    // 1. RBAC Guard: Ensure caller is authorized staff/employee/founder/admin
    if (currentUserId) {
      const roleCheck = await verifyUserRole(currentUserId, ["EMPLOYEE", "HR", "FOUNDER", "ADMIN", "SUPER_ADMIN"]);
      if (!roleCheck.authorized) {
        return NextResponse.json({ success: false, error: "Unauthorized access to employee user directory." }, { status: 403 });
      }
    }

    // 2. Query real registered profiles from Supabase
    let query = supabase
      .from("profiles")
      .select("id, name, email, username, role, career_stage, college, degree, target_role, headline, status, created_at, updated_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    const { data: profiles, error } = await query;

    if (error) {
      console.error("[Employee Users API Error]:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // 3. Filter and map
    let usersList: PlatformUserRecord[] = (profiles || []).map((p: any) => ({
      id: p.id,
      name: p.name || p.username || "Registered User",
      email: p.email || "No email on record",
      username: p.username || "",
      role: (p.role || "STUDENT").toUpperCase(),
      career_stage: p.career_stage || "Student / Job Seeker",
      college: p.college || "",
      degree: p.degree || "",
      target_role: p.target_role || "",
      headline: p.headline || "",
      status: (p.status || "ACTIVE").toUpperCase() as "ACTIVE" | "SUSPENDED",
      created_at: p.created_at || new Date().toISOString(),
      updated_at: p.updated_at,
    }));

    if (roleFilter !== "ALL") {
      usersList = usersList.filter(u => u.role === roleFilter);
    }

    if (searchQuery) {
      usersList = usersList.filter(u =>
        u.name.toLowerCase().includes(searchQuery) ||
        u.email.toLowerCase().includes(searchQuery) ||
        u.username?.toLowerCase().includes(searchQuery) ||
        u.college?.toLowerCase().includes(searchQuery) ||
        u.target_role?.toLowerCase().includes(searchQuery)
      );
    }

    return NextResponse.json({
      success: true,
      users: usersList,
      totalCount: usersList.length,
    });
  } catch (err: any) {
    console.error("[Employee Users Handler Error]:", err);
    return NextResponse.json({ success: false, error: err?.message || "Internal server error" }, { status: 500 });
  }
}
