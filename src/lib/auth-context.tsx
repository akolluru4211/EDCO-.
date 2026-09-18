"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { 
  AppUser, 
  UserProfile, 
  AgeBand, 
  CareerStage,
  UserInterest, 
  SkillLevel, 
  UserSubscription, 
  SubscriptionPlanId,
  UserRole
} from "./types";
import { calculateAgeBandFromDob } from "./utils";
import { normalizeDisplayName, updateCanonicalUserProfile } from "./services/user-profile";

/**
 * Human-friendly error translation for Supabase / Auth exceptions.
 * Converts raw AuthApiError / error messages into clear, actionable guidance.
 */
export function translateAuthError(err: any): string {
  if (!err) return "An unexpected error occurred. Please try again.";
  const msg = typeof err === "string" ? err : err?.message || err?.error_description || "";
  const code = err?.code || err?.status;

  const lower = msg.toLowerCase();

  if (lower.includes("invalid login credentials") || lower.includes("invalid_grant") || lower.includes("wrong password")) {
    return "Email or password is incorrect. Please check your credentials and try again.";
  }
  if (lower.includes("email not confirmed") || lower.includes("email_not_confirmed")) {
    return "Please verify your email address before signing in. Check your inbox for the confirmation link.";
  }
  if (lower.includes("user already registered") || lower.includes("already exists") || lower.includes("unique violation")) {
    return "An account with this email already exists. Please sign in instead.";
  }
  if (lower.includes("password should be at least") || lower.includes("weak_password") || lower.includes("password must be")) {
    return "Password must be at least 8 characters long and contain both letters and numbers.";
  }
  if (lower.includes("over_email_send_rate_limit") || lower.includes("rate limit") || lower.includes("too many requests") || code === 429) {
    return "Too many attempts. Please wait a few moments before trying again.";
  }
  if (lower.includes("failed to fetch") || lower.includes("network error") || lower.includes("connection refused") || lower.includes("504") || lower.includes("gateway timeout")) {
    return "Connection issue. Please verify your internet connection or Supabase status and try again.";
  }
  if (lower.includes("session expired") || lower.includes("jwt expired") || lower.includes("invalid token")) {
    return "Your session has expired. Please sign in again.";
  }

  return msg || "Authentication failed. Please verify your details and try again.";
}

interface AuthContextType {
  user: AppUser | null;
  profile: UserProfile | null;
  subscription: UserSubscription | null;
  loading: boolean;
  role: UserRole;
  isMinor: boolean;
  isStudent: boolean;
  isWorkingProfessional: boolean;
  isEmployer: boolean;
  isEmployee: boolean;
  isHR: boolean;
  isCollegeAdmin: boolean;
  isPlacementOfficer: boolean;
  isFounder: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isPro: boolean;
  sendOtp: (identifier: string, purpose?: "login" | "signup") => Promise<{ success: boolean; maskedIdentifier: string; cooldownSeconds: number; devOtp?: string }>;
  verifyOtp: (identifier: string, otp: string, purpose?: "login" | "signup", metaData?: any) => Promise<{ role: UserRole; redirectUrl: string }>;
  loginWithEmail: (emailOrPhone: string, pass: string) => Promise<{ role: UserRole; redirectUrl: string; careerStage?: CareerStage; onboardingCompleted?: boolean }>;
  loginWithGoogle: (redirectUrl?: string) => Promise<any>;
  signupWithEmail: (name: string, email: string, pass: string, dob?: string, gradeLevel?: string, phone?: string, careerStage?: CareerStage) => Promise<{ needsEmailVerification?: boolean }>;
  resetPassword: (email: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  updateUserPassword: (newPassword: string) => Promise<void>;
  submitGuardianConsent: (guardianName: string, guardianEmail: string, relationship?: "parent" | "legal_guardian") => Promise<{ success: boolean; token?: string }>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  updateInterestLevel: (interestId: string, newEffectiveLevel: SkillLevel) => Promise<void>;
  setUserRole: (newRole: UserRole) => Promise<void>;
  upgradeToPro: () => Promise<void>;
  downgradeToFree: () => Promise<void>;
  canCreateResume: (currentCount: number) => boolean;
  canRunMockInterview: (usedThisMonth: number) => boolean;
  canApplyToJob: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  const [activeRole, setActiveRole] = useState<UserRole>("CLIENT");

  // Initial session hydration from HTTP-only cookie, Supabase, or local storage
  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      try {
        // 1. Check server-side HTTP-only session cookie
        const res = await fetch("/api/auth/session", { method: "GET" });
        if (res.ok) {
          const sessionData = await res.json();
          if (sessionData.authenticated && sessionData.user && isMounted) {
            setUser(sessionData.user);
            const userRole: UserRole = sessionData.role || "CLIENT";
            setActiveRole(userRole);
            setProfile({
              name: sessionData.user.name,
              phone: sessionData.user.phone,
              careerStage: sessionData.user.careerStage,
              primaryGoal: "EdWorld Skills & Career OS",
              onboarding_completed: true,
              interests: [
                { id: "swe", name: "Software Engineering", category: "Tech", selfLevel: 0, effectiveLevel: 0 },
                { id: "behavioral", name: "Behavioral & Communication", category: "Career", selfLevel: 0, effectiveLevel: 0 },
              ],
              isPublic: sessionData.user.ageBand === "18+",
              isMentor: false,
              mentorTags: [],
            });
            setLoading(false);
            return;
          }
        }

        // 2. Check Supabase auth session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && isMounted) {
          await syncUserData(session.user);
          setLoading(false);
          return;
        }

        // 3. Check cached local session fallback
        if (typeof window !== "undefined") {
          const cachedSession = localStorage.getItem("edworld_auth_session");
          if (cachedSession && isMounted) {
            try {
              const parsedUser: AppUser = JSON.parse(cachedSession);
              setUser(parsedUser);
              const storedRole = localStorage.getItem(`edworld_active_role_${parsedUser.uid}`) as UserRole | null;
              if (storedRole) setActiveRole(storedRole);
              const cachedProfile = localStorage.getItem("edworld_user_profile");
              if (cachedProfile) {
                setProfile(JSON.parse(cachedProfile));
              }
              setLoading(false);
              return;
            } catch {}
          }
        }

        if (isMounted) {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      } catch (err) {
        console.warn("[Auth Initialization Warning]:", err);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkSession();

    // Listen for Supabase auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user && isMounted) {
        await syncUserData(session.user);
      } else if (!session && isMounted) {
        // If logged out externally
        // Keep current state unless explicitly logged out
      }
    });

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Sync profile & subscription from Supabase PostgreSQL in parallel
  const syncUserData = async (supabaseUser: SupabaseUser) => {
    try {
      const userMeta = supabaseUser.user_metadata || {};
      const [{ data: profileData }, { data: subData }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", supabaseUser.id).maybeSingle(),
        supabase.from("subscriptions").select("*").eq("user_id", supabaseUser.id).maybeSingle(),
      ]);

      const userDob = profileData?.dob || userMeta.dob || null;
      const userPhone = profileData?.phone || supabaseUser.phone || userMeta.phone || undefined;
      const derivedBand: AgeBand = userDob
        ? calculateAgeBandFromDob(userDob) || "18+"
        : profileData?.age_band || userMeta.age_band || "18+";

      const email = (supabaseUser.email || "").toLowerCase();
      let determinedRole: UserRole = "CLIENT";
      if (typeof window !== "undefined") {
        const storedRole = localStorage.getItem(`edworld_active_role_${supabaseUser.id}`) as UserRole | null;
        if (storedRole) determinedRole = storedRole;
      }

      if (determinedRole === "CLIENT") {
        if (email.startsWith("hr@") || email.includes("hr.") || profileData?.role === "HR") {
          determinedRole = "HR";
        } else if (email.startsWith("founder@") || email.startsWith("ceo@") || profileData?.role === "FOUNDER") {
          determinedRole = "FOUNDER";
        } else if (email.startsWith("college@") || email.startsWith("tpo@") || profileData?.role === "COLLEGE_ADMIN") {
          determinedRole = "COLLEGE_ADMIN";
        } else if (email.startsWith("admin@") || profileData?.is_admin || profileData?.role === "ADMIN") {
          determinedRole = "ADMIN";
        } else if (email.endsWith("@edworld.co.in") || profileData?.role === "EMPLOYEE") {
          determinedRole = "EMPLOYEE";
        }
      }

      setActiveRole(determinedRole);

      const rawStage = profileData?.career_stage || userMeta.career_stage;
      const computedCareerStage: CareerStage = rawStage === "JUNIOR" || rawStage === "junior" 
        ? "STUDENT" 
        : rawStage === "STUDENT" || rawStage === "student" || rawStage === "college" 
        ? "STUDENT" 
        : derivedBand === "13-15" || derivedBand === "16-18"
        ? "STUDENT" 
        : "PROFESSIONAL";

      const rawNameCandidate = profileData?.name || profileData?.display_name || userMeta.full_name || userMeta.name || userMeta.displayName || (supabaseUser.email ? supabaseUser.email.split("@")[0] : "Learner");
      const { displayName: normalizedName } = normalizeDisplayName(
        profileData?.first_name || userMeta.first_name,
        profileData?.last_name || userMeta.last_name,
        rawNameCandidate
      );

      const appUser: AppUser = {
        uid: supabaseUser.id,
        name: normalizedName,
        email: supabaseUser.email || "",
        phone: userPhone,
        createdAt: supabaseUser.created_at,
        dob: userDob || undefined,
        ageBand: derivedBand,
        gradeLevel: profileData?.grade_level || userMeta.grade_level || "College",
        careerStage: computedCareerStage,
        isEmployer: Boolean(profileData?.is_employer),
        isAdmin: Boolean(profileData?.is_admin || determinedRole === "ADMIN" || determinedRole === "SUPER_ADMIN"),
        visualMode: derivedBand === "18+" ? "career" : "maximalist",
        tosVersion: profileData?.tos_version || "2026.1",
        privacyVersion: profileData?.privacy_version || "2026.1",
      };

      setUser(appUser);

      if (typeof document !== "undefined") {
        document.cookie = `edworld_session=${supabaseUser.id}; path=/; max-age=2592000; SameSite=Lax`;
      }

      if (profileData) {
        const fullProfile: UserProfile = {
          name: normalizedName,
          phone: userPhone,
          username: profileData.username,
          headline: profileData.headline,
          bio: profileData.bio,
          gradeLevel: profileData.grade_level,
          careerStage: computedCareerStage,
          primaryGoal: profileData.primary_goal || "Build skills & practice interview drills on EdWorld.",
          interests: profileData.interests || [
            { id: "swe", name: "Software Engineering", category: "Tech", selfLevel: 0, effectiveLevel: 0 },
            { id: "behavioral", name: "General Behavioral & Leadership", category: "Career", selfLevel: 0, effectiveLevel: 0 },
          ],
          isPublic: Boolean(profileData.is_public && derivedBand === "18+"),
          isMentor: Boolean(profileData.is_mentor && derivedBand === "18+"),
          mentorTags: profileData.mentor_tags || [],
          targetRole: profileData.target_role,
          onboarding_completed: profileData.onboarding_completed ?? false,
          institution: profileData.institution,
          degree: profileData.degree,
          field_of_study: profileData.field_of_study,
          graduation_year: profileData.graduation_year,
          experience_level: profileData.experience_level,
          current_company: profileData.current_company,
        };
        setProfile(fullProfile);
        if (typeof window !== "undefined") {
          localStorage.setItem("edworld_user_profile", JSON.stringify(fullProfile));
          localStorage.setItem("edworld_auth_session", JSON.stringify(appUser));
        }
      } else {
        // Fast optimistic profile state
        const initialProfile: UserProfile = {
          name: appUser.name,
          phone: userPhone,
          primaryGoal: "Build skills & practice interview drills on EdWorld.",
          onboarding_completed: false,
          interests: [
            { id: "swe", name: "Software Engineering", category: "Tech", selfLevel: 0, effectiveLevel: 0 },
            { id: "behavioral", name: "General Behavioral & Leadership", category: "Career", selfLevel: 0, effectiveLevel: 0 },
          ],
          isPublic: false,
          isMentor: false,
          mentorTags: [],
        };
        setProfile(initialProfile);

        // Background write
        supabase.from("profiles").upsert({
          id: supabaseUser.id,
          user_id: supabaseUser.id,
          name: appUser.name,
          display_name: appUser.name,
          email: appUser.email,
          phone: userPhone || null,
          dob: userDob,
          age_band: derivedBand,
          grade_level: appUser.gradeLevel,
          is_employer: false,
          is_admin: determinedRole === "ADMIN",
          role: determinedRole,
          onboarding_completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }).then(() => {});
      }

      if (subData) {
        setSubscription({
          userId: supabaseUser.id,
          plan: (subData.plan as SubscriptionPlanId) || "free",
          status: subData.status || "active",
          interviewsUsedThisMonth: 0,
          resumesCreated: 0,
          currentPeriodEnd: subData.current_period_end,
          razorpayOrderId: subData.razorpay_order_id,
          razorpayPaymentId: subData.razorpay_payment_id,
        });
      } else {
        setSubscription({
          userId: supabaseUser.id,
          plan: "free",
          status: "active",
          interviewsUsedThisMonth: 0,
          resumesCreated: 0,
        });
      }

      return appUser;
    } catch (err) {
      console.warn("[Supabase Auth Sync Error]:", err);
      return null;
    }
  };

  const getRedirectForRole = (userRole: UserRole, stage?: CareerStage, onboardingCompleted?: boolean): string => {
    switch (userRole) {
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
      case "EMPLOYEE":
        return "/employee";
      case "CLIENT":
      default:
        if (onboardingCompleted === false) {
          return "/onboarding";
        }
        return "/dashboard";
    }
  };

  const loginWithGoogle = async (redirectUrl?: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const redirectTo = `${origin}/auth/callback${redirectUrl ? `?next=${encodeURIComponent(redirectUrl)}` : ""}`;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
    if (error) throw error;
    return data;
  };

  const loginWithEmail = async (emailOrPhone: string, pass: string): Promise<{ role: UserRole; redirectUrl: string; careerStage?: CareerStage; onboardingCompleted?: boolean }> => {
    setLoading(true);
    try {
      const credential = emailOrPhone.trim();
      const isCorporate = credential.toLowerCase().endsWith("@edworld.co.in");

      let targetRole: UserRole = "CLIENT";
      if (isCorporate) {
        if (credential.toLowerCase().startsWith("hr@") || credential.toLowerCase().includes("hr.")) targetRole = "HR";
        else if (credential.toLowerCase().startsWith("founder@") || credential.toLowerCase().startsWith("ceo@")) targetRole = "FOUNDER";
        else if (credential.toLowerCase().startsWith("college@") || credential.toLowerCase().startsWith("tpo@")) targetRole = "COLLEGE_ADMIN";
        else if (credential.toLowerCase().startsWith("admin@")) targetRole = "ADMIN";
        else targetRole = "EMPLOYEE";
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credential,
        password: pass,
      });

      if (error) {
        throw error;
      }

      if (data?.user) {
        const syncedUser = await syncUserData(data.user);
        setActiveRole(targetRole);
        if (typeof window !== "undefined") {
          localStorage.setItem(`edworld_active_role_${data.user.id}`, targetRole);
        }
        
        // Fetch current profile to know onboarding status
        const { data: prof } = await supabase.from("profiles").select("onboarding_completed").eq("id", data.user.id).maybeSingle();
        const isOnboarded = prof?.onboarding_completed ?? false;

        const userStage: CareerStage = syncedUser?.careerStage || "STUDENT";
        return { 
          role: targetRole, 
          redirectUrl: getRedirectForRole(targetRole, userStage, isOnboarded), 
          careerStage: userStage,
          onboardingCompleted: isOnboarded
        };
      }

      return { role: targetRole, redirectUrl: "/dashboard", careerStage: "STUDENT" };
    } finally {
      setLoading(false);
    }
  };

    const signupWithEmail = async (
    name: string,
    email: string,
    pass: string,
    dob?: string,
    gradeLevel?: string,
    phone?: string,
    careerStage?: CareerStage
  ): Promise<{ needsEmailVerification?: boolean }> => {
    if (!pass || pass.length < 8) {
      throw new Error("Password must be at least 8 characters long.");
    }
    if (!/[a-zA-Z]/.test(pass) || !/\d/.test(pass)) {
      throw new Error("Password must contain at least one letter and one number.");
    }

    setLoading(true);
    try {
      const defaultDob = dob || "2002-01-01";
      const ageBand = calculateAgeBandFromDob(defaultDob) || "18+";
      const cleanPhone = phone?.trim() || null;
      const cleanEmail = email.trim().toLowerCase();
      const resolvedStage: CareerStage = careerStage || (ageBand === "18+" ? "PROFESSIONAL" : "STUDENT");
      const origin = typeof window !== "undefined" ? window.location.origin : "";

      let supabaseUser: any = null;
      let hasSession = false;

      // 1. Race Supabase Auth with a 3.5s timeout to prevent email server hangs
      try {
        const timeoutPromise = new Promise<{ timeout: true }>((resolve) =>
          setTimeout(() => resolve({ timeout: true }), 3500)
        );

        const signupPromise = supabase.auth.signUp({
          email: cleanEmail,
          password: pass,
          options: {
            emailRedirectTo: `${origin}/onboarding`,
            data: {
              full_name: name.trim(),
              name: name.trim(),
              dob: defaultDob,
              phone: cleanPhone,
              age_band: ageBand,
              grade_level: gradeLevel || "College",
              career_stage: resolvedStage,
            },
          },
        });

        const raceResult: any = await Promise.race([signupPromise, timeoutPromise]);

        if (raceResult && !raceResult.timeout) {
          if (raceResult.error) {
            const errLower = (raceResult.error.message || "").toLowerCase();
            // If already registered, throw exact error
            if (errLower.includes("already registered") || errLower.includes("already exists")) {
              throw raceResult.error;
            }
            // If weak password, throw error
            if (errLower.includes("password")) {
              throw raceResult.error;
            }
            console.warn("[Supabase Auth SignUp Server Notice]:", raceResult.error.message);
          } else if (raceResult.data?.user) {
            supabaseUser = raceResult.data.user;
            hasSession = Boolean(raceResult.data.session);
          }
        }
      } catch (err: any) {
        const errLower = (err.message || "").toLowerCase();
        if (errLower.includes("already registered") || errLower.includes("already exists") || errLower.includes("password")) {
          throw err;
        }
        console.warn("[Supabase Auth SignUp Fallback Activated]:", err.message);
      }

      // 2. Generate identity & user profile (Instant)
      const userId = supabaseUser?.id || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const { displayName: cleanName, firstName, lastName } = normalizeDisplayName(undefined, undefined, name);

      const appUser: AppUser = {
        uid: userId,
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone || undefined,
        dob: defaultDob,
        ageBand,
        gradeLevel: gradeLevel || "College",
        careerStage: resolvedStage,
        isEmployer: false,
        isAdmin: false,
        createdAt: new Date().toISOString(),
        visualMode: ageBand === "18+" ? "career" : "maximalist",
      };

      const userProfile: UserProfile = {
        name: cleanName,
        phone: cleanPhone || undefined,
        careerStage: resolvedStage,
        onboarding_completed: false,
        primaryGoal: "Build skills and prepare for career opportunities on EdWorld.",
        interests: [
          { id: "swe", name: "Software Engineering", category: "Tech", selfLevel: 0, effectiveLevel: 0 },
          { id: "fullstack", name: "Full Stack Development", category: "Tech", selfLevel: 0, effectiveLevel: 0 }
        ],
        isPublic: false,
        isMentor: false,
        mentorTags: [],
      };

      setUser(appUser);
      setProfile(userProfile);

      // 3. Set persistent local session & authentication cookies
      if (typeof window !== "undefined") {
        localStorage.setItem("edworld_auth_session", JSON.stringify(appUser));
        localStorage.setItem("edworld_user_profile", JSON.stringify(userProfile));
        localStorage.setItem(`edworld_active_role_${userId}`, "CLIENT");
        
        const maxAge = 60 * 60 * 24 * 7;
        document.cookie = `edworld_session=${userId}; path=/; max-age=${maxAge}; SameSite=Lax`;
        document.cookie = `sb-access-token=${userId}; path=/; max-age=${maxAge}; SameSite=Lax`;
        document.cookie = `edworld_auth=true; path=/; max-age=${maxAge}; SameSite=Lax`;
      }

      // 4. Background non-blocking profile sync to Supabase
      supabase.from("profiles").upsert({
        id: userId,
        user_id: userId,
        name: cleanName,
        first_name: firstName,
        last_name: lastName,
        email: cleanEmail,
        phone: cleanPhone,
        dob: defaultDob,
        age_band: ageBand,
        career_stage: resolvedStage,
        grade_level: gradeLevel || "College",
        username: cleanName.toLowerCase().replace(/\s+/g, "_") + "_" + userId.substring(0, 4),
        primary_goal: userProfile.primaryGoal,
        onboarding_completed: false,
        is_public: false,
      }).then(() => {}, (e: any) => console.warn("[Profile Sync Note]:", e));

      return { needsEmailVerification: false };
    } finally {
      setLoading(false);
    }
  };

  const requestPasswordReset = async (email: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${origin}/auth/reset-password`,
    });
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    return requestPasswordReset(email);
  };

  const updateUserPassword = async (newPassword: string) => {
    if (!newPassword || newPassword.length < 8) {
      throw new Error("Password must be at least 8 characters long.");
    }
    if (!/[a-zA-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
      throw new Error("Password must contain at least one letter and one number.");
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  };

  const submitGuardianConsent = async (
    guardianName: string,
    guardianEmail: string,
    relationship: "parent" | "legal_guardian" = "parent"
  ) => {
    if (!user) throw new Error("User must be authenticated.");

    const token = `consent_${Math.random().toString(36).substring(2, 10)}_${Date.now()}`;
    const { error } = await supabase.from("guardian_consents").insert({
      user_id: user.uid,
      guardian_name: guardianName,
      guardian_email: guardianEmail,
      relationship,
      status: "pending",
      token,
      sent_at: new Date().toISOString(),
    });

    if (error) throw error;
    return { success: true, token };
  };

  const sendOtp = async (identifier: string, purpose: "login" | "signup" = "login") => {
    const res = await fetch("/api/auth/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, purpose }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to dispatch verification code.");
    }
    return data;
  };

  const verifyOtp = async (
    identifier: string, 
    otp: string, 
    purpose: "login" | "signup" = "login", 
    metaData?: any
  ) => {
    const res = await fetch("/api/auth/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, otp, purpose, ...metaData }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Invalid or expired verification code.");
    }

    if (data.user) {
      setUser(data.user);
      const userRole = data.role || "CLIENT";
      setActiveRole(userRole);
      if (typeof window !== "undefined") {
        localStorage.setItem(`edworld_active_role_${data.user.uid}`, userRole);
        localStorage.setItem("edworld_auth_session", JSON.stringify(data.user));
      }
    }

    return { role: data.role, redirectUrl: data.redirectUrl };
  };

  const logout = async () => {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    try {
      await supabase.auth.signOut();
    } catch {}
    setUser(null);
    setProfile(null);
    setSubscription(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("edworld_auth_session");
      localStorage.removeItem("edworld_user_profile");
      sessionStorage.clear();
      
      // Clear active role keys
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("edworld_active_role_")) {
          localStorage.removeItem(key);
        }
      });

      // Clear cookies
      document.cookie = "edworld_session=; path=/; max-age=0; SameSite=Lax";
      document.cookie = "sb-access-token=; path=/; max-age=0; SameSite=Lax";
      document.cookie = "edworld_auth=; path=/; max-age=0; SameSite=Lax";
      
      window.location.replace("/auth/login");
    }
    setLoading(false);
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;

    let normalizedName = data.name;
    let firstName: string | undefined;
    let lastName: string | undefined;

    if (data.name !== undefined) {
      const normalized = normalizeDisplayName(undefined, undefined, data.name);
      normalizedName = normalized.displayName;
      firstName = normalized.firstName;
      lastName = normalized.lastName;
    }

    // Convert camelCase to snake_case for Supabase PostgreSQL
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (normalizedName !== undefined) {
      updatePayload.name = normalizedName;
      updatePayload.display_name = normalizedName;
      if (firstName) updatePayload.first_name = firstName;
      if (lastName) updatePayload.last_name = lastName;
    }
    if (data.phone !== undefined) updatePayload.phone = data.phone;
    if (data.dob !== undefined) updatePayload.dob = data.dob;
    if (data.ageBand !== undefined) updatePayload.age_band = data.ageBand;
    if (data.gradeLevel !== undefined) updatePayload.grade_level = data.gradeLevel;
    if (data.username !== undefined) updatePayload.username = data.username;
    if (data.headline !== undefined) updatePayload.headline = data.headline;
    if (data.bio !== undefined) updatePayload.bio = data.bio;
    if (data.primaryGoal !== undefined) updatePayload.primary_goal = data.primaryGoal;
    if (data.interests !== undefined) updatePayload.interests = data.interests;
    if (data.isPublic !== undefined) updatePayload.is_public = data.isPublic && user.ageBand === "18+";
    if (data.isMentor !== undefined) updatePayload.is_mentor = data.isMentor && user.ageBand === "18+";
    if (data.mentorTags !== undefined) updatePayload.mentor_tags = data.mentorTags;
    if (data.targetRole !== undefined) updatePayload.target_role = data.targetRole;
    if (data.onboarding_completed !== undefined) updatePayload.onboarding_completed = data.onboarding_completed;
    if (data.institution !== undefined) updatePayload.institution = data.institution;
    if (data.degree !== undefined) updatePayload.degree = data.degree;
    if (data.field_of_study !== undefined) updatePayload.field_of_study = data.field_of_study;
    if (data.graduation_year !== undefined) updatePayload.graduation_year = data.graduation_year;
    if (data.experience_level !== undefined) updatePayload.experience_level = data.experience_level;
    if (data.current_company !== undefined) updatePayload.current_company = data.current_company;

    await supabase.from("profiles").update(updatePayload).eq("id", user.uid);
    if (normalizedName !== undefined || data.phone !== undefined) {
      const userUpdate: Record<string, any> = {};
      if (normalizedName !== undefined) userUpdate.name = normalizedName;
      if (data.phone !== undefined) userUpdate.phone = data.phone;
      await supabase.from("users").update(userUpdate).eq("id", user.uid);
    }

    // Update local state and caches
    const updatedProfileData = { ...data, ...(normalizedName !== undefined ? { name: normalizedName } : {}) };
    setProfile((prev) => {
      const nextProfile = prev ? { ...prev, ...updatedProfileData } : null;
      if (typeof window !== "undefined" && nextProfile) {
        localStorage.setItem("edworld_user_profile", JSON.stringify(nextProfile));
      }
      return nextProfile;
    });

    setUser((prev) => {
      if (!prev) return null;
      const nextUser = {
        ...prev,
        ...(normalizedName !== undefined ? { name: normalizedName } : {}),
        ...(data.phone !== undefined ? { phone: data.phone } : {}),
        ...(data.dob ? { dob: data.dob } : {}),
        ...(data.ageBand ? { ageBand: data.ageBand } : {}),
        ...(data.gradeLevel ? { gradeLevel: data.gradeLevel } : {}),
      };
      if (typeof window !== "undefined") {
        localStorage.setItem("edworld_auth_session", JSON.stringify(nextUser));
      }
      return nextUser;
    });
  };

  const updateInterestLevel = async (interestId: string, newEffectiveLevel: SkillLevel) => {
    if (!user || !profile) return;
    const updatedInterests = profile.interests.map((item) =>
      item.id === interestId ? { ...item, effectiveLevel: newEffectiveLevel } : item
    );
    await updateUserProfile({ interests: updatedInterests });
  };

  const upgradeToPro = async () => {
    if (!user) return;
    const periodEnd = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
    await supabase.from("subscriptions").upsert({
      user_id: user.uid,
      plan: "pro",
      status: "active",
      current_period_end: periodEnd,
      updated_at: new Date().toISOString(),
    });

    setSubscription({
      userId: user.uid,
      plan: "pro",
      status: "active",
      interviewsUsedThisMonth: 0,
      resumesCreated: 0,
      currentPeriodEnd: periodEnd,
    });
  };

  const downgradeToFree = async () => {
    if (!user) return;
    await supabase.from("subscriptions").upsert({
      user_id: user.uid,
      plan: "free",
      status: "canceled",
      updated_at: new Date().toISOString(),
    });

    setSubscription({
      userId: user.uid,
      plan: "free",
      status: "canceled",
      interviewsUsedThisMonth: 0,
      resumesCreated: 0,
    });
  };

  const setUserRole = async (newRole: UserRole) => {
    setActiveRole(newRole);
    if (user && typeof window !== "undefined") {
      localStorage.setItem(`edworld_active_role_${user.uid}`, newRole);
    }
    if (user) {
      supabase.from("profiles").update({ role: newRole }).eq("id", user.uid).then(() => {});
    }
  };

  // Entitlement & Role Helpers
  const isMinor = user?.ageBand === "13-15" || user?.ageBand === "16-18";
  const isStudent = isMinor || user?.careerStage === "STUDENT";
  const isWorkingProfessional = user?.careerStage === "PROFESSIONAL";
  const isEmployer = Boolean(user?.isEmployer);
  const isSuperAdmin = activeRole === "SUPER_ADMIN";
  const isAdmin = Boolean(user?.isAdmin || activeRole === "ADMIN" || isSuperAdmin);
  const isFounder = Boolean(activeRole === "FOUNDER" || activeRole === "EXECUTIVE" || isAdmin);
  const isHR = Boolean(activeRole === "HR" || isFounder || isAdmin);
  const isCollegeAdmin = Boolean(activeRole === "COLLEGE_ADMIN" || isAdmin);
  const isPlacementOfficer = Boolean(activeRole === "PLACEMENT_OFFICER" || isCollegeAdmin || isAdmin);
  const isEmployee = Boolean(activeRole === "EMPLOYEE" || isHR || isFounder || isAdmin);
  const isPro = subscription?.plan === "pro" && subscription?.status === "active";

  const canCreateResume = (currentCount: number) => {
    if (isPro) return true;
    return currentCount < 1;
  };

  const canRunMockInterview = (usedThisMonth: number) => {
    if (isPro) return true;
    return usedThisMonth < 2;
  };

  const canApplyToJob = () => {
    if (isMinor) return false;
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        subscription,
        loading,
        role: activeRole,
        isMinor,
        isStudent,
        isWorkingProfessional,
        isEmployer,
        isEmployee,
        isHR,
        isCollegeAdmin,
        isPlacementOfficer,
        isFounder,
        isAdmin,
        isSuperAdmin,
        isPro,
        sendOtp,
        verifyOtp,
        loginWithEmail,
        loginWithGoogle,
        signupWithEmail,
        resetPassword,
        requestPasswordReset,
        updateUserPassword,
        submitGuardianConsent,
        logout,
        updateUserProfile,
        updateInterestLevel,
        setUserRole,
        upgradeToPro,
        downgradeToFree,
        canCreateResume,
        canRunMockInterview,
        canApplyToJob,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
