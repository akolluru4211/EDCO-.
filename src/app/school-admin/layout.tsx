"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import AuthGuard from "@/components/auth/AuthGuard";

export default function SchoolAdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isSchoolAdmin, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      const hasAccess = isSchoolAdmin || isAdmin || (typeof window !== "undefined" && localStorage.getItem(`edworld_role_school_admin_${user.uid}`) === "true");
      if (!hasAccess) {
        router.replace("/dashboard");
      }
    }
  }, [user, isSchoolAdmin, isAdmin, loading, router]);

  const hasAccess = isSchoolAdmin || isAdmin || (typeof window !== "undefined" && localStorage.getItem(`edworld_role_school_admin_${user?.uid}`) === "true");
  if (user && !hasAccess) {
    return null; // Don't render any school admin DOM elements to unauthorized users
  }

  return (
    <AuthGuard requireAuth={true}>
      {children}
    </AuthGuard>
  );
}
