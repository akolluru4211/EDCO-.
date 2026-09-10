"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

interface AppSplashScreenProps {
  onLoaded?: () => void;
  minDisplayTimeMs?: number;
}

export default function AppSplashScreen({ 
  onLoaded, 
  minDisplayTimeMs = 2400 
}: AppSplashScreenProps) {
  const [stage, setStage] = useState<"enter" | "active" | "exit">("enter");

  useEffect(() => {
    // Staggered reveal
    const timer1 = setTimeout(() => setStage("active"), 100);
    const timer2 = setTimeout(() => {
      if (onLoaded) {
        setStage("exit");
        setTimeout(onLoaded, 400);
      }
    }, minDisplayTimeMs);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onLoaded, minDisplayTimeMs]);

  return (
    <div 
      className={`fixed inset-0 z-50 bg-[#080A10] text-white flex flex-col justify-between items-center p-6 select-none overflow-hidden transition-opacity duration-400 ${
        stage === "exit" ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{
        paddingTop: "max(1.5rem, env(safe-area-inset-top, 1.5rem))",
        paddingBottom: "max(1.5rem, env(safe-area-inset-bottom, 1.5rem))",
      }}
      aria-label="Edworld Co. Loading"
      role="status"
    >
      {/* Background: Sophisticated Abstract Orbital Curves & Soft Glows */}
      <div className="absolute inset-0 pointer-events-none -z-10 flex items-center justify-center overflow-hidden">
        
        {/* Soft Ambient Radial Glows */}
        <div className="absolute w-[360px] h-[360px] bg-violet-600/10 rounded-full blur-[90px] -top-10 -left-10" />
        <div className="absolute w-[380px] h-[380px] bg-cyan-500/10 rounded-full blur-[100px] top-1/3 -right-20" />
        <div className="absolute w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[110px] -bottom-10 left-1/4" />

        {/* Futuristic Orbital Curve Lines */}
        <svg 
          className="absolute w-[600px] h-[800px] opacity-20" 
          viewBox="0 0 600 800" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <ellipse 
            cx="300" 
            cy="400" 
            rx="260" 
            ry="360" 
            stroke="url(#orbit-gradient-1)" 
            strokeWidth="1.2" 
            transform="rotate(-15 300 400)" 
          />
          <ellipse 
            cx="300" 
            cy="400" 
            rx="220" 
            ry="310" 
            stroke="url(#orbit-gradient-2)" 
            strokeWidth="1" 
            transform="rotate(25 300 400)" 
          />
          <ellipse 
            cx="300" 
            cy="400" 
            rx="180" 
            ry="250" 
            stroke="url(#orbit-gradient-3)" 
            strokeWidth="0.8" 
            strokeDasharray="4 8"
            transform="rotate(-5 300 400)" 
          />
          <defs>
            <linearGradient id="orbit-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="orbit-gradient-2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.6" />
              <stop offset="70%" stopColor="#8B5CF6" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="orbit-gradient-3" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.5" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Top Space (Safe Area balance) */}
      <div className="w-full h-8" />

      {/* Center Stage: Logo, Typography & Elegant Loader */}
      <div className="flex flex-col items-center justify-center text-center space-y-6 max-w-xs mx-auto">
        
        {/* Brand Mark with Soft Glow */}
        <div className="relative group">
          {/* Subtle Ambient Halo */}
          <div className="absolute -inset-4 bg-gradient-to-tr from-violet-600/30 via-cyan-500/20 to-emerald-500/30 rounded-3xl blur-xl opacity-75 animate-pulse" />
          
          {/* Logo Frame */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#0D101A] border border-white/15 flex items-center justify-center p-3.5 shadow-2xl">
            <Image
              src="/images/edworld-logo.png"
              alt="Edworld Co."
              width={64}
              height={64}
              className="object-contain filter drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]"
              priority
            />
          </div>
        </div>

        {/* Brand Typography */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center justify-center gap-1.5 font-sans">
            Edworld <span className="text-[#10B981] font-black">Co.</span>
          </h1>
          <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 tracking-[0.22em] uppercase">
            Skills &amp; Career OS
          </p>
        </div>

        {/* Circular Gradient Loader */}
        <div className="pt-4 flex flex-col items-center space-y-3">
          <div className="relative w-12 h-12 flex items-center justify-center">
            {/* Animated Rotating Gradient Ring */}
            <svg 
              className="w-12 h-12 animate-spin" 
              viewBox="0 0 48 48" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              style={{ animationDuration: "1.4s" }}
            >
              <circle 
                cx="24" 
                cy="24" 
                r="20" 
                stroke="url(#loader-gradient)" 
                strokeWidth="3.5" 
                strokeLinecap="round"
                strokeDasharray="95 35"
              />
              <defs>
                <linearGradient id="loader-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="50%" stopColor="#06B6D4" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Subtle center dot */}
            <div className="w-2 h-2 rounded-full bg-cyan-400/40 blur-xs" />
          </div>

          <span className="text-[10px] font-bold tracking-[0.25em] text-slate-400 uppercase animate-pulse">
            LOADING...
          </span>
        </div>

      </div>

      {/* Bottom Inspiring Tagline (Safe Area compliant) */}
      <div className="w-full text-center pb-2">
        <p className="text-xs font-medium text-slate-400 tracking-wide">
          Better Skills. Brighter Futures.
        </p>
      </div>

    </div>
  );
}
