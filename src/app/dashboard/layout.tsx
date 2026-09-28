"use client";

import React from "react";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary moduleName="Dashboard Hub">
      {children}
    </ErrorBoundary>
  );
}

