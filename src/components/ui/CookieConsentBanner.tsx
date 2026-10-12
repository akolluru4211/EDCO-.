"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, X, Sliders, Check } from "lucide-react";

interface CookiePreferences {
  essential: boolean;
  preferences: boolean;
  analytics: boolean;
  timestamp: string;
}

export default function CookieConsentBanner() {
  const [show, setShow] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  
  const [prefFunctional, setPrefFunctional] = useState(true);
  const [prefAnalytics, setPrefAnalytics] = useState(true);

  useEffect(() => {
    // Check if consent has already been given
    const saved = localStorage.getItem("edworld_cookie_consent");
    if (!saved) {
      const timer = setTimeout(() => setShow(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  // Listen for global custom event to allow reopening preferences from the footer
  useEffect(() => {
    const handleReopen = () => {
      setShow(true);
      setShowCustomize(true);
    };

    window.addEventListener("edworld-open-cookie-preferences", handleReopen);
    return () => window.removeEventListener("edworld-open-cookie-preferences", handleReopen);
  }, []);

  const savePreferences = (preferences: CookiePreferences) => {
    try {
      localStorage.setItem("edworld_cookie_consent", JSON.stringify(preferences));
    } catch (e) {
      // LocalStorage access fallback
    }
    setShow(false);
    setShowCustomize(false);
  };

  const handleAcceptAll = () => {
    savePreferences({
      essential: true,
      preferences: true,
      analytics: true,
      timestamp: new Date().toISOString(),
    });
  };

  const handleEssentialOnly = () => {
    savePreferences({
      essential: true,
      preferences: false,
      analytics: false,
      timestamp: new Date().toISOString(),
    });
  };

  const handleSaveCustom = () => {
    savePreferences({
      essential: true,
      preferences: prefFunctional,
      analytics: prefAnalytics,
      timestamp: new Date().toISOString(),
    });
  };

  if (!show) return null;

  return (
    <div
      role="region"
      aria-label="Privacy & Cookie Preferences"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-white text-black p-5 sm:p-6 rounded-3xl border border-neutral-300 shadow-2xl space-y-4 animate-in slide-in-from-bottom-5 duration-300"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-black text-black">
          <ShieldCheck className="w-4 h-4 text-black" />
          <span>Privacy &amp; Minimal Cookies</span>
        </div>
        <button
          type="button"
          onClick={handleEssentialOnly}
          aria-label="Dismiss cookie notice"
          className="text-neutral-400 hover:text-black transition-colors cursor-pointer p-1 rounded-lg hover:bg-neutral-100"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {!showCustomize ? (
        <>
          <p className="text-xs text-neutral-600 leading-relaxed">
            EdWorld Co. uses essential session tokens and privacy-preserving telemetry to deliver your career roadmap. We do not sell personal data or use third-party ad brokers. Read our{" "}
            <Link href="/cookies" className="text-black font-bold underline hover:text-neutral-700">
              Cookie Policy
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-black font-bold underline hover:text-neutral-700">
              Privacy Policy
            </Link>.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleAcceptAll}
              className="flex-1 min-w-[120px] px-3.5 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs text-center active:scale-[0.98]"
            >
              Accept All
            </button>
            <button
              type="button"
              onClick={handleEssentialOnly}
              className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-neutral-50 text-black border border-neutral-300 text-xs font-bold transition-all cursor-pointer active:scale-[0.98]"
            >
              Essential Only
            </button>
            <button
              type="button"
              onClick={() => setShowCustomize(true)}
              className="p-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-black text-xs font-medium transition-all cursor-pointer flex items-center justify-center active:scale-[0.98]"
              aria-label="Customize cookie settings"
              title="Customize settings"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        </>
      ) : (
        <div className="space-y-3 pt-1">
          <p className="text-xs text-neutral-600">Select which categories of cookies you consent to:</p>
          
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 border border-neutral-200">
              <div>
                <div className="font-bold text-black flex items-center gap-1.5">
                  <span>Strictly Necessary</span>
                  <span className="text-[10px] text-neutral-500 font-semibold">(Always Active)</span>
                </div>
                <div className="text-[10px] text-neutral-500">Required for authentication &amp; security tokens</div>
              </div>
              <Check className="w-4 h-4 text-black" />
            </div>

            <label className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-neutral-200 cursor-pointer hover:border-black transition-colors">
              <div>
                <div className="font-bold text-black">Functional Preferences</div>
                <div className="text-[10px] text-neutral-500">Remembers UI themes, interview volume &amp; layout</div>
              </div>
              <input
                type="checkbox"
                checked={prefFunctional}
                onChange={(e) => setPrefFunctional(e.target.checked)}
                className="w-4 h-4 rounded text-black focus:ring-0 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-neutral-200 cursor-pointer hover:border-black transition-colors">
              <div>
                <div className="font-bold text-black">Performance Telemetry</div>
                <div className="text-[10px] text-neutral-500">Anonymous latency and error monitoring</div>
              </div>
              <input
                type="checkbox"
                checked={prefAnalytics}
                onChange={(e) => setPrefAnalytics(e.target.checked)}
                className="w-4 h-4 rounded text-black focus:ring-0 cursor-pointer"
              />
            </label>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={handleSaveCustom}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold transition-all cursor-pointer text-center active:scale-[0.98]"
            >
              Save Preferences
            </button>
            <button
              type="button"
              onClick={() => setShowCustomize(false)}
              className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-neutral-50 border border-neutral-300 text-black text-xs font-bold transition-all cursor-pointer active:scale-[0.98]"
            >
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
