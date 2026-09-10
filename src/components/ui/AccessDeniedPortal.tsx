"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, Lock } from "lucide-react";
import Button from "@/components/ui/Button";

interface AccessDeniedPortalProps {
  portalName?: string;
  requiredRole?: string;
  userRole?: string;
  redirectTo?: string;
}

export default function AccessDeniedPortal({
  portalName = "Internal Operations",
  requiredRole = "Staff Member",
  userRole = "CLIENT",
  redirectTo = "/dashboard"
}: AccessDeniedPortalProps) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6 bg-paper text-ink selection:bg-forest selection:text-white">
      <div className="max-w-md w-full bg-paper-raised rounded-3xl border border-line shadow-xl p-6 sm:p-8 space-y-5 text-center animate-in fade-in duration-200">
        
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-[11px] font-bold text-rose-700">
            <Lock className="w-3 h-3" />
            <span>403 Forbidden &bull; Restricted Portal</span>
          </div>
          <h1 className="text-2xl font-black font-sans text-ink tracking-tight">
            Access Denied
          </h1>
          <p className="text-xs text-ink-soft leading-relaxed">
            You do not have permission to access the <strong className="text-ink">{portalName}</strong>. This portal is strictly restricted to authorized {requiredRole} personnel.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-paper-soft border border-line text-left text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-ink-muted text-[11px]">Your Active Role:</span>
            <span className="font-bold font-mono text-ink bg-paper px-2 py-0.5 rounded-md border border-line text-[11px]">
              {userRole || "STUDENT / CLIENT"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-ink-muted text-[11px]">Security Policy:</span>
            <span className="text-forest font-bold text-[11px]">Strict Role Separation</span>
          </div>
        </div>

        <div className="pt-2">
          <Button
            href={redirectTo}
            variant="primary"
            size="md"
            className="w-full justify-center shadow-md"
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            <span>Return to Permitted Workspace</span>
          </Button>
        </div>

      </div>
    </div>
  );
}

