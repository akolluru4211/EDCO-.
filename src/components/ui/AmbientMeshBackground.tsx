"use client";

import React from "react";

interface AmbientMeshBackgroundProps {
  className?: string;
  intensity?: "subtle" | "vibrant";
}

export default function AmbientMeshBackground({
  className = "",
  intensity = "subtle",
}: AmbientMeshBackgroundProps) {
  const opacityClass = intensity === "vibrant" ? "opacity-30" : "opacity-15";

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {/* Orb 1: Violet/Purple */}
      <div
        className={`absolute -top-24 -left-24 w-96 h-96 rounded-full bg-gradient-to-tr from-purple-400 to-indigo-500 blur-3xl ${opacityClass} animate-float-slow`}
      />

      {/* Orb 2: Cyan/Teal */}
      <div
        className={`absolute top-1/3 -right-24 w-96 h-96 rounded-full bg-gradient-to-bl from-teal-300 to-cyan-500 blur-3xl ${opacityClass} animate-float-gentle`}
        style={{ animationDelay: "2s" }}
      />

      {/* Orb 3: Lime/Gold */}
      <div
        className={`absolute -bottom-24 left-1/3 w-80 h-80 rounded-full bg-gradient-to-tr from-lime-300 to-amber-400 blur-3xl ${opacityClass} animate-float-slow`}
        style={{ animationDelay: "4s" }}
      />
    </div>
  );
}
