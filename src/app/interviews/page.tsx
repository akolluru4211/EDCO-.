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
  Compass,
  MessageSquare,
  Activity,
  Flame,
  Volume2
} from "lucide-react";
import EventTicket from "@/components/ui/EventTicket";
import AuthGuard from "@/components/auth/AuthGuard";
import UserGreeting from "@/components/ui/UserGreeting";
import SpotlightCard from "@/components/ui/SpotlightCard";
import BorderBeam from "@/components/ui/BorderBeam";
import ShimmerBadge from "@/components/ui/ShimmerBadge";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import DailyPracticeCard from "@/components/interview/DailyPracticeCard";
import SpeakingHabitsTracker from "@/components/interview/SpeakingHabitsTracker";

export const dynamic = "force-dynamic";

export default function InterviewsHubPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [commProfile, setCommProfile] = useState<any>(null);

  // Career Track Gating: 18+ only
  const isMinorUser = user ? user.ageBand !== "18+" : false;

  useEffect(() => {
    if (!user || isMinorUser) {
      setSessions([]);
      return;
    }

    const loadSessionsAndCommProfile = async () => {
      // 1. Fetch Sessions from Supabase
      try {
        const { data } = await supabase
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
        }
      } catch (err) {
        console.warn("[Supabase Sessions Load Note]", err);
      }

      // 2. Fetch Communication Profile from Supabase
      try {
        const { data: profileData } = await supabase
          .from("communication_profiles")
          .select("*")
          .eq("user_id", user.uid)
          .maybeSingle();

        if (profileData) {
          setCommProfile(profileData);
        }
      } catch (cpErr) {
        console.warn("[Fetch Comm Profile Note]:", cpErr);
      }
    };

    loadSessionsAndCommProfile();
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
              <span className="text-xs font-mono text-[#8E95A5]">Adaptive Mock Interviews + Language Trainer</span>
            </div>
            <UserGreeting
              context="interview"
              subtitle="Evaluate technical correctness and train English fluency, filler-word reduction, and STAR structure across interviews."
            />
          </div>

          <div className="p-5 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] flex items-start gap-3 max-w-sm text-xs text-[#181920] shadow-sm">
            <TrendingUp className="w-5 h-5 text-[#00D2B4] shrink-0 mt-0.5" />
            <div>
              <p className="font-black text-sm text-[#181920]">Personalized Language Coach</p>
              <p className="text-[#767E94] text-[11px] mt-0.5 leading-relaxed">
                Tracks filler words, sentence length, and pacing over time with instant "What You Said" vs "Better Way to Say It" guidance.
              </p>
            </div>
          </div>
        </div>

        {/* 1. Daily Personalized Practice Drill Card */}
        <DailyPracticeCard
          focusArea={commProfile?.primary_weakness ? `Targeting ${commProfile.primary_weakness.replace("_", " ")}` : "Reducing filler words & pacing"}
          task={commProfile?.recommended_focus?.[0] ? `Answer in 60s: "Can you describe a key technical project you built and how you solved the hardest bug?"` : 'Answer in 60s: "Tell me about a technical project you are proud of."'}
        />

        {/* 2. Upgraded Formats: Standard Verbal, Language Training Drills, Sandbox, Group Discussion */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#7B57FF] bg-[#EDE8FD] border border-[#7B57FF]/30 px-3 py-1 rounded-full">
                Practice Formats
              </span>
              <h2 className="text-2xl font-black text-[#181920] tracking-tight mt-1">Choose Interview Mode</h2>
              <p className="text-xs text-[#767E94]">Practice verbal Q&amp;A, standalone language training drills, live coding, or group discussions.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Format 1: Standalone Language Training Drills */}
            <SpotlightCard
              spotlightColor="rgba(215, 252, 81, 0.2)"
              spotlightSize={300}
              className="card-quixel p-5 border-2 border-[#13141B] shadow-quixel space-y-3 flex flex-col justify-between"
            >
              <BorderBeam size={160} duration={8} colorFrom="#D7FC51" colorTo="#00D2B4" />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-[#13141B] text-[#D7FC51] flex items-center justify-center font-bold">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-950 bg-[#D7FC51] px-2 py-0.5 rounded-full">
                    NEW &bull; Fast Drill
                  </span>
                </div>
                <h3 className="font-black text-[#181920] text-base">Language Training</h3>
                <p className="text-xs text-[#767E94] leading-relaxed">
                  Rapid 60-second spoken drills with live speech-to-text, filler counting, and "Try Again" attempt comparison.
                </p>
              </div>
              <Link
                href="/interviews/language-training"
                className="btn-shine w-full py-2.5 rounded-2xl bg-[#13141B] hover:bg-black text-[#D7FC51] text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all hover:scale-102"
              >
                <span>Launch Language Drills</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </SpotlightCard>

            {/* Format 2: Standard Full Verbal Studio */}
            <SpotlightCard
              spotlightColor="rgba(123, 87, 255, 0.16)"
              spotlightSize={300}
              className="card-quixel p-5 border border-[#E8ECF2] shadow-sm space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-[#EDE8FD] text-[#7B57FF] flex items-center justify-center">
                  <Video className="w-5 h-5" />
                </div>
                <h3 className="font-black text-[#181920] text-base">Full Verbal Studio</h3>
                <p className="text-xs text-[#767E94] leading-relaxed">
                  Multi-question verbal interview with camera engagement, STAR rubric scoring, and level progression.
                </p>
              </div>
              <Link
                href="/interviews/swe"
                className="w-full py-2.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <span>Launch Verbal Session</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </SpotlightCard>

            {/* Format 3: Sandboxed Coding Round */}
            <SpotlightCard
              spotlightColor="rgba(0, 210, 180, 0.16)"
              spotlightSize={300}
              className="card-quixel p-5 border border-[#E8ECF2] shadow-sm space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-[#E0FAF6] text-[#00D2B4] flex items-center justify-center">
                  <Zap className="w-5 h-5 text-[#00D2B4]" />
                </div>
                <h3 className="font-black text-[#181920] text-base">Live Coding Round</h3>
                <p className="text-xs text-[#767E94] leading-relaxed">
                  Integrated code editor with isolated sandboxed execution, unit test runner, and complexity analysis.
                </p>
              </div>
              <Link
                href="/interviews/swe?format=coding"
                className="w-full py-2.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <span>Launch Coding Round</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </SpotlightCard>

            {/* Format 4: AI Group Discussion */}
            <SpotlightCard
              spotlightColor="rgba(255, 184, 0, 0.18)"
              spotlightSize={300}
              className="card-quixel p-5 border border-[#E8ECF2] shadow-sm space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-[#FFF6DC] text-[#FFB800] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-[#FFB800]" />
                </div>
                <h3 className="font-black text-[#181920] text-base">AI Group Discussion</h3>
                <p className="text-xs text-[#767E94] leading-relaxed">
                  Simulated round-table with opposing AI personas, turn-taking state machine, and collaboration scoring.
                </p>
              </div>
              <Link
                href="/interviews/behavioral?format=group_discussion"
                className="w-full py-2.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <span>Launch Discussion</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </SpotlightCard>

          </div>
        </div>

        {/* 3. Longitudinal Speaking Habits & Filler Word Telemetry Tracker */}
        <SpeakingHabitsTracker
          profileSummary={{
            languageScore: commProfile?.language_score || 80,
            grammarScore: commProfile?.grammar_score || 84,
            clarityScore: commProfile?.clarity_score || 82,
            fluencyScore: commProfile?.fluency_score || 80,
            vocabularyScore: commProfile?.vocabulary_score || 82,
            professionalScore: commProfile?.professional_score || 85,
            totalInterviews: commProfile?.total_interviews || sessions.length || 3,
            averageWpm: commProfile?.average_wpm || 128,
            topFillers: commProfile?.top_recurring_fillers || ["actually", "basically"],
            strengths: commProfile?.strengths || ["Structured STAR explanation", "Clear technical terminology"],
            recommendedFocus: commProfile?.recommended_focus || ["Reduce filler words", "Pause for breath"]
          }}
        />

        {/* 4. Category Selection Grid */}
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

        {/* 5. Recorded Sessions & Score History */}
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
                    </div>
                    <p className="text-xs text-[#767E94] line-clamp-1">{session.questionText}</p>
                    <div className="flex items-center gap-3 text-[11px] text-[#8E95A5]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(session.createdAt).toLocaleDateString()}
                      </span>
                      <span>Content: {session.contentScore}%</span>
                      <span>Language: {session.voiceScore}%</span>
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
              No interview sessions recorded yet. Pick a track above or try a 60s Language Drill to get started!
            </div>
          )}
        </div>

      </div>
      </div>
    </AuthGuard>
  );
}
