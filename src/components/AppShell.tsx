"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { CURRENT_TOS_VERSION, CURRENT_PRIVACY_VERSION } from "@/lib/types";
import ReconsentModal from "@/components/legal/ReconsentModal";
import Navbar from "@/components/navbar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [showReconsent, setShowReconsent] = useState(false);

  const visualMode = user?.ageBand === "18+" || !user?.ageBand ? "career" : "maximalist";
  const isAuthPage = pathname === "/auth/login" || pathname === "/auth/signup" || pathname?.startsWith("/auth/");

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

  const handleReconsentAccept = async (tosVersion: string, privacyVersion: string) => {
    setShowReconsent(false);
  };

  return (
    <div
      data-visual-mode={visualMode}
      data-age-band={user?.ageBand || "18+"}
      className="min-h-screen flex flex-col bg-[#F4F6FB] font-sans text-[#181920] selection:bg-[#E1FD53] selection:text-[#181920]"
    >
      {!isAuthPage && <Navbar />}
      <main className={`flex-1 ${isAuthPage ? "" : "pb-24 md:pb-20 lg:pb-0"}`}>{children}</main>

      <ReconsentModal
        isOpen={showReconsent}
        onAccept={handleReconsentAccept}
      />
    </div>
  );
}
