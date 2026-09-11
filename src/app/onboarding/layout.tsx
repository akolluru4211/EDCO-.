"use client";

import React from "react";
import AuthGuard from "@/components/auth/AuthGuard";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requireAuth={true}>
      {children}
    </AuthGuard>
  );
}
