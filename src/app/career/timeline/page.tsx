"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { 
  Calendar, 
  ArrowLeft, 
  FolderGit2, 
  Award, 
  Video, 
  Sparkles,
  AlertCircle
} from "lucide-react";

export const dynamic = "force-dynamic";

export default function CareerTimelinePage() {
  const { user } = useAuth();
  const isAdult = user?.ageBand === "18+";

  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !isAdult) return;
    const loadTimeline = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/career/timeline?userId=${user.uid}`);
        const data = await res.json();
        if (data.events) {
          setEvents(data.events);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadTimeline();
  }, [user, isAdult]);

  if (!isAdult && user) {
    return (
      <div className="min-h-screen bg-[#F4F6FB] flex items-center justify-center p-6">
        <div className="card-quixel max-w-md p-8 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-[#FF7A50] mx-auto" />
          <h2 className="text-xl font-black text-[#181920]">Career Track Feature</h2>
          <p className="text-sm text-[#767E94]">The Career Timeline is exclusively available for Career Track accounts (18+).</p>
          <Link href="/dashboard" className="btn-quixel-primary inline-block">Return to Dashboard</Link>
        </div>
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "evidence": return <FolderGit2 className="w-4 h-4 text-[#5C38FF]" />;
      case "project": return <FolderGit2 className="w-4 h-4 text-[#00C48C]" />;
      case "certification": return <Award className="w-4 h-4 text-[#FFB800]" />;
      case "interview": return <Video className="w-4 h-4 text-[#FF7A50]" />;
      default: return <Sparkles className="w-4 h-4 text-[#5C38FF]" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6FB] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">

        <div className="space-y-1">
          <Link href="/dashboard" className="inline-flex items-center text-xs font-bold text-[#5C38FF] hover:underline mb-1">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EDE8FD] text-[#5C38FF] flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#181920]">Career Timeline</h1>
              <p className="text-xs text-[#767E94]">A verified, chronological record of your career milestones, projects, credentials, and simulations.</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-xs text-[#767E94]">Building career timeline...</div>
        ) : events.length === 0 ? (
          <div className="card-quixel p-12 text-center space-y-3">
            <Calendar className="w-12 h-12 text-[#8E95A5] mx-auto opacity-50" />
            <h3 className="text-base font-black text-[#181920]">No Timeline Milestones Yet</h3>
            <p className="text-xs text-[#767E94] max-w-sm mx-auto">
              Your timeline automatically builds as you complete mock interviews, add projects, and record career evidence.
            </p>
          </div>
        ) : (
          <div className="relative pl-6 border-l-2 border-[#E8ECF2] space-y-6 my-6">
            {events.map((ev, idx) => (
              <div key={ev.id || idx} className="relative group">
                <div className="absolute -left-[31px] top-1.5 w-6 h-6 rounded-full bg-white border-2 border-[#5C38FF] flex items-center justify-center shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-[#5C38FF]" />
                </div>

                <div className="card-quixel p-5 space-y-2 hover:border-[#5C38FF]/40 transition-all">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded-lg bg-[#F4F6FB]">{getIcon(ev.type)}</span>
                      <span className="font-black uppercase tracking-wider text-[10px] text-[#767E94]">{ev.category}</span>
                    </div>
                    <span className="font-mono text-[11px] text-[#767E94]">{ev.date ? new Date(ev.date).toLocaleDateString() : ""}</span>
                  </div>

                  <h3 className="text-sm font-black text-[#181920]">{ev.title}</h3>
                  {ev.description && (
                    <p className="text-xs text-[#767E94]">{ev.description}</p>
                  )}

                  {ev.skills && ev.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {ev.skills.map((s: string, sIdx: number) => (
                        <span key={sIdx} className="text-[10px] font-bold text-[#5C38FF] bg-[#EDE8FD] px-2 py-0.5 rounded">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
