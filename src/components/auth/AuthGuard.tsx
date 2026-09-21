"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { UserRole } from "@/lib/types";
import AuthLoadingScreen from "@/components/ui/AuthLoadingScreen";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: (UserRole | string)[];
  requireAuth?: boolean;
}

export default function AuthGuard({
  children,
  allowedRoles,
  requireAuth = true,
}: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, role, loading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (loading) return;

    // 1. Not Authenticated
    if (requireAuth && !user) {
      const redirectUrl = pathname ? `?redirectUrl=${encodeURIComponent(pathname)}` : "";
      router.replace(`/auth/login${redirectUrl}`);
      return;
    }

    // 2. Role-Based Access Control (RBAC) Verification
    if (requireAuth && user && allowedRoles && allowedRoles.length > 0) {
      const currentRole = role || "CLIENT";
      const normalizedAllowed = allowedRoles.map((r) => r.toUpperCase());

      // If user's role is not permitted for this page
      if (!normalizedAllowed.includes(currentRole.toUpperCase())) {
        // Redirect to their permitted portal
        let targetPortal = "/dashboard";
        if (currentRole === "EMPLOYEE") targetPortal = "/employee";
        else if (currentRole === "HR") targetPortal = "/hr";
        else if (currentRole === "FOUNDER" || currentRole === "EXECUTIVE") targetPortal = "/founder";
                else if (currentRole === "COLLEGE_ADMIN" || currentRole === "PLACEMENT_OFFICER") targetPortal = "/colleges";
        else if (currentRole === "ADMIN" || currentRole === "SUPER_ADMIN") targetPortal = "/admin";

        router.replace(targetPortal);
        return;
      }
    }

    // 3. Strict Onboarding Gate: If user has not completed onboarding, do not allow into dashboard!
    const currentRole = role || "CLIENT";
    const isStandardUser = currentRole === "CLIENT";
    const isOnboardingPage = pathname === "/onboarding" || pathname?.startsWith("/onboarding/");

    if (requireAuth && user && isStandardUser) {
      const isOnboarded = Boolean(profile?.onboarding_completed);
      
      if (!isOnboarded && !isOnboardingPage) {
        router.replace("/onboarding");
        return;
      }

      if (isOnboarded && isOnboardingPage) {
        router.replace("/dashboard");
        return;
      }
    }

    // 4. User is authenticated and authorized
    setIsAuthorized(true);
  }, [user, profile, role, loading, pathname, allowedRoles, requireAuth, router]);

  if (loading || !isAuthorized) {
    return <AuthLoadingScreen message={loading ? "Checking session..." : "Verifying permissions..."} />;
  }

  return <>{children}</>;
}
