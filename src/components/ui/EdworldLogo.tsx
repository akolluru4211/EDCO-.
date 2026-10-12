"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

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
    sm: { box: "w-7 h-7", iconSize: 28, font: "text-xs", sub: "text-[8px]" },
    md: { box: "w-8 h-8", iconSize: 32, font: "text-sm", sub: "text-[9px]" },
    lg: { box: "w-10 h-10", iconSize: 40, font: "text-base", sub: "text-[10px]" },
    xl: { box: "w-12 h-12", iconSize: 48, font: "text-lg", sub: "text-xs" },
  }[size];

  const isDark = variant === "dark";

  const content = (
    <div className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      {/* Bespoke Geometric "ED" Monogram Mark */}
      <div
        className={`relative rounded-xl overflow-hidden bg-black flex items-center justify-center shadow-xs border border-neutral-800 transition-all group-hover:scale-105 duration-200 shrink-0 ${dimension.box}`}
      >
        <Image
          src="/images/edworld-mark.png"
          alt="EdWorld Co. Logo"
          width={dimension.iconSize}
          height={dimension.iconSize}
          className="w-full h-full object-cover"
          priority
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1 leading-none">
            <span className={`font-black tracking-tight ${isDark ? "text-white" : "text-black"} ${dimension.font} ${textClassName}`}>
              Edworld
            </span>
            <span className="text-[10px] font-mono font-black px-1.5 py-0.5 rounded-md bg-neutral-100 border border-neutral-300 text-black">
              CO.
            </span>
          </div>
          <span className={`font-semibold tracking-wider uppercase mt-1 ${isDark ? "text-neutral-400" : "text-neutral-500"} ${dimension.sub}`}>
            Skills &amp; Career OS
          </span>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center outline-none focus-visible:ring-2 focus-visible:ring-black rounded-lg">
        {content}
      </Link>
    );
  }

  return content;
};

export default EdworldLogo;
