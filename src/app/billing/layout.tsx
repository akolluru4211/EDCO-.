"use client";

import React from "react";
import AuthGuard from "@/components/auth/AuthGuard";

export default function BillingLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requireAuth={true}>
      {children}
    </AuthGuard>
  );
}
