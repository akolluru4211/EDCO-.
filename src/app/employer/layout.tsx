"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function EmployerLayout({ children }: { children: React.ReactNode }) {
  const { user, isEmployer, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (!isEmployer && !isAdmin) {
        router.replace("/dashboard");
      }
    }
  }, [user, isEmployer, isAdmin, loading, router]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user && !isEmployer && !isAdmin) {
    return null;
  }

  return <>{children}</>;
}
