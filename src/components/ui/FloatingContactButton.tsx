"use client";

import React from "react";
import Link from "next/link";
import { MessageSquare, HelpCircle } from "lucide-react";

export default function FloatingContactButton() {
  return (
    <Link
      href="/contact"
      aria-label="Contact EdWorld Support & Grievance Redressal"
      className="fixed bottom-6 left-6 z-40 px-3.5 py-2.5 rounded-2xl bg-[#13141B]/95 hover:bg-[#13141B] text-white shadow-xl border border-white/15 backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2 group cursor-pointer"
    >
      <div className="w-6 h-6 rounded-lg bg-[#00D2B4]/20 text-[#00D2B4] flex items-center justify-center group-hover:scale-110 transition-transform">
        <MessageSquare className="w-3.5 h-3.5" />
      </div>
      <span className="text-xs font-bold hidden sm:inline">Help &amp; Support</span>
    </Link>
  );
}
