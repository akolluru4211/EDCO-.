"use client";

import React, { useState } from "react";
import { Copy, Check, ShieldCheck } from "lucide-react";
import { formatEdId } from "@/lib/utils";

interface EdIdBadgeProps {
  userId?: string | null;
  customId?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "minimal" | "pill" | "dark" | "card";
  showCopy?: boolean;
  showVerified?: boolean;
  className?: string;
}

export default function EdIdBadge({
  userId,
  customId,
  size = "md",
  variant = "default",
  showCopy = true,
  showVerified = true,
  className = "",
}: EdIdBadgeProps) {
  const [copied, setCopied] = useState(false);
  const edId = customId || formatEdId(userId);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(edId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const sizeStyles = {
    sm: "text-[10px] px-2 py-0.5 gap-1.5",
    md: "text-xs px-2.5 py-1 gap-2",
    lg: "text-sm px-3.5 py-1.5 gap-2.5",
  }[size];

  const logoSizes = {
    sm: "w-3.5 h-3.5 text-[8px]",
    md: "w-4 h-4 text-[9px]",
    lg: "w-5 h-5 text-[10px]",
  }[size];

  if (variant === "minimal") {
    return (
      <div className={`inline-flex items-center font-mono font-bold text-slate-700 ${sizeStyles} ${className}`}>
        <span className="text-[#0052FF] font-black mr-1">ED</span>
        <span>{edId}</span>
        {showCopy && (
          <button
            type="button"
            onClick={handleCopy}
            title="Copy Ed ID"
            className="text-slate-400 hover:text-slate-900 transition-colors p-0.5 ml-0.5"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
          </button>
        )}
      </div>
    );
  }

  if (variant === "dark") {
    return (
      <div
        className={`inline-flex items-center rounded-xl bg-[#13141B] border border-white/10 text-white shadow-sm font-mono ${sizeStyles} ${className}`}
      >
        <div className={`rounded-lg bg-[#D7FC51] text-[#13141B] font-black flex items-center justify-center shrink-0 ${logoSizes}`}>
          E
        </div>
        <div className="flex items-center gap-1 font-bold">
          <span className="text-[#D7FC51] tracking-wider">{edId}</span>
          {showVerified && (
            <span title="Verified EdWorld Citizen ID">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            </span>
          )}
        </div>
        {showCopy && (
          <button
            type="button"
            onClick={handleCopy}
            title="Copy Ed ID"
            className="text-white/60 hover:text-white transition-colors p-0.5 ml-0.5"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          </button>
        )}
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div
        className={`p-3 rounded-2xl bg-gradient-to-br from-slate-900 via-[#13141B] to-slate-950 text-white border border-slate-800 shadow-md space-y-2 ${className}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#D7FC51] text-[#13141B] font-black flex items-center justify-center text-xs shadow-sm">
              ED
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest text-[#D7FC51] font-bold uppercase block">
                Official Ed ID
              </span>
              <span className="text-xs font-mono font-black text-white">{edId}</span>
            </div>
          </div>
          {showCopy && (
            <button
              type="button"
              onClick={handleCopy}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all text-[10px] font-mono flex items-center gap-1"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-white/70" />
                  <span className="text-white/80">Copy</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center rounded-full bg-white border border-slate-200 shadow-sm text-slate-800 font-mono ${sizeStyles} ${className}`}
    >
      <div className={`rounded-full bg-slate-900 text-white font-black flex items-center justify-center shrink-0 ${logoSizes}`}>
        ED
      </div>
      <div className="flex items-center gap-1 font-bold">
        <span className="text-slate-900 tracking-tight">{edId}</span>
        {showVerified && (
          <span title="Verified EdWorld ID">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          </span>
        )}
      </div>
      {showCopy && (
        <button
          type="button"
          onClick={handleCopy}
          title="Copy Ed ID"
          className="text-slate-400 hover:text-slate-900 transition-colors p-0.5 ml-0.5"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
        </button>
      )}
    </div>
  );
}
