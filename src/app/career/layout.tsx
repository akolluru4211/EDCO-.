"use client";

import React from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

export default function CareerLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary moduleName="Career Workspace">
      <AuthGuard>
        {children}
      </AuthGuard>
    </ErrorBoundary>
  );
}

