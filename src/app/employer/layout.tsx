"use client";

import React from "react";
import AuthGuard from "@/components/auth/AuthGuard";

export default function EmployerLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={["EMPLOYER", "HR", "FOUNDER", "ADMIN", "SUPER_ADMIN"]}>
      {children}
    </AuthGuard>
  );
}
