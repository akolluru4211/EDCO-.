"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { 
  Sparkles, 
  Trophy, 
  BookOpen, 
  Flame, 
  Compass, 
  MessageSquare, 
  ArrowRight, 
  ShieldCheck, 
  Star,
  Brain,
  Layers,
  Award,
  Video,
  Play,
  Heart,
  Lightbulb,
  DollarSign
} from "lucide-react";
import Button from "@/components/ui/Button";

import { useRouter } from "next/navigation";

export default function JuniorDashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  React.useEffect(() => {
    if (!loading && user) {
      if (user.careerStage === "PROFESSIONAL") {
        router.replace("/career/dashboard");
      } else if (user.careerStage === "STUDENT") {
        router.replace("/dashboard");
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F4F6FB] py-8 px-4 sm:px-6 lg:px-8 text-[#13141B]">
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in">
        
        {/* Banner */}
        <div className="card-quixel rounded-3xl p-6 sm:p-8 bg-[#13141B] text-white shadow-xl relative overflow-hidden border border-white/10">
          <div className="relative z-10 max-w-2xl space-y-3">
            <span className="px-3.5 py-1.5 rounded-full bg-[#EDE8FD] text-[#7B57FF] text-[11px] font-black uppercase tracking-wider inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Junior Discovery Track &bull; Ages 13–15</span>
            </span>
            <h1 className="text-2xl sm:text-4xl font-black font-display tracking-tight text-white">
              Welcome back, {user?.name || "Explorer"}! 🚀
            </h1>
            <p className="text-xs sm:text-sm text-[#989BAA] leading-relaxed">
              Hands-on curiosity quests, interactive subject discovery, AI prompting sandboxes, and speech practice in a 100% safe, private workspace.
            </p>
          </div>
        </div>

        {/* 1-Click Instant Action: Today's Active Quest */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-700 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-left w-full md:w-auto">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-mono font-bold uppercase">
                ⚡ Active Mission
              </span>
              <span className="text-xs font-bold text-violet-200">+120 XP Reward</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white">
              Curiosity Quest: The Interactive Solar Logic Tracker
            </h2>
            <p className="text-xs text-violet-100 max-w-xl">
              Understand logic gates and sensors by building a simulated clean energy tracker step-by-step.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link
              href="/school?tab=quests"
              className="w-full md:w-auto px-6 py-3.5 rounded-2xl bg-white text-violet-900 font-black text-xs uppercase tracking-wider hover:bg-violet-50 transition-all shadow-md flex items-center justify-center gap-2 active:scale-95"
            >
              <span>Continue Quest</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Feature Grid: Direct Deep-Linked Junior Capabilities */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <Link
            href="/school?tab=ai_literacy"
            className="card-quixel card-quixel-interactive rounded-3xl p-6 border border-[#E8ECF2] bg-white space-y-3 flex flex-col justify-between hover:shadow-md transition-all"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-[#EDE8FD] text-[#7B57FF] flex items-center justify-center">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#13141B] text-sm">AI Prompting Sandbox</h3>
              <p className="text-xs text-[#5E6573]">Experiment with fun AI prompts safely with ethical guidelines.</p>
            </div>
            <span className="text-xs font-bold text-[#7B57FF] flex items-center gap-1 pt-2">
              <span>Open Sandbox</span> &rarr;
            </span>
          </Link>

          <Link
            href="/school?tab=stream_guidance"
            className="card-quixel card-quixel-interactive rounded-3xl p-6 border border-[#E8ECF2] bg-white space-y-3 flex flex-col justify-between hover:shadow-md transition-all"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-[#FFF6DC] text-[#D97706] flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#13141B] text-sm">Subject &amp; Stream Quiz</h3>
              <p className="text-xs text-[#5E6573]">Discover what subjects match your natural interests &amp; hobbies.</p>
            </div>
            <span className="text-xs font-bold text-[#D97706] flex items-center gap-1 pt-2">
              <span>Take Quiz</span> &rarr;
            </span>
          </Link>

          <Link
            href="/school/trainer"
            className="card-quixel card-quixel-interactive rounded-3xl p-6 border border-[#E8ECF2] bg-white space-y-3 flex flex-col justify-between hover:shadow-md transition-all"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Video className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#13141B] text-sm">Speech &amp; Voice Trainer</h3>
              <p className="text-xs text-[#5E6573]">Practice presentations with encouraging feedback &amp; zero stress.</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 pt-2">
              <span>Start Speaking</span> &rarr;
            </span>
          </Link>

          <Link
            href="/school/journal"
            className="card-quixel card-quixel-interactive rounded-3xl p-6 border border-[#E8ECF2] bg-white space-y-3 flex flex-col justify-between hover:shadow-md transition-all"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#13141B] text-sm">Growth Journal</h3>
              <p className="text-xs text-[#5E6573]">Your private daily log for discoveries, ideas, and reflections.</p>
            </div>
            <span className="text-xs font-bold text-teal-600 flex items-center gap-1 pt-2">
              <span>Write Notes</span> &rarr;
            </span>
          </Link>

          <Link
            href="/school?tab=talent_showcase"
            className="card-quixel card-quixel-interactive rounded-3xl p-6 border border-[#E8ECF2] bg-white space-y-3 flex flex-col justify-between hover:shadow-md transition-all"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#13141B] text-sm">Talent Showcase</h3>
              <p className="text-xs text-[#5E6573]">Share your creative art, science projects, and short stories.</p>
            </div>
            <span className="text-xs font-bold text-rose-600 flex items-center gap-1 pt-2">
              <span>View Showcase</span> &rarr;
            </span>
          </Link>

          <Link
            href="/school?tab=career_simulator"
            className="card-quixel card-quixel-interactive rounded-3xl p-6 border border-[#E8ECF2] bg-white space-y-3 flex flex-col justify-between hover:shadow-md transition-all"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Play className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#13141B] text-sm">Day-in-the-Life Simulator</h3>
              <p className="text-xs text-[#5E6573]">Roleplay as an aerospace engineer, game developer, or doctor.</p>
            </div>
            <span className="text-xs font-bold text-indigo-600 flex items-center gap-1 pt-2">
              <span>Launch Simulator</span> &rarr;
            </span>
          </Link>

          <Link
            href="/school/join-classroom"
            className="card-quixel card-quixel-interactive rounded-3xl p-6 border border-[#E8ECF2] bg-white space-y-3 flex flex-col justify-between hover:shadow-md transition-all"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-[#13141B] text-sm">School Classroom</h3>
              <p className="text-xs text-[#5E6573]">Enter your teacher's 6-character code to join your class.</p>
            </div>
            <span className="text-xs font-bold text-blue-600 flex items-center gap-1 pt-2">
              <span>Enter Class Code</span> &rarr;
            </span>
          </Link>

          <Link
            href="/school?tab=study_groups"
            className="card-quixel card-quixel-interactive rounded-3xl p-6 border border-[#E8ECF2] bg-white space-y-3 flex flex-col justify-between hover:shadow-md transition-all"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#13141B] text-sm">Study Circles</h3>
              <p className="text-xs text-[#5E6573]">Ask questions about science quests and help fellow classmates.</p>
            </div>
            <span className="text-xs font-bold text-amber-600 flex items-center gap-1 pt-2">
              <span>Join Circle</span> &rarr;
            </span>
          </Link>

        </div>
      </div>
    </div>
  );
}
