"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { CURRENT_TOS_VERSION, CURRENT_PRIVACY_VERSION } from "@/lib/types";
import ReconsentModal from "@/components/legal/ReconsentModal";
import AppSidebar from "@/components/layout/AppSidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [showReconsent, setShowReconsent] = useState(false);

  const isAuthPage =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/auth/login" ||
    pathname === "/auth/signup" ||
    pathname?.startsWith("/auth/");

  const isPublicLanding =
    pathname === "/" ||
    pathname === "/about" ||
    pathname === "/contact" ||
    pathname === "/pricing" ||
    pathname === "/privacy" ||
    pathname === "/terms" ||
    pathname === "/for-college" ||
    pathname === "/for-professionals" ||
    pathname === "/for-career" ||
    pathname === "/consent/verify" ||
    pathname?.startsWith("/sector-landing");

  const isAppWorkspace = !isAuthPage && !isPublicLanding;

  useEffect(() => {
    if (user) {
      const isOutdated =
        (user.tosVersion && user.tosVersion !== CURRENT_TOS_VERSION) ||
        (user.privacyVersion && user.privacyVersion !== CURRENT_PRIVACY_VERSION);
      if (isOutdated) {
        setShowReconsent(true);
      }
    }
  }, [user]);

  const handleReconsentAccept = async () => {
    setShowReconsent(false);
  };

  if (isAppWorkspace) {
    return (
      <div className="min-h-screen flex flex-col lg:flex-row bg-[#FCFCFB] text-[#13141B] font-sans antialiased selection:bg-[#00D2B4]/20 selection:text-[#0A5245]">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-[#13141B] focus:text-[#00D2B4] focus:rounded-xl focus:shadow-xl focus:font-bold focus:text-xs"
        >
          Skip to main content
        </a>

        {/* Persistent Application Sidebar */}
        <AppSidebar />

        {/* Main Application Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
          <main id="main-content" tabIndex={-1} className="flex-1 w-full max-w-full outline-none">
            {children}
          </main>
        </div>

        <ReconsentModal
          isOpen={showReconsent}
          onAccept={handleReconsentAccept}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-[#00D2B4]/20 selection:text-[#0A5245] overflow-x-clip bg-[#FCFCFB] text-[#13141B]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-[#13141B] focus:text-[#00D2B4] focus:rounded-xl focus:shadow-2xl focus:font-bold focus:text-xs focus:ring-2 focus:ring-[#00D2B4]"
      >
        Skip to main content
      </a>

      <main id="main-content" tabIndex={-1} className="flex-1 w-full max-w-full outline-none">
        {children}
      </main>

      <ReconsentModal
        isOpen={showReconsent}
        onAccept={handleReconsentAccept}
      />
    </div>
  );
}
