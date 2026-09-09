"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

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

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
