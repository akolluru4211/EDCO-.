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
  isTeacher: boolean;
  isSchoolAdmin: boolean;
  isCollegeAdmin: boolean;
  isPlacementOfficer: boolean;
  isFounder: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isPro: boolean;
  sendOtp: (identifier: string, purpose?: "login" | "signup") => Promise<{ success: boolean; maskedIdentifier: string; cooldownSeconds: number; devOtp?: string }>;
  verifyOtp: (identifier: string, otp: string, purpose?: "login" | "signup", metaData?: any) => Promise<{ role: UserRole; redirectUrl: string }>;
  loginWithEmail: (emailOrPhone: string, pass: string) => Promise<{ role: UserRole; redirectUrl: string }>;
  signupWithEmail: (name: string, email: string, pass: string, dob: string, gradeLevel?: string, phone?: string, careerStage?: CareerStage) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
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

        // 2. Check Supabase auth session fallback
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
        } else if (email.startsWith("teacher@") || profileData?.is_teacher || profileData?.role === "TEACHER") {
          determinedRole = "TEACHER";
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
        ? "JUNIOR" 
        : rawStage === "STUDENT" || rawStage === "student" || rawStage === "college" 
        ? "STUDENT" 
        : derivedBand === "13-15" 
        ? "JUNIOR" 
        : derivedBand === "16-18" 
        ? "STUDENT" 
        : "PROFESSIONAL";

      const appUser: AppUser = {
        uid: supabaseUser.id,
        name: profileData?.name || userMeta.full_name || userMeta.name || "Candidate",
        email: supabaseUser.email || "",
        phone: userPhone,
        createdAt: supabaseUser.created_at,
        dob: userDob || undefined,
        ageBand: derivedBand,
        gradeLevel: profileData?.grade_level || userMeta.grade_level || "College",
        careerStage: computedCareerStage,
        isEmployer: Boolean(profileData?.is_employer),
        isAdmin: Boolean(profileData?.is_admin || determinedRole === "ADMIN" || determinedRole === "SUPER_ADMIN"),
        isTeacher: Boolean(profileData?.is_teacher || userMeta.is_teacher || determinedRole === "TEACHER"),
        isSchoolAdmin: Boolean(profileData?.is_school_admin || userMeta.is_school_admin),
        visualMode: derivedBand === "18+" ? "career" : "maximalist",
        tosVersion: profileData?.tos_version || "2026.1",
        privacyVersion: profileData?.privacy_version || "2026.1",
      };

      setUser(appUser);

      if (typeof document !== "undefined") {
        document.cookie = `edworld_session=${supabaseUser.id}; path=/; max-age=2592000; SameSite=Lax`;
      }

      if (profileData) {
        setProfile({
          name: profileData.name || appUser.name,
          phone: userPhone,
          username: profileData.username,
          headline: profileData.headline,
          bio: profileData.bio,
          gradeLevel: profileData.grade_level,
          careerStage: computedCareerStage,
          primaryGoal: profileData.primary_goal || "EdWorld Internal Organization Workspace",
          interests: profileData.interests || [
            { id: "swe", name: "Software Engineering", category: "Tech", selfLevel: 0, effectiveLevel: 0 },
            { id: "behavioral", name: "General Behavioral & Leadership", category: "Career", selfLevel: 0, effectiveLevel: 0 },
          ],
          isPublic: Boolean(profileData.is_public && derivedBand === "18+"),
          isMentor: Boolean(profileData.is_mentor && derivedBand === "18+"),
          mentorTags: profileData.mentor_tags || [],
          targetRole: profileData.target_role,
          isTeacher: Boolean(profileData.is_teacher),
          isSchoolAdmin: Boolean(profileData.is_school_admin),
        });
      } else {
        // Fast optimistic profile state
        setProfile({
          name: appUser.name,
          phone: userPhone,
          primaryGoal: "EdWorld Internal Organization Workspace",
          interests: [
            { id: "swe", name: "Software Engineering", category: "Tech", selfLevel: 0, effectiveLevel: 0 },
            { id: "behavioral", name: "General Behavioral & Leadership", category: "Career", selfLevel: 0, effectiveLevel: 0 },
          ],
          isPublic: false,
          isMentor: false,
          mentorTags: [],
        });

        // Background write without blocking
        supabase.from("profiles").upsert({
          id: supabaseUser.id,
          user_id: supabaseUser.id,
          name: appUser.name,
          email: appUser.email,
          phone: userPhone || null,
          dob: userDob,
          age_band: derivedBand,
          grade_level: appUser.gradeLevel,
          is_employer: false,
          is_admin: determinedRole === "ADMIN",
          role: determinedRole,
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
    } catch (err) {
      console.warn("[Supabase Auth Sync Error]:", err);
    }
  };

  const getRedirectForRole = (userRole: UserRole): string => {
    switch (userRole) {
      case "HR":
        return "/hr";
      case "FOUNDER":
      case "EXECUTIVE":
        return "/founder";
      case "TEACHER":
        return "/school/teacher";
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
        return "/dashboard";
    }
  };

  const loginWithEmail = async (emailOrPhone: string, pass: string): Promise<{ role: UserRole; redirectUrl: string }> => {
    setLoading(true);
    try {
      const credential = emailOrPhone.trim();
      const isCorporate = credential.toLowerCase().endsWith("@edworld.co.in");

      // Default role estimation
      let targetRole: UserRole = "CLIENT";
      if (isCorporate) {
        if (credential.toLowerCase().startsWith("hr@") || credential.toLowerCase().includes("hr.")) targetRole = "HR";
        else if (credential.toLowerCase().startsWith("founder@") || credential.toLowerCase().startsWith("ceo@")) targetRole = "FOUNDER";
        else if (credential.toLowerCase().startsWith("teacher@")) targetRole = "TEACHER";
        else if (credential.toLowerCase().startsWith("college@") || credential.toLowerCase().startsWith("tpo@")) targetRole = "COLLEGE_ADMIN";
        else if (credential.toLowerCase().startsWith("admin@")) targetRole = "ADMIN";
        else targetRole = "EMPLOYEE";
      }
      
      const loginPromise = supabase.auth.signInWithPassword({
        email: credential,
        password: pass,
      });

      const timeoutPromise = new Promise<any>((_, reject) =>
        setTimeout(() => reject(new Error("GATEWAY_TIMEOUT")), 4000)
      );

      try {
        const { data, error } = await Promise.race([loginPromise, timeoutPromise]);
        if (error) throw error;
        if (data?.user) {
          await syncUserData(data.user);
          setActiveRole(targetRole);
          if (typeof window !== "undefined") {
            localStorage.setItem(`edworld_active_role_${data.user.id}`, targetRole);
          }
          return { role: targetRole, redirectUrl: getRedirectForRole(targetRole) };
        }
      } catch (remoteErr: any) {
        // Fallback for 504 / timeout / network disruption
        if (typeof window !== "undefined") {
          const cachedSession = localStorage.getItem("edworld_auth_session");
          if (cachedSession) {
            const parsedUser: AppUser = JSON.parse(cachedSession);
            if (parsedUser.email.toLowerCase() === credential.toLowerCase()) {
              setUser(parsedUser);
              setActiveRole(targetRole);
              localStorage.setItem(`edworld_active_role_${parsedUser.uid}`, targetRole);
              const cachedProfile = localStorage.getItem("edworld_user_profile");
              if (cachedProfile) {
                setProfile(JSON.parse(cachedProfile));
              }
              return { role: targetRole, redirectUrl: getRedirectForRole(targetRole) };
            }
          }
        }
        if (remoteErr?.message !== "GATEWAY_TIMEOUT" && !remoteErr?.message?.includes("504")) {
          throw remoteErr;
        }
      }

      return { role: targetRole, redirectUrl: getRedirectForRole(targetRole) };
    } finally {
      setLoading(false);
    }
  };

  const signupWithEmail = async (
    name: string,
    email: string,
    pass: string,
    dob: string,
    gradeLevel?: string,
    phone?: string,
    careerStage?: CareerStage
  ) => {
    // Client-side Password Strength Enforcement
    if (!pass || pass.length < 8) {
      throw new Error("Password must be at least 8 characters long.");
    }
    if (!/[a-zA-Z]/.test(pass) || !/\d/.test(pass)) {
      throw new Error("Password must contain at least one letter and one number.");
    }

    setLoading(true);
    try {
      const ageBand = calculateAgeBandFromDob(dob) || "18+";
      const cleanPhone = phone?.trim() || null;
      const cleanEmail = email.trim().toLowerCase();
      const resolvedStage: CareerStage = careerStage || (ageBand === "13-15" ? "JUNIOR" : ageBand === "16-18" ? "STUDENT" : "PROFESSIONAL");
      let userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      // Attempt Supabase signUp with 4-second timeout race to prevent 504 blocking
      try {
        const signUpPromise = supabase.auth.signUp({
          email: cleanEmail,
          password: pass,
          options: {
            data: {
              full_name: name,
              name,
              dob,
              phone: cleanPhone,
              age_band: ageBand,
              grade_level: gradeLevel || "College",
              career_stage: resolvedStage,
            },
          },
        });

        const timeoutPromise = new Promise<{ data: { user: null }; error: null }>((resolve) =>
          setTimeout(() => resolve({ data: { user: null }, error: null }), 4000)
        );

        const { data, error } = await Promise.race([signUpPromise, timeoutPromise]);
        
        if (error) {
          // If error is 504 / gateway timeout, gracefully continue with local session
          const errStatus = (error as any)?.status;
          const errMsg = error.message || "";
          if (errStatus !== 504 && !errMsg.includes("504") && !errMsg.includes("Gateway Timeout")) {
            throw error;
          }
        }

        if (data?.user?.id) {
          userId = data.user.id;
        }
      } catch (remoteErr: any) {
        const isTimeoutOr504 =
          remoteErr?.status === 504 ||
          remoteErr?.message?.includes("504") ||
          remoteErr?.message?.includes("Gateway Timeout");

        if (!isTimeoutOr504 && remoteErr?.message && !remoteErr?.message?.includes("fetch")) {
          throw remoteErr;
        }
        console.warn("[Auth Resilience Active]: Remote auth gateway timed out. Establishing local authenticated session.");
      }

      // Optimistic instant state update & persistent cache
      const appUser: AppUser = {
        uid: userId,
        name,
        email: cleanEmail,
        phone: cleanPhone || undefined,
        dob,
        ageBand,
        gradeLevel: gradeLevel || "College",
        careerStage: resolvedStage,
        isEmployer: false,
        isAdmin: false,
        createdAt: new Date().toISOString(),
        visualMode: ageBand === "18+" ? "career" : "maximalist",
      };

      const userProfile: UserProfile = {
        name,
        phone: cleanPhone || undefined,
        careerStage: resolvedStage,
        primaryGoal: resolvedStage === "JUNIOR"
          ? "Explore technology concepts and beginner STEM discovery quests."
          : resolvedStage === "STUDENT"
          ? "Build foundational coding projects and prepare for upcoming college tracks."
          : "Prepare for competitive full-time industry interviews and optimize ATS resume keyword alignment.",
        interests: [
          { id: "swe", name: "Software Engineering", category: "Tech", selfLevel: 0, effectiveLevel: 0 },
          { id: "behavioral", name: "General Behavioral & Leadership", category: "Career", selfLevel: 0, effectiveLevel: 0 }
        ],
        isPublic: false,
        isMentor: false,
        mentorTags: [],
      };

      setUser(appUser);
      setProfile(userProfile);

      if (typeof window !== "undefined") {
        localStorage.setItem("edworld_auth_session", JSON.stringify(appUser));
        localStorage.setItem("edworld_user_profile", JSON.stringify(userProfile));
        document.cookie = `edworld_session=${userId}; path=/; max-age=2592000; SameSite=Lax`;
      }

      // Non-blocking background sync across relational tables
      Promise.allSettled([
        supabase.from("users").upsert({
          id: userId,
          name,
          email: cleanEmail,
          phone: cleanPhone,
          age_band: ageBand,
          grade: gradeLevel || "College",
          career_stage: resolvedStage,
          is_employer: false,
          is_admin: false,
          is_mentor: false,
        }),
        dob ? supabase.from("user_dob_records").upsert({ user_id: userId, dob }) : Promise.resolve(),
        supabase.from("profiles").upsert({
          id: userId,
          user_id: userId,
          name,
          email: cleanEmail,
          phone: cleanPhone,
          dob,
          age_band: ageBand,
          career_stage: resolvedStage,
          grade_level: gradeLevel || "College",
          username: name.toLowerCase().replace(/\s+/g, "_") + "_" + userId.substring(0, 4),
          primary_goal: userProfile.primaryGoal,
          is_public: false,
        }),
        supabase.from("user_interests").upsert([
          { user_id: userId, interest_id: "swe", self_level: 0, effective_level: 0 },
          { user_id: userId, interest_id: "behavioral", self_level: 0, effective_level: 0 }
        ])
      ]).catch((dbErr) => {
        console.warn("Background post-signup sync note:", dbErr);
      });
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/login`,
    });
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
      
      // Replace window location to prevent browser back navigation cache
      window.location.replace("/auth/login");
    }
    setLoading(false);
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;

    // Convert camelCase to snake_case for Supabase PostgreSQL
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (data.name !== undefined) updatePayload.name = data.name;
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

    await supabase.from("profiles").update(updatePayload).eq("id", user.uid);

    // Update local state
    setProfile((prev) => (prev ? { ...prev, ...data } : null));
    if (data.dob || data.ageBand) {
      setUser((prev) => (prev ? { ...prev, dob: data.dob || prev.dob, ageBand: data.ageBand || prev.ageBand } : null));
    }
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
  const isStudent = isMinor;
  const isWorkingProfessional = user?.ageBand === "18+";
  const isEmployer = Boolean(user?.isEmployer);
  const isSuperAdmin = activeRole === "SUPER_ADMIN";
  const isAdmin = Boolean(user?.isAdmin || activeRole === "ADMIN" || isSuperAdmin);
  const isFounder = Boolean(activeRole === "FOUNDER" || activeRole === "EXECUTIVE" || isAdmin);
  const isHR = Boolean(activeRole === "HR" || isFounder || isAdmin);
  const isTeacher = Boolean(
    activeRole === "TEACHER" ||
    user?.isTeacher ||
    profile?.isTeacher ||
    isAdmin
  );
  const isSchoolAdmin = Boolean(
    activeRole === "SCHOOL_ADMIN" ||
    user?.isSchoolAdmin ||
    profile?.isSchoolAdmin ||
    isAdmin
  );
  const isCollegeAdmin = Boolean(activeRole === "COLLEGE_ADMIN" || isAdmin);
  const isPlacementOfficer = Boolean(activeRole === "PLACEMENT_OFFICER" || isCollegeAdmin || isAdmin);
  const isEmployee = Boolean(activeRole === "EMPLOYEE" || isHR || isFounder || isAdmin);
  const isPro = subscription?.plan === "pro" && subscription?.status === "active";

  const canCreateResume = (currentCount: number) => {
    if (isMinor) return currentCount < 1;
    if (isPro) return true;
    return currentCount < 1;
  };

  const canRunMockInterview = (usedThisMonth: number) => {
    if (isMinor) return usedThisMonth < 2;
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
        isTeacher,
        isSchoolAdmin,
        isCollegeAdmin,
        isPlacementOfficer,
        isFounder,
        isAdmin,
        isSuperAdmin,
        isPro,
        sendOtp,
        verifyOtp,
        loginWithEmail,
        signupWithEmail,
        resetPassword,
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
