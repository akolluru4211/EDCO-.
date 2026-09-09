"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

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

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const hasAccess = isSchoolAdmin || isAdmin || (typeof window !== "undefined" && localStorage.getItem(`edworld_role_school_admin_${user?.uid}`) === "true");
  if (user && !hasAccess) {
    return null; // Don't render any school admin DOM elements to unauthorized users
  }

  return <>{children}</>;
}
