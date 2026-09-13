"use client";

import React from "react";
import { Flame } from "lucide-react";

interface StreakFlameProps {
  streakDays: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  showSparks?: boolean;
}

export default function StreakFlame({
  streakDays,
  size = "md",
  className = "",
  showSparks = true,
}: StreakFlameProps) {
  const isHot = streakDays > 0;
  const isInferno = streakDays >= 7;

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-11 h-11",
    lg: "w-14 h-14",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div className={`relative flex items-center justify-center ${sizeClasses[size]} ${className}`}>
      {/* Background Animated Glow */}
      {isHot && (
        <div
          className={`absolute inset-0 rounded-full animate-pulse-glow ${
            isInferno
              ? "bg-gradient-to-tr from-amber-500/40 via-orange-500/40 to-red-500/40 blur-md"
              : "bg-gradient-to-tr from-orange-400/30 to-amber-300/30 blur-sm"
          }`}
          aria-hidden="true"
        />
      )}

      {/* Outer Circle Container */}
      <div
        className={`relative z-10 flex items-center justify-center rounded-2xl transition-transform duration-300 ${
          sizeClasses[size]
        } ${
          isHot
            ? isInferno
              ? "bg-gradient-to-br from-amber-400 via-orange-500 to-rose-600 text-white shadow-lg shadow-orange-500/30 animate-flame-flicker"
              : "bg-amber-100 text-amber-600 border border-amber-200"
            : "bg-slate-100 text-slate-400 border border-slate-200"
        }`}
      >
        <Flame className={`${iconSizes[size]} transition-transform duration-300 ${isHot ? "scale-110" : "scale-95"}`} />

        {/* Dynamic Flying Sparks for hot streaks */}
        {isHot && showSparks && (
          <>
            <span
              className="flame-sparkle"
              style={{ top: "10%", right: "20%", animationDelay: "0.2s" }}
            />
            <span
              className="flame-sparkle"
              style={{ top: "25%", left: "15%", animationDelay: "0.8s" }}
            />
            <span
              className="flame-sparkle"
              style={{ top: "5%", left: "45%", animationDelay: "1.2s" }}
            />
          </>
        )}
      </div>
    </div>
  );
}
