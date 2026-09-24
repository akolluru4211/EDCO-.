"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, X } from "lucide-react";

export default function CookieConsentBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("edworld_cookie_consent");
    if (!consent) {
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("edworld_cookie_consent", "accepted");
    setShow(false);
  };

  const handleDecline = () => {
    localStorage.setItem("edworld_cookie_consent", "essential_only");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      role="region"
      aria-label="Privacy & Cookie Preferences"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-[#13141B] text-white p-5 rounded-3xl border border-white/15 shadow-2xl space-y-3 animate-in slide-in-from-bottom-5 duration-300 backdrop-blur-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-black text-[#D7FC51]">
          <ShieldCheck className="w-4 h-4 text-[#00D2B4]" />
          <span>Privacy &amp; Minimal Cookies</span>
        </div>
        <button
          type="button"
          onClick={handleDecline}
          aria-label="Dismiss cookie notice"
          className="text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-[11px] text-slate-300 leading-relaxed">
        EdWorld Co. uses essential session tokens and privacy-first telemetry to deliver personalized career roadmaps. We do not sell user data. Learn more in our{" "}
        <Link href="/privacy" className="text-[#00D2B4] font-bold underline hover:text-white">
          Privacy Policy
        </Link>.
      </p>

      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={handleAccept}
          className="flex-1 px-3.5 py-2 rounded-xl bg-[#00D2B4] hover:bg-[#00BF9A] text-[#13141B] text-xs font-black transition-all cursor-pointer shadow-sm"
        >
          Accept Preferences
        </button>
        <button
          type="button"
          onClick={handleDecline}
          className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-bold transition-all cursor-pointer"
        >
          Essential Only
        </button>
      </div>
    </div>
  );
}
