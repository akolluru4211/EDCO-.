"use client";

import React, { useState, useEffect } from "react";
import { Monitor, Tablet, Copy, Check, Mail, Sparkles, ExternalLink, ArrowRight } from "lucide-react";
import EdworldLogo from "@/components/ui/EdworldLogo";

interface MobileDeviceRestrictionProps {
  /** Optional custom title */
  title?: string;
  /** Optional custom message */
  message?: string;
  /** If true, allow user to bypass restriction */
  allowBypass?: boolean;
  /** Wrapped children to display on Desktop/Tablet or if bypassed */
  children?: React.ReactNode;
}

export default function MobileDeviceRestriction({
  title = "Desktop or Tablet Recommended",
  message = "EdWorld's interactive interview simulators, live coding environments, and ATS resume builder are optimized for larger screens (Tablet, Laptop, or Desktop) for the best experience.",
  allowBypass = true,
  children,
}: MobileDeviceRestrictionProps) {
  const [isMobilePhone, setIsMobilePhone] = useState(false);
  const [bypassed, setBypassed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    setCurrentUrl(window.location.href);

    const checkDevice = () => {
      // Small screen phone detection (< 768px width)
      // Tablets (>= 768px) like iPads, Android tablets, and Desktops are fully supported!
      const isSmallScreen = window.innerWidth < 768;
      const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      const userAgent = navigator.userAgent.toLowerCase();
      const isPhoneAgent = /android.*mobile|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent);

      // Restriction applies strictly to small phones (< 768px)
      setIsMobilePhone(isSmallScreen && (isTouch || isPhoneAgent));
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
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
      const subject = encodeURIComponent("Continue on EdWorld Co.");
      const body = encodeURIComponent(
        `Here is your link to continue your learning and career workspace on Desktop or Tablet:\n\n${window.location.href}`
      );
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
    }
  };

  // If not a mobile phone screen or bypassed, render normal children
  if (!isMobilePhone || bypassed) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#F4F6FB] flex flex-col justify-between p-6 font-sans selection:bg-[#D7FC51] selection:text-black">
      {/* Top Brand */}
      <div className="flex items-center justify-between">
        <EdworldLogo />
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDE8FD] text-[#7B57FF] text-[11px] font-bold">
          <Monitor className="w-3.5 h-3.5" />
          <span>Desktop / Tablet</span>
        </div>
      </div>

      {/* Center Modal Card */}
      <div className="my-auto py-8">
        <div className="card-quixel rounded-3xl p-6 sm:p-8 bg-white border border-[#E8ECF2] shadow-xl text-center space-y-5 max-w-sm mx-auto">
          
          {/* Visual Device Icon Cluster */}
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 bg-[#EDE8FD] rounded-3xl transform rotate-6" />
            <div className="relative w-16 h-16 rounded-2xl bg-[#13141B] text-[#D7FC51] flex items-center justify-center shadow-md">
              <Monitor className="w-8 h-8" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-[#00D2B4] text-white flex items-center justify-center shadow-sm">
              <Tablet className="w-4 h-4" />
            </div>
          </div>

          {/* Heading and Description */}
          <div className="space-y-2">
            <h2 className="text-xl font-black font-display text-[#13141B] tracking-tight">
              {title}
            </h2>
            <p className="text-xs text-[#5E6573] leading-relaxed">
              {message}
            </p>
          </div>

          {/* Supported Devices Badge */}
          <div className="p-3 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] text-[11px] text-[#13141B] font-semibold space-y-1">
            <div className="flex items-center justify-center gap-3 text-[#7B57FF]">
              <span className="flex items-center gap-1">
                <Monitor className="w-3.5 h-3.5" /> Laptops &amp; Desktops
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Tablet className="w-3.5 h-3.5" /> Tablets (iPads)
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-1">
            <button
              type="button"
              onClick={handleCopyLink}
              className="w-full py-3 px-4 rounded-2xl bg-[#13141B] hover:bg-[#2A2C38] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-[#D7FC51]" />
                  <span>Link Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Link to Open on Desktop</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleEmailLink}
              className="w-full py-3 px-4 rounded-2xl bg-[#F4F6FB] hover:bg-[#E8ECF2] border border-[#E8ECF2] text-[#13141B] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Mail className="w-4 h-4 text-[#7B57FF]" />
              <span>Email Link to Myself</span>
            </button>
          </div>

          {/* Optional Bypass for Mobile Preview */}
          {allowBypass && (
            <div className="pt-2 border-t border-[#E8ECF2]">
              <button
                type="button"
                onClick={() => setBypassed(true)}
                className="text-[11px] font-semibold text-[#8E95A5] hover:text-[#13141B] underline transition-colors"
              >
                Continue anyway (mobile preview mode)
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Footer reassurance */}
      <div className="text-center text-[11px] text-[#8E95A5]">
        EdWorld Co. • Built for comprehensive engineering &amp; career development
      </div>
    </div>
  );
}
