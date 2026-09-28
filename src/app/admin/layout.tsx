"use client";

import React from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
      <ErrorBoundary moduleName="Admin Operations Portal" fallbackTitle="Admin Hub Notice">
        {children}
      </ErrorBoundary>
    </AuthGuard>
  );
}

