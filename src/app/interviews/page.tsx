"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AVAILABLE_CATEGORIES } from "@/lib/constants";
import { InterviewSession, SkillLevel } from "@/lib/types";
import { getDifficultyBadgeColor, getDifficultyLabel } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { 
  Video, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  TrendingUp, 
  Award, 
  Clock, 
  BarChart3,
  HelpCircle,
  Zap,
  Lock,
  Compass
} from "lucide-react";
import EventTicket from "@/components/ui/EventTicket";
import AuthGuard from "@/components/auth/AuthGuard";
import UserGreeting from "@/components/ui/UserGreeting";
import SpotlightCard from "@/components/ui/SpotlightCard";
import BorderBeam from "@/components/ui/BorderBeam";
import ShimmerBadge from "@/components/ui/ShimmerBadge";
import AnimatedCounter from "@/components/ui/AnimatedCounter";

export const dynamic = "force-dynamic";

export default function InterviewsHubPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);

  // Career Track Gating: 18+ only
  const isMinorUser = user ? user.ageBand !== "18+" : false;

  useEffect(() => {
    if (!user || isMinorUser) {
      setSessions([]);
      return;
    }

    const loadSessions = async () => {
      // 1. Fetch from Supabase
      try {
        const { data, error } = await supabase
          .from("interview_sessions")
          .select("*")
          .eq("user_id", user.uid)
          .order("created_at", { ascending: false });

        if (data && data.length > 0) {
          const list: InterviewSession[] = data.map((d) => ({
            id: d.id,
            userId: d.user_id,
            questionId: d.questions?.[0]?.id || "swe-0-1",
            questionText: d.questions?.[0]?.text || "Interview Question",
            category: d.category,
            difficultyLevel: d.difficulty_level as SkillLevel,
            transcript: d.questions?.[0]?.transcript || "",
            contentScore: d.overall_score || 85,
            voiceScore: d.metrics?.voiceDelivery || 80,
            expressionScore: d.metrics?.facialEngagement || 75,
            overallScore: d.overall_score || 82,
            metrics: d.metrics || {
              wordsPerMinute: 130,
              fillerWordCount: 2,
              fillerWordsUsed: ["um"],
              speechPaceRating: "ideal",
              clarityScore: 85,
              structureRating: "Excellent (STAR structure)",
              engagementScore: 80,
            },
            feedback: {
              strengths: ["Clear STAR format", "Strong technical depth"],
              areasForImprovement: ["Add quantified metric benchmarks"],
              tone: "encouraging",
              detailedSummary: "Excellent response covering foundational concepts with clear architecture breakdown.",
              nextPracticeAdvice: "Continue onto Level 1 Applied Concurrency scenarios.",
            },
            createdAt: d.created_at,
          }));
          setSessions(list);
          localStorage.setItem(`edworld_${user.uid}_interview_sessions`, JSON.stringify(list));
          return;
        }
      } catch (err) {
        console.warn("[Supabase Sessions Load Note]", err);
      }

      // 2. Check user-scoped cache
      const cached = localStorage.getItem(`edworld_${user.uid}_interview_sessions`);
      if (cached) {
        try {
          setSessions(JSON.parse(cached));
        } catch (e) {}
      }
    };

    loadSessions();
  }, [user, isMinorUser]);

  const getEffectiveLevelForCategory = (catId: string, catName: string): SkillLevel => {
    const found = profile?.interests?.find(
      (i) => i.id === catId || i.name.toLowerCase() === catName.toLowerCase()
    );
    return found ? found.effectiveLevel : 0;
  };

  // Under-18 Minor Gating Screen
  if (isMinorUser) {
    return (
      <AuthGuard>
        <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-6 bg-[#F4F6FB]">
          <div className="max-w-md w-full bg-white rounded-4xl border border-[#E8ECF2] shadow-quixel p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-[#FFF6DC] border border-[#FFB800]/30 text-[#FFB800] flex items-center justify-center mx-auto shadow-sm">
              <Lock className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-[#FFF6DC] text-[#FFB800] text-xs font-mono font-bold uppercase tracking-wider border border-[#FFB800]/30">
                {user?.ageBand === "13-15" ? "Junior Track" : "Explorer Track"}
              </span>
              <h1 className="text-2xl font-black text-[#181920] tracking-tight">
                Full AI Interview Studio is for Career Track (18+)
              </h1>
              <p className="text-xs text-[#8E95A5] leading-relaxed">
                Minors practice presentation and verbal clarity inside the School Communication Trainer and Curiosity Quests.
              </p>
            </div>
            <Link
              href="/school/trainer"
              className="w-full py-3.5 px-4 rounded-2xl bg-[#13141B] hover:bg-[#252632] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Open School Communication Trainer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </AuthGuard>
    );
  }

  // Compute trend metrics
  const sortedByDateAsc = [...sessions].reverse();
  const recentScore = sessions[0]?.overallScore || 0;
  const avgScore = sessions.length > 0
    ? Math.round(sessions.reduce((acc, s) => acc + s.overallScore, 0) / sessions.length)
    : 0;

  return (
    <AuthGuard>
      <div className="min-h-[calc(100vh-5rem)] bg-[#F4F6FB] text-[#181920] pb-16">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8 animate-in fade-in duration-300">
        
        {/* Header */}
        <div className="card-quixel p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider bg-[#13141B] text-[#D7FC51] px-3 py-1 rounded-xl">
                Career Track
              </span>
              <span className="text-xs font-mono text-[#8E95A5]">Adaptive Mock Interviews</span>
            </div>
            <UserGreeting
              context="interview"
              subtitle="Questions are dynamically selected to match your demonstrated Effective Level. Scoring ≥ 80% advances your level."
            />
          </div>

          <div className="p-5 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] flex items-start gap-3 max-w-sm text-xs text-[#181920] shadow-sm">
            <TrendingUp className="w-5 h-5 text-[#00D2B4] shrink-0 mt-0.5" />
            <div>
              <p className="font-black text-sm text-[#181920]">Dynamic Level Calibration</p>
              <p className="text-[#767E94] text-[11px] mt-0.5 leading-relaxed">
                Every interview delivers Whisper speech scoring, delivery pacing analysis, and automatically nudges your effective skill level.
              </p>
            </div>
          </div>
        </div>

        {/* Upgraded Interview Format Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#7B57FF] bg-[#EDE8FD] border border-[#7B57FF]/30 px-3 py-1 rounded-full">
                Upgraded Formats
              </span>
              <h2 className="text-2xl font-black text-[#181920] tracking-tight mt-1">Choose Interview Mode</h2>
              <p className="text-xs text-[#767E94]">Practice standard verbal interviews, live sandboxed coding rounds, or multi-persona group discussions</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Format 1: Standard Mock Interview */}
            <SpotlightCard
              spotlightColor="rgba(123, 87, 255, 0.16)"
              spotlightSize={320}
              className="card-quixel p-6 sm:p-7 border-2 border-[#13141B] shadow-quixel space-y-4 flex flex-col justify-between card-lift-glow"
            >
              <BorderBeam size={180} duration={10} colorFrom="#7B57FF" colorTo="#00D2B4" />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-[#EDE8FD] text-[#7B57FF] flex items-center justify-center relative">
                    <span className="radar-pulse-ring text-[#7B57FF]" />
                    <Video className="w-6 h-6 animate-float-gentle" />
                  </div>
                  {/* Animated Waveform Simulation */}
                  <div className="waveform-bars-container">
                    <div className="waveform-bar bg-[#7B57FF]" />
                    <div className="waveform-bar bg-[#7B57FF]" />
                    <div className="waveform-bar bg-[#7B57FF]" />
                    <div className="waveform-bar bg-[#7B57FF]" />
                    <div className="waveform-bar bg-[#7B57FF]" />
                  </div>
                </div>
                <h3 className="font-black text-[#181920] text-lg">Standard Verbal Studio</h3>
                <p className="text-xs text-[#767E94] leading-relaxed">
                  Verbal Q&amp;A with Whisper speech transcription, STAR structure evaluation, pacing, and filler word tracking.
                </p>
              </div>
              <Link
                href="/interviews/swe"
                className="btn-shine w-full py-3 rounded-2xl bg-[#13141B] hover:bg-[#252632] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all hover:scale-102 active:scale-98"
              >
                <span>Launch Verbal Session</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </SpotlightCard>

            {/* Format 2: Sandboxed Coding Round */}
            <SpotlightCard
              spotlightColor="rgba(0, 210, 180, 0.16)"
              spotlightSize={320}
              className="card-quixel card-quixel-interactive p-6 sm:p-7 space-y-4 flex flex-col justify-between card-lift-glow"
            >
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-2xl bg-[#E0FAF6] text-[#00D2B4] flex items-center justify-center">
                  <Zap className="w-6 h-6 text-[#00D2B4] animate-bounce" />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-[#181920] text-lg">Live Coding Sandbox</h3>
                  <span className="text-[10px] font-black text-[#00D2B4] bg-[#E0FAF6] px-2.5 py-0.5 rounded-full border border-[#00D2B4]/30">
                    Interactive
                  </span>
                </div>
                <p className="text-xs text-[#767E94] leading-relaxed">
                  Real code editor with isolated sandboxed execution, unit test case runner (pass/fail), and timeout protection.
                </p>
              </div>
              <Link
                href="/interviews/swe?format=coding"
                className="btn-shine w-full py-3 rounded-2xl bg-[#13141B] hover:bg-[#252632] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all hover:scale-102 active:scale-98"
              >
                <span>Launch Coding Round</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </SpotlightCard>

            {/* Format 3: AI Group Discussion */}
            <SpotlightCard
              spotlightColor="rgba(255, 184, 0, 0.18)"
              spotlightSize={320}
              className="card-quixel card-quixel-interactive p-6 sm:p-7 space-y-4 flex flex-col justify-between card-lift-glow"
            >
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-2xl bg-[#FFF6DC] text-[#FFB800] flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-[#FFB800] animate-pulse" />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-[#181920] text-lg">AI Group Discussion</h3>
                  <span className="text-[10px] font-black text-[#FF7A50] bg-[#FFEFEA] px-2.5 py-0.5 rounded-full border border-[#FF7A50]/30">
                    Pro Gated
                  </span>
                </div>
                <p className="text-xs text-[#767E94] leading-relaxed">
                  Simulated round-table with 2-3 AI personas with opposing viewpoints, turn-taking state machine, and collaboration scoring.
                </p>
              </div>
              <Link
                href="/interviews/behavioral?format=group_discussion"
                className="btn-shine w-full py-3 rounded-2xl bg-[#13141B] hover:bg-[#252632] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all hover:scale-102 active:scale-98"
              >
                <span>Launch Discussion</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </SpotlightCard>
          </div>
        </div>

        {/* Live Practice Day Passes & Workshop Tickets */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-[#181920] tracking-tight">Your Active Event &amp; Studio Passes</h2>
              <p className="text-xs text-[#767E94]">Holographic passes for live AI mock evaluation &amp; peer career events</p>
            </div>
            <span className="text-xs font-black text-[#00D2B4] bg-[#E0FAF6] px-3 py-1 rounded-full border border-[#00D2B4]/30">
              2 Active Passes
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-8 pt-2">
            <EventTicket
              passType="AI Studio Pass"
              eventName="Full-Stack Mock Sprint"
              date="Today &bull; Unlimited Entry"
              venue="Edworld Online Studio"
              seatCode="SEAT-A1"
              attendeeName={user?.name || "Candidate"}
              onClick={() => router.push("/interviews/swe")}
            />

            <EventTicket
              passType="Masterclass Pass"
              eventName="STAR Behavioral Strategy"
              date="Saturday 4:00 PM IST"
              venue="Live Interactive Stage"
              seatCode="SEAT-E7"
              attendeeName={user?.name || "Candidate"}
              onClick={() => router.push("/interviews/behavioral")}
            />
          </div>
        </div>

        {/* Score Trend Summary (if history exists) */}
        {sessions.length > 0 && (
          <div className="card-quixel p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-[#181920] text-base">Performance Trend &bull; Recent Sessions</h3>
                <p className="text-xs text-[#767E94]">Average Score: {avgScore}% across {sessions.length} sessions</p>
              </div>
              <span className="text-xs font-mono font-black text-[#00D2B4] bg-[#E0FAF6] px-3 py-1 rounded-full border border-[#00D2B4]/30">
                Latest: {recentScore}%
              </span>
            </div>

            {/* Score History Bars */}
            <div className="flex items-end gap-2 h-24 pt-4 border-t border-[#F0F2F6] overflow-x-auto">
              {sortedByDateAsc.slice(-10).map((s, idx) => (
                <div key={s.id || idx} className="flex-1 min-w-[32px] flex flex-col items-center gap-1 group">
                  <span className="text-[10px] font-mono text-[#8E95A5] opacity-0 group-hover:opacity-100 transition-opacity">
                    {s.overallScore}%
                  </span>
                  <div
                    className={`w-full rounded-t-xl transition-all ${
                      s.overallScore >= 80 ? "bg-[#00D2B4]" : s.overallScore >= 65 ? "bg-[#7B57FF]" : "bg-[#FFB800]"
                    }`}
                    style={{ height: `${Math.max(12, (s.overallScore / 100) * 64)}px` }}
                  />
                  <span className="text-[9px] font-mono text-[#8E95A5] truncate max-w-full">
                    {s.category.split(" ")[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category Selection Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-[#181920] tracking-tight">Select Practice Track</h2>
            <span className="text-xs font-bold text-[#767E94]">5 Calibrated Tracks</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {AVAILABLE_CATEGORIES.map((cat) => {
              const currentLevel = getEffectiveLevelForCategory(cat.id, cat.name);

              return (
                <div
                  key={cat.id}
                  className="card-quixel card-quixel-interactive p-6 sm:p-7 flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="w-11 h-11 rounded-2xl bg-[#EDE8FD] text-[#7B57FF] flex items-center justify-center font-bold group-hover:bg-[#7B57FF] group-hover:text-white transition-colors">
                        <Video className="w-5 h-5" />
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${getDifficultyBadgeColor(currentLevel)}`}>
                        {getDifficultyLabel(currentLevel)}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-black text-[#181920] text-lg group-hover:text-[#7B57FF] transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-[#767E94] mt-1 leading-relaxed">{cat.description}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#F0F2F6] flex items-center justify-between">
                    <span className="text-[11px] text-[#8E95A5] font-mono">
                      Level {currentLevel} Ready
                    </span>
                    <Link
                      href={`/interviews/${cat.id}`}
                      className="px-4 py-2 rounded-2xl bg-[#13141B] hover:bg-[#252632] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
                    >
                      <span>Start Studio</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Previous Sessions & Score History */}
        <div className="card-quixel p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between border-b border-[#F0F2F6] pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#7B57FF]" />
              <h2 className="text-xl font-black text-[#181920]">Recorded Interview Sessions</h2>
            </div>
            <span className="text-xs text-[#767E94] font-bold">{sessions.length} Recorded Sessions</span>
          </div>

          {sessions.length > 0 ? (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="p-4 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-[#181920]">{session.category}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${getDifficultyBadgeColor(session.difficultyLevel)}`}>
                        Level {session.difficultyLevel}
                      </span>
                      {session.effectiveLevelChange?.nudged && (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#E0FAF6] text-[#00D2B4] text-[10px] font-black flex items-center gap-1 border border-[#00D2B4]/30">
                          <Zap className="w-3 h-3" />
                          Nudge: {session.effectiveLevelChange.previousLevel} &rarr; {session.effectiveLevelChange.newLevel}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#767E94] line-clamp-1">{session.questionText}</p>
                    <div className="flex items-center gap-3 text-[11px] text-[#8E95A5]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(session.createdAt).toLocaleDateString()}
                      </span>
                      <span>Content: {session.contentScore}%</span>
                      <span>Voice: {session.voiceScore}%</span>
                      {session.expressionScore > 0 && <span>Engagement: {session.expressionScore}%</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <span className="text-2xl font-black text-[#00D2B4]">{session.overallScore}%</span>
                      <p className="text-[10px] font-black uppercase tracking-wider text-[#8E95A5]">Overall</p>
                    </div>
                    <Link
                      href={`/interviews/results/${session.id}`}
                      className="px-4 py-2 rounded-2xl bg-white border border-[#E8ECF2] text-[#181920] hover:bg-[#F4F6FB] text-xs font-bold shadow-sm transition-all"
                    >
                      View Report
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-[#8E95A5] bg-[#F4F6FB] rounded-2xl border border-[#E8ECF2]">
              No interview sessions recorded yet. Pick a track above to practice your first question!
            </div>
          )}
        </div>
        </div>
      </div>
    </AuthGuard>
  );
}
