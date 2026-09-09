"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { 
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
  Trophy
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import GrowthRing from "@/components/ui/GrowthRing";

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  const isJuniorTrack = user?.ageBand === "13-15";
  const isExplorerTrack = user?.ageBand === "16-18";
  const isCareerTrack = user?.ageBand === "18+";

  // Career Stage (college vs working_professional)
  const [careerStage, setCareerStage] = useState<"college" | "working_professional">(
    (profile?.careerStage as any) || "working_professional"
  );

  // Filter for Recommended modules
  const [selectedDifficulty, setSelectedDifficulty] = useState<"All" | "Beginner" | "Intermediate" | "Advanced">("All");

  // College-specific data
  const [placementDrives, setPlacementDrives] = useState<any[]>([]);
  const [hackathons, setHackathons] = useState<any[]>([]);

  // Working-prof data
  const [salaryData, setSalaryData] = useState<any[]>([]);
  const [selectedTargetRole, setSelectedTargetRole] = useState("fullstack_engineer");

  // User Gamification Stats
  const [userStats, setUserStats] = useState<{
    points: number;
    current_streak: number;
    longest_streak: number;
  }>({ points: 248, current_streak: 5, longest_streak: 12 });

  // Kanban Application Tracker
  const [kanbanApps, setKanbanApps] = useState<{
    applied: any[];
    interviewing: any[];
    offer: any[];
    rejected: any[];
  }>({ applied: [], interviewing: [], offer: [], rejected: [] });

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
    if (!user || isJuniorTrack) return;

    const loadData = async () => {
      try {
        // Load User Stats
        const { data: sData } = await supabase
          .from("user_stats")
          .select("*")
          .eq("user_id", user.uid)
          .maybeSingle();
        if (sData) {
          setUserStats({
            points: sData.points || 248,
            current_streak: sData.current_streak || 5,
            longest_streak: sData.longest_streak || 12,
          });
        }

        // 1. College stage data
        const { data: drives } = await supabase.from("placement_drives").select("*");
        if (drives && drives.length > 0) setPlacementDrives(drives);
        else {
          setPlacementDrives([
            {
              id: "d1",
              company: "Google India",
              role: "Software Engineer - Campus Grad",
              drive_date: "2026-09-24",
              eligibility_criteria: "B.Tech / M.Tech CS/IT with CGPA >= 8.0",
              rounds: ["Online Assessment", "Technical Interview 1", "Technical Interview 2", "Googliness / HR"]
            },
            {
              id: "d2",
              company: "Microsoft",
              role: "Support & Software Engineer",
              drive_date: "2026-10-02",
              eligibility_criteria: "CGPA >= 7.5, Zero active backlogs",
              rounds: ["Coding Round", "System Design Drill", "Managerial Round"]
            }
          ]);
        }

        const { data: hacks } = await supabase.from("hackathons").select("*");
        if (hacks && hacks.length > 0) setHackathons(hacks);
        else {
          setHackathons([
            {
              id: "h1",
              name: "AI & Distributed Cloud Hackathon 2026",
              team_size_range: "2-4 Members",
              description: "Build next-gen autonomous LLM agents and scalable cloud architectures.",
              event_date: "2026-09-30",
              registration_url: "https://hackathons.dev"
            },
            {
              id: "h2",
              name: "FinTech Security Sprint",
              team_size_range: "Solo / Duo",
              description: "Design zero-knowledge verification pipelines for real-time payment transactions.",
              event_date: "2026-10-15",
              registration_url: "https://hackathons.dev"
            }
          ]);
        }

        // 2. Working Prof data
        const { data: salaries } = await supabase.from("salary_reference_data").select("*");
        if (salaries && salaries.length > 0) setSalaryData(salaries);
        else {
          setSalaryData([
            { id: "s1", role: "Senior Full Stack Engineer", city: "Bengaluru", experience_bracket: "4-7 Yrs", p25_inr: 2400000, p50_median_inr: 3200000, p75_inr: 4500000, data_source: "Aggregated Tech Market Benchmark" },
            { id: "s2", role: "AI / ML Solutions Engineer", city: "Hyderabad", experience_bracket: "3-6 Yrs", p25_inr: 2800000, p50_median_inr: 3800000, p75_inr: 5200000, data_source: "Aggregated Tech Market Benchmark" },
            { id: "s3", role: "Product Manager (Technical)", city: "Remote / Pan-India", experience_bracket: "5-8 Yrs", p25_inr: 2600000, p50_median_inr: 3500000, p75_inr: 4800000, data_source: "Aggregated Tech Market Benchmark" }
          ]);
        }

        // Kanban Applications
        setKanbanApps({
          applied: [
            { id: "app-1", role: "Software Engineer", company: "Stripe", date: "2 days ago" },
            { id: "app-2", role: "Frontend Developer", company: "Vercel", date: "4 days ago" }
          ],
          interviewing: [
            { id: "app-3", role: "Full Stack Engineer", company: "Linear", date: "Round 2: System Design" }
          ],
          offer: [
            { id: "app-4", role: "Product Engineer", company: "Supabase", date: "Offer Received" }
          ],
          rejected: []
        });

      } catch (err) {
        console.warn("Dashboard data load note:", err);
      }
    };

    loadData();
  }, [user, isJuniorTrack]);

  // Recommended Practice Modules List (matching Quixel 2x2 grid aesthetic)
  const practiceModules = [
    {
      id: "mod-1",
      type: "Course",
      title: "STAR Technique & Behavioral Mastery",
      difficulty: "Beginner",
      duration: "1 hour",
      category: "Interviews",
      iconBg: "bg-[#FFE7D6]",
      iconColor: "text-[#FF7A50]",
      badgeColor: "bg-[#F0F2F6] text-[#5A607F]",
      href: "/interviews/behavioral",
      illustration: (
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#FF7A50] to-[#FFB800] p-1 shadow-md flex items-center justify-center transform -rotate-3 hover:rotate-0 transition-transform">
          <div className="w-full h-full bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center font-black text-white text-xl">
            ABC
          </div>
        </div>
      )
    },
    {
      id: "mod-2",
      type: "Course",
      title: "Distributed System Design Drill",
      difficulty: "Advanced",
      duration: "3 hours",
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
      type: "Challenge",
      title: "ATS Resume Keyword Tuning",
      difficulty: "Beginner",
      duration: "8 questions",
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
      type: "Challenge",
      title: "High-Frequency System Architecture",
      difficulty: "Intermediate",
      duration: "24 questions",
      category: "Engineering",
      iconBg: "bg-[#E9FFA4]",
      iconColor: "text-[#13141B]",
      badgeColor: "bg-[#E0FAF6] text-[#00D2B4]",
      href: "/projects",
      illustration: (
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#D7FC51] to-[#00D2B4] p-1 shadow-md flex items-center justify-center transform rotate-2 hover:rotate-0 transition-transform">
          <Palette className="w-8 h-8 text-[#13141B]" />
        </div>
      )
    }
  ];

  const filteredModules = selectedDifficulty === "All"
    ? practiceModules
    : practiceModules.filter(m => m.difficulty === selectedDifficulty);

  const userName = user?.name ? user.name.split(" ")[0] : "Learner";

  if (isJuniorTrack) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-6 bg-[#F4F6FB]">
        <div className="max-w-md w-full bg-white rounded-4xl p-8 border border-[#E8ECF2] shadow-quixel text-center space-y-4">
          <div className="w-14 h-14 rounded-3xl bg-[#D7FC51]/30 text-[#13141B] flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-[#181920]">Junior Explorer Studio</h1>
          <p className="text-xs text-[#8E95A5] leading-relaxed">
            Junior learners (13-15) practice digital literacy, curiosity quests, and private growth reflection in the School Learning Studio.
          </p>
          <Link href="/school" className="inline-block px-6 py-3 rounded-2xl bg-[#13141B] hover:bg-[#252632] text-white text-xs font-bold shadow-md transition-all">
            Enter School Learning Studio &rarr;
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#F4F6FB] text-[#181920] pb-16">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8 animate-in fade-in duration-300">
        
        {/* ========================================================================= */}
        {/* TOP GREETING & STAT CAPSULES BAR (Quixel Style)                            */}
        {/* ========================================================================= */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Greeting Header */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#181920]">
                Good Morning, {userName}!
              </h1>
            </div>
            <p className="text-sm font-medium text-[#767E94] flex items-center gap-1.5">
              You&apos;re <span className="font-bold text-[#181920]">37% closer</span> to your career goal. 
              <span className="text-[#FFB800] text-base">⚡</span>
            </p>
          </div>

          {/* Top 4 Metric Capsule Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* 1. Points Pill */}
            <div className="pill-stat">
              <div className="w-10 h-10 rounded-2xl bg-[#FFF6DC] text-[#FFB800] flex items-center justify-center shadow-inner">
                <Sparkles className="w-5 h-5 fill-[#FFB800]" />
              </div>
              <div>
                <div className="text-lg font-black text-[#181920] leading-none">{userStats.points}</div>
                <span className="text-[11px] font-bold text-[#8E95A5]">Points</span>
              </div>
            </div>

            {/* 2. Courses / Drills Pill */}
            <div className="pill-stat">
              <div className="w-10 h-10 rounded-2xl bg-[#EDE8FD] text-[#7B57FF] flex items-center justify-center shadow-inner">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg font-black text-[#181920] leading-none">17</div>
                <span className="text-[11px] font-bold text-[#8E95A5]">Courses</span>
              </div>
            </div>

            {/* 3. Certificates / Resumes Pill */}
            <div className="pill-stat">
              <div className="w-10 h-10 rounded-2xl bg-[#FFEFEA] text-[#FF7A50] flex items-center justify-center shadow-inner">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg font-black text-[#181920] leading-none">120</div>
                <span className="text-[11px] font-bold text-[#8E95A5]">Certificates</span>
              </div>
            </div>

            {/* 4. Challenges / Streak Pill */}
            <div className="pill-stat">
              <div className="w-10 h-10 rounded-2xl bg-[#E0FAF6] text-[#00D2B4] flex items-center justify-center shadow-inner">
                <Flame className="w-5 h-5 fill-[#00D2B4]" />
              </div>
              <div>
                <div className="text-lg font-black text-[#181920] leading-none">{userStats.current_streak}d</div>
                <span className="text-[11px] font-bold text-[#8E95A5]">Challenges</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SUB-STAGE SWITCHER (College vs Working Professional)                       */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-[#E8ECF2] shadow-sm">
          <div className="flex items-center gap-2 pl-1">
            <span className="text-[10px] font-black uppercase tracking-wider bg-[#13141B] text-[#D7FC51] px-2.5 py-1 rounded-xl">
              18+ CAREER TRACK
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

        {/* ========================================================================= */}
        {/* MAIN DASHBOARD 2-COLUMN GRID (Matching Layout from Screenshot)            */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* ---------------- LEFT COLUMN (8 Cols) ---------------- */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6 sm:space-y-8">
            
            {/* 1. Continue Learning Hero Card (Wide with Lime Blob Accent) */}
            <div className="space-y-3">
              <h2 className="text-lg font-black text-[#181920]">Continue learning</h2>
              
              <div className="card-quixel p-5 sm:p-7 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                
                {/* Left Section: 3D Blob Icon + Course Info */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 z-10 w-full md:w-auto">
                  {/* Lime Blob Container with 3D Brain/Illustration */}
                  <div className="relative w-20 h-20 sm:w-28 sm:h-28 flex-shrink-0 flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#D7FC51] via-[#E2FF75] to-[#B8F218] rounded-3xl transform -rotate-3 shadow-md" />
                    <div className="relative z-10 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#7B57FF] text-white flex items-center justify-center shadow-lg transform rotate-2">
                      <Brain className="w-8 h-8 sm:w-10 sm:h-10 text-[#D7FC51]" />
                    </div>
                  </div>

                  {/* Course Details */}
                  <div className="space-y-1.5 sm:space-y-2 flex-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#7B57FF]">
                      <Layers className="w-3.5 h-3.5" />
                      <span>Course</span>
                    </div>
                    <h3 className="text-lg sm:text-2xl font-black text-[#181920] tracking-tight leading-tight">
                      Design Thinking &amp; STAR Architecture I
                    </h3>
                    <div className="space-y-1 pt-1">
                      <span className="text-xs font-bold text-[#8E95A5]">46% of 100% Completed</span>
                      {/* Segmented Progress Bar */}
                      <div className="w-full sm:w-64 h-2 bg-[#F0F2F6] rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#7B57FF] to-[#00D2B4] rounded-full w-[46%]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Section: Action Buttons */}
                <div className="flex items-center sm:flex-col lg:flex-row gap-2 z-10 w-full md:w-auto justify-end">
                  <Link
                    href="/interviews"
                    className="flex-1 md:flex-initial px-5 py-3 rounded-2xl bg-[#13141B] hover:bg-[#252632] text-white text-xs font-bold shadow-md hover:scale-105 transition-all text-center"
                  >
                    Resume learning
                  </Link>
                  <div className="flex items-center gap-1.5">
                    <button 
                      aria-label="Notifications"
                      className="w-10 h-10 rounded-2xl bg-[#F4F6FB] hover:bg-[#E8ECF2] border border-[#E8ECF2] flex items-center justify-center text-[#181920] transition-colors"
                    >
                      <Bell className="w-4 h-4" />
                    </button>
                    <button 
                      aria-label="Options"
                      className="w-10 h-10 rounded-2xl bg-[#F4F6FB] hover:bg-[#E8ECF2] border border-[#E8ECF2] flex items-center justify-center text-[#181920] transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Recommended For You Section (Filter Tabs + 2x2 Grid) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-lg font-black text-[#181920]">Recommended For You</h2>
                
                {/* Filter Tabs (All, Beginner, Intermediate, Advanced) */}
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
                  <button aria-label="More filters" className="px-2 py-1 text-[#767E94] hover:text-[#181920] hidden sm:block">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 2x2 Interactive Module Cards */}
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

                    {/* Illustration with background blob */}
                    <div className="relative z-10 flex-shrink-0">
                      <div className="absolute -inset-2 bg-gradient-to-tr from-[#D7FC51] to-transparent rounded-full opacity-60 group-hover:scale-110 transition-transform" />
                      <div className="relative">
                        {mod.illustration}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* See All Courses Link */}
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

            {/* 3. Skill Telemetry & Adaptive Level Calibration */}
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
                  progress={75}
                  size={108}
                  strokeWidth={9}
                  label="Active Effective Level"
                />
                <GrowthRing
                  level={2}
                  progress={40}
                  size={92}
                  strokeWidth={8}
                  label="Advanced Benchmark"
                />
              </div>
            </div>

          </div>

          {/* ---------------- RIGHT COLUMN (4 / 5 Cols) ---------------- */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6">
            
            {/* 1. Floating Streak & Domain XP Card (Matching Screenshot) */}
            <div className="floating-streak-card p-6 sm:p-7 space-y-6">
              
              {/* Header: You're on a 5-day streak */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-[#181920] leading-tight">
                    You&apos;re on a<br />5-day streak
                  </h3>
                </div>
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-[#FFF6DC] text-[#FFB800] border border-[#FFB800]/30 shadow-sm">
                  <Flame className="w-5 h-5 fill-[#FFB800]" />
                  <span className="text-lg font-black text-[#181920]">31</span>
                </div>
              </div>

              {/* Day Pills: S M ⚡ ⚡ ⚡ ⚡ ⚡ S */}
              <div className="flex items-center justify-between gap-1">
                {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => {
                  const isCompleted = idx >= 2 && idx <= 6; // Active streak on T, W, T, F, S
                  return (
                    <div
                      key={idx}
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-black transition-transform ${
                        isCompleted
                          ? "bg-[#D7FC51] text-[#13141B] shadow-sm transform hover:scale-110"
                          : "bg-[#F4F6FB] text-[#8E95A5] border border-[#E8ECF2]"
                      }`}
                    >
                      {isCompleted ? <Zap className="w-4 h-4 fill-[#13141B]" /> : day}
                    </div>
                  );
                })}
              </div>

              {/* Domain XP Progress Bars (Cyan Striped) */}
              <div className="space-y-4 pt-2 border-t border-[#F0F2F6]">
                {[
                  { domain: "Web Design & Architecture", xp: "4,712 XP", percent: 85 },
                  { domain: "Color Psychology & STAR", xp: "4,328 XP", percent: 78 },
                  { domain: "UX Writing & ATS Match", xp: "2,810 XP", percent: 55 },
                  { domain: "Design Thinking II", xp: "1,561 XP", percent: 35 },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-[#181920]">{item.domain}</span>
                      <span className="text-[#8E95A5] font-mono text-[11px]">{item.xp}</span>
                    </div>
                    <div className="progress-cyan-striped h-2.5 w-full">
                      <div 
                        className="progress-cyan-fill" 
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* View More Details Link */}
              <div className="pt-2">
                <Link
                  href="/profile"
                  className="text-xs font-bold text-[#181920] hover:text-[#7B57FF] flex items-center gap-1 transition-colors"
                >
                  <span>View more details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* 2. Vibrant Purple Action Banner (Matching Screenshot) */}
            <div className="banner-quixel-purple p-6 sm:p-7 space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 text-white px-2.5 py-0.5 rounded-full inline-block">
                  Verified Opportunities
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  The #1 job board &amp; studio for UI &amp; Devs!
                </h3>
                <p className="text-xs text-white/80 leading-relaxed">
                  Explore high-signal roles with direct engineering referrals &amp; ATS-matching audits.
                </p>
              </div>

              {/* Tag Capsules */}
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="px-3 py-1 rounded-xl bg-white/15 backdrop-blur-md text-[11px] font-bold text-white border border-white/20">
                  &lt;/&gt; UI Engineer
                </span>
                <span className="px-3 py-1 rounded-xl bg-white/15 backdrop-blur-md text-[11px] font-bold text-white border border-white/20">
                  ⚡ Quality Assurance
                </span>
                <span className="px-3 py-1 rounded-xl bg-white/15 backdrop-blur-md text-[11px] font-bold text-white border border-white/20">
                  🎯 Project Manager
                </span>
              </div>

              {/* Find a Job CTA Button */}
              <div className="pt-2">
                <Link
                  href="/jobs"
                  className="inline-block px-5 py-2.5 rounded-2xl bg-white hover:bg-[#F4F6FB] text-[#5C38FF] text-xs font-black shadow-lg hover:scale-105 transition-all"
                >
                  Find a job &rarr;
                </Link>
              </div>
            </div>

          </div>

        </div>

        {/* ========================================================================= */}
        {/* STAGE-SPECIFIC DETAILED DRILLS (College & Working Prof)                    */}
        {/* ========================================================================= */}
        {careerStage === "college" ? (
          /* ---------------- COLLEGE EXPANSION ---------------- */
          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between border-b border-[#E8ECF2] pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#7B57FF]" />
                <h2 className="text-xl font-black text-[#181920]">Campus Placement Drives &amp; Hackathons</h2>
              </div>
              <Link href="/jobs" className="text-xs font-bold text-[#7B57FF] hover:underline flex items-center gap-1">
                <span>View All Internship Listings</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Campus Placement Drives */}
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
              </div>

              {/* Group Projects & Hackathon Finder */}
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

                <div className="space-y-3">
                  {hackathons.map((h, i) => (
                    <div key={h.id || i} className="p-4 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] space-y-2">
                      <div className="flex items-center justify-between text-xs font-black text-[#181920]">
                        <span>{h.name}</span>
                        <span className="text-[10px] font-mono text-[#FF7A50] bg-[#FFEFEA] px-2.5 py-0.5 rounded-full border border-[#FF7A50]/30">
                          {h.team_size_range}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#767E94] leading-relaxed">{h.description}</p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-[#8E95A5]">Date: {h.event_date}</span>
                        <a
                          href={h.registration_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-bold text-[#7B57FF] hover:underline flex items-center gap-1"
                        >
                          Register / Details <ArrowRight className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ---------------- WORKING PROFESSIONAL EXPANSION ---------------- */
          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between border-b border-[#E8ECF2] pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#7B57FF]" />
                <h2 className="text-xl font-black text-[#181920]">Working Professional Suite</h2>
              </div>
            </div>

            {/* Application Pipeline Kanban */}
            <div className="card-quixel p-6 sm:p-7 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-black tracking-wider text-[#00D2B4]">Application Pipeline</span>
                  <h3 className="text-xl font-black text-[#181920]">Job Search Kanban Tracker</h3>
                </div>
                <Link href="/jobs" className="text-xs font-bold text-[#7B57FF] hover:underline">
                  Manage Applications &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {/* Applied */}
                <div className="p-4 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] space-y-2">
                  <div className="text-xs font-black text-[#181920] flex items-center justify-between">
                    <span>Applied</span>
                    <span className="text-[10px] font-mono text-[#8E95A5]">{kanbanApps.applied.length}</span>
                  </div>
                  {kanbanApps.applied.map((a) => (
                    <div key={a.id} className="p-3 rounded-xl bg-white border border-[#E8ECF2] shadow-sm text-xs font-bold text-[#181920] space-y-0.5">
                      <div>{a.role}</div>
                      <div className="text-[10px] text-[#767E94] font-normal">{a.company} • {a.date}</div>
                    </div>
                  ))}
                </div>

                {/* Interviewing */}
                <div className="p-4 rounded-2xl bg-[#E0FAF6]/60 border border-[#00D2B4]/30 space-y-2">
                  <div className="text-xs font-black text-[#00D2B4] flex items-center justify-between">
                    <span>Interviewing</span>
                    <span className="text-[10px] font-mono text-[#00D2B4]">{kanbanApps.interviewing.length}</span>
                  </div>
                  {kanbanApps.interviewing.map((a) => (
                    <div key={a.id} className="p-3 rounded-xl bg-white border border-[#00D2B4]/30 shadow-sm text-xs font-bold text-[#181920] space-y-0.5">
                      <div>{a.role}</div>
                      <div className="text-[10px] text-[#00D2B4] font-normal">{a.company} • {a.date}</div>
                    </div>
                  ))}
                </div>

                {/* Offer */}
                <div className="p-4 rounded-2xl bg-[#D7FC51]/20 border border-[#D7FC51]/50 space-y-2">
                  <div className="text-xs font-black text-[#13141B] flex items-center justify-between">
                    <span>Offer</span>
                    <span className="text-[10px] font-mono text-[#13141B]">{kanbanApps.offer.length}</span>
                  </div>
                  {kanbanApps.offer.map((a) => (
                    <div key={a.id} className="p-3 rounded-xl bg-white border border-[#D7FC51]/50 shadow-sm text-xs font-bold text-[#181920] space-y-0.5">
                      <div>{a.role}</div>
                      <div className="text-[10px] text-[#13141B] font-bold">{a.company} • {a.date}</div>
                    </div>
                  ))}
                </div>

                {/* Archived */}
                <div className="p-4 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] space-y-2">
                  <div className="text-xs font-black text-[#8E95A5] flex items-center justify-between">
                    <span>Archived</span>
                    <span className="text-[10px] font-mono text-[#8E95A5]">0</span>
                  </div>
                  <div className="text-[11px] text-[#8E95A5] italic p-2">No archived items</div>
                </div>
              </div>
            </div>

            {/* Aggregated Industry Salary Reference Benchmarks */}
            <div className="card-quixel p-6 sm:p-7 space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black tracking-wider text-[#7B57FF]">Factual Market Telemetry</span>
                <h3 className="text-xl font-black text-[#181920]">Industry Compensation Reference Ranges</h3>
                <p className="text-xs text-[#767E94]">
                  Aggregated, factual industry salary benchmarks from public labor data.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {salaryData.map((s, i) => (
                  <div key={s.id || i} className="p-5 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] space-y-2">
                    <div className="text-sm font-black text-[#181920]">{s.role}</div>
                    <div className="text-[11px] text-[#767E94]">{s.city} • {s.experience_bracket}</div>
                    <div className="p-2.5 rounded-xl bg-white border border-[#E8ECF2] font-mono text-xs font-bold text-[#00D2B4]">
                      ₹{(s.p25_inr / 100000).toFixed(1)}L – ₹{(s.p75_inr / 100000).toFixed(1)}L (Median: ₹{(s.p50_median_inr / 100000).toFixed(1)}L)
                    </div>
                    <div className="text-[9px] text-[#8E95A5]">Source: {s.data_source}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
