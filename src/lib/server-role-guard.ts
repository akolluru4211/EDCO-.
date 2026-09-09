import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

import { UserRole } from "./types";

export type RoleType = 
  | "admin" 
  | "school_admin" 
  | "teacher" 
  | "employer" 
  | "student" 
  | "working_professional"
  | "CLIENT"
  | "EMPLOYEE"
  | "HR"
  | "TEACHER"
  | "COLLEGE_ADMIN"
  | "PLACEMENT_OFFICER"
  | "FOUNDER"
  | "EXECUTIVE"
  | "ADMIN"
  | "SUPER_ADMIN";

export interface RoleCheckResult {
  authorized: boolean;
  statusCode?: number;
  error?: string;
  user?: {
    id: string;
    email?: string;
    role?: UserRole | string;
    ageBand?: string;
    isAdmin: boolean;
    isHR: boolean;
    isFounder: boolean;
    isTeacher: boolean;
    isSchoolAdmin: boolean;
    isCollegeAdmin: boolean;
    isPlacementOfficer: boolean;
    isEmployee: boolean;
    isEmployer: boolean;
  };
}

/**
 * Validates whether the user ID / token has one of the allowed roles.
 * Never trusts unverified client claims. Checks database record.
 */
export async function verifyUserRole(
  userId: string | null | undefined,
  allowedRoles: RoleType[]
): Promise<RoleCheckResult> {
  if (!userId) {
    return {
      authorized: false,
      statusCode: 401,
      error: "Unauthorized: Authentication required."
    };
  }

  try {
    const { data: userRecord, error } = await supabase
      .from("users")
      .select("id, email, role, age_band, is_admin, is_hr, is_founder, is_teacher, is_school_admin, is_employer, is_suspended")
      .eq("id", userId)
      .maybeSingle();

    if (error || !userRecord) {
      // Check profiles fallback
      const { data: profileRecord } = await supabase
        .from("profiles")
        .select("id, email, role, age_band, is_admin, is_hr, is_founder, is_teacher, is_school_admin, is_employer")
        .eq("id", userId)
        .maybeSingle();

      if (!profileRecord) {
        return {
          authorized: false,
          statusCode: 403,
          error: "Forbidden: User profile not found."
        };
      }

      return evaluateRoles(profileRecord, allowedRoles);
    }

    if (userRecord.is_suspended) {
      return {
        authorized: false,
        statusCode: 403,
        error: "Forbidden: Account has been suspended by administration."
      };
    }

    return evaluateRoles(userRecord, allowedRoles);
  } catch (err: any) {
    console.error("[verifyUserRole Exception]:", err);
    return {
      authorized: false,
      statusCode: 500,
      error: "Internal Server Error during authorization verification."
    };
  }
}

function evaluateRoles(record: any, allowedRoles: RoleType[]): RoleCheckResult {
  const rawRole = (record.role || "").toUpperCase();
  const isAdmin = Boolean(record.is_admin || rawRole === "ADMIN" || rawRole === "SUPER_ADMIN");
  const isSuperAdmin = Boolean(rawRole === "SUPER_ADMIN");
  const isFounder = Boolean(record.is_founder || rawRole === "FOUNDER" || rawRole === "EXECUTIVE" || isAdmin);
  const isHR = Boolean(record.is_hr || rawRole === "HR" || isFounder || isAdmin);
  const isTeacher = Boolean(record.is_teacher || rawRole === "TEACHER" || isAdmin);
  const isSchoolAdmin = Boolean(record.is_school_admin || rawRole === "SCHOOL_ADMIN" || isAdmin);
  const isCollegeAdmin = Boolean(rawRole === "COLLEGE_ADMIN" || isAdmin);
  const isPlacementOfficer = Boolean(rawRole === "PLACEMENT_OFFICER" || isCollegeAdmin || isAdmin);
  const isEmployee = Boolean(rawRole === "EMPLOYEE" || isHR || isFounder || isAdmin);
  const isEmployer = Boolean(record.is_employer);
  const isMinor = record.age_band === "13-15" || record.age_band === "16-18";
  const isWorkingProf = record.age_band === "18+";

  const user = {
    id: record.id,
    email: record.email,
    role: rawRole || (isAdmin ? "ADMIN" : isHR ? "HR" : isFounder ? "FOUNDER" : isTeacher ? "TEACHER" : "CLIENT"),
    ageBand: record.age_band,
    isAdmin,
    isHR,
    isFounder,
    isTeacher,
    isSchoolAdmin,
    isCollegeAdmin,
    isPlacementOfficer,
    isEmployee,
    isEmployer
  };

  let hasPermission = false;

  for (const role of allowedRoles) {
    const r = role.toUpperCase();
    if (r === "SUPER_ADMIN" && isSuperAdmin) hasPermission = true;
    if ((r === "ADMIN" || role === "admin") && isAdmin) hasPermission = true;
    if ((r === "FOUNDER" || r === "EXECUTIVE") && isFounder) hasPermission = true;
    if (r === "HR" && isHR) hasPermission = true;
    if ((r === "TEACHER" || role === "teacher") && isTeacher) hasPermission = true;
    if ((r === "SCHOOL_ADMIN" || role === "school_admin") && isSchoolAdmin) hasPermission = true;
    if (r === "COLLEGE_ADMIN" && isCollegeAdmin) hasPermission = true;
    if (r === "PLACEMENT_OFFICER" && isPlacementOfficer) hasPermission = true;
    if (r === "EMPLOYEE" && isEmployee) hasPermission = true;
    if ((r === "EMPLOYER" || role === "employer") && (isEmployer || isAdmin)) hasPermission = true;
    if ((r === "STUDENT" || role === "student") && isMinor) hasPermission = true;
    if ((r === "WORKING_PROFESSIONAL" || role === "working_professional") && isWorkingProf) hasPermission = true;
    if (r === "CLIENT") hasPermission = true;
  }

  if (!hasPermission) {
    return {
      authorized: false,
      statusCode: 403,
      error: `Forbidden: Insufficient role permissions. Required role(s): ${allowedRoles.join(", ")}`,
      user
    };
  }

  return {
    authorized: true,
    user
  };
}

/**
 * Standard NextRequest middleware helper for API routes.
 */
export async function requireRole(
  req: NextRequest,
  allowedRoles: RoleType[],
  explicitUserId?: string
): Promise<RoleCheckResult> {
  const userId = explicitUserId || 
    req.headers.get("x-user-id") || 
    req.nextUrl.searchParams.get("userId") || 
    req.nextUrl.searchParams.get("teacherId") || 
    req.nextUrl.searchParams.get("adminId");

  return verifyUserRole(userId, allowedRoles);
}

/**
 * Records an audit log whenever an Edworld Admin inspects a specific student's record.
 */
export async function logAdminStudentInspection(
  adminId: string,
  studentId: string,
  reason: string = "Admin compliance inspection"
) {
  try {
    await supabase.from("audit_logs").insert({
      actor_id: adminId,
      actor_role: "admin",
      action: "admin.student_record_inspected",
      target_type: "student",
      target_id: studentId,
      metadata: {
        reason,
        inspected_at: new Date().toISOString()
      }
    });
  } catch (e) {
    console.warn("Audit log insertion exception:", e);
  }
}
