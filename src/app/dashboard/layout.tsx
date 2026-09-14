"use client";

import React from "react";
import MobileDeviceRestriction from "@/components/ui/MobileDeviceRestriction";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <MobileDeviceRestriction
      title="Desktop or Tablet Workspace"
      message="For the optimal technical interview simulations, code editing, and ATS resume audits, EdWorld is designed for Laptop, Desktop, and Tablet (iPad) screens."
      allowBypass={true}
    >
      {children}
    </MobileDeviceRestriction>
  );
}
