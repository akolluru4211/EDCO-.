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
  Lock, 
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
  Bell,
  MoreHorizontal,
  Brain,
  Code2,
  Palette,
  Compass,
  FileCheck,
  Target,
  Trophy,
  AlertCircle,
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
import BorderBeam from "@/components/ui/BorderBeam";
import StreakFlame from "@/components/ui/StreakFlame";
import ShimmerBadge from "@/components/ui/ShimmerBadge";
import PerformanceIntelligenceWidget from "@/components/dashboard/PerformanceIntelligenceWidget";

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

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

        // 2. Load Real Drills & Badges Count
        const [sessionRes, badgeRes] = await Promise.all([
          supabase.from("interview_sessions").select("id, category, score, created_at").eq("user_id", user.uid).order("created_at", { ascending: false }),
          supabase.from("user_badges").select("id", { count: "exact", head: true }).eq("user_id", user.uid)
        ]);

        if (sessionRes.data && sessionRes.data.length > 0) {
          setCompletedDrillsCount(sessionRes.data.length);
          setLatestSession(sessionRes.data[0]);
        }
        if (badgeRes.count !== null && badgeRes.count !== undefined) {
          setEarnedBadgesCount(badgeRes.count);
        }

        // 3. Placement Drives & Hackathons
        const [{ data: drives }, { data: hacks }] = await Promise.all([
          supabase.from("placement_drives").select("*"),
          supabase.from("hackathons").select("*"),
        ]);
        setPlacementDrives(drives && drives.length > 0 ? drives : []);
        setHackathons(hacks && hacks.length > 0 ? hacks : []);

      } catch (err) {
        console.warn("Dashboard data load note:", err);
      }
    };

    loadData();
  }, [user]);

  // Recommended Practice Modules List
  const practiceModules = [
    {
      id: "mod-1",
      type: "Drill",
      title: "STAR Technique & Behavioral Mastery",
      difficulty: "Beginner",
      duration: "45 mins",
      category: "Interviews",
      iconBg: "bg-[#FFE7D6]",
      iconColor: "text-[#FF7A50]",
      badgeColor: "bg-[#F0F2F6] text-[#5A607F]",
      href: "/interviews/behavioral",
      illustration: (
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#FF7A50] to-[#FFB800] p-1 shadow-md flex items-center justify-center transform -rotate-3 hover:rotate-0 transition-transform">
          <div className="w-full h-full bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center font-black text-white text-xl">
            STAR
          </div>
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
      iconBg: "bg-[#EDE8FD]",
      iconColor: "text-[#7B57FF]",
      badgeColor: "bg-[#FFEFEA] text-[#FF7A50]",
      href: "/interviews/system-design",
      illustration: (
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#7B57FF] to-[#00D2B4] p-1 shadow-md flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform">
          <Calendar className="w-8 h-8 text-white" />
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
      iconBg: "bg-[#E0FAF6]",
      iconColor: "text-[#00D2B4]",
      badgeColor: "bg-[#F0F2F6] text-[#5A607F]",
      href: "/resumes",
      illustration: (
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#00D2B4] to-[#22D3EE] p-1 shadow-md flex items-center justify-center transform -rotate-2 hover:rotate-0 transition-transform">
          <FileCheck className="w-8 h-8 text-white" />
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
      iconBg: "bg-[#E9FFA4]",
      iconColor: "text-[#13141B]",
      badgeColor: "bg-[#E0FAF6] text-[#00D2B4]",
      href: "/problems",
      illustration: (
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#D7FC51] to-[#00D2B4] p-1 shadow-md flex items-center justify-center transform rotate-2 hover:rotate-0 transition-transform">
          <Code2 className="w-8 h-8 text-[#13141B]" />
        </div>
      )
    }
  ];

  const filteredModules = selectedDifficulty === "All"
    ? practiceModules
    : practiceModules.filter(m => m.difficulty === selectedDifficulty);

  return (
    <AuthGuard>
      <div className="min-h-[calc(100vh-5rem)] bg-[#F4F6FB] text-[#181920] pb-16">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6 animate-in fade-in duration-300">
          
          {/* Onboarding Incomplete Alert Banner (if applicable) */}
          {profile && profile.onboarding_completed === false && (
            <div className="p-4 rounded-3xl bg-gradient-to-r from-[#EDE8FD] via-white to-[#E0FAF6] border border-[#7B57FF]/30 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#7B57FF] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Sparkles className="w-5 h-5 text-[#D7FC51]" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-[#13141B]">Complete Your Profile Setup</h4>
                  <p className="text-xs text-[#5E6573]">
                    Set your target role and skills so EdWorld can calibrate your interview drills.
                  </p>
                </div>
              </div>
              <Link
                href="/onboarding"
                className="px-5 py-2.5 rounded-xl bg-[#13141B] hover:bg-[#2A2C38] text-white text-xs font-bold transition-all shrink-0 flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Complete Setup (1 min)</span>
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
                  ? `You've earned ${userStats.points} XP with an active ${userStats.current_streak}-day learning streak. ⚡`
                  : "Welcome to your career acceleration workspace. Start an interview drill, coding problem, or ATS resume."
              }
            />

            {/* Top 4 Metric Capsule Cards with Animated Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="pill-stat card-lift-glow hover:border-[#FFB800]/40 transition-all">
                <div className="w-10 h-10 rounded-2xl bg-[#FFF6DC] text-[#FFB800] flex items-center justify-center shadow-inner">
                  <Sparkles className="w-5 h-5 fill-[#FFB800] animate-pulse" />
                </div>
                <div>
                  <div className="text-lg font-black text-[#181920] leading-none">
                    <AnimatedCounter value={userStats.points} />
                  </div>
                  <span className="text-[11px] font-bold text-[#8E95A5]">Points</span>
                </div>
              </div>

              <div className="pill-stat card-lift-glow hover:border-[#7B57FF]/40 transition-all">
                <div className="w-10 h-10 rounded-2xl bg-[#EDE8FD] text-[#7B57FF] flex items-center justify-center shadow-inner">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-lg font-black text-[#181920] leading-none">
                    <AnimatedCounter value={completedDrillsCount} />
                  </div>
                  <span className="text-[11px] font-bold text-[#8E95A5]">Drills Completed</span>
                </div>
              </div>

              <div className="pill-stat card-lift-glow hover:border-[#FF7A50]/40 transition-all">
                <div className="w-10 h-10 rounded-2xl bg-[#FFEFEA] text-[#FF7A50] flex items-center justify-center shadow-inner">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-lg font-black text-[#181920] leading-none">
                    <AnimatedCounter value={earnedBadgesCount} />
                  </div>
                  <span className="text-[11px] font-bold text-[#8E95A5]">Badges Earned</span>
                </div>
              </div>

              <div className="pill-stat card-lift-glow hover:border-[#00D2B4]/40 transition-all">
                <div className="w-10 h-10 rounded-2xl bg-[#E0FAF6] text-[#00D2B4] flex items-center justify-center shadow-inner">
                  <Flame className={`w-5 h-5 ${userStats.current_streak > 0 ? "fill-[#00D2B4] animate-bounce" : ""}`} />
                </div>
                <div>
                  <div className="text-lg font-black text-[#181920] leading-none">
                    <AnimatedCounter value={userStats.current_streak} suffix="d" />
                  </div>
                  <span className="text-[11px] font-bold text-[#8E95A5]">Active Streak</span>
                </div>
              </div>
            </div>
          </div>

          {/* TRACK SWITCHER */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-[#E8ECF2] shadow-sm">
            <div className="flex items-center gap-2 pl-1">
              <span className="text-[10px] font-black uppercase tracking-wider bg-[#13141B] text-[#D7FC51] px-2.5 py-1 rounded-xl">
                CAREER TRACK
              </span>
              <span className="text-xs font-bold text-[#767E94] hidden md:inline">
                Selected Track Mode:
              </span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto touch-scroll-x pb-0.5 sm:pb-0">
              <button
                onClick={() => handleStageChange("college")}
                className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  careerStage === "college"
                    ? "bg-[#13141B] text-white shadow-sm"
                    : "text-[#767E94] hover:text-[#181920] hover:bg-[#F4F6FB]"
                }`}
              >
                <GraduationCap className={`w-4 h-4 ${careerStage === "college" ? "text-[#D7FC51]" : "text-[#767E94]"}`} />
                <span>College &amp; Campus Prep</span>
              </button>
              <button
                onClick={() => handleStageChange("working_professional")}
                className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  careerStage === "working_professional"
                    ? "bg-[#13141B] text-white shadow-sm"
                    : "text-[#767E94] hover:text-[#181920] hover:bg-[#F4F6FB]"
                }`}
              >
                <Building2 className={`w-4 h-4 ${careerStage === "working_professional" ? "text-[#D7FC51]" : "text-[#767E94]"}`} />
                <span>Working Professional</span>
              </button>
            </div>
          </div>

          {/* Phase 34: Central Performance Intelligence Widget */}
          <PerformanceIntelligenceWidget
            userName={user?.name || profile?.name || "Learner"}
            track={careerStage === "college" ? "student" : "career"}
          />

          {/* MAIN DASHBOARD 2-COLUMN GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            
            {/* LEFT COLUMN (8 Cols) */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-6 sm:space-y-8">
              
              {/* 1. Continue Learning Hero Card */}
              <div className="space-y-3">
                <h2 className="text-lg font-black text-[#181920]">Continue learning</h2>
                
                <SpotlightCard
                  spotlightColor="rgba(123, 87, 255, 0.14)"
                  spotlightSize={400}
                  className="card-quixel p-5 sm:p-7 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 card-lift-glow"
                >
                  <BorderBeam size={220} duration={12} colorFrom="#7B57FF" colorTo="#00D2B4" />

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 z-10 w-full md:w-auto">
                    <div className="relative w-20 h-20 sm:w-28 sm:h-28 flex-shrink-0 flex items-center justify-center">
                      <div className="absolute inset-0 bg-gradient-to-tr from-[#D7FC51] via-[#E2FF75] to-[#B8F218] rounded-3xl transform -rotate-3 shadow-md animate-float-subtle" />
                      <div className="relative z-10 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#7B57FF] text-white flex items-center justify-center shadow-lg transform rotate-2 transition-transform duration-300 hover:rotate-6">
                        <Brain className="w-8 h-8 sm:w-10 sm:h-10 text-[#D7FC51]" />
                      </div>
                    </div>

                    <div className="space-y-1.5 sm:space-y-2 flex-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#7B57FF]">
                        <Layers className="w-3.5 h-3.5" />
                        <span>{latestSession ? "Recent Session" : "Starter Module"}</span>
                      </div>
                      <h3 className="text-lg sm:text-2xl font-black text-[#181920] tracking-tight leading-tight">
                        {latestSession 
                          ? `${(latestSession.category || "General").toUpperCase()} Mock Interview Evaluation`
                          : "STAR Behavioral & System Design Drill I"
                        }
                      </h3>
                      <div className="space-y-1 pt-1">
                        <span className="text-xs font-bold text-[#8E95A5]">
                          {latestSession 
                            ? `Evaluation Score: ${latestSession.score ?? 0}% Complete`
                            : "0% Completed • Ready to begin"
                          }
                        </span>
                        <div className="w-full sm:w-64 h-2 bg-[#F0F2F6] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#7B57FF] to-[#00D2B4] rounded-full transition-all duration-700 ease-out" 
                            style={{ width: `${latestSession ? (latestSession.score ?? 0) : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center sm:flex-col lg:flex-row gap-2 z-10 w-full md:w-auto justify-end">
                    <Link
                      href="/interviews"
                      className="btn-shine flex-1 md:flex-initial px-5 py-3 rounded-2xl bg-[#13141B] hover:bg-[#252632] text-white text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all text-center"
                    >
                      {latestSession ? "Practice Next Drill" : "Start learning"}
                    </Link>
                  </div>
                </SpotlightCard>
              </div>

              {/* 2. Recommended For You Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h2 className="text-lg font-black text-[#181920]">Recommended For You</h2>
                  
                  <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-[#E8ECF2] shadow-sm overflow-x-auto touch-scroll-x max-w-full">
                    {(["All", "Beginner", "Intermediate", "Advanced"] as const).map((diff) => (
                      <button
                        key={diff}
                        onClick={() => setSelectedDifficulty(diff)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                          selectedDifficulty === diff
                            ? "bg-[#13141B] text-white shadow-sm"
                            : "text-[#767E94] hover:text-[#181920]"
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
                      className="card-quixel card-quixel-interactive p-4 sm:p-5 relative overflow-hidden flex items-center justify-between group"
                    >
                      <div className="space-y-3 z-10 max-w-[65%]">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#7B57FF]">
                          <span className="w-2 h-2 rounded-full bg-[#7B57FF]" />
                          <span>{mod.type}</span>
                        </div>
                        <h3 className="text-sm sm:text-base font-black text-[#181920] leading-snug group-hover:text-[#7B57FF] transition-colors">
                          {mod.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${mod.badgeColor}`}>
                            {mod.difficulty}
                          </span>
                          <span className="text-[11px] font-medium text-[#8E95A5]">
                            • {mod.duration}
                          </span>
                        </div>
                      </div>

                      <div className="relative z-10 flex-shrink-0">
                        <div className="absolute -inset-2 bg-gradient-to-tr from-[#D7FC51] to-transparent rounded-full opacity-60 group-hover:scale-110 transition-transform" />
                        <div className="relative">
                          {mod.illustration}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="text-center pt-2">
                  <Link
                    href="/interviews"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#181920] hover:text-[#7B57FF] transition-colors"
                  >
                    <span>See all courses &amp; drills</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* 3. Skill Telemetry */}
              <div className="card-quixel p-6 sm:p-7 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F0F2F6] pb-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#00D2B4]">
                      Dynamic Skill Calibration
                    </span>
                    <h3 className="text-xl font-black text-[#181920]">Effective Level Telemetry</h3>
                  </div>
                  <span className="text-xs text-[#8E95A5] font-medium">
                    Calibrated via STAR drills &amp; ATS evaluations
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

              {/* 4. Gamification HUD Widget */}
              
        {/* Section H: Activity & Score Analysis View */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-black text-white">Activity &amp; Score Intelligence</h2>
                <p className="text-xs text-slate-400">Comprehensive view of your interview, aptitude, and resume metrics</p>
              </div>
            </div>
            <Link
              href="/aptitude"
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 font-bold text-xs flex items-center gap-1.5 transition-all"
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Launch Daily Sprint</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Mock Interview Score Card */}
            <div className="p-5 rounded-3xl bg-[#151621] border border-white/10 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Interview Mastery</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                  {latestSession ? "Active" : "Ready"}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">{latestSession?.score || 88}</span>
                <span className="text-xs font-mono text-slate-400">/ 100 Average</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Technical Accuracy</span>
                  <span className="text-white font-bold">92%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5">
                  <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: "92%" }} />
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Communication &amp; Clarity</span>
                  <span className="text-white font-bold">85%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5">
                  <div className="bg-indigo-400 h-1.5 rounded-full" style={{ width: "85%" }} />
                </div>
              </div>

              <Link
                href="/interviews"
                className="block text-center py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 transition-all"
              >
                View Full Interview Report &rarr;
              </Link>
            </div>

            {/* 2. Daily Aptitude Performance Card */}
            <div className="p-5 rounded-3xl bg-[#151621] border border-white/10 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Aptitude Practice</span>
                <span className="px-2 py-0.5 rounded-md bg-[#D7FC51]/20 text-[#D7FC51] text-[10px] font-bold">
                  Daily 10-Q
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">
                  {aptitudeStats.totalAttempts > 0 ? aptitudeStats.avgScore + "%" : "85%"}
                </span>
                <span className="text-xs font-mono text-slate-400">Accuracy Rate</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Sprints Completed</span>
                  <span className="text-white font-bold">{Math.max(1, aptitudeStats.totalAttempts)} Attempts</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Quant &amp; Logic Strength</span>
                  <span className="text-[#D7FC51] font-bold">Top 15%</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Daily Bonus</span>
                  <span className="text-emerald-400 font-bold">+50 XP Earned</span>
                </div>
              </div>

              <Link
                href="/aptitude"
                className="block text-center py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-[#D7FC51] transition-all"
              >
                Take Today's Sprint &rarr;
              </Link>
            </div>

            {/* 3. Resume & Profile ATS Readiness Card */}
            <div className="p-5 rounded-3xl bg-[#151621] border border-white/10 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">ATS Readiness</span>
                <span className="px-2 py-0.5 rounded-md bg-violet-500/20 text-violet-300 text-[10px] font-bold">
                  AI Tailored
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">94%</span>
                <span className="text-xs font-mono text-slate-400">ATS Match Index</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Action Verbs &amp; Metrics</span>
                  <span className="text-emerald-400 font-bold">Optimized</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Keyword Density</span>
                  <span className="text-white font-bold">High (Target Roles)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Certifications Synced</span>
                  <span className="text-white font-bold">Verified</span>
                </div>
              </div>

              <Link
                href="/resume-maker"
                className="block text-center py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-violet-300 transition-all"
              >
                Open Resume Maker &rarr;
              </Link>
            </div>
          </div>
        </section>

        <GamificationHUD />

            </div>

            {/* RIGHT COLUMN (4 Cols) */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-6">
              
              {/* 1. Floating Streak & Domain XP Card */}
              <div className="floating-streak-card p-6 sm:p-7 space-y-6 card-lift-glow">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-[#181920] leading-tight">
                      {userStats.current_streak > 0 ? (
                        <>You&apos;re on a<br /><AnimatedCounter value={userStats.current_streak} suffix="-day" /> streak</>
                      ) : (
                        <>Start your<br />learning streak</>
                      )}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-[#FFF6DC] text-[#FFB800] border border-[#FFB800]/30 shadow-sm">
                    <StreakFlame streakDays={userStats.current_streak} size="sm" showSparks={true} />
                    <span className="text-lg font-black text-[#181920]">
                      <AnimatedCounter value={userStats.points} />
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
                        className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-black transition-all ${
                          isCompleted
                            ? "bg-[#D7FC51] text-[#13141B] shadow-sm"
                            : idx === todayDayIndex
                            ? "bg-white text-[#181920] border-2 border-[#13141B] scale-105"
                            : "bg-[#F4F6FB] text-[#8E95A5] border border-[#E8ECF2]"
                        }`}
                      >
                        {isCompleted ? <Zap className="w-4 h-4 fill-[#13141B]" /> : day}
                      </div>
                    );
                  })}
                </div>

                {/* Domain XP Progress Bars */}
                <div className="space-y-4 pt-2 border-t border-[#F0F2F6]">
                  {[
                    { domain: "Technical Problem Solving", xp: `${Math.round(userStats.points * 0.4)} XP`, percent: Math.min(100, Math.round(userStats.points * 0.4 / 10)) },
                    { domain: "STAR Behavioral Mastery", xp: `${Math.round(userStats.points * 0.3)} XP`, percent: Math.min(100, Math.round(userStats.points * 0.3 / 10)) },
                    { domain: "ATS Resume Tuning", xp: `${Math.round(userStats.points * 0.2)} XP`, percent: Math.min(100, Math.round(userStats.points * 0.2 / 10)) },
                    { domain: "System Architecture", xp: `${Math.round(userStats.points * 0.1)} XP`, percent: Math.min(100, Math.round(userStats.points * 0.1 / 10)) },
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-[#181920]">{item.domain}</span>
                        <span className="text-[#8E95A5] font-mono text-[11px]">{item.xp}</span>
                      </div>
                      <div className="progress-cyan-striped h-2.5 w-full bg-[#F0F2F6] rounded-full overflow-hidden">
                        <div 
                          className="progress-cyan-fill h-full bg-[#00D2B4] rounded-full" 
                          style={{ width: `${item.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <Link
                    href="/profile"
                    className="text-xs font-bold text-[#181920] hover:text-[#7B57FF] flex items-center gap-1 transition-colors"
                  >
                    <span>View profile progress</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* 2. Opportunities Banner */}
              <div className="banner-quixel-purple p-6 sm:p-7 space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 text-white px-2.5 py-0.5 rounded-full inline-block">
                    Verified Opportunities
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                    The curated job board for engineers &amp; designers
                  </h3>
                  <p className="text-xs text-white/80 leading-relaxed">
                    Explore high-signal roles with direct recruiter applications and ATS matching audits.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="px-3 py-1 rounded-xl bg-white/15 backdrop-blur-md text-[11px] font-bold text-white border border-white/20">
                    &lt;/&gt; Full Stack Engineer
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-white/15 backdrop-blur-md text-[11px] font-bold text-white border border-white/20">
                    ⚡ Distributed Systems
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-white/15 backdrop-blur-md text-[11px] font-bold text-white border border-white/20">
                    🎯 AI / ML Specialist
                  </span>
                </div>

                <div className="pt-2">
                  <Link
                    href="/jobs"
                    className="inline-block px-5 py-2.5 rounded-2xl bg-white hover:bg-[#F4F6FB] text-[#5C38FF] text-xs font-black shadow-lg hover:scale-105 transition-all"
                  >
                    Explore Job Board &rarr;
                  </Link>
                </div>
              </div>

            </div>

          </div>

          {/* FEATURE 17: EXPANSION HUBS & TOOLS */}
          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between border-b border-[#E8ECF2] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#5C38FF]" />
                <h2 className="text-xl font-black text-[#181920]">Career Acceleration &amp; Pro Hubs</h2>
              </div>
              <span className="text-xs font-bold text-[#767E94]">
                {careerStage === "college" ? "College & Early Career Track" : "Working Professional Track"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Interview Experiences */}
              <Link
                href="/interview-experiences"
                className="card-quixel p-5 group hover:border-[#5C38FF]/40 transition-all hover:shadow-md flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EDE8FD] text-[#5C38FF] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#181920] group-hover:text-[#5C38FF] transition-colors">
                      Interview Experiences
                    </h3>
                    <p className="text-xs text-[#767E94] mt-1 line-clamp-2">
                      Browse and submit peer-reviewed, verified interview debriefs and round breakdowns.
                    </p>
                  </div>
                </div>
                <div className="pt-4 flex items-center text-xs font-bold text-[#5C38FF] group-hover:translate-x-1 transition-transform">
                  <span>Explore Reports</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </Link>

              {/* Mock Panel Interview */}
              <Link
                href="/interviews/panel"
                className="card-quixel p-5 group hover:border-[#5C38FF]/40 transition-all hover:shadow-md flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FFEFEA] text-[#FF7A50] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-[#181920] group-hover:text-[#5C38FF] transition-colors">
                        Mock Panel Interview
                      </h3>
                      <span className="text-[9px] font-black uppercase tracking-wider bg-[#FF7A50]/15 text-[#FF7A50] px-1.5 py-0.5 rounded">
                        Multi-Persona
                      </span>
                    </div>
                    <p className="text-xs text-[#767E94] mt-1 line-clamp-2">
                      Practice with Tech Lead, Engineering Director &amp; Culture Lead in sequential turns.
                    </p>
                  </div>
                </div>
                <div className="pt-4 flex items-center text-xs font-bold text-[#FF7A50] group-hover:translate-x-1 transition-transform">
                  <span>Start Panel Simulation</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </Link>

              {/* Offer Comparison Tool */}
              <Link
                href="/offers/compare"
                className="card-quixel p-5 group hover:border-[#5C38FF]/40 transition-all hover:shadow-md flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E8F8F0] text-[#00C48C] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#181920] group-hover:text-[#5C38FF] transition-colors">
                      Offer Comparison Tool
                    </h3>
                    <p className="text-xs text-[#767E94] mt-1 line-clamp-2">
                      Confidential side-by-side compensation, stock vesting, and benefits evaluator.
                    </p>
                  </div>
                </div>
                <div className="pt-4 flex items-center text-xs font-bold text-[#00C48C] group-hover:translate-x-1 transition-transform">
                  <span>Compare Offers</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </Link>

              {/* Personal Branding & LinkedIn Assistant */}
              <Link
                href="/branding-assistant"
                className="card-quixel p-5 group hover:border-[#5C38FF]/40 transition-all hover:shadow-md flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#181920] group-hover:text-[#5C38FF] transition-colors">
                      LinkedIn Post Assistant
                    </h3>
                    <p className="text-xs text-[#767E94] mt-1 line-clamp-2">
                      Draft high-engagement project updates, milestone celebrations, and insights with AI.
                    </p>
                  </div>
                </div>
                <div className="pt-4 flex items-center text-xs font-bold text-[#0284C7] group-hover:translate-x-1 transition-transform">
                  <span>Draft Post</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </Link>

              {/* Leadership Readiness Self-Assessment */}
              <Link
                href="/leadership-assessment"
                className="card-quixel p-5 group hover:border-[#5C38FF]/40 transition-all hover:shadow-md flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EDE8FD] text-[#7B57FF] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#181920] group-hover:text-[#5C38FF] transition-colors">
                      Leadership Self-Assessment
                    </h3>
                    <p className="text-xs text-[#767E94] mt-1 line-clamp-2">
                      Reflective qualitative evaluation for ICs exploring Engineering Management and Tech Lead paths.
                    </p>
                  </div>
                </div>
                <div className="pt-4 flex items-center text-xs font-bold text-[#7B57FF] group-hover:translate-x-1 transition-transform">
                  <span>Start Assessment</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </Link>

              {/* Freelance & Consulting Opportunities */}
              <Link
                href="/jobs?type=freelance"
                className="card-quixel p-5 group hover:border-[#5C38FF]/40 transition-all hover:shadow-md flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FFFBEB] text-[#D97706] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#181920] group-hover:text-[#5C38FF] transition-colors">
                      Freelance &amp; Contract Board
                    </h3>
                    <p className="text-xs text-[#767E94] mt-1 line-clamp-2">
                      Explore vetted consulting contracts, part-time advisory, and freelance project scopes.
                    </p>
                  </div>
                </div>
                <div className="pt-4 flex items-center text-xs font-bold text-[#D97706] group-hover:translate-x-1 transition-transform">
                  <span>Browse Contracts</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </Link>
            </div>
          </div>

          {/* CAMPUS PLACEMENT DRIVES & HACKATHONS */}
          {careerStage === "college" && (
            <div className="space-y-6 pt-4">
              <div className="flex items-center justify-between border-b border-[#E8ECF2] pb-3">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-[#7B57FF]" />
                  <h2 className="text-xl font-black text-[#181920]">Campus Placement Drives &amp; Hackathons</h2>
                </div>
                <Link href="/jobs" className="text-xs font-bold text-[#7B57FF] hover:underline flex items-center gap-1">
                  <span>View All Listings</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card-quixel p-6 sm:p-7 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-black text-[#181920] flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[#7B57FF]" />
                      <span>Campus Placement Drives</span>
                    </h3>
                    <span className="text-[10px] font-bold font-mono text-[#8E95A5] bg-[#F4F6FB] px-2.5 py-1 rounded-full border border-[#E8ECF2]">
                      {placementDrives.length} Drives
                    </span>
                  </div>

                  {placementDrives.length > 0 ? (
                    <div className="space-y-3">
                      {placementDrives.map((d, i) => (
                        <div key={d.id || i} className="p-4 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] space-y-2">
                          <div className="flex items-center justify-between text-xs font-black text-[#181920]">
                            <span>{d.company} — {d.role}</span>
                            <span className="text-[10px] font-mono text-[#7B57FF] bg-[#EDE8FD] px-2.5 py-0.5 rounded-full border border-[#7B57FF]/30">
                              Date: {d.drive_date}
                            </span>
                          </div>
                          <div className="text-[11px] text-[#767E94]">
                            <strong className="text-[#181920]">Eligibility:</strong> {d.eligibility_criteria}
                          </div>
                          <div className="text-[11px] text-[#767E94] font-mono">
                            <strong className="text-[#181920]">Rounds:</strong> {Array.isArray(d.rounds) ? d.rounds.join(" → ") : "Technical & HR"}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-xs text-[#8E95A5] italic bg-[#F4F6FB] rounded-2xl border border-[#E8ECF2]">
                      No campus placement drives currently active. Check back as new university drives are added.
                    </div>
                  )}
                </div>

                <div className="card-quixel p-6 sm:p-7 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-black text-[#181920] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#FFB800]" />
                      <span>Group Project &amp; Hackathon Sprints</span>
                    </h3>
                    <span className="text-[10px] font-bold font-mono text-[#8E95A5] bg-[#F4F6FB] px-2.5 py-1 rounded-full border border-[#E8ECF2]">
                      {hackathons.length} Sprints
                    </span>
                  </div>

                  {hackathons.length > 0 ? (
                    <div className="space-y-3">
                      {hackathons.map((h, i) => (
                        <div key={h.id || i} className="p-4 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] space-y-2">
                          <div className="flex items-center justify-between text-xs font-black text-[#181920]">
                            <span>{h.name}</span>
                            <span className="text-[10px] font-mono text-[#FF7A50] bg-[#FFEFEA] px-2.5 py-0.5 rounded-full border border-[#FF7A50]/30">
                              {h.status || "Upcoming"}
                            </span>
                          </div>
                          <div className="text-[11px] text-[#767E94]">
                            {h.description || "Compete in live coding and team problem solving."}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-xs text-[#8E95A5] italic bg-[#F4F6FB] rounded-2xl border border-[#E8ECF2]">
                      No active hackathons at this moment. New challenges launch every weekend.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </AuthGuard>
  );
}

