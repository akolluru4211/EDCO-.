"use client";

import React, { useState, useEffect } from "react";
import { Monitor, Tablet, Copy, Check, Mail, Laptop, Smartphone, AlertOctagon, ArrowRight } from "lucide-react";
import EdworldLogo from "@/components/ui/EdworldLogo";

interface MobileDeviceRestrictionProps {
  /** Optional custom title */
  title?: string;
  /** Optional custom message */
  message?: string;
  /** If true, allow user to bypass restriction (default false for strict enforcement) */
  allowBypass?: boolean;
  /** Wrapped children to display on Desktop/Tablet or if bypassed */
  children?: React.ReactNode;
}

export default function MobileDeviceRestriction({
  title = "Please Switch to a Tablet or Laptop",
  message = "EdWorld is designed exclusively for larger screen devices. Mobile phones do not support our interactive coding environments, mock interview simulators, and ATS resume editor. Please open EdWorld on your Tablet (iPad/Android tablet) or Laptop/Desktop to continue.",
  allowBypass = false,
  children,
}: MobileDeviceRestrictionProps) {
  const [isMobilePhone, setIsMobilePhone] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;

    setCurrentUrl(window.location.href);

    const checkDevice = () => {
      // Small screen phone detection (< 768px width)
      // Tablets (>= 768px) like iPads, Android tablets, and Laptops/Desktops are fully supported!
      const isSmallScreen = window.innerWidth < 768;
      const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      const userAgent = navigator.userAgent.toLowerCase();
      const isPhoneAgent = /android.*mobile|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent);

      // Restriction applies strictly to small phones (< 768px)
      setIsMobilePhone(isSmallScreen && (isTouch || isPhoneAgent || isSmallScreen));
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);
    window.addEventListener("orientationchange", checkDevice);
    return () => {
      window.removeEventListener("resize", checkDevice);
      window.removeEventListener("orientationchange", checkDevice);
    };
  }, []);

  const handleCopyLink = () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleEmailLink = () => {
    if (typeof window !== "undefined") {
      const subject = encodeURIComponent("Open EdWorld on Tablet or Laptop");
      const body = encodeURIComponent(
        `Here is your link to continue your learning and career workspace on your Tablet or Laptop:\n\n${window.location.href}\n\n— The EdWorld Co. Team`
      );
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
    }
  };

  // If not yet mounted or not a mobile phone screen, render children normally
  if (!mounted || !isMobilePhone) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-[999999] bg-[#F4F6FB] flex flex-col justify-between p-6 font-sans selection:bg-[#D7FC51] selection:text-black overflow-y-auto">
      {/* Top Header Brand */}
      <div className="flex items-center justify-between">
        <EdworldLogo />
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFEFEA] text-[#FF7A50] text-[11px] font-bold border border-[#FF7A50]/20">
          <AlertOctagon className="w-3.5 h-3.5" />
          <span>Mobile Phone Restricted</span>
        </div>
      </div>

      {/* Main Switch Notice Card */}
      <div className="my-auto py-6">
        <div className="card-quixel rounded-3xl p-6 sm:p-8 bg-white border border-[#E8ECF2] shadow-2xl text-center space-y-5 max-w-sm mx-auto">
          
          {/* Visual Device Switch Graphic */}
          <div className="relative w-24 h-20 mx-auto flex items-center justify-center">
            {/* Phone (Disabled) */}
            <div className="relative w-10 h-16 rounded-xl bg-slate-100 border-2 border-slate-300 flex flex-col items-center justify-between p-1 opacity-50 transform -rotate-12">
              <div className="w-3 h-0.5 bg-slate-400 rounded-full mt-0.5" />
              <div className="w-2 h-2 rounded-full bg-slate-400 mb-0.5" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-red-500 font-black text-xl">✕</span>
              </div>
            </div>

            {/* Arrow Switch */}
            <div className="mx-1 text-[#7B57FF]">
              <ArrowRight className="w-6 h-6 animate-pulse" />
            </div>

            {/* Tablet / Laptop (Supported) */}
            <div className="relative w-16 h-12 rounded-xl bg-[#13141B] text-[#D7FC51] flex items-center justify-center shadow-lg border border-slate-800 transform rotate-6">
              <Laptop className="w-7 h-7" />
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black shadow-sm">
                ✓
              </div>
            </div>
          </div>

          {/* Heading & Context */}
          <div className="space-y-2">
            <h2 className="text-xl font-black font-display text-[#13141B] tracking-tight">
              {title}
            </h2>
            <p className="text-xs text-[#5E6573] leading-relaxed">
              {message}
            </p>
          </div>

          {/* Supported Devices Grid */}
          <div className="p-3.5 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] text-[11px] text-[#13141B] space-y-2">
            <div className="font-bold text-[10px] uppercase tracking-wider text-[#8E95A5]">
              Supported Form Factors:
            </div>
            <div className="grid grid-cols-2 gap-2 text-left">
              <div className="p-2 rounded-xl bg-white border border-[#E8ECF2] flex items-center gap-2">
                <Laptop className="w-4 h-4 text-[#7B57FF]" />
                <span className="font-bold text-[11px]">Laptop / PC</span>
              </div>
              <div className="p-2 rounded-xl bg-white border border-[#E8ECF2] flex items-center gap-2">
                <Tablet className="w-4 h-4 text-[#00D2B4]" />
                <span className="font-bold text-[11px]">iPad / Tablet</span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="space-y-2.5 pt-1">
            <button
              type="button"
              onClick={handleCopyLink}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#13141B] hover:bg-[#2A2C38] text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer uppercase tracking-wider"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-[#D7FC51]" />
                  <span>Link Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Link for Tablet / Laptop</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleEmailLink}
              className="w-full py-3 px-4 rounded-2xl bg-[#F4F6FB] hover:bg-[#E8ECF2] border border-[#E8ECF2] text-[#13141B] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Mail className="w-4 h-4 text-[#7B57FF]" />
              <span>Email Link to Open on Laptop</span>
            </button>
          </div>

        </div>
      </div>

      {/* Footer Branding */}
      <div className="text-center text-[11px] text-[#8E95A5]">
        EdWorld Co. • Built for comprehensive engineering &amp; career development
      </div>
    </div>
  );
}
