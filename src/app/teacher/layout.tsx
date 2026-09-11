"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import AuthGuard from "@/components/auth/AuthGuard";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const { user, isMinor, isTeacher, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      const isEducator = isTeacher || isAdmin || (typeof window !== "undefined" && localStorage.getItem(`edworld_role_teacher_${user.uid}`) === "true");
      if (isMinor || !isEducator) {
        router.replace("/dashboard");
      }
    }
  }, [user, isMinor, isTeacher, isAdmin, loading, router]);

  const isEducator = isTeacher || isAdmin || (typeof window !== "undefined" && localStorage.getItem(`edworld_role_teacher_${user?.uid}`) === "true");
  if (user && (isMinor || !isEducator)) {
    return null; // Don't render any teacher DOM elements to unauthorized students
  }

  return (
    <AuthGuard requireAuth={true}>
      {children}
    </AuthGuard>
  );
}
