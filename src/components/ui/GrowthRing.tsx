"use client";

import React, { useEffect, useState } from "react";

export interface GrowthRingProps {
  level?: 0 | 1 | 2;
  progress?: number; // 0 to 100
  size?: number;     // px dimension
  strokeWidth?: number;
  animated?: boolean;
  label?: string;
  className?: string;
}

export const GrowthRing: React.FC<GrowthRingProps> = ({
  level = 1,
  progress = 68,
  size = 96,
  strokeWidth = 8,
  animated = true,
  label,
  className = ""
}) => {
  const [currentProgress, setCurrentProgress] = useState(animated ? 0 : progress);

  useEffect(() => {
    if (!animated) {
      setCurrentProgress(progress);
      return;
    }

    // Check prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      setCurrentProgress(progress);
    } else {
      const timeout = setTimeout(() => {
        setCurrentProgress(progress);
      }, 150);
      return () => clearTimeout(timeout);
    }
  }, [progress, animated]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (currentProgress / 100) * circumference;

  // Level Colors
  const levelColors = {
    0: { stroke: "#0d9488", text: "text-teal-600", bg: "stroke-teal-100", label: "Foundational" },
    1: { stroke: "#1b4332", text: "text-forest", bg: "stroke-forest/10", label: "Intermediate" },
    2: { stroke: "#d97706", text: "text-gold-dark", bg: "stroke-gold-light", label: "Advanced" }
  }[level] || { stroke: "#1b4332", text: "text-forest", bg: "stroke-forest/10", label: "Intermediate" };

  return (
    <div className={`relative inline-flex flex-col items-center justify-center ${className}`}>
      <div style={{ width: size, height: size }} className="relative flex items-center justify-center">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
          aria-hidden="true"
        >
          {/* Background Track Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            className={levelColors.bg}
            fill="transparent"
          />
          {/* Dynamic Animated Progress Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            stroke={levelColors.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              transition: animated ? "stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)" : "none"
            }}
          />
        </svg>

        {/* Center Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`text-base sm:text-lg font-black font-mono tracking-tighter ${levelColors.text}`}>
            {currentProgress}%
          </span>
          <span className="text-[9px] uppercase tracking-wider font-extrabold text-ink-muted">
            Lvl {level}
          </span>
        </div>
      </div>

      {label && (
        <span className="mt-1.5 text-xs font-bold text-ink-soft">
          {label}
        </span>
      )}
    </div>
  );
};

export default GrowthRing;
