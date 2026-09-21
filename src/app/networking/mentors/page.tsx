"use client";

import React, { useState, useEffect } from "react";
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
import { supabase } from "@/lib/supabase";
import { normalizeDisplayName } from "@/lib/services/user-profile";

export const dynamic = "force-dynamic";

export default function MentorsDirectoryPage() {
  const { user } = useAuth();
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<string>("all");
  const [selectedMentor, setSelectedMentor] = useState<MentorProfile | null>(null);

  const DOMAINS = ["all", "Software Engineering", "System Design", "Behavioral Leadership", "Machine Learning", "UI/UX Design"];

  useEffect(() => {
    async function loadMentors() {
      setLoading(true);
      try {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("is_mentor", true)
          .eq("is_public", true);

        if (data && data.length > 0) {
          const mapped: MentorProfile[] = data.map((p) => {
            const { displayName } = normalizeDisplayName(p.first_name, p.last_name, p.name || p.display_name);
            return {
              id: p.id || p.user_id,
              userId: p.user_id || p.id,
              name: displayName || p.name || "Engineering Mentor",
              headline: p.headline || "Industry Mentor",
              bio: p.bio || "Providing 1:1 mentorship and mock interview feedback.",
              company: p.company || "Technology Partner",
              role: p.headline || "Senior Engineer",
              domains: (p.interests || []).map((i: any) => typeof i === "string" ? i : i.name),
              hourlyRate: 0,
              isVerifiedMentor: true,
              rating: p.rating || 5.0,
              reviewCount: p.review_count || 0,
              availabilitySlots: ["Mon 6:30 PM IST", "Thu 7:00 PM IST", "Sat 11:00 AM IST"],
              totalMenteesHelped: p.total_mentees_helped || 0,
              createdAt: p.created_at || new Date().toISOString(),
            };
          });
          setMentors(mapped);
        } else {
          setMentors([]);
        }
      } catch (err) {
        console.warn("[Mentors Load Note]:", err);
        setMentors([]);
      } finally {
        setLoading(false);
      }
    }

    loadMentors();
  }, []);

  const filteredMentors = mentors.filter((m) => {
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
            </div>

            <Link
              href="/networking/become-mentor"
              className="px-4 py-2.5 rounded-xl bg-forest hover:opacity-90 text-white text-xs font-bold shadow-sm transition-all shrink-0"
            >
              Apply as Mentor
            </Link>
          </div>

          {/* Search & Domain Filter Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 pt-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search mentors by name, company, or domain..."
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

        {/* Mentor Cards Grid or Honest Empty State */}
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-forest border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredMentors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map((mentor) => (
              <MentorCard
                key={mentor.id}
                mentor={mentor}
                onBookSession={(m) => setSelectedMentor(m)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-paper-raised rounded-3xl border border-line p-12 text-center space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-paper-soft border border-line text-ink-muted flex items-center justify-center mx-auto">
              <Users className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold font-display text-ink">No Verified Mentors Listed Yet</h3>
              <p className="text-xs text-ink-soft max-w-sm mx-auto leading-relaxed">
                Verified engineering mentors will appear here as they register and get approved. You can also apply to become a mentor.
              </p>
            </div>
            <Link
              href="/networking/become-mentor"
              className="inline-block px-5 py-2.5 rounded-xl bg-forest text-white text-xs font-bold shadow-sm hover:opacity-90 transition-opacity"
            >
              Apply as a Mentor
            </Link>
          </div>
        )}

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
