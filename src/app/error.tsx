"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import EdworldLogo from "@/components/ui/EdworldLogo";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[App Segment Error]:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-[#E8ECF2] shadow-2xl p-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-2xl bg-[#FFEFEA] border border-[#FF7A50]/20 text-[#FF7A50] flex items-center justify-center mx-auto shadow-sm">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700">
            Error Segment Handled
          </span>
          <h1 className="text-2xl font-black text-[#13141B] tracking-tight">
            Application Encountered an Error
          </h1>
          <p className="text-xs sm:text-sm text-[#5E6573] leading-relaxed">
            This module encountered an unexpected state. Your saved progress, resume drafts, and scores remain safe.
          </p>
        </div>

        {error?.message && (
          <div className="p-3 bg-[#F4F6FB] rounded-xl border border-[#E8ECF2] text-[11px] text-[#5E6573] font-mono overflow-x-auto text-left">
            {error.message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#13141B] hover:bg-[#2A2C38] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-[#13141B] font-bold text-xs border border-[#E8ECF2] flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            <Home className="w-4 h-4 text-[#8E95A5]" />
            <span>Open Dashboard</span>
          </Link>
        </div>

        <div className="pt-4 border-t border-[#E8ECF2] flex items-center justify-center">
          <EdworldLogo size="sm" showText={true} />
        </div>
      </div>
    </div>
  );
}
