import crypto from "crypto";
import { supabase } from "./supabase";
import { UserRole, AppUser, CareerStage } from "./types";

export type AccountStatus = "ACTIVE" | "SUSPENDED" | "DISABLED" | "PENDING" | "INVITED";

export interface OtpRecord {
  identifier: string;
  hashedOtp: string;
  expiresAt: number; // timestamp in ms
  resendAvailableAt: number; // timestamp in ms
  attempts: number;
  maxAttempts: number;
  used: boolean;
  lockedUntil?: number;
  purpose: "login" | "signup";
  createdAt: number;
}

export interface SecurityEvent {
  type: 
    | "OTP_REQUESTED" 
    | "OTP_SENT" 
    | "OTP_VERIFY_SUCCESS" 
    | "OTP_VERIFY_FAILED" 
    | "OTP_EXPIRED" 
    | "OTP_REUSED" 
    | "OTP_LOCKED" 
    | "RATE_LIMIT_EXCEEDED" 
    | "ACCOUNT_SUSPENDED_LOGIN_ATTEMPT" 
    | "LOGOUT"
    | "WAF_SQLI_BLOCKED"
    | "WAF_XSS_BLOCKED"
    | "WAF_PATH_TRAVERSAL_BLOCKED"
    | "WAF_BOT_BLOCKED";
  identifier: string;
  ip?: string;
  userAgent?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// In-memory resilient OTP & Rate-Limit store (persisted on globalThis for Next.js route chunks)
const globalForAuth = globalThis as unknown as {
  edworldOtpStore?: Map<string, OtpRecord>;
  edworldRequestHistory?: Map<string, number[]>;
  edworldActiveSessions?: Map<string, { userId: string; role: UserRole; expiresAt: number }>;
  edworldSecurityLogs?: SecurityEvent[];
};

const otpStore = globalForAuth.edworldOtpStore || (globalForAuth.edworldOtpStore = new Map<string, OtpRecord>());
const requestHistory = globalForAuth.edworldRequestHistory || (globalForAuth.edworldRequestHistory = new Map<string, number[]>());
const activeSessions = globalForAuth.edworldActiveSessions || (globalForAuth.edworldActiveSessions = new Map<string, { userId: string; role: UserRole; expiresAt: number }>());
const securityLogs = globalForAuth.edworldSecurityLogs || (globalForAuth.edworldSecurityLogs = []);

// Seed known internal provisioned staff for deterministic server role verification
const PROVISIONED_INTERNAL_ACCOUNTS: Record<string, { role: UserRole; status: AccountStatus; name: string; orgId: string }> = {
  "admin@edworld.co.in": { role: "ADMIN", status: "ACTIVE", name: "System Admin", orgId: "edworld-hq" },
  "superadmin@edworld.co.in": { role: "SUPER_ADMIN", status: "ACTIVE", name: "Super Admin", orgId: "edworld-hq" },
  "hr@edworld.co.in": { role: "HR", status: "ACTIVE", name: "People Operations", orgId: "edworld-hq" },
  "founder@edworld.co.in": { role: "FOUNDER", status: "ACTIVE", name: "Founder & CEO", orgId: "edworld-hq" },
  "edworld.eden@gmail.com": { role: "FOUNDER", status: "ACTIVE", name: "EdWorld Founder & CEO", orgId: "edworld-hq" },
  "ceo@edworld.co.in": { role: "FOUNDER", status: "ACTIVE", name: "Chief Executive", orgId: "edworld-hq" },
  "teacher@edworld.co.in": { role: "TEACHER", status: "ACTIVE", name: "Lead Educator", orgId: "edworld-school" },
  "college@edworld.co.in": { role: "COLLEGE_ADMIN", status: "ACTIVE", name: "College Director", orgId: "edworld-univ" },
  "tpo@edworld.co.in": { role: "PLACEMENT_OFFICER", status: "ACTIVE", name: "Placement Officer", orgId: "edworld-univ" },
  "employee@edworld.co.in": { role: "EMPLOYEE", status: "ACTIVE", name: "Staff Engineer", orgId: "edworld-hq" },
  "aditya.verma@edworld.co.in": { role: "EMPLOYEE", status: "ACTIVE", name: "Aditya Verma", orgId: "edworld-hq" },
  "sneha.mukherjee@edworld.co.in": { role: "EMPLOYEE", status: "ACTIVE", name: "Sneha Mukherjee", orgId: "edworld-hq" },
  "suspended.user@example.com": { role: "CLIENT", status: "SUSPENDED", name: "Suspended Learner", orgId: "none" },
  "disabled.employee@edworld.co.in": { role: "EMPLOYEE", status: "DISABLED", name: "Disabled Staff", orgId: "edworld-hq" },
};

/**
 * Normalizes identifier (email or phone)
 */
export function normalizeIdentifier(input: string): string {
  if (!input) return "";
  const trimmed = input.trim();
  if (trimmed.includes("@")) {
    return trimmed.toLowerCase();
  }
  // Mobile: keep leading + and digits
  const cleaned = trimmed.replace(/[^\d+]/g, "");
  return cleaned;
}

/**
 * Masks phone numbers or email addresses for privacy in UI.
 * e.g. "+91 9876543210" -> "+91 ******3210"
 * e.g. "alex.morgan@example.com" -> "a***n@example.com"
 */
export function maskIdentifier(identifier: string): string {
  const norm = normalizeIdentifier(identifier);
  if (norm.includes("@")) {
    const [user, domain] = norm.split("@");
    if (user.length <= 2) {
      return `${user[0]}***@${domain}`;
    }
    return `${user[0]}***${user[user.length - 1]}@${domain}`;
  }
  // Phone masking
  if (norm.length >= 10) {
    const last4 = norm.slice(-4);
    const prefix = norm.startsWith("+") ? norm.slice(0, 3) : "";
    return `${prefix ? prefix + " " : ""}******${last4}`;
  }
  return "******" + norm.slice(-2);
}

/**
 * Hash an OTP using SHA-256 with salt
 */
function hashOtp(identifier: string, otp: string): string {
  const salt = process.env.OTP_SALT || "edworld-secure-otp-salt-2026";
  return crypto.createHmac("sha256", salt).update(`${identifier}:${otp}`).digest("hex");
}

/**
 * Maps UserRole and CareerStage to authorized portal URL
 */
export function getRedirectForRole(role: UserRole | string, careerStage?: string, isOnboarded: boolean = true): string {
  if (isOnboarded === false && (role === "CLIENT" || role === "STUDENT")) {
    return "/onboarding";
  }
  switch (role) {
    case "STUDENT":
    case "CLIENT":
      if (careerStage === "JUNIOR") return "/student/junior/dashboard";
      return "/dashboard";
    case "EMPLOYEE":
      return "/employee";
    case "HR":
      return "/hr";
    case "FOUNDER":
    case "EXECUTIVE":
      return "/founder";
    case "COLLEGE_ADMIN":
    case "PLACEMENT_OFFICER":
      return "/colleges";
    case "ADMIN":
    case "SUPER_ADMIN":
      return "/admin";
    default:
      if (careerStage === "JUNIOR") return "/student/junior/dashboard";
      return "/dashboard";
  }
}

/**
 * Generates and sends a 6-digit OTP with rate limiting & cooldown
 */
export async function generateAndSendOtp(
  rawIdentifier: string,
  purpose: "login" | "signup" = "login",
  ipAddress?: string
): Promise<{
  success: boolean;
  maskedIdentifier: string;
  cooldownSeconds: number;
  message: string;
  devOtp?: string;
}> {
  const identifier = normalizeIdentifier(rawIdentifier);
  if (!identifier) {
    throw new Error("Please enter a valid email address or phone number.");
  }

  const now = Date.now();

  // 1. Check Rate Limiting (max 4 OTP requests in 10 minutes)
  const history = requestHistory.get(identifier) || [];
  const recentRequests = history.filter((t) => now - t < 10 * 60 * 1000);
  if (recentRequests.length >= 5) {
    logSecurityEvent({
      type: "RATE_LIMIT_EXCEEDED",
      identifier,
      ip: ipAddress,
      timestamp: new Date().toISOString(),
      metadata: { count: recentRequests.length },
    });
    throw new Error("Too many OTP requests. Please wait 10 minutes before requesting a new code.");
  }

  // 2. Check Cooldown (60 seconds)
  const existingRecord = otpStore.get(identifier);
  if (existingRecord) {
    if (existingRecord.lockedUntil && existingRecord.lockedUntil > now) {
      const waitMins = Math.ceil((existingRecord.lockedUntil - now) / 60000);
      throw new Error(`Account temporarily locked due to repeated failed attempts. Please retry in ${waitMins} minutes.`);
    }

    if (!existingRecord.used && existingRecord.resendAvailableAt > now) {
      const remainingSecs = Math.ceil((existingRecord.resendAvailableAt - now) / 1000);
      throw new Error(`Please wait ${remainingSecs} seconds before requesting another code.`);
    }
  }

  // 3. Generate 6-digit cryptographic numeric OTP
  const rawCode = crypto.randomInt(100000, 999999).toString();
  const hashedOtp = hashOtp(identifier, rawCode);

  const otpRecord: OtpRecord = {
    identifier,
    hashedOtp,
    expiresAt: now + 5 * 60 * 1000, // 5 minutes TTL
    resendAvailableAt: now + 45 * 1000, // 45s resend cooldown
    attempts: 0,
    maxAttempts: 5,
    used: false,
    purpose,
    createdAt: now,
  };

  otpStore.set(identifier, otpRecord);
  recentRequests.push(now);
  requestHistory.set(identifier, recentRequests);

  // 4. Log Security Event (Never log plaintext OTP)
  logSecurityEvent({
    type: "OTP_SENT",
    identifier,
    ip: ipAddress,
    timestamp: new Date().toISOString(),
    metadata: { purpose, ttlMinutes: 5 },
  });

  const masked = maskIdentifier(identifier);

  // In local test / development environment, allow test retrieval
  const isDev = process.env.NODE_ENV !== "production";

  return {
    success: true,
    maskedIdentifier: masked,
    cooldownSeconds: 45,
    message: `Verification code sent to ${masked}. Code expires in 5 minutes.`,
    devOtp: isDev ? rawCode : undefined,
  };
}

/**
 * Verifies 6-digit OTP, checks expiration, one-time use, and enforces server-side role resolution
 */
export async function verifyOtp(
  rawIdentifier: string,
  enteredOtp: string,
  purpose: "login" | "signup" = "login",
  metaData?: { name?: string; dob?: string; careerStage?: CareerStage; gradeLevel?: string }
): Promise<{
  success: boolean;
  user: AppUser;
  role: UserRole;
  status: AccountStatus;
  redirectUrl: string;
  token: string;
}> {
  const identifier = normalizeIdentifier(rawIdentifier);
  const now = Date.now();

  const record = otpStore.get(identifier);

  if (!record) {
    logSecurityEvent({
      type: "OTP_VERIFY_FAILED",
      identifier,
      timestamp: new Date().toISOString(),
      metadata: { reason: "NO_ACTIVE_OTP" },
    });
    throw new Error("No active verification code found. Please request a new code.");
  }

  // Check Lockout
  if (record.lockedUntil && record.lockedUntil > now) {
    const waitMins = Math.ceil((record.lockedUntil - now) / 60000);
    logSecurityEvent({
      type: "OTP_LOCKED",
      identifier,
      timestamp: new Date().toISOString(),
    });
    throw new Error(`Account verification is locked due to too many failed attempts. Try again in ${waitMins} minutes.`);
  }

  // Check Expiration (5 mins)
  if (now > record.expiresAt) {
    logSecurityEvent({
      type: "OTP_EXPIRED",
      identifier,
      timestamp: new Date().toISOString(),
    });
    throw new Error("Verification code has expired. Please request a new 6-digit code.");
  }

  // Check One-Time Use
  if (record.used) {
    logSecurityEvent({
      type: "OTP_REUSED",
      identifier,
      timestamp: new Date().toISOString(),
    });
    throw new Error("This verification code has already been used. Please request a fresh code.");
  }

  // Check OTP Hash Match (or test code 123456 in dev mode)
  const isDev = process.env.NODE_ENV !== "production";
  const expectedHash = record.hashedOtp;
  const enteredHash = hashOtp(identifier, (enteredOtp || "").trim());
  const isMatch = enteredHash === expectedHash || (isDev && enteredOtp === "123456");

  if (!isMatch) {
    record.attempts += 1;
    if (record.attempts >= record.maxAttempts) {
      record.lockedUntil = now + 15 * 60 * 1000; // 15-minute temporary lockout
      logSecurityEvent({
        type: "OTP_LOCKED",
        identifier,
        timestamp: new Date().toISOString(),
        metadata: { attempts: record.attempts },
      });
      throw new Error("Too many failed attempts. Account verification is locked for 15 minutes.");
    }

    logSecurityEvent({
      type: "OTP_VERIFY_FAILED",
      identifier,
      timestamp: new Date().toISOString(),
      metadata: { attemptsRemaining: record.maxAttempts - record.attempts },
    });
    throw new Error(`Invalid verification code. ${record.maxAttempts - record.attempts} attempts remaining.`);
  }

  // Mark as USED immediately (prevent replay attacks)
  record.used = true;
  otpStore.set(identifier, record);

  // 5. Query Secure Server-Side User & Role
  const { user, role, status } = await resolveUserAndRole(identifier, purpose, metaData);

  if (status === "SUSPENDED") {
    logSecurityEvent({
      type: "ACCOUNT_SUSPENDED_LOGIN_ATTEMPT",
      identifier,
      timestamp: new Date().toISOString(),
    });
    throw new Error("Your account has been suspended by organization administration. Please contact edworld.eden@gmail.com.");
  }

  if (status === "DISABLED") {
    throw new Error("This account is currently disabled. Please contact your Edworld administrator.");
  }

  // 6. Create Session Token
  const token = `edw_sess_${crypto.randomBytes(32).toString("hex")}`;
  activeSessions.set(token, {
    userId: user.uid,
    role,
    expiresAt: now + 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  const redirectUrl = getRedirectForRole(role, user.careerStage);

  logSecurityEvent({
    type: "OTP_VERIFY_SUCCESS",
    identifier,
    timestamp: new Date().toISOString(),
    metadata: { role, redirectUrl },
  });

  return {
    success: true,
    user,
    role,
    status,
    redirectUrl,
    token,
  };
}

/**
 * Resolves user profile and role from secure database / internal provisioned directory
 */
async function resolveUserAndRole(
  identifier: string,
  purpose: "login" | "signup",
  metaData?: { name?: string; dob?: string; careerStage?: CareerStage; gradeLevel?: string }
): Promise<{ user: AppUser; role: UserRole; status: AccountStatus }> {
  // Check predefined provisioned internal staff
  const provisioned = PROVISIONED_INTERNAL_ACCOUNTS[identifier];
  if (provisioned) {
    const isMinor = false;
    const appUser: AppUser = {
      uid: `usr_${crypto.createHash("md5").update(identifier).digest("hex").slice(0, 16)}`,
      name: provisioned.name,
      email: identifier.includes("@") ? identifier : `${identifier}@edworld.co.in`,
      phone: !identifier.includes("@") ? identifier : undefined,
      createdAt: new Date().toISOString(),
      role: provisioned.role,
      status: provisioned.status,
      careerStage: "PROFESSIONAL",
      ageBand: "18+",
      isEmployer: false,
      isAdmin: provisioned.role === "ADMIN" || provisioned.role === "SUPER_ADMIN",
      isTeacher: provisioned.role === "TEACHER",
      isSchoolAdmin: provisioned.role === "SCHOOL_ADMIN",
      visualMode: "career",
    };
    return { user: appUser, role: provisioned.role, status: provisioned.status };
  }

  // Check Supabase database profile
  try {
    const query = identifier.includes("@")
      ? supabase.from("profiles").select("*").eq("email", identifier).maybeSingle()
      : supabase.from("profiles").select("*").eq("phone", identifier).maybeSingle();

    const { data: profile } = await query;

    if (profile) {
      const role: UserRole = (profile.role as UserRole) || "CLIENT";
      const status: AccountStatus = profile.is_suspended ? "SUSPENDED" : "ACTIVE";
      const appUser: AppUser = {
        uid: profile.id,
        name: profile.name || "Learner",
        email: profile.email || identifier,
        phone: profile.phone,
        createdAt: profile.created_at || new Date().toISOString(),
        dob: profile.dob,
        ageBand: profile.age_band || "18+",
        gradeLevel: profile.grade_level,
        careerStage: profile.career_stage || "STUDENT",
        isEmployer: Boolean(profile.is_employer),
        isAdmin: Boolean(profile.is_admin || role === "ADMIN"),
        isTeacher: Boolean(profile.is_teacher || role === "TEACHER"),
        isSchoolAdmin: Boolean(profile.is_school_admin),
        visualMode: profile.age_band === "18+" ? "career" : "maximalist",
      };
      return { user: appUser, role, status };
    }
  } catch {
    // Database query fallback
  }

  // For a new student / client account:
  const userId = `usr_${crypto.randomBytes(12).toString("hex")}`;
  const defaultRole: UserRole = "CLIENT";
  const defaultStatus: AccountStatus = "ACTIVE";

  const appUser: AppUser = {
    uid: userId,
    name: metaData?.name || "Edworld Learner",
    email: identifier.includes("@") ? identifier : `${identifier}@edworld.user`,
    phone: !identifier.includes("@") ? identifier : undefined,
    dob: metaData?.dob,
    ageBand: metaData?.careerStage === "JUNIOR" ? "13-15" : metaData?.careerStage === "STUDENT" ? "16-18" : "18+",
    gradeLevel: metaData?.gradeLevel || "College",
    careerStage: metaData?.careerStage || "STUDENT",
    createdAt: new Date().toISOString(),
    isEmployer: false,
    isAdmin: false,
    isTeacher: false,
    isSchoolAdmin: false,
    visualMode: metaData?.careerStage === "JUNIOR" ? "maximalist" : "career",
  };

  // Persist to database if available
  try {
    await supabase.from("profiles").insert({
      id: userId,
      user_id: userId,
      name: appUser.name,
      email: appUser.email,
      phone: appUser.phone || null,
      dob: appUser.dob || null,
      role: defaultRole,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  } catch {
    // Local / non-blocking fallback
  }

  return { user: appUser, role: defaultRole, status: defaultStatus };
}

/**
 * Records an immutable security audit event
 */
export function logSecurityEvent(event: SecurityEvent) {
  securityLogs.push(event);
  if (securityLogs.length > 200) securityLogs.shift();
  // Attempt background insert to DB
  try {
    supabase.from("audit_logs").insert({
      action: event.type,
      target_type: "auth",
      target_id: event.identifier,
      metadata: {
        ...event.metadata,
        ip: event.ip,
        timestamp: event.timestamp,
      },
    }).then(() => {});
  } catch {}
}

/**
 * Creates a valid session token and registers it in the active sessions store
 */
export function createSession(userId: string, role: UserRole = "CLIENT"): string {
  const token = `edw_sess_${crypto.randomBytes(32).toString("hex")}`;
  const now = Date.now();
  activeSessions.set(token, {
    userId,
    role,
    expiresAt: now + 30 * 24 * 60 * 60 * 1000, // 30 days
  });
  return token;
}

/**
 * Validates active session token or valid authenticated user identifier
 */
export function validateSession(token: string): { valid: boolean; userId?: string; role?: UserRole } {
  if (!token) return { valid: false };
  
  // 1. Check in-memory active session tokens (edw_sess_...)
  const session = activeSessions.get(token);
  if (session && session.expiresAt >= Date.now()) {
    return { valid: true, userId: session.userId, role: session.role };
  }
  if (session && session.expiresAt < Date.now()) {
    activeSessions.delete(token);
  }

  // 2. Accept direct user IDs (usr_...) or valid UUIDs if set in session cookie
  if (
    token.startsWith("usr_") || 
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token)
  ) {
    return { valid: true, userId: token, role: "CLIENT" };
  }

  return { valid: false };
}

/**
 * Invalidates session token on logout
 */
export function invalidateSession(token: string) {
  if (token) {
    activeSessions.delete(token);
  }
}

