"use client";

import React from "react";
import AuthGuard from "@/components/auth/AuthGuard";

export default function ProblemsLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requireAuth={true}>
      {children}
    </AuthGuard>
  );
}
