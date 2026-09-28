"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { 
  BarChart3,
  Sparkles, 
  Flame, 
  Zap, 
  ArrowRight, 
  TrendingUp, 
  FileText, 
  Video, 
  FolderGit2, 
  Briefcase,
  GraduationCap,
  Building2,
  Calendar,
  Layers,
  Award,
  CheckCircle2,
  Brain,
  Code2,
  FileCheck,
  Target,
  Users,
  Share2,
  Scale
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import GrowthRing from "@/components/ui/GrowthRing";
import GamificationHUD from "@/components/dashboard/GamificationHUD";
import AuthGuard from "@/components/auth/AuthGuard";
import UserGreeting from "@/components/ui/UserGreeting";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import SpotlightCard from "@/components/ui/SpotlightCard";
import PerformanceIntelligenceWidget from "@/components/dashboard/PerformanceIntelligenceWidget";
import MyCareerPlanWidget from "@/components/dashboard/MyCareerPlanWidget";

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile } = useAuth();

  // Career Stage (college vs working_professional)
  const [careerStage, setCareerStage] = useState<"college" | "working_professional">(
    profile?.careerStage === "STUDENT" || user?.careerStage === "STUDENT" ? "college" : "working_professional"
  );

  useEffect(() => {
    if (user?.careerStage === "STUDENT" || profile?.careerStage === "STUDENT") {
      setCareerStage("college");
    } else if (user?.careerStage === "PROFESSIONAL" || profile?.careerStage === "PROFESSIONAL") {
      setCareerStage("working_professional");
    }
  }, [user?.careerStage, profile?.careerStage]);

  // Filter for Recommended modules
  const [selectedDifficulty, setSelectedDifficulty] = useState<"All" | "Beginner" | "Intermediate" | "Advanced">("All");

  // College-specific data
  const [placementDrives, setPlacementDrives] = useState<any[]>([]);
  const [hackathons, setHackathons] = useState<any[]>([]);

  // User Gamification Stats
  const [userStats, setUserStats] = useState<{
    points: number;
    current_streak: number;
    longest_streak: number;
  }>({ points: 0, current_streak: 0, longest_streak: 0 });

  const [completedDrillsCount, setCompletedDrillsCount] = useState<number>(0);
  const [earnedBadgesCount, setEarnedBadgesCount] = useState<number>(0);
  const [latestSession, setLatestSession] = useState<any>(null);

  const [aptitudeStats, setAptitudeStats] = useState<{ totalAttempts: number; avgScore: number; recentAttempts: any[] }>({
    totalAttempts: 0,
    avgScore: 0,
    recentAttempts: []
  });

  useEffect(() => {
    if (!user) return;
    const fetchAptitudeStats = async () => {
      try {
        const { data } = await supabase
          .from("aptitude_attempts")
          .select("score, total_questions, attempted_date, created_at")
          .eq("user_id", user.uid)
          .order("created_at", { ascending: false })
          .limit(5);

        if (data && data.length > 0) {
          const total = data.length;
          const sumPct = data.reduce((acc, curr) => acc + (curr.score / curr.total_questions) * 100, 0);
          setAptitudeStats({
            totalAttempts: total,
            avgScore: Math.round(sumPct / total),
            recentAttempts: data,
          });
        }
      } catch (err) {
        console.warn("Aptitude stats note:", err);
      }
    };
    fetchAptitudeStats();
  }, [user]);

  const handleStageChange = async (newStage: "college" | "working_professional") => {
    setCareerStage(newStage);
    if (user) {
      try {
        await supabase.from("users").update({ career_stage: newStage }).eq("id", user.uid);
        await supabase.from("profiles").update({ career_stage: newStage }).eq("user_id", user.uid);
      } catch (err) {
        console.warn("Update career stage note:", err);
      }
    }
  };

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        // 1. Load User Stats
        const { data: sData } = await supabase
          .from("user_stats")
          .select("*")
          .eq("user_id", user.uid)
          .maybeSingle();
        if (sData) {
          setUserStats({
            points: sData.points || 0,
            current_streak: sData.current_streak || 0,
            longest_streak: sData.longest_streak || 0,
          });
        }

        // 2. Load Completed Drills Count
        const { count: dCount } = await supabase
          .from("interview_sessions")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.uid);
        setCompletedDrillsCount(dCount || 0);

        // 3. Load Latest Session
        const { data: lastSess } = await supabase
          .from("interview_sessions")
          .select("*")
          .eq("user_id", user.uid)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (lastSess) {
          setLatestSession(lastSess);
        }

        // 4. Load Badges Count
        const { count: bCount } = await supabase
          .from("user_badges")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.uid);
        setEarnedBadgesCount(bCount || 0);

        // 5. Load College Placement Drives (if applicable)
        const { data: pData } = await supabase
          .from("campus_placement_drives")
          .select("*")
          .order("drive_date", { ascending: true })
          .limit(4);
        if (pData) setPlacementDrives(pData);

        // 6. Load Hackathons (if applicable)
        const { data: hData } = await supabase
          .from("hackathon_sprints")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(4);
        if (hData) setHackathons(hData);

      } catch (err) {
        console.warn("Dashboard data loading error:", err);
      }
    };

    loadData();
  }, [user]);

  const practiceModules = [
    {
      id: "mod-1",
      type: "Drill",
      title: "STAR Behavioral Leadership Mastery",
      difficulty: "Intermediate",
      duration: "45 mins",
      category: "Behavioral",
      badgeColor: "bg-emerald-50 text-emerald-700",
      href: "/interviews/star-method",
      illustration: (
        <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-800 flex items-center justify-center font-serif font-bold text-xs">
          STAR
        </div>
      )
    },
    {
      id: "mod-2",
      type: "Drill",
      title: "Distributed System Design & Concurrency",
      difficulty: "Advanced",
      duration: "60 mins",
      category: "Architecture",
      badgeColor: "bg-indigo-50 text-indigo-700",
      href: "/interviews/system-design",
      illustration: (
        <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200/60 text-indigo-800 flex items-center justify-center">
          <Calendar className="w-5 h-5" />
        </div>
      )
    },
    {
      id: "mod-3",
      type: "Resume",
      title: "ATS Keyword Alignment Audit",
      difficulty: "Beginner",
      duration: "10 mins",
      category: "Resume",
      badgeColor: "bg-stone-100 text-stone-700",
      href: "/resumes",
      illustration: (
        <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-200 text-stone-800 flex items-center justify-center">
          <FileCheck className="w-5 h-5" />
        </div>
      )
    },
    {
      id: "mod-4",
      type: "Problem",
      title: "Algorithmic Complexity & Data Structures",
      difficulty: "Intermediate",
      duration: "30 mins",
      category: "Coding",
      badgeColor: "bg-amber-50 text-amber-700",
      href: "/problems",
      illustration: (
        <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200/60 text-amber-800 flex items-center justify-center">
          <Code2 className="w-5 h-5" />
        </div>
      )
    }
  ];

  const filteredModules = selectedDifficulty === "All"
    ? practiceModules
    : practiceModules.filter(m => m.difficulty === selectedDifficulty);

  return (
    <AuthGuard>
      <div className="min-h-[calc(100vh-5rem)] bg-[#FAF8F5] text-stone-900 pb-20 font-sans selection:bg-emerald-100 selection:text-emerald-900">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 pt-6 sm:pt-8 space-y-8 animate-in fade-in duration-300">
          
          {/* Onboarding Incomplete Alert Banner */}
          {profile && profile.onboarding_completed === false && (
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-serif font-medium text-stone-900">Complete Your Profile Setup</h4>
                  <p className="text-xs text-stone-600">
                    Set your target role and skills so Edworld can calibrate your interview drills.
                  </p>
                </div>
              </div>
              <Link
                href="/onboarding"
                className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium transition-all shrink-0 flex items-center justify-center gap-2 shadow-xs"
              >
                <span>Complete Setup</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* TOP GREETING & STAT CAPSULES BAR */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <UserGreeting
              context="dashboard"
              subtitle={
                userStats.points > 0 || userStats.current_streak > 0
                  ? `You've earned ${userStats.points} XP with an active ${userStats.current_streak}-day learning streak.`
                  : "Welcome to your career acceleration workspace. Start an interview drill, coding problem, or ATS resume."
              }
            />

            {/* Top 4 Metric Capsule Cards with Animated Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-lg sm:text-xl font-medium font-serif text-stone-900 leading-tight">
                    <AnimatedCounter value={userStats.points} />
                  </div>
                  <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider">XP Points</span>
                </div>
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-lg sm:text-xl font-medium font-serif text-stone-900 leading-tight">
                    <AnimatedCounter value={completedDrillsCount} />
                  </div>
                  <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider">Drills Done</span>
                </div>
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-lg sm:text-xl font-medium font-serif text-stone-900 leading-tight">
                    <AnimatedCounter value={earnedBadgesCount} />
                  </div>
                  <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider">Badges</span>
                </div>
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <Flame className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-lg sm:text-xl font-medium font-serif text-stone-900 leading-tight">
                    <AnimatedCounter value={userStats.current_streak} suffix="d" />
                  </div>
                  <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider">Streak</span>
                </div>
              </div>
            </div>
          </div>

          {/* TRACK SWITCHER */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-stone-200/80 shadow-xs">
            <div className="flex items-center gap-2 pl-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-stone-100 text-stone-700 px-2.5 py-1 rounded-lg">
                Career Track
              </span>
              <span className="text-xs text-stone-500 hidden md:inline">
                Selected Focus Mode:
              </span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto touch-scroll-x pb-0.5 sm:pb-0">
              <button
                onClick={() => handleStageChange("college")}
                className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  careerStage === "college"
                    ? "bg-stone-900 text-white shadow-xs"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>College &amp; Campus Prep</span>
              </button>
              <button
                onClick={() => handleStageChange("working_professional")}
                className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  careerStage === "working_professional"
                    ? "bg-stone-900 text-white shadow-xs"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Working Professional</span>
              </button>
            </div>
          </div>

          {/* Central Performance Intelligence Widget */}
          <PerformanceIntelligenceWidget
            userName={user?.name || profile?.name || "Learner"}
            track={careerStage === "college" ? "student" : "career"}
          />

          {/* MAIN DASHBOARD 2-COLUMN GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            
            {/* LEFT COLUMN (8 Cols) */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-6 sm:space-y-8">
              
              {/* CAREER LEARNING OS: Integrated My Career Plan & Daily Timetable */}
              <MyCareerPlanWidget
                userId={user?.uid}
                userName={user?.name || profile?.name || "Learner"}
              />

              {/* 1. Continue Learning Hero Card */}
              <div className="space-y-3">
                <h2 className="text-lg font-serif font-medium text-stone-900">Continue learning</h2>
                
                <div className="rounded-2xl p-5 sm:p-7 bg-white border border-stone-200/80 shadow-xs relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 z-10 w-full md:w-auto">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-stone-900 text-stone-50 flex items-center justify-center shrink-0 shadow-xs">
                      <Brain className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-400" />
                    </div>

                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-stone-500">
                        <Layers className="w-3.5 h-3.5" />
                        <span>{latestSession ? "Recent Session" : "Starter Module"}</span>
                      </div>
                      <h3 className="text-base sm:text-xl font-serif font-medium text-stone-900 tracking-tight leading-snug">
                        {latestSession 
                          ? `${(latestSession.category || "General").toUpperCase()} Mock Interview Evaluation`
                          : "STAR Behavioral & System Design Drill I"
                        }
                      </h3>
                      <div className="space-y-1.5 pt-1">
                        <span className="text-xs text-stone-500">
                          {latestSession 
                            ? `Evaluation Score: ${latestSession.score ?? 0}% Complete`
                            : "0% Completed • Ready to begin"
                          }
                        </span>
                        <div className="w-full sm:w-64 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-stone-900 rounded-full transition-all duration-700 ease-out" 
                            style={{ width: `${latestSession ? (latestSession.score ?? 0) : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center sm:flex-col lg:flex-row gap-2 z-10 w-full md:w-auto justify-end">
                    <Link
                      href="/interviews"
                      className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium shadow-xs transition-colors text-center w-full md:w-auto"
                    >
                      {latestSession ? "Practice Next Drill" : "Start Learning"}
                    </Link>
                  </div>
                </div>
              </div>

              {/* 2. Recommended For You Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h2 className="text-lg font-serif font-medium text-stone-900">Recommended For You</h2>
                  
                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-stone-200/80 shadow-2xs overflow-x-auto touch-scroll-x max-w-full">
                    {(["All", "Beginner", "Intermediate", "Advanced"] as const).map((diff) => (
                      <button
                        key={diff}
                        onClick={() => setSelectedDifficulty(diff)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                          selectedDifficulty === diff
                            ? "bg-stone-900 text-white shadow-2xs"
                            : "text-stone-500 hover:text-stone-900"
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredModules.map((mod) => (
                    <Link
                      key={mod.id}
                      href={mod.href}
                      className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200/80 hover:border-stone-400 shadow-xs hover:shadow-sm transition-all flex items-center justify-between group"
                    >
                      <div className="space-y-2.5 z-10 max-w-[70%]">
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-stone-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
                          <span>{mod.type}</span>
                        </div>
                        <h3 className="text-sm sm:text-base font-serif font-medium text-stone-900 leading-snug group-hover:text-stone-700 transition-colors">
                          {mod.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${mod.badgeColor}`}>
                            {mod.difficulty}
                          </span>
                          <span className="text-[11px] text-stone-400">
                            • {mod.duration}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {mod.illustration}
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="text-center pt-2">
                  <Link
                    href="/interviews"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-700 hover:text-stone-900 underline underline-offset-2 transition-colors"
                  >
                    <span>Explore all curriculum drills</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* 3. Skill Telemetry */}
              <div className="p-6 sm:p-7 rounded-2xl bg-white border border-stone-200/80 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                      Skill Telemetry
                    </span>
                    <h3 className="text-lg font-serif font-medium text-stone-900">Effective Level Calibration</h3>
                  </div>
                  <span className="text-xs text-stone-500">
                    Calibrated via AI drills &amp; verified evaluations
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center justify-items-center py-2">
                  <GrowthRing
                    level={0}
                    progress={100}
                    size={92}
                    strokeWidth={8}
                    label="Foundational Concepts"
                  />
                  <GrowthRing
                    level={1}
                    progress={completedDrillsCount > 0 ? 80 : 20}
                    size={108}
                    strokeWidth={9}
                    label="Active Effective Level"
                  />
                  <GrowthRing
                    level={2}
                    progress={completedDrillsCount > 3 ? 50 : 0}
                    size={92}
                    strokeWidth={8}
                    label="Advanced Benchmark"
                  />
                </div>
              </div>

              {/* 4. Activity & Score Intelligence Section (Clean Minimal Light Cards) */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center font-medium">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-base font-serif font-medium text-stone-900">Activity &amp; Score Intelligence</h2>
                      <p className="text-xs text-stone-500">Overview of interview, aptitude, and resume metrics</p>
                    </div>
                  </div>
                  <Link
                    href="/aptitude"
                    className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <Brain className="w-3.5 h-3.5" />
                    <span>Launch Daily Sprint</span>
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 1. Mock Interview Score Card */}
                  <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Interview Mastery</span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${latestSession ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-600"}`}>
                        {latestSession ? "Evaluated" : "Not Started"}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-serif font-medium text-stone-900">
                        {latestSession ? (latestSession.score ?? 0) : "—"}
                      </span>
                      <span className="text-xs text-stone-400">
                        {latestSession ? "/ 100 Last Evaluation" : "No interview taken yet"}
                      </span>
                    </div>

                    {latestSession ? (
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between text-stone-500">
                          <span>Evaluation Category</span>
                          <span className="text-stone-900 font-medium capitalize">{latestSession.category || "General"}</span>
                        </div>
                        <div className="w-full bg-stone-100 rounded-full h-1.5">
                          <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${latestSession.score ?? 0}%` }} />
                        </div>
                        <div className="flex justify-between text-stone-500">
                          <span>Interview Status</span>
                          <span className="text-emerald-700 font-medium">Completed</span>
                        </div>
                      </div>
                    ) : (
                      <div className="py-2 text-xs text-stone-400 italic">
                        Take your first AI mock interview to generate technical and behavioral telemetry.
                      </div>
                    )}

                    <Link
                      href="/interviews"
                      className="block text-center py-2 rounded-xl bg-stone-50 hover:bg-stone-100 text-xs font-medium text-stone-700 transition-colors"
                    >
                      {latestSession ? "View Interview Report →" : "Start First Interview →"}
                    </Link>
                  </div>

                  {/* 2. Daily Aptitude Performance Card */}
                  <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Aptitude Practice</span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-medium">
                        Daily Sprint
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-serif font-medium text-stone-900">
                        {aptitudeStats.totalAttempts > 0 ? `${aptitudeStats.avgScore}%` : "—"}
                      </span>
                      <span className="text-xs text-stone-400">
                        {aptitudeStats.totalAttempts > 0 ? "Accuracy Rate" : "No sprints taken yet"}
                      </span>
                    </div>

                    {aptitudeStats.totalAttempts > 0 ? (
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between text-stone-500">
                          <span>Sprints Completed</span>
                          <span className="text-stone-900 font-medium">{aptitudeStats.totalAttempts} Attempts</span>
                        </div>
                        <div className="w-full bg-stone-100 rounded-full h-1.5">
                          <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, aptitudeStats.avgScore)}%` }} />
                        </div>
                        <div className="flex justify-between text-stone-500">
                          <span>Recent Activity</span>
                          <span className="text-emerald-700 font-medium">Active Sprinting</span>
                        </div>
                      </div>
                    ) : (
                      <div className="py-2 text-xs text-stone-400 italic">
                        Complete 10-question daily sprints to track quant, logic, and verbal agility.
                      </div>
                    )}

                    <Link
                      href="/aptitude"
                      className="block text-center py-2 rounded-xl bg-stone-50 hover:bg-stone-100 text-xs font-medium text-stone-700 transition-colors"
                    >
                      {aptitudeStats.totalAttempts > 0 ? "Take Today's Sprint →" : "Start Aptitude Sprint →"}
                    </Link>
                  </div>

                  {/* 3. Resume & Profile ATS Readiness Card */}
                  <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">ATS Readiness</span>
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-medium">
                        AI Tailored
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-serif font-medium text-stone-900">
                        {profile?.targetRole ? "Ready" : "Draft"}
                      </span>
                      <span className="text-xs text-stone-400">ATS Optimization</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between text-stone-500">
                        <span>Target Role</span>
                        <span className="text-stone-900 font-medium truncate max-w-[150px]">{profile?.targetRole || "Not set"}</span>
                      </div>
                      <div className="flex justify-between text-stone-500">
                        <span>Verified Identity</span>
                        <span className="text-emerald-700 font-medium">Active</span>
                      </div>
                      <div className="flex justify-between text-stone-500">
                        <span>Format</span>
                        <span className="text-stone-700 font-medium">Single-Column ATS</span>
                      </div>
                    </div>

                    <Link
                      href="/resumes"
                      className="block text-center py-2 rounded-xl bg-stone-50 hover:bg-stone-100 text-xs font-medium text-stone-700 transition-colors"
                    >
                      Open Resume Maker →
                    </Link>
                  </div>
                </div>
              </section>

              <GamificationHUD />

            </div>

            {/* RIGHT COLUMN (4 Cols) */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-6">
              
              {/* 1. Daily Streak & Domain XP Card */}
              <div className="p-6 sm:p-7 rounded-2xl bg-white border border-stone-200/80 shadow-xs space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-serif font-medium text-stone-900 leading-tight">
                      {userStats.current_streak > 0 ? (
                        <>You&apos;re on a <AnimatedCounter value={userStats.current_streak} suffix="-day" /> streak</>
                      ) : (
                        <>Start your learning streak</>
                      )}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/60 shadow-2xs">
                    <Flame className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-serif font-medium text-stone-900">
                      <AnimatedCounter value={userStats.points} /> XP
                    </span>
                  </div>
                </div>

                {/* Day Pills: S M T W T F S */}
                <div className="flex items-center justify-between gap-1">
                  {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => {
                    const todayDayIndex = new Date().getDay();
                    const isCompleted = userStats.current_streak > 0 && idx === todayDayIndex;
                    return (
                      <div
                        key={idx}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-medium transition-all ${
                          isCompleted
                            ? "bg-emerald-600 text-white shadow-2xs"
                            : idx === todayDayIndex
                            ? "bg-stone-900 text-white font-semibold"
                            : "bg-stone-50 text-stone-400 border border-stone-200/60"
                        }`}
                      >
                        {isCompleted ? <Zap className="w-3.5 h-3.5 fill-white" /> : day}
                      </div>
                    );
                  })}
                </div>

                {/* Domain XP Progress Bars */}
                <div className="space-y-4 pt-2 border-t border-stone-100">
                  {[
                    { domain: "Technical Problem Solving", xp: `${Math.round(userStats.points * 0.4)} XP`, percent: Math.min(100, Math.round(userStats.points * 0.4 / 10)) },
                    { domain: "STAR Behavioral Mastery", xp: `${Math.round(userStats.points * 0.3)} XP`, percent: Math.min(100, Math.round(userStats.points * 0.3 / 10)) },
                    { domain: "ATS Resume Tuning", xp: `${Math.round(userStats.points * 0.2)} XP`, percent: Math.min(100, Math.round(userStats.points * 0.2 / 10)) },
                    { domain: "System Architecture", xp: `${Math.round(userStats.points * 0.1)} XP`, percent: Math.min(100, Math.round(userStats.points * 0.1 / 10)) },
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-stone-700 font-medium">{item.domain}</span>
                        <span className="text-stone-400 font-mono text-[11px]">{item.xp}</span>
                      </div>
                      <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-stone-900 rounded-full transition-all duration-500" 
                          style={{ width: `${item.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <Link
                    href="/profile"
                    className="text-xs font-medium text-stone-700 hover:text-stone-900 flex items-center gap-1 transition-colors"
                  >
                    <span>View profile details &amp; ID card</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* 2. Opportunities Banner */}
              <div className="p-6 sm:p-7 rounded-2xl bg-stone-900 text-stone-100 shadow-xs space-y-4">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-stone-800 text-stone-300 px-2.5 py-0.5 rounded-md inline-block">
                    Verified Opportunities
                  </span>
                  <h3 className="text-lg font-serif font-medium text-white leading-snug">
                    Curated job board for engineers &amp; designers
                  </h3>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    Explore high-signal roles with direct recruiter applications and ATS matching audits.
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="px-2.5 py-1 rounded-lg bg-stone-800 text-[11px] text-stone-300 border border-stone-700">
                    Full Stack Engineer
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-stone-800 text-[11px] text-stone-300 border border-stone-700">
                    Distributed Systems
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-stone-800 text-[11px] text-stone-300 border border-stone-700">
                    AI / ML Specialist
                  </span>
                </div>

                <div className="pt-2">
                  <Link
                    href="/jobs"
                    className="inline-block px-4 py-2 rounded-xl bg-white hover:bg-stone-100 text-stone-900 text-xs font-medium transition-colors"
                  >
                    Explore Job Board →
                  </Link>
                </div>
              </div>

            </div>

          </div>

          {/* EXPANSION HUBS & TOOLS */}
          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-stone-700" />
                <h2 className="text-lg font-serif font-medium text-stone-900">Career Acceleration &amp; Pro Hubs</h2>
              </div>
              <span className="text-xs text-stone-500">
                {careerStage === "college" ? "College & Early Career Track" : "Working Professional Track"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Interview Experiences */}
              <Link
                href="/interview-experiences"
                className="p-5 rounded-2xl bg-white border border-stone-200/80 hover:border-stone-400 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-serif font-medium text-stone-900 group-hover:text-stone-700 transition-colors">
                      Interview Experiences
                    </h3>
                    <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                      Browse and submit peer-reviewed, verified interview debriefs and round breakdowns.
                    </p>
                  </div>
                </div>
                <div className="pt-4 flex items-center text-xs font-medium text-stone-900 group-hover:translate-x-1 transition-transform">
                  <span>Explore Reports</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </Link>

              {/* Mock Panel Interview */}
              <Link
                href="/interviews/panel"
                className="p-5 rounded-2xl bg-white border border-stone-200/80 hover:border-stone-400 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-serif font-medium text-stone-900 group-hover:text-stone-700 transition-colors">
                        Mock Panel Interview
                      </h3>
                      <span className="text-[9px] font-semibold uppercase tracking-wider bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                        Multi-Persona
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                      Practice with Tech Lead, Engineering Director &amp; Culture Lead in sequential turns.
                    </p>
                  </div>
                </div>
                <div className="pt-4 flex items-center text-xs font-medium text-amber-800 group-hover:translate-x-1 transition-transform">
                  <span>Start Panel Simulation</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </Link>

              {/* Offer Comparison Tool */}
              <Link
                href="/offers/compare"
                className="p-5 rounded-2xl bg-white border border-stone-200/80 hover:border-stone-400 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-serif font-medium text-stone-900 group-hover:text-stone-700 transition-colors">
                      Offer Comparison Tool
                    </h3>
                    <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                      Confidential side-by-side compensation, stock vesting, and benefits evaluator.
                    </p>
                  </div>
                </div>
                <div className="pt-4 flex items-center text-xs font-medium text-emerald-700 group-hover:translate-x-1 transition-transform">
                  <span>Compare Offers</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </Link>

              {/* Personal Branding & LinkedIn Assistant */}
              <Link
                href="/branding-assistant"
                className="p-5 rounded-2xl bg-white border border-stone-200/80 hover:border-stone-400 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-serif font-medium text-stone-900 group-hover:text-stone-700 transition-colors">
                      LinkedIn Post Assistant
                    </h3>
                    <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                      Draft high-engagement project updates, milestone celebrations, and insights with AI.
                    </p>
                  </div>
                </div>
                <div className="pt-4 flex items-center text-xs font-medium text-sky-700 group-hover:translate-x-1 transition-transform">
                  <span>Draft Post</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </Link>

              {/* Leadership Readiness Self-Assessment */}
              <Link
                href="/leadership-assessment"
                className="p-5 rounded-2xl bg-white border border-stone-200/80 hover:border-stone-400 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-serif font-medium text-stone-900 group-hover:text-stone-700 transition-colors">
                      Leadership Self-Assessment
                    </h3>
                    <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                      Reflective qualitative evaluation for ICs exploring Engineering Management and Tech Lead paths.
                    </p>
                  </div>
                </div>
                <div className="pt-4 flex items-center text-xs font-medium text-indigo-700 group-hover:translate-x-1 transition-transform">
                  <span>Start Assessment</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </Link>

              {/* Freelance & Consulting Opportunities */}
              <Link
                href="/jobs?type=freelance"
                className="p-5 rounded-2xl bg-white border border-stone-200/80 hover:border-stone-400 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-serif font-medium text-stone-900 group-hover:text-stone-700 transition-colors">
                      Freelance &amp; Contract Board
                    </h3>
                    <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                      Explore vetted consulting contracts, part-time advisory, and freelance project scopes.
                    </p>
                  </div>
                </div>
                <div className="pt-4 flex items-center text-xs font-medium text-stone-700 group-hover:translate-x-1 transition-transform">
                  <span>Browse Contracts</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </Link>
            </div>
          </div>

          {/* CAMPUS PLACEMENT DRIVES & HACKATHONS */}
          {careerStage === "college" && (
            <div className="space-y-6 pt-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-stone-700" />
                  <h2 className="text-lg font-serif font-medium text-stone-900">Campus Placement Drives &amp; Hackathons</h2>
                </div>
                <Link href="/jobs" className="text-xs font-medium text-stone-700 hover:text-stone-900 underline underline-offset-2 flex items-center gap-1">
                  <span>View All Listings</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 sm:p-7 rounded-2xl bg-white border border-stone-200/80 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-serif font-medium text-stone-900 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-stone-700" />
                      <span>Campus Placement Drives</span>
                    </h3>
                    <span className="text-[10px] font-medium text-stone-600 bg-stone-100 px-2.5 py-1 rounded-md">
                      {placementDrives.length} Drives
                    </span>
                  </div>

                  {placementDrives.length > 0 ? (
                    <div className="space-y-3">
                      {placementDrives.map((d, i) => (
                        <div key={d.id || i} className="p-4 rounded-xl bg-stone-50 border border-stone-200/60 space-y-2">
                          <div className="flex items-center justify-between text-xs font-medium text-stone-900">
                            <span>{d.company} — {d.role}</span>
                            <span className="text-[10px] font-mono text-stone-600 bg-stone-200/60 px-2 py-0.5 rounded">
                              Date: {d.drive_date}
                            </span>
                          </div>
                          <div className="text-[11px] text-stone-600">
                            <strong className="text-stone-900 font-medium">Eligibility:</strong> {d.eligibility_criteria}
                          </div>
                          <div className="text-[11px] text-stone-600 font-mono">
                            <strong className="text-stone-900 font-medium">Rounds:</strong> {Array.isArray(d.rounds) ? d.rounds.join(" → ") : "Technical & HR"}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-xs text-stone-400 italic bg-stone-50 rounded-xl border border-stone-200/60">
                      No campus placement drives currently active. Check back as new university drives are added.
                    </div>
                  )}
                </div>

                <div className="p-6 sm:p-7 rounded-2xl bg-white border border-stone-200/80 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-serif font-medium text-stone-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>Group Project &amp; Hackathon Sprints</span>
                    </h3>
                    <span className="text-[10px] font-medium text-stone-600 bg-stone-100 px-2.5 py-1 rounded-md">
                      {hackathons.length} Sprints
                    </span>
                  </div>

                  {hackathons.length > 0 ? (
                    <div className="space-y-3">
                      {hackathons.map((h, i) => (
                        <div key={h.id || i} className="p-4 rounded-xl bg-stone-50 border border-stone-200/60 space-y-2">
                          <div className="flex items-center justify-between text-xs font-medium text-stone-900">
                            <span>{h.name}</span>
                            <span className="text-[10px] font-mono text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                              {h.status || "Upcoming"}
                            </span>
                          </div>
                          <div className="text-[11px] text-stone-600">
                            {h.description || "Compete in live coding and team problem solving."}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-xs text-stone-400 italic bg-stone-50 rounded-xl border border-stone-200/60">
                      No active hackathons at this moment. New challenges launch every weekend.
                    </div>
                  )}
                </div>
              </div>

              {/* CAMPUS AMBASSADOR PROGRAM PORTAL */}
              <div className="p-6 sm:p-7 rounded-2xl bg-stone-900 text-stone-100 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-stone-800 text-white flex items-center justify-center font-bold shadow-2xs shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-serif font-medium text-white">Edworld Campus Ambassador Program</h3>
                      <span className="text-[9px] font-medium uppercase tracking-wider bg-stone-800 text-emerald-400 px-2 py-0.5 rounded">
                        Open
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Represent Edworld Co at your university, organize student mock interview circles, and earn leadership credentials.
                    </p>
                  </div>
                </div>
                <Link
                  href="/ambassador"
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-stone-100 text-stone-900 text-xs font-medium whitespace-nowrap transition-colors"
                >
                  <span>Ambassador Portal →</span>
                </Link>
              </div>

            </div>
          )}

        </div>
      </div>
    </AuthGuard>
  );
}
