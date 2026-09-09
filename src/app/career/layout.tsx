"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function CareerLayout({ children }: { children: React.ReactNode }) {
  const { user, isMinor, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // If minor tries to access adult career routes, redirect to student dashboard
      if (isMinor) {
        router.replace("/dashboard");
      }
    }
  }, [user, isMinor, loading, router]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isMinor) {
    return null;
  }

  return <>{children}</>;
}
