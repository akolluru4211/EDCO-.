"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { MentorProfile } from "@/lib/types";
import MentorCard from "@/components/networking/MentorCard";
import MentorshipBookingModal from "@/components/networking/MentorshipBookingModal";
import { 
  Search, 
  ShieldCheck, 
  ArrowLeft, 
  Filter, 
  Sparkles,
  Users
} from "lucide-react";

export const dynamic = "force-dynamic";

const ALL_MENTORS: MentorProfile[] = [
  {
    id: "mentor-1",
    userId: "user-mentor-1",
    name: "Dr. Arvind Subramanian",
    headline: "Principal Systems Architect @ CloudScale Labs",
    bio: "12+ years designing high-throughput distributed engines. Helping candidates master Level 2 concurrency, Kafka topologies, and system scalability mocks.",
    company: "CloudScale Labs",
    role: "Principal Architect",
    domains: ["Software Engineering", "System Design", "Distributed Systems"],
    hourlyRate: 0,
    isVerifiedMentor: true,
    rating: 4.9,
    reviewCount: 48,
    availabilitySlots: ["Mon 6:30 PM IST", "Thu 7:00 PM IST", "Sat 11:00 AM IST"],
    totalMenteesHelped: 124,
    createdAt: "2026-01-15T00:00:00Z",
  },
  {
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
  {
    id: "mentor-3",
    userId: "user-mentor-3",
    name: "Karan Mehta",
    headline: "Staff Machine Learning Engineer @ Nexus AI",
    bio: "Specializing in Large Language Model fine-tuning, retrieval systems, and machine learning system design mock interviews.",
    company: "Nexus AI",
    role: "Staff ML Engineer",
    domains: ["Machine Learning", "Python", "Data Science"],
    hourlyRate: 0,
    isVerifiedMentor: true,
    rating: 4.8,
    reviewCount: 22,
    availabilitySlots: ["Wed 7:30 PM IST", "Sat 2:00 PM IST"],
    totalMenteesHelped: 54,
    createdAt: "2026-03-01T00:00:00Z",
  },
  {
    id: "mentor-4",
    userId: "user-mentor-4",
    name: "Rachel Tan",
    headline: "Lead Product Designer @ Canvas Interactive",
    bio: "Portfolio design audits, Figma design system structuring, and product UX problem-solving mock reviews.",
    company: "Canvas Interactive",
    role: "Lead Product Designer",
    domains: ["UI/UX Design", "Product Strategy", "Portfolio Review"],
    hourlyRate: 0,
    isVerifiedMentor: true,
    rating: 4.9,
    reviewCount: 19,
    availabilitySlots: ["Mon 5:00 PM IST", "Fri 6:00 PM IST"],
    totalMenteesHelped: 41,
    createdAt: "2026-04-05T00:00:00Z",
  },
];

export default function MentorsDirectoryPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<string>("all");
  const [selectedMentor, setSelectedMentor] = useState<MentorProfile | null>(null);

  const DOMAINS = ["all", "Software Engineering", "System Design", "Behavioral Leadership", "Machine Learning", "UI/UX Design"];

  const filteredMentors = ALL_MENTORS.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.domains.some((d) => d.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDomain = selectedDomain === "all" || m.domains.includes(selectedDomain);

    return matchesSearch && matchesDomain;
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-paper py-8 px-4 sm:px-6 lg:px-8 text-ink">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-ink-muted">
          <Link href="/networking" className="hover:text-ink flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Networking Hub</span>
          </Link>
          <span>/</span>
          <span className="text-ink font-bold">Mentor Directory</span>
        </div>

        {/* Header */}
        <div className="bg-paper-raised rounded-3xl border border-line p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-forest/10 text-forest text-xs font-bold font-mono border border-forest/20 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-forest" />
                  Verified Engineering Mentors
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold font-display text-ink tracking-tight mt-1">
                Discover Industry Mentors
              </h1>
              <p className="text-xs sm:text-sm text-ink-soft">
                Book calibrated 1:1 sessions for resume audits, architecture deep-dives, and mock interview guidance.
              </p>
            </div>
          </div>

          {/* Search & Domain Filter Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 pt-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search mentors by name, company (e.g. Stripe), or topic..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-line bg-paper text-ink text-xs focus:ring-2 focus:ring-forest focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              {DOMAINS.map((domain) => (
                <button
                  key={domain}
                  onClick={() => setSelectedDomain(domain)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-all ${
                    selectedDomain === domain
                      ? "bg-forest text-white shadow-sm"
                      : "bg-paper-raised border border-line text-ink-soft hover:text-ink hover:bg-paper-soft"
                  }`}
                >
                  {domain === "all" ? "All Domains" : domain}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mentor Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMentors.map((mentor) => (
            <MentorCard
              key={mentor.id}
              mentor={mentor}
              onBookSession={(m) => setSelectedMentor(m)}
            />
          ))}
        </div>

        {/* Booking Modal */}
        <MentorshipBookingModal
          mentor={selectedMentor}
          isOpen={!!selectedMentor}
          onClose={() => setSelectedMentor(null)}
          userAgeBand={user?.ageBand || "18+"}
          onRequestBooking={async () => {}}
        />
      </div>
    </div>
  );
}
