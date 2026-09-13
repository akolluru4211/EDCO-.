"use client";

import React from "react";

interface ShimmerBadgeProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: "violet" | "cyan" | "amber" | "emerald" | "slate";
  className?: string;
}

export default function ShimmerBadge({
  children,
  icon,
  variant = "violet",
  className = "",
}: ShimmerBadgeProps) {
  const variantStyles = {
    violet: "bg-violet-50 text-violet-700 border-violet-200/80",
    cyan: "bg-teal-50 text-teal-800 border-teal-200/80",
    amber: "bg-amber-50 text-amber-900 border-amber-200/80",
    emerald: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
    slate: "bg-slate-100 text-slate-800 border-slate-200",
  };

  return (
    <span
      className={`shimmer-badge inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide border shadow-sm transition-transform duration-200 hover:scale-105 ${variantStyles[variant]} ${className}`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
