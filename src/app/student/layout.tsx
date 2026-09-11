"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import AuthGuard from "@/components/auth/AuthGuard";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user, isMinor, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // If adult 18+ user tries to access student junior/explorer routes, redirect to career dashboard
      if (user.ageBand === "18+" && !user.isAdmin) {
        router.replace("/career/dashboard");
      }
    }
  }, [user, isMinor, loading, router]);

  return (
    <AuthGuard requireAuth={true}>
      {children}
    </AuthGuard>
  );
}
