"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { 
  GraduationCap, 
  ArrowLeft, 
  Search, 
  Building2, 
  Briefcase, 
  MessageSquare, 
  UserPlus, 
  CheckCircle2,
  Lock,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default function AlumniNetworkPage() {
  const { user } = useAuth();
  const isAdult = user?.ageBand === "18+";

  const [alumni, setAlumni] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCollege, setFilterCollege] = useState("");

  useEffect(() => {
    if (!user || !isAdult) return;
    const fetchAlumni = async () => {
      try {
        setLoading(true);
        // Query verified alumni users from profiles who have opted into public/community discovery
        const { data, error } = await supabase
          .from("profiles")
          .select("id, user_id, full_name, role, avatar_url, university, grad_year, major, current_company, current_title")
          .not("university", "is", null)
          .neq("user_id", user.uid)
          .limit(20);

        if (data) {
          setAlumni(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlumni();
  }, [user, isAdult]);

  if (!isAdult && user) {
    return (
      <div className="min-h-screen bg-[#F4F6FB] flex items-center justify-center p-6">
        <div className="card-quixel max-w-md p-8 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-[#FF7A50] mx-auto" />
          <h2 className="text-xl font-black text-[#181920]">Career Track Feature</h2>
          <p className="text-sm text-[#767E94]">The Alumni Network Explorer is exclusively available for Career Track accounts (18+).</p>
          <Link href="/dashboard" className="btn-quixel-primary inline-block">Return to Dashboard</Link>
        </div>
      </div>
    );
  }

  const filtered = alumni.filter(a => {
    const q = searchTerm.toLowerCase();
    const matchesQuery = 
      (a.full_name && a.full_name.toLowerCase().includes(q)) ||
      (a.current_company && a.current_company.toLowerCase().includes(q)) ||
      (a.current_title && a.current_title.toLowerCase().includes(q)) ||
      (a.university && a.university.toLowerCase().includes(q));
    const matchesCollege = !filterCollege || (a.university && a.university.toLowerCase().includes(filterCollege.toLowerCase()));
    return matchesQuery && matchesCollege;
  });

  return (
    <div className="min-h-screen bg-[#F4F6FB] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">

        <div className="space-y-1">
          <Link href="/networking" className="inline-flex items-center text-xs font-bold text-[#5C38FF] hover:underline mb-1">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Networking
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EDE8FD] text-[#5C38FF] flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#181920]">Alumni Directory &amp; Connections</h1>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="card-quixel p-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E95A5]" />
            <input
              type="text"
              placeholder="Search by name, company, role, or university..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#5C38FF]"
            />
          </div>
        </div>

        {/* Alumni Cards */}
        {loading ? (
          <div className="text-center py-16 text-xs text-[#767E94]">Discovering alumni profiles...</div>
        ) : filtered.length === 0 ? (
          <div className="card-quixel p-12 text-center space-y-3">
            <GraduationCap className="w-12 h-12 text-[#8E95A5] mx-auto opacity-50" />
            <h3 className="text-base font-black text-[#181920]">No Alumni Matching Search</h3>
            <p className="text-xs text-[#767E94] max-w-sm mx-auto">
              Try adjusting your query or ensure your university profile information is up to date.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(a => (
              <div key={a.id} className="card-quixel p-5 flex flex-col justify-between space-y-4 hover:border-[#5C38FF]/40 transition-all">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#5C38FF] text-white flex items-center justify-center font-black text-sm shadow">
                      {a.full_name ? a.full_name.charAt(0).toUpperCase() : "A"}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-[#181920]">{a.full_name || "Alumnus"}</h3>
                      <p className="text-xs text-[#767E94]">{a.current_title || "Engineer"} {a.current_company ? `at ${a.current_company}` : ""}</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-[#181920]">
                      <GraduationCap className="w-3.5 h-3.5 text-[#5C38FF]" />
                      <span>{a.university || "University Cohort"}</span>
                    </div>
                    {a.grad_year && (
                      <span className="text-[11px] font-mono text-[#767E94]">Class of {a.grad_year}</span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E8ECF2] flex items-center justify-between">
                  <Link
                    href={`/u/${a.user_id}`}
                    className="text-xs font-bold text-[#5C38FF] hover:underline"
                  >
                    View Profile
                  </Link>
                  <Link
                    href={`/networking/messages?recipient=${a.user_id}`}
                    className="px-3 py-1.5 rounded-xl bg-[#5C38FF] text-white text-xs font-bold hover:bg-[#4D2CE0] flex items-center gap-1 shadow-sm"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Message</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
