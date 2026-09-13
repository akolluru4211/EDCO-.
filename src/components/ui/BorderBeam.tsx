"use client";

import React from "react";

interface BorderBeamProps {
  size?: number; // size in px of the glowing beam
  duration?: number; // duration in seconds
  colorFrom?: string;
  colorTo?: string;
  className?: string;
  borderWidth?: number;
}

export default function BorderBeam({
  size = 200,
  duration = 12,
  colorFrom = "#7B57FF",
  colorTo = "#00D2B4",
  className = "",
  borderWidth = 1.5,
}: BorderBeamProps) {
  return (
    <div
      style={
        {
          "--size": `${size}px`,
          "--duration": `${duration}s`,
          "--color-from": colorFrom,
          "--color-to": colorTo,
          "--border-width": `${borderWidth}px`,
        } as React.CSSProperties
      }
      className={`pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)] ${className}`}
      aria-hidden="true"
    >
      <div
        className="absolute aspect-square bg-gradient-to-l from-[var(--color-from)] via-[var(--color-to)] to-transparent opacity-80"
        style={{
          width: "var(--size)",
          offsetPath: `rect(0 auto auto 0 round calc(1.75rem))`,
          animation: `border-beam var(--duration) infinite linear`,
        }}
      />
    </div>
  );
}
