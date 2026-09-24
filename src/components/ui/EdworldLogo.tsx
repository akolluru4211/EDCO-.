"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

interface EdworldLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  textClassName?: string;
  variant?: "dark" | "light" | "auto";
  href?: string;
  className?: string;
}

export const EdworldLogo: React.FC<EdworldLogoProps> = ({
  size = "md",
  showText = true,
  textClassName = "",
  variant = "auto",
  href = "/",
  className = "",
}) => {
  const dimension = {
    sm: { box: "w-8 h-8", imgSize: 22, font: "text-sm", sub: "text-[9px]" },
    md: { box: "w-10 h-10", imgSize: 28, font: "text-base", sub: "text-[10px]" },
    lg: { box: "w-12 h-12", imgSize: 34, font: "text-xl", sub: "text-xs" },
    xl: { box: "w-16 h-16", imgSize: 48, font: "text-2xl", sub: "text-xs" },
  }[size];

  const isDark = variant === "dark";

  const content = (
    <div className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      {/* Brand Icon Mark */}
      <div
        className={`relative rounded-2xl bg-[#13141B] overflow-hidden flex items-center justify-center shadow-md border border-white/15 transition-transform group-hover:scale-105 duration-200 p-1 shrink-0 ${dimension.box}`}
      >
        <Image
          src="/images/edworld-logo.png"
          alt="Edworld Co Logo"
          width={dimension.imgSize}
          height={dimension.imgSize}
          className="object-contain"
          priority
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-black tracking-tight leading-none ${isDark ? "text-white" : "text-[#13141B]"} ${dimension.font} ${textClassName}`}>
            Edworld <span className="text-[#D7FC51] font-black">Co.</span>
          </span>
          <span className={`font-bold ${isDark ? "text-[#8E95A5]" : "text-[#8F9CAE]"} uppercase tracking-wider mt-0.5 ${dimension.sub}`}>
            Career Readiness
          </span>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} aria-label="EdWorld Co. Home" className="inline-block hover:opacity-95 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
};

export default EdworldLogo;
