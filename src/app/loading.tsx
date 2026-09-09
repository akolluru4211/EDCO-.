import React from "react";
import Image from "next/image";

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 space-y-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-black overflow-hidden flex items-center justify-center shadow-xl shadow-slate-950/20 border border-slate-800 animate-pulse">
          <Image
            src="/images/edworld-logo.png"
            alt="Loading Edworld Co"
            width={40}
            height={40}
            className="object-contain"
            priority
          />
        </div>
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-brand-500 to-indigo-500 opacity-30 blur-sm -z-10 animate-pulse" />
      </div>

      <div className="space-y-1 text-center">
        <p className="text-sm font-black text-slate-800 tracking-tight">Loading Edworld Co...</p>
        <p className="text-xs text-slate-400 font-medium">Calibrating your personalized career track</p>
      </div>
    </div>
  );
}
