"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { CURRENT_TOS_VERSION, CURRENT_PRIVACY_VERSION } from "@/lib/types";
import ReconsentModal from "@/components/legal/ReconsentModal";
import FloatingNav from "@/components/layout/FloatingNav";
import MyraChatbot from "@/components/ai/MyraChatbot";
import CookieConsentBanner from "@/components/ui/CookieConsentBanner";

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
      <div className="min-h-screen flex flex-col bg-white text-black font-sans antialiased selection:bg-neutral-950 selection:text-white">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-black focus:text-white focus:rounded-xl focus:shadow-xl focus:font-bold focus:text-xs"
        >
          Skip to main content
        </a>

        {/* Floating Top-Left Brand Logo & Floating Top-Right Navigation Menu Hub */}
        <FloatingNav />

        {/* Main Full-Width Application Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden pt-20 sm:pt-24">
          <main id="main-content" tabIndex={-1} className="flex-1 w-full max-w-full outline-none">
            {children}
          </main>
        </div>

        <ReconsentModal
          isOpen={showReconsent}
          onAccept={handleReconsentAccept}
        />

        {/* Floating AI Educational Mentor & Doubt Solver */}
        <MyraChatbot />

        {/* Global Privacy & Cookie Consent */}
        <CookieConsentBanner />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-neutral-950 selection:text-white overflow-x-clip bg-white text-black">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-black focus:text-white focus:rounded-xl focus:shadow-2xl focus:font-bold focus:text-xs"
      >
        Skip to main content
      </a>

      {/* Floating Top-Left Brand Logo & Floating Top-Right Navigation Menu Hub */}
      <FloatingNav />

      <main id="main-content" tabIndex={-1} className="flex-1 w-full max-w-full outline-none">
        {children}
      </main>

      <ReconsentModal
        isOpen={showReconsent}
        onAccept={handleReconsentAccept}
      />

      {/* Floating AI Educational Mentor & Doubt Solver */}
      <MyraChatbot />

      {/* Global Privacy & Cookie Consent */}
      <CookieConsentBanner />
    </div>
  );
}
