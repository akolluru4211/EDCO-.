"use client";

import React from "react";
import AuthGuard from "@/components/auth/AuthGuard";

export default function CareerLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      {children}
    </AuthGuard>
  );
}
