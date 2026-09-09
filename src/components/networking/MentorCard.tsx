"use client";

import React from "react";
import Link from "next/link";
import { MentorProfile } from "@/lib/types";
import { 
  ShieldCheck, 
  Star, 
  Users, 
  Calendar, 
  ArrowRight, 
  ExternalLink, 
  CheckCircle2,
  Building,
  Briefcase
} from "lucide-react";

interface MentorCardProps {
  mentor: MentorProfile;
  onBookSession?: (mentor: MentorProfile) => void;
}

export default function MentorCard({ mentor, onBookSession }: MentorCardProps) {
  return (
    <div className="bg-paper-raised rounded-3xl border border-line shadow-sm hover:shadow-md hover:border-forest/30 transition-all p-6 flex flex-col justify-between space-y-4 group">
      <div className="space-y-3">
        {/* Header & Verification Badge */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-forest text-white font-black text-base flex items-center justify-center shadow-sm">
              {mentor.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-base text-ink group-hover:text-forest transition-colors">
                {mentor.name}
              </h3>
              <p className="text-xs text-ink-muted line-clamp-1">{mentor.role} @ {mentor.company}</p>
            </div>
          </div>

          {mentor.isVerifiedMentor && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-forest/10 text-forest border border-forest/20 text-[10px] font-bold font-mono">
              <ShieldCheck className="w-3 h-3 text-forest" />
              Verified Mentor
            </span>
          )}
        </div>

        {/* Bio */}
        <p className="text-xs text-ink-soft line-clamp-2 leading-relaxed">
          {mentor.bio}
        </p>

        {/* Domains Badges */}
        <div className="flex flex-wrap gap-1">
          {mentor.domains.map((d) => (
            <span
              key={d}
              className="px-2 py-0.5 rounded-md bg-paper-soft text-ink-soft border border-line text-[10px] font-mono"
            >
              {d}
            </span>
          ))}
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between text-xs font-mono text-ink-muted pt-2 border-t border-line">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-gold text-gold" />
            <span className="font-bold text-ink">{mentor.rating.toFixed(1)}</span>
            <span>({mentor.reviewCount} reviews)</span>
          </div>

          <div className="flex items-center gap-1 text-ink-muted">
            <Users className="w-3.5 h-3.5" />
            <span>{mentor.totalMenteesHelped} Mentees</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-line flex items-center justify-between gap-2">
        <Link
          href={`/networking/mentors/${mentor.id}`}
          className="text-xs font-bold text-ink-soft hover:text-ink underline"
        >
          View Profile
        </Link>

        <button
          onClick={() => onBookSession && onBookSession(mentor)}
          className="px-4 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Calendar className="w-3.5 h-3.5 text-forest-300" />
          <span>Book 1:1 Session</span>
        </button>
      </div>
    </div>
  );
}
