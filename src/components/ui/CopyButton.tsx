"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CopyButtonProps {
  textToCopy: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
  size?: "sm" | "md";
}

export default function CopyButton({
  textToCopy,
  label = "Copy",
  copiedLabel = "Copied!",
  className = "",
  size = "sm",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn("Clipboard copy error:", err);
    }
  };

  const isSmall = size === "sm";

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Copied to clipboard" : `Copy ${label}`}
      className={`inline-flex items-center gap-1.5 font-bold transition-all cursor-pointer ${
        copied
          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
          : "bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10"
      } ${isSmall ? "px-2.5 py-1 text-[11px] rounded-lg" : "px-3.5 py-2 text-xs rounded-xl"} ${className}`}
    >
      {copied ? (
        <>
          <Check className={`${isSmall ? "w-3 h-3" : "w-3.5 h-3.5"} text-emerald-400 stroke-[3]`} />
          <span>{copiedLabel}</span>
        </>
      ) : (
        <>
          <Copy className={isSmall ? "w-3 h-3" : "w-3.5 h-3.5"} />
          {label && <span>{label}</span>}
        </>
      )}
    </button>
  );
}
