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
  Scale,
  ShieldCheck,
  Compass,
  ArrowUpRight,
  Clock,
  Check
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
import PersonalizedTimetableWidget from "@/components/dashboard/PersonalizedTimetableWidget";
import EdIdBadge from "@/components/ui/EdIdBadge";

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

  const practiceModules = [
    {
      id: "mod-1",
      type: "Interview",
      title: "STAR Behavioral & Leadership Simulation",
      difficulty: "Intermediate",
      duration: "25 mins",
      category: "Behavioral",
      badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
      href: "/interviews/star-method",
      illustration: (
        <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center font-mono font-bold text-xs">
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
      badgeColor: "bg-indigo-50 text-indigo-800 border-indigo-200",
      href: "/interviews/system-design",
      illustration: (
        <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 flex items-center justify-center">
          <Calendar className="w-5 h-5 text-indigo-600" />
        </div>
      )
    },
    {
      id: "mod-3",
      type: "Resume",
      title: "ATS Keyword Alignment & Semantic Audit",
      difficulty: "Beginner",
      duration: "10 mins",
      category: "Resume",
      badgeColor: "bg-slate-100 text-[#13141B] border-slate-200",
      href: "/resumes",
      illustration: (
        <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 text-[#13141B] flex items-center justify-center">
          <FileCheck className="w-5 h-5 text-[#13141B]" />
        </div>
      )
    },
    {
      id: "mod-4",
      type: "Challenge",
      title: "EdFix Real-World Problem Solution Challenge",
      difficulty: "Intermediate",
      duration: "30 mins",
      category: "EdFix",
      badgeColor: "bg-teal-50 text-teal-800 border-teal-200",
      href: "/edfix",
      illustration: (
        <div className="w-11 h-11 rounded-xl bg-[#00D2B4]/10 border border-[#00D2B4]/20 text-[#0A5245] flex items-center justify-center font-bold">
          <Sparkles className="w-5 h-5 text-[#00D2B4]" />
        </div>
      )
    }
  ];

  const filteredModules = selectedDifficulty === "All"
    ? practiceModules
    : practiceModules.filter(m => m.difficulty === selectedDifficulty);

  return (
    <AuthGuard>
      <div className="min-h-[calc(100vh-4rem)] bg-[#FCFCFB] text-[#13141B] pb-20 font-sans selection:bg-[#00D2B4]/20 selection:text-[#0A5245]">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 sm:space-y-8 animate-in fade-in duration-300">
          
          {/* Onboarding Incomplete Alert Banner */}
          {profile && profile.onboarding_completed === false && (
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-extrabold text-[#13141B]">Complete Your Career Setup</h4>
                  <p className="text-xs text-[#5E6573]">
                    Set your target role and skills so EdWorld can calibrate your personalized interview drills.
                  </p>
                </div>
              </div>
              <Link
                href="/onboarding"
                className="px-4 py-2 rounded-xl bg-[#13141B] hover:bg-black text-white text-xs font-bold transition-all shrink-0 flex items-center justify-center gap-2 shadow-2xs"
              >
                <span>Complete Setup</span>
                <ArrowRight className="w-4 h-4 text-[#00D2B4]" />
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
                  : "Welcome to your career acceleration workspace. Start an interview drill, coding challenge, or ATS resume."
              }
            />

            {/* Top 4 Metric Capsule Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#EBECEF] shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-lg sm:text-xl font-extrabold font-mono text-[#13141B] leading-tight">
                    <AnimatedCounter value={userStats.points} />
                  </div>
                  <span className="text-[10px] font-bold text-[#5E6573] uppercase tracking-wider">XP Points</span>
                </div>
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#EBECEF] shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#00D2B4]/10 text-[#0A5245] border border-[#00D2B4]/20 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5 text-[#00D2B4]" />
                </div>
                <div>
                  <div className="text-lg sm:text-xl font-extrabold font-mono text-[#13141B] leading-tight">
                    <AnimatedCounter value={completedDrillsCount} />
                  </div>
                  <span className="text-[10px] font-bold text-[#5E6573] uppercase tracking-wider">Drills Done</span>
                </div>
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#EBECEF] shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-100 text-[#13141B] border border-slate-200 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5 text-[#13141B]" />
                </div>
                <div>
                  <div className="text-lg sm:text-xl font-extrabold font-mono text-[#13141B] leading-tight">
                    <AnimatedCounter value={earnedBadgesCount} />
                  </div>
                  <span className="text-[10px] font-bold text-[#5E6573] uppercase tracking-wider">Badges</span>
                </div>
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#EBECEF] shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
                  <Flame className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-lg sm:text-xl font-extrabold font-mono text-[#13141B] leading-tight">
                    <AnimatedCounter value={userStats.current_streak} suffix="d" />
                  </div>
                  <span className="text-[10px] font-bold text-[#5E6573] uppercase tracking-wider">Streak</span>
                </div>
              </div>
            </div>
          </div>

          {/* TRACK SWITCHER */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-[#EBECEF] shadow-xs">
            <div className="flex items-center gap-2 pl-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#13141B] text-white px-2.5 py-1 rounded-lg shadow-2xs">
                Career Track
              </span>
              <span className="text-xs text-[#5E6573] font-medium hidden md:inline">
                Selected Focus Mode:
              </span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto touch-scroll-x pb-0.5 sm:pb-0">
              <button
                onClick={() => handleStageChange("college")}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  careerStage === "college"
                    ? "bg-[#13141B] text-white shadow-2xs"
                    : "text-[#5E6573] hover:text-[#13141B] hover:bg-slate-50"
                }`}
              >
                <GraduationCap className="w-4 h-4 text-[#00D2B4]" />
                <span>College &amp; Campus Prep</span>
              </button>
              <button
                onClick={() => handleStageChange("working_professional")}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  careerStage === "working_professional"
                    ? "bg-[#13141B] text-white shadow-2xs"
                    : "text-[#5E6573] hover:text-[#13141B] hover:bg-slate-50"
                }`}
              >
                <Building2 className="w-4 h-4 text-[#00D2B4]" />
                <span>Working Professional</span>
              </button>
            </div>
          </div>

          {/* Central Performance Intelligence Widget */}
          <PerformanceIntelligenceWidget
            userName={user?.name || profile?.name || "Learner"}
            track={careerStage === "college" ? "student" : "career"}
          />

          {/* MAIN BALANCED BENTO GRID: LEFT TOOL HUB (4 Cols) + WORKSPACE (8 Cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            
            {/* LEFT COLUMN: Quick Action Hub, Daily Sprint, Digital ID & Skill Telemetry */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* 1. Quick Launch Actions Station */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#EBECEF] shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#EBECEF] pb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#00D2B4]" />
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#13141B]">
                      Quick Actions
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-[#5E6573] font-bold">1-Click Launch</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <Link
                    href="/interviews"
                    className="p-3 rounded-xl bg-[#FCFCFB] hover:bg-slate-50 border border-[#EBECEF] hover:border-[#D1D5DC] flex flex-col items-start gap-1.5 transition-all group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#13141B] text-[#00D2B4] flex items-center justify-center shadow-2xs">
                      <Video className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-[#13141B] group-hover:text-[#00D2B4] transition-colors">
                      EdInterview
                    </span>
                  </Link>

                  <Link
                    href="/resumes"
                    className="p-3 rounded-xl bg-[#FCFCFB] hover:bg-slate-50 border border-[#EBECEF] hover:border-[#D1D5DC] flex flex-col items-start gap-1.5 transition-all group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#13141B] text-[#00D2B4] flex items-center justify-center shadow-2xs">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-[#13141B] group-hover:text-[#00D2B4] transition-colors">
                      EdResume
                    </span>
                  </Link>

                  <Link
                    href="/edfix"
                    className="p-3 rounded-xl bg-[#FCFCFB] hover:bg-slate-50 border border-[#EBECEF] hover:border-[#D1D5DC] flex flex-col items-start gap-1.5 transition-all group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#13141B] text-[#00D2B4] flex items-center justify-center shadow-2xs">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-[#13141B] group-hover:text-[#00D2B4] transition-colors">
                      EdFix
                    </span>
                  </Link>

                  <Link
                    href="/projects"
                    className="p-3 rounded-xl bg-[#FCFCFB] hover:bg-slate-50 border border-[#EBECEF] hover:border-[#D1D5DC] flex flex-col items-start gap-1.5 transition-all group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#13141B] text-[#00D2B4] flex items-center justify-center shadow-2xs">
                      <FolderGit2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-[#13141B] group-hover:text-[#00D2B4] transition-colors">
                      EdProjects
                    </span>
                  </Link>

                  <Link
                    href="/aptitude"
                    className="p-3 rounded-xl bg-[#FCFCFB] hover:bg-slate-50 border border-[#EBECEF] hover:border-[#D1D5DC] flex flex-col items-start gap-1.5 transition-all group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#13141B] text-[#00D2B4] flex items-center justify-center shadow-2xs">
                      <Brain className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-[#13141B] group-hover:text-[#00D2B4] transition-colors">
                      EdAptitude
                    </span>
                  </Link>

                  <Link
                    href="/network"
                    className="p-3 rounded-xl bg-[#FCFCFB] hover:bg-slate-50 border border-[#EBECEF] hover:border-[#D1D5DC] flex flex-col items-start gap-1.5 transition-all group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#13141B] text-[#00D2B4] flex items-center justify-center shadow-2xs">
                      <Users className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-[#13141B] group-hover:text-[#00D2B4] transition-colors">
                      EdNetwork
                    </span>
                  </Link>
                </div>
              </div>

              {/* 2. Today's Daily Target & Aptitude Sprint Capsule */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#EBECEF] shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-[#00D2B4]" />
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#13141B]">
                      Daily Practice Sprint
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#00D2B4]/10 text-[#0A5245] border border-[#00D2B4]/20">
                    +50 XP
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#FCFCFB] border border-[#EBECEF] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#13141B]">10 Speed Questions</span>
                    <span className="text-[11px] font-mono text-[#5E6573] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-500" />
                      10 Mins
                    </span>
                  </div>
                  <p className="text-xs text-[#5E6573] font-medium leading-relaxed">
                    Benchmark quant, logic, and verbal reflexes calibrated to top tech hiring bars.
                  </p>
                  <Link
                    href="/aptitude"
                    className="w-full py-2 px-3 rounded-xl bg-[#13141B] hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-2xs"
                  >
                    <span>Launch Sprint</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#00D2B4]" />
                  </Link>
                </div>
              </div>

              {/* 3. Verified Digital ID & Public Profile Badge */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#EBECEF] shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#EBECEF] pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#00D2B4]" />
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#13141B]">
                      Verified Identity
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-bold">
                    Active
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#5E6573] font-medium">Digital ID:</span>
                    <EdIdBadge userId={user?.uid || ""} customId={(profile as any)?.edworldId || (profile as any)?.edId} size="sm" variant="pill" />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#5E6573] font-medium">Role:</span>
                    <span className="font-bold text-[#13141B]">{profile?.targetRole || "Engineering"}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#5E6573] font-medium">Public Status:</span>
                    <span className="font-bold text-[#0A5245]">{profile?.isPublic ? "Visible" : "Private"}</span>
                  </div>

                  <Link
                    href={`/u/${user?.name?.toLowerCase().replace(/\s+/g, "_") || user?.uid || "profile"}`}
                    className="block text-center py-2 px-3 rounded-xl border border-[#EBECEF] hover:bg-slate-50 text-[#13141B] text-xs font-bold transition-colors"
                  >
                    View Public Portfolio &rarr;
                  </Link>
                </div>
              </div>

              {/* 4. Skill Telemetry & Effective Level Calibration */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#EBECEF] shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#EBECEF] pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0A5245]">
                      Telemetry
                    </span>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#13141B]">
                      Skill Calibration
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-[#5E6573]">Verified Levels</span>
                </div>

                <div className="grid grid-cols-3 gap-2 items-center justify-items-center py-2">
                  <GrowthRing
                    level={0}
                    progress={100}
                    size={76}
                    strokeWidth={6}
                    label="Concepts"
                  />
                  <GrowthRing
                    level={1}
                    progress={completedDrillsCount > 0 ? 80 : 25}
                    size={84}
                    strokeWidth={7}
                    label="Core Level"
                  />
                  <GrowthRing
                    level={2}
                    progress={completedDrillsCount > 3 ? 50 : 0}
                    size={76}
                    strokeWidth={6}
                    label="Benchmark"
                  />
                </div>
              </div>

            </div>

            {/* MAIN WORKSPACE COLUMN (8 Cols): Personalized Timetable, Career Plan, Continue Learning, Recommended Modules & Intelligence */}
            <div className="lg:col-span-8 space-y-6 sm:space-y-8">
              
              {/* PERSONALIZED STUDY TIMETABLE (Calibrated to CGPA, Target Role & Available Time) */}
              <PersonalizedTimetableWidget />

              {/* CAREER LEARNING OS: Integrated My Career Plan & Skill Milestones */}
              <MyCareerPlanWidget
                userId={user?.uid}
                userName={user?.name || profile?.name || "Learner"}
              />

              {/* 1. Continue Learning Hero Card */}
              <div className="space-y-3">
                <h2 className="text-base sm:text-lg font-extrabold font-sans text-[#13141B]">Continue Learning</h2>
                
                <div className="rounded-2xl p-5 sm:p-7 bg-white border border-[#EBECEF] shadow-xs relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 z-10 w-full md:w-auto">
                    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#13141B] text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Brain className="w-7 h-7 text-[#00D2B4]" />
                    </div>

                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#5E6573]">
                        <Layers className="w-3.5 h-3.5 text-[#00D2B4]" />
                        <span>{latestSession ? "Recent Session" : "Starter Module"}</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-extrabold font-sans text-[#13141B] tracking-tight leading-snug">
                        {latestSession 
                          ? `${(latestSession.category || "General").toUpperCase()} Mock Interview Evaluation`
                          : "STAR Behavioral & System Design Drill I"
                        }
                      </h3>
                      <div className="space-y-1.5 pt-1">
                        <span className="text-xs text-[#5E6573] font-medium">
                          {latestSession 
                            ? `Evaluation Score: ${latestSession.score ?? 0}% Complete`
                            : "0% Completed • Ready to begin"
                          }
                        </span>
                        <div className="w-full sm:w-64 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#13141B] rounded-full transition-all duration-700 ease-out" 
                            style={{ width: `${latestSession ? (latestSession.score ?? 0) : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center sm:flex-col lg:flex-row gap-2 z-10 w-full md:w-auto justify-end">
                    <Link
                      href="/interviews"
                      className="px-5 py-2.5 rounded-xl bg-[#13141B] hover:bg-black text-white text-xs font-bold shadow-2xs transition-colors text-center w-full md:w-auto"
                    >
                      {latestSession ? "Practice Next Drill" : "Start Learning"}
                    </Link>
                  </div>
                </div>
              </div>

              {/* 2. Recommended For You Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h2 className="text-base sm:text-lg font-extrabold font-sans text-[#13141B]">Recommended Curriculum</h2>
                  
                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#EBECEF] shadow-2xs overflow-x-auto touch-scroll-x max-w-full">
                    {(["All", "Beginner", "Intermediate", "Advanced"] as const).map((diff) => (
                      <button
                        key={diff}
                        onClick={() => setSelectedDifficulty(diff)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                          selectedDifficulty === diff
                            ? "bg-[#13141B] text-white shadow-2xs"
                            : "text-[#5E6573] hover:text-[#13141B]"
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
                      className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EBECEF] hover:border-[#D1D5DC] shadow-xs transition-all flex items-center justify-between group"
                    >
                      <div className="space-y-2 z-10 max-w-[70%]">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#5E6573]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00D2B4]" />
                          <span>{mod.type}</span>
                        </div>
                        <h3 className="text-xs sm:text-sm font-extrabold text-[#13141B] leading-snug group-hover:text-[#00D2B4] transition-colors">
                          {mod.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${mod.badgeColor}`}>
                            {mod.difficulty}
                          </span>
                          <span className="text-[11px] text-[#5E6573]">
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
              </div>

              {/* 3. Activity & Score Intelligence Section */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#13141B] text-[#00D2B4] flex items-center justify-center font-bold shadow-2xs">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm sm:text-base font-extrabold text-[#13141B]">Score &amp; Readiness Matrix</h2>
                      <p className="text-xs text-[#5E6573]">Telemetry across interview, aptitude, and resume engines</p>
                    </div>
                  </div>
                  <Link
                    href="/aptitude"
                    className="px-3.5 py-1.5 rounded-xl bg-[#13141B] hover:bg-black text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <Brain className="w-3.5 h-3.5 text-[#00D2B4]" />
                    <span>Daily Sprint</span>
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Mock Interview Score Card */}
                  <div className="p-5 rounded-2xl bg-white border border-[#EBECEF] shadow-xs space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-[#5E6573] uppercase tracking-wider">Interview Mastery</span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${latestSession ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-slate-100 text-[#5E6573]"}`}>
                        {latestSession ? "Evaluated" : "Not Started"}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-extrabold font-mono text-[#13141B]">
                        {latestSession ? (latestSession.score ?? 0) : "—"}
                      </span>
                      <span className="text-xs text-[#5E6573]">
                        {latestSession ? "/ 100 Score" : "No interview taken"}
                      </span>
                    </div>

                    <Link
                      href="/interviews"
                      className="block text-center py-2 rounded-xl bg-[#FCFCFB] hover:bg-slate-50 border border-[#EBECEF] text-xs font-bold text-[#13141B] transition-colors"
                    >
                      {latestSession ? "View Report →" : "Start Interview →"}
                    </Link>
                  </div>

                  {/* Daily Aptitude Performance Card */}
                  <div className="p-5 rounded-2xl bg-white border border-[#EBECEF] shadow-xs space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-[#5E6573] uppercase tracking-wider">Aptitude Agility</span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                        Daily
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-extrabold font-mono text-[#13141B]">
                        {aptitudeStats.totalAttempts > 0 ? `${aptitudeStats.avgScore}%` : "—"}
                      </span>
                      <span className="text-xs text-[#5E6573]">
                        {aptitudeStats.totalAttempts > 0 ? "Accuracy" : "No sprints taken"}
                      </span>
                    </div>

                    <Link
                      href="/aptitude"
                      className="block text-center py-2 rounded-xl bg-[#FCFCFB] hover:bg-slate-50 border border-[#EBECEF] text-xs font-bold text-[#13141B] transition-colors"
                    >
                      {aptitudeStats.totalAttempts > 0 ? "Take Today's Sprint →" : "Start Aptitude Sprint →"}
                    </Link>
                  </div>

                  {/* Resume & ATS Readiness Card */}
                  <div className="p-5 rounded-2xl bg-white border border-[#EBECEF] shadow-xs space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-[#5E6573] uppercase tracking-wider">ATS Readiness</span>
                      <span className="px-2 py-0.5 rounded-md bg-[#00D2B4]/10 text-[#0A5245] border border-[#00D2B4]/20 text-[10px] font-bold">
                        AI Tailored
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-extrabold text-[#13141B]">
                        {profile?.targetRole ? "Ready" : "Draft"}
                      </span>
                      <span className="text-xs text-[#5E6573]">ATS Alignment</span>
                    </div>

                    <Link
                      href="/resumes"
                      className="block text-center py-2 rounded-xl bg-[#FCFCFB] hover:bg-slate-50 border border-[#EBECEF] text-xs font-bold text-[#13141B] transition-colors"
                    >
                      Open Resume Maker →
                    </Link>
                  </div>
                </div>
              </section>

              {/* Gamification HUD */}
              <GamificationHUD />

            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
