"use client";

import React from "react";
import Image from "next/image";

interface AuthLoadingScreenProps {
  message?: string;
}

export default function AuthLoadingScreen({ message = "Checking session..." }: AuthLoadingScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0B0C10] text-white select-none px-4">
      {/* Background glow accents */}
      <div className="absolute w-72 h-72 rounded-full bg-[#7B57FF]/10 blur-3xl pointer-events-none -top-12 -left-12" />
      <div className="absolute w-72 h-72 rounded-full bg-[#00D2B4]/10 blur-3xl pointer-events-none -bottom-12 -right-12" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-sm space-y-6 animate-in fade-in duration-300">
        {/* Brand Mark Logo */}
        <div className="relative group">
          <div className="w-20 h-20 rounded-3xl bg-[#13141B] border border-white/15 p-3 flex items-center justify-center shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#7B57FF]/20 via-[#00D2B4]/20 to-[#D7FC51]/20 opacity-50" />
            <Image
              src="/images/edworld-logo.png"
              alt="Edworld Co. Logo"
              width={54}
              height={54}
              className="object-contain relative z-10 drop-shadow-md"
              priority
            />
          </div>
          {/* Subtle animated ring around logo */}
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#7B57FF] via-[#00D2B4] to-[#D7FC51] opacity-30 blur-sm animate-pulse" />
        </div>

        {/* Brand Text */}
        <div className="space-y-1">
          <h1 className="text-2xl font-black tracking-tight font-sans text-white">
            Edworld <span className="text-[#D7FC51]">Co.</span>
          </h1>
          <p className="text-[10px] font-bold tracking-[0.25em] text-[#8E95A5] uppercase">
            SKILLS & CAREER OS
          </p>
        </div>

        {/* Circular Gradient Spinner */}
        <div className="flex flex-col items-center space-y-3 pt-2">
          <div className="relative w-8 h-8">
            <div className="w-8 h-8 rounded-full border-2 border-white/10" />
            <div className="absolute inset-0 w-8 h-8 rounded-full border-2 border-transparent border-t-[#D7FC51] border-r-[#00D2B4] animate-spin" />
          </div>
          <span className="text-xs font-semibold text-[#8E95A5] tracking-wider uppercase">
            {message}
          </span>
        </div>
      </div>
    </div>
  );
}
