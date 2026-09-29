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
  TrendingUp, 
  Clock, 
  BarChart3,
  Zap,
  Lock,
  MessageSquare
} from "lucide-react";
import AuthGuard from "@/components/auth/AuthGuard";
import UserGreeting from "@/components/ui/UserGreeting";
import DailyPracticeCard from "@/components/interview/DailyPracticeCard";
import SpeakingHabitsTracker from "@/components/interview/SpeakingHabitsTracker";

export const dynamic = "force-dynamic";

export default function InterviewsHubPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [commProfile, setCommProfile] = useState<any>(null);
  const [activeResume, setActiveResume] = useState<{ id: string; title: string; skillsCount: number; projectsCount: number } | null>(null);

  // Career Track Gating: 18+ only
  const isMinorUser = user ? user.ageBand !== "18+" : false;

  useEffect(() => {
    if (!user || isMinorUser) {
      setSessions([]);
      return;
    }

    const loadData = async () => {
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

      // 3. Fetch User's Active Resume
      try {
        const { data: resumeData } = await supabase
          .from("resumes")
          .select("id, title, content, updated_at")
          .eq("user_id", user.uid)
          .order("updated_at", { ascending: false })
          .limit(1);

        if (resumeData && resumeData.length > 0) {
          const r = resumeData[0];
          const skillsList = r.content?.skills?.technical || (Array.isArray(r.content?.skills) ? r.content.skills : []) || [];
          const projList = r.content?.projects || [];
          setActiveResume({
            id: r.id,
            title: r.title || "Portfolio Resume",
            skillsCount: skillsList.length,
            projectsCount: projList.length,
          });
        }
      } catch (rErr) {
        console.warn("[Fetch Resume Note]:", rErr);
      }
    };

    loadData();
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
        <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-6 bg-[#FAF8F5]">
          <div className="max-w-md w-full bg-white rounded-2xl border border-stone-200/80 shadow-xs p-8 text-center space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200/60 text-amber-800 flex items-center justify-center mx-auto shadow-2xs">
              <Lock className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 text-xs font-mono font-medium">
                {user?.ageBand === "13-15" ? "Junior Track" : "Explorer Track"}
              </span>
              <h1 className="text-2xl font-serif font-medium text-stone-900 tracking-tight">
                Full AI Interview Studio is for Career Track (18+)
              </h1>
              <p className="text-xs text-stone-500 leading-relaxed">
                Minors practice presentation and verbal clarity inside foundational practice modules.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="w-full py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <span>Return to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-[calc(100vh-5rem)] bg-[#FAF8F5] text-stone-900 pb-20 font-sans selection:bg-emerald-100 selection:text-emerald-900">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 pt-6 sm:pt-8 space-y-8 animate-in fade-in duration-300">
          
          {/* Header */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider bg-stone-100 text-stone-700 px-2.5 py-1 rounded-md">
                  Career Track
                </span>
                <span className="text-xs font-mono text-stone-400">AI Resume-Connected Studio</span>
              </div>
              <UserGreeting
                context="interview"
                subtitle="Evaluate technical depth, STAR methodology, and train English fluency with AI interviewing your exact resume projects."
              />
            </div>

            <div className="p-4 sm:p-5 rounded-xl bg-stone-50 border border-stone-200/60 flex items-start gap-3.5 max-w-md text-xs text-stone-700 shadow-2xs">
              <TrendingUp className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-serif font-medium text-sm text-stone-900">Resume-Tailored Questions</p>
                <p className="text-stone-500 text-xs mt-1 leading-relaxed">
                  AI analyzes your saved resume projects and skills to ask authentic technical trade-off and STAR behavioral questions.
                </p>
              </div>
            </div>
          </div>

          {/* Resume Connected Quick-Action Callout */}
          {activeResume && (
            <div className="p-5 sm:p-6 rounded-2xl bg-stone-900 text-white shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-stone-800">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-900 text-emerald-300 font-medium text-xs">
                    Resume Connected
                  </span>
                  <span className="text-xs sm:text-sm font-mono text-stone-300">
                    {activeResume.title}
                  </span>
                </div>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Ready for AI mock interview with {activeResume.skillsCount > 0 ? `${activeResume.skillsCount} detected skills` : "technical profile"} and {activeResume.projectsCount > 0 ? `${activeResume.projectsCount} portfolio projects` : "experience"}.
                </p>
              </div>
              <Link
                href="/interviews/swe"
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-stone-100 text-stone-900 font-medium text-xs uppercase tracking-wider flex items-center gap-2 shadow-xs shrink-0 transition-colors"
              >
                <span>Launch Interview with Resume</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* 1. Daily Personalized Practice Drill Card */}
          <DailyPracticeCard
            focusArea={commProfile?.primary_weakness ? `Targeting ${commProfile.primary_weakness.replace("_", " ")}` : "Reducing filler words & pacing"}
            task={commProfile?.recommended_focus?.[0] ? `Answer in 60s: "Can you describe a key technical project you built and how you solved the hardest bug?"` : 'Answer in 60s: "Tell me about a technical project you are proud of."'}
          />

          {/* 2. Practice Formats */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-stone-600 bg-stone-100 border border-stone-200/80 px-2.5 py-1 rounded-md">
                  Practice Formats
                </span>
                <h2 className="text-xl sm:text-2xl font-serif font-medium text-stone-900 tracking-tight mt-1.5">Choose Interview Mode</h2>
                <p className="text-xs text-stone-500 mt-0.5">Practice verbal Q&amp;A, standalone language training drills, live coding, or group discussions.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              
              {/* Format 1: Standalone Language Training Drills */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200/80 shadow-xs space-y-4 flex flex-col justify-between hover:border-stone-400 transition-all">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center font-medium">
                      <Sparkles className="w-5 h-5 text-emerald-700" />
                    </div>
                    <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                      Fast Drill
                    </span>
                  </div>
                  <h3 className="font-serif font-medium text-stone-900 text-base">Language Training</h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Rapid 60-second spoken drills with live speech-to-text, filler counting, and attempt comparison.
                  </p>
                </div>
                <Link
                  href="/interviews/language-training"
                  className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <span>Launch Language Drills</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Format 2: Standard Full Verbal Studio */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200/80 shadow-xs space-y-4 flex flex-col justify-between hover:border-stone-400 transition-all">
                <div className="space-y-2.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                    <Video className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif font-medium text-stone-900 text-base">Full Verbal Studio</h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Multi-question verbal interview with camera engagement, STAR rubric scoring, and resume project deep-dives.
                  </p>
                </div>
                <Link
                  href="/interviews/swe"
                  className="w-full py-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-900 border border-stone-200 text-xs font-medium flex items-center justify-center gap-2 transition-colors shadow-2xs"
                >
                  <span>Launch Verbal Session</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Format 3: Technical Architecture & Code Reasoning */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200/80 shadow-xs space-y-4 flex flex-col justify-between hover:border-stone-400 transition-all">
                <div className="space-y-2.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-amber-700" />
                  </div>
                  <h3 className="font-serif font-medium text-stone-900 text-base">Technical Code Reasoning</h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Verbal &amp; structured explanation of algorithms, system design, data structures, and edge-case handling.
                  </p>
                </div>
                <Link
                  href="/interviews/swe"
                  className="w-full py-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-900 border border-stone-200 text-xs font-medium flex items-center justify-center gap-2 transition-colors shadow-2xs"
                >
                  <span>Launch Technical Round</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Format 4: AI Group Discussion */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200/80 shadow-xs space-y-4 flex flex-col justify-between hover:border-stone-400 transition-all">
                <div className="space-y-2.5">
                  <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-stone-700" />
                  </div>
                  <h3 className="font-serif font-medium text-stone-900 text-base">AI Group Discussion</h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Simulated round-table with opposing AI personas, turn-taking state machine, and collaboration scoring.
                  </p>
                </div>
                <Link
                  href="/interviews/behavioral?format=group_discussion"
                  className="w-full py-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-900 border border-stone-200 text-xs font-medium flex items-center justify-center gap-2 transition-colors shadow-2xs"
                >
                  <span>Launch Discussion</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>
          </div>

          {/* 3. Longitudinal Speaking Habits Tracker */}
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
              <h2 className="text-xl font-serif font-medium text-stone-900 tracking-tight">Select Practice Track</h2>
              <span className="text-xs text-stone-500">5 Calibrated Tracks</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {AVAILABLE_CATEGORIES.map((cat) => {
                const currentLevel = getEffectiveLevelForCategory(cat.id, cat.name);

                return (
                  <div
                    key={cat.id}
                    className="p-6 sm:p-7 rounded-2xl bg-white border border-stone-200/80 hover:border-stone-400 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center font-medium">
                          <Video className="w-5 h-5" />
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-medium border ${getDifficultyBadgeColor(currentLevel)}`}>
                          {getDifficultyLabel(currentLevel)}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-serif font-medium text-stone-900 text-lg group-hover:text-stone-700 transition-colors">
                          {cat.name}
                        </h3>
                        <p className="text-xs text-stone-500 mt-1 leading-relaxed">{cat.description}</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                      <span className="text-[11px] text-stone-400 font-mono">
                        Level {currentLevel} Ready
                      </span>
                      <Link
                        href={`/interviews/${cat.id}`}
                        className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs shadow-2xs flex items-center gap-1.5 transition-colors"
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
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-stone-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-stone-700" />
                <h2 className="text-lg font-serif font-medium text-stone-900">Recorded Interview Sessions</h2>
              </div>
              <span className="text-xs text-stone-500">{sessions.length} Recorded Sessions</span>
            </div>

            {sessions.length > 0 ? (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-4 rounded-xl bg-stone-50 border border-stone-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-stone-900">{session.category}</span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${getDifficultyBadgeColor(session.difficultyLevel)}`}>
                          Level {session.difficultyLevel}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 line-clamp-1">{session.questionText}</p>
                      <div className="flex items-center gap-3 text-[11px] text-stone-400">
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
                        <span className="text-2xl font-serif font-medium text-emerald-700">{session.overallScore}%</span>
                        <p className="text-[10px] font-medium uppercase tracking-wider text-stone-400">Overall</p>
                      </div>
                      <Link
                        href={`/interviews/results/${session.id}`}
                        className="px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-stone-800 hover:bg-stone-50 text-xs font-medium shadow-2xs transition-colors"
                      >
                        View Report
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-stone-400 bg-stone-50 rounded-xl border border-stone-200/60">
                No interview sessions recorded yet. Pick a track above or try a 60s Language Drill to get started!
              </div>
            )}
          </div>

        </div>
      </div>
    </AuthGuard>
  );
}
