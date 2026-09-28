"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  ShieldCheck, 
  Copy, 
  Check, 
  ExternalLink, 
  Share2, 
  Download,
  Sparkles,
  MapPin,
  Building2,
  GraduationCap
} from "lucide-react";
import { formatEdworldId } from "@/lib/utils";

export interface EdworldDigitalIdCardProps {
  userId?: string;
  name?: string;
  headline?: string;
  email?: string;
  username?: string;
  avatarUrl?: string | null;
  organization?: string;
  college?: string;
  location?: string;
  role?: string;
  careerStage?: string;
  isPublic?: boolean;
}

export default function EdworldDigitalIdCard({
  userId,
  name = "Edworld Member",
  headline = "Software Engineer & Builder",
  email,
  username,
  avatarUrl,
  organization,
  college,
  location,
  role,
  careerStage = "PROFESSIONAL",
  isPublic = true
}: EdworldDigitalIdCardProps) {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const edworldId = formatEdworldId(userId);
  const publicSlug = username || userId || "member";
  const publicProfileUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/u/${publicSlug}` 
    : `https://www.edworld.co.in/u/${publicSlug}`;

  const displayName = name.trim() || "Edworld Member";
  const userInitial = displayName.charAt(0).toUpperCase();

  const handleCopyId = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(edworldId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2500);
    }
  };

  const handleCopyProfileLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(publicProfileUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleDownloadCard = () => {
    setIsDownloading(true);
    // Simple, reliable clean print or image capture action
    try {
      const cardElement = document.getElementById("edworld-digital-id-card");
      if (cardElement && typeof window !== "undefined") {
        window.print();
      }
    } catch (e) {
      console.error("Card print error:", e);
    } finally {
      setTimeout(() => setIsDownloading(false), 1000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Digital ID Card Surface */}
      <div
        id="edworld-digital-id-card"
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 via-stone-900 to-stone-950 text-white p-6 sm:p-8 border border-stone-800 shadow-xl"
      >
        {/* Subtle Decorative Geometric Accents (Editorial, Non-Neon) */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />

        {/* Card Header: Brand Logo + ID Badge */}
        <div className="relative z-10 flex items-center justify-between gap-4 border-b border-stone-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-stone-800 border border-stone-700/60 p-1 flex items-center justify-center shrink-0 shadow-sm">
              <Image
                src="/images/edworld-logo.png"
                alt="Edworld Logo"
                width={26}
                height={26}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <span className="text-sm font-black tracking-tight text-white flex items-center gap-1 font-sans leading-none">
                Edworld <span className="text-emerald-400 font-extrabold">Co.</span>
              </span>
              <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mt-1 block">
                Digital Career Identity
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-bold border border-emerald-800/80 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Member</span>
            </span>
          </div>
        </div>

        {/* Card Body: User Avatar + Name + Headline + Metadata */}
        <div className="relative z-10 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-serif font-bold text-2xl flex items-center justify-center shadow-lg shrink-0 border border-emerald-400/20">
              {userInitial}
            </div>

            <div className="space-y-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight leading-snug truncate">
                {displayName}
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 font-medium line-clamp-1">
                {headline}
              </p>
              {email && (
                <p className="text-[11px] text-stone-400 font-mono pt-0.5 truncate">
                  {email}
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Organization / College / Location */}
          <div className="flex flex-col sm:items-end text-xs text-stone-400 space-y-1 font-medium">
            {organization && (
              <span className="flex items-center gap-1.5 text-stone-300">
                <Building2 className="w-3.5 h-3.5 text-stone-500" />
                <span>{organization}</span>
              </span>
            )}
            {college && (
              <span className="flex items-center gap-1.5 text-stone-300">
                <GraduationCap className="w-3.5 h-3.5 text-stone-500" />
                <span>{college}</span>
              </span>
            )}
            {location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-stone-500" />
                <span>{location}</span>
              </span>
            )}
          </div>
        </div>

        {/* Card Footer: Edworld ID + Format */}
        <div className="relative z-10 pt-5 border-t border-stone-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">
              Edworld ID:
            </span>
            <span className="font-mono text-xs sm:text-sm font-bold text-emerald-400 tracking-wider bg-stone-800/80 px-2.5 py-1 rounded-lg border border-stone-700/60">
              {edworldId}
            </span>
            <button
              type="button"
              onClick={handleCopyId}
              title="Copy Edworld ID"
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
            >
              {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="text-[10px] text-stone-500 font-mono">
            Auth Level: Career Verified
          </div>
        </div>
      </div>

      {/* Card Action Controls */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          type="button"
          onClick={handleCopyId}
          className="px-3.5 py-2 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
        >
          {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-500" />}
          <span>{copiedId ? "ID Copied" : "Copy ID"}</span>
        </button>

        <button
          type="button"
          onClick={handleCopyProfileLink}
          className="px-3.5 py-2 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
        >
          {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-stone-500" />}
          <span>{copiedLink ? "Link Copied" : "Share Profile"}</span>
        </button>

        <Link
          href={`/u/${publicSlug}`}
          target="_blank"
          className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
        >
          <span>View Public Profile</span>
          <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
        </Link>
      </div>
    </div>
  );
}
