"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

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

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isEducator = isTeacher || isAdmin || (typeof window !== "undefined" && localStorage.getItem(`edworld_role_teacher_${user?.uid}`) === "true");
  if (user && (isMinor || !isEducator)) {
    return null; // Don't render any teacher DOM elements to unauthorized students
  }

  return <>{children}</>;
}
