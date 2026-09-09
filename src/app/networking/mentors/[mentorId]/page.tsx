"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { MentorProfile } from "@/lib/types";
import MentorshipBookingModal from "@/components/networking/MentorshipBookingModal";
import { 
  ShieldCheck, 
  Star, 
  Users, 
  Calendar, 
  ArrowLeft, 
  Building, 
  Briefcase, 
  ExternalLink, 
  CheckCircle2,
  Clock,
  Sparkles
} from "lucide-react";

export const dynamic = "force-dynamic";

const MENTOR_DATA: Record<string, MentorProfile> = {
  "mentor-1": {
    id: "mentor-1",
    userId: "user-mentor-1",
    name: "Dr. Arvind Subramanian",
    headline: "Principal Systems Architect @ CloudScale Labs",
    bio: "12+ years designing high-throughput distributed engines. Helping candidates master Level 2 concurrency, Kafka topologies, and system scalability mocks. Previously Staff Engineer at Amazon AWS.",
    company: "CloudScale Labs",
    role: "Principal Architect",
    domains: ["Software Engineering", "System Design", "Distributed Systems"],
    hourlyRate: 0,
    isVerifiedMentor: true,
    rating: 4.9,
    reviewCount: 48,
    availabilitySlots: ["Mon 6:30 PM IST", "Thu 7:00 PM IST", "Sat 11:00 AM IST"],
    linkedInUrl: "https://linkedin.com/in/arvind-subramanian",
    githubUrl: "https://github.com/asubramanian-scale",
    totalMenteesHelped: 124,
    createdAt: "2026-01-15T00:00:00Z",
  },
  "mentor-2": {
    id: "mentor-2",
    userId: "user-mentor-2",
    name: "Pooja Hegde",
    headline: "Senior Engineering Manager @ FinTech Innovations",
    bio: "Ex-Stripe engineer passionate about behavioral STAR communication, behavioral leadership interviews, and junior engineering career acceleration.",
    company: "FinTech Innovations",
    role: "Senior Engineering Manager",
    domains: ["Behavioral Leadership", "Frontend Architecture", "Career Growth"],
    hourlyRate: 0,
    isVerifiedMentor: true,
    rating: 5.0,
    reviewCount: 36,
    availabilitySlots: ["Tue 6:00 PM IST", "Sun 4:00 PM IST"],
    totalMenteesHelped: 89,
    createdAt: "2026-02-10T00:00:00Z",
  },
};

export default function MentorProfileDetailPage() {
  const params = useParams();
  const mentorId = params.mentorId as string;
  const { user } = useAuth();
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const mentor = MENTOR_DATA[mentorId] || MENTOR_DATA["mentor-1"];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
          <Link href="/networking/mentors" className="hover:text-slate-900 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Mentor Directory</span>
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-bold">{mentor.name}</span>
        </div>

        {/* Hero Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white font-black text-xl flex items-center justify-center shadow-md">
                {mentor.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900">{mentor.name}</h1>
                  {mentor.isVerifiedMentor && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold font-mono">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 font-medium">{mentor.headline}</p>
                <div className="flex items-center gap-3 text-xs text-slate-500 font-mono pt-1">
                  <span className="flex items-center gap-1">
                    <Building className="w-3.5 h-3.5" />
                    {mentor.company}
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5" />
                    {mentor.role}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsBookingOpen(true)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <Calendar className="w-4 h-4 text-brand-300" />
              <span>Book 1:1 Session</span>
            </button>
          </div>

          {/* Bio & Details */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
              About Mentorship &amp; Focus Areas
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {mentor.bio}
            </p>
          </div>

          {/* Domains */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
              Mentorship Domains
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {mentor.domains.map((d) => (
                <span
                  key={d}
                  className="px-3 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-mono font-bold"
                >
                  {d}
                </span>
              ))}
            </div>
          </div>

          {/* Availability Slots */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-600" />
              <span>Standard Weekly Availability</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              {mentor.availabilitySlots.map((slot) => (
                <div key={slot} className="p-2.5 bg-white rounded-xl border border-slate-200 text-slate-800 font-mono text-center">
                  {slot}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Booking Modal */}
        <MentorshipBookingModal
          mentor={mentor}
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
          userAgeBand={user?.ageBand || "18+"}
          onRequestBooking={async () => {}}
        />
      </div>
    </div>
  );
}
