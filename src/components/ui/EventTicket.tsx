"use client";

import React from "react";
import Image from "next/image";

export interface EventTicketProps {
  passType?: string;
  eventName?: string;
  date?: string;
  venue?: string;
  seatCode?: string;
  attendeeName?: string;
  className?: string;
  onClick?: () => void;
}

export const EventTicket: React.FC<EventTicketProps> = ({
  passType = "Mock Studio Pass",
  eventName = "AI Mock Interview",
  date = "Today • Live Session",
  venue = "Edworld Readiness Hub",
  seatCode = "LVL-1",
  attendeeName,
  className = "",
  onClick,
}) => {
  return (
    <div className={`ticket-card cursor-pointer ${className}`} onClick={onClick}>
      {/* Background Holographic Layer */}
      <div className="ticket-bg-holographic" />

      {/* Floating Notes Texture */}
      <div className="absolute inset-0 overflow-hidden text-5xl text-white/30 mix-blend-color-burn translate-y-6 pointer-events-none select-none z-10">
        ♪♪♪♪♪
      </div>
      <div className="absolute inset-0 overflow-hidden text-5xl text-white/20 mix-blend-color-burn translate-y-16 pointer-events-none select-none z-10">
        ♪♪♪♪
      </div>

      {/* Ticket Header with Edworld Logo */}
      <div className="relative text-center z-20 px-3 pt-2.5">
        <div className="flex items-center justify-between">
          <div className="w-7 h-7 rounded-lg bg-black overflow-hidden flex items-center justify-center border border-white/40 shadow-sm">
            <Image
              src="/images/edworld-logo.png"
              alt="Edworld"
              width={22}
              height={22}
              className="object-contain"
            />
          </div>
          <span className="font-black text-2xl tracking-widest text-white/90 drop-shadow-sm font-mono">
            EDWORLD
          </span>
          <div className="rotate-180 text-xs text-white/80 font-bold">✁</div>
        </div>
      </div>

      {/* Ticket Body */}
      <div className="relative z-20 px-4 py-2 text-slate-900 text-xs space-y-1 font-medium">
        <p className="font-bold italic text-slate-950 text-sm tracking-tight">{passType}</p>
        <p className="text-slate-800 font-semibold">{eventName}</p>
        <p className="text-slate-700 text-[11px]">{date}</p>
        <p className="text-slate-600 text-[10px] truncate">{venue}</p>
        {attendeeName && <p className="text-slate-800 font-bold text-[10px] pt-0.5">Attendee: {attendeeName}</p>}
      </div>

      {/* Ticket Footer with Seat & Barcode */}
      <div className="relative z-20 px-4 pb-3 space-y-2">
        <div className="text-center text-xs font-semibold text-slate-900">
          Pass <span className="font-black text-sm text-brand-950">{seatCode}</span>
        </div>
        <div className="ticket-barcode" />
      </div>

      {/* SVG Specular Bump Filter */}
      <svg className="absolute w-0 h-0 pointer-events-none">
        <filter id="ticket-bump">
          <feTurbulence result="noise" numOctaves={3} baseFrequency="0.7" type="fractalNoise" />
          <feSpecularLighting
            in="noise"
            result="specular"
            lightingColor="#fffffc"
            specularExponent={25}
            specularConstant="0.8"
            surfaceScale="0.15"
          >
            <fePointLight z={210} y={100} x={100} />
          </feSpecularLighting>
          <feComposite result="noise2" operator="in" in="specular" in2="SourceGraphic" />
          <feBlend mode="screen" in2="noise2" in="SourceGraphic" />
        </filter>
      </svg>
    </div>
  );
};

export default EventTicket;
