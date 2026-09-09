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

export default function JuniorDashboardPage() {
  const { user, profile } = useAuth();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F4F6FB] py-8 px-4 sm:px-6 lg:px-8 text-[#13141B]">
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in">
        
        {/* Banner */}
        <div className="card-quixel rounded-3xl p-6 sm:p-8 bg-[#13141B] text-white shadow-xl relative overflow-hidden border border-white/10">
          <div className="relative z-10 max-w-xl space-y-2">
            <span className="px-3 py-1 rounded-full bg-[#EDE8FD] text-[#7B57FF] text-[11px] font-black uppercase tracking-wider inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Junior Discovery Track &bull; Ages 13–15</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white">
              Welcome back, {user?.name || "Explorer"}! 🚀
            </h1>
            <p className="text-xs sm:text-sm text-[#989BAA] leading-relaxed">
              Explore weekly curiosity quests, stream navigators, AI prompting sandboxes, and build foundations.
            </p>
          </div>
        </div>

        {/* Feature Grid: Full Junior Capabilities */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          
          <Link
            href="/school"
            className="card-quixel card-quixel-interactive rounded-3xl p-6 border border-[#E8ECF2] bg-white space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-[#EDE8FD] text-[#7B57FF] flex items-center justify-center">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#13141B] text-sm">AI &amp; Future Skills Literacy</h3>
              <p className="text-xs text-[#5E6573]">Explainer library, prompting sandbox, and mandatory AI ethics.</p>
            </div>
            <span className="text-xs font-bold text-[#7B57FF] flex items-center gap-1">
              <span>Open Sandbox</span> &rarr;
            </span>
          </Link>

          <Link
            href="/school"
            className="card-quixel card-quixel-interactive rounded-3xl p-6 border border-[#E8ECF2] bg-white space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-[#FFF6DC] text-[#D97706] flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#13141B] text-sm">Stream &amp; Subject Guidance</h3>
              <p className="text-xs text-[#5E6573]">Interactive interest quiz and PCM/Commerce stream explorer.</p>
            </div>
            <span className="text-xs font-bold text-[#D97706] flex items-center gap-1">
              <span>Take Quiz</span> &rarr;
            </span>
          </Link>

          <Link
            href="/school"
            className="card-quixel card-quixel-interactive rounded-3xl p-6 border border-[#E8ECF2] bg-white space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-[#E1FD53]/30 text-[#13141B] flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#13141B] text-sm">Curiosity Quests</h3>
              <p className="text-xs text-[#5E6573]">Solve digital logic challenges and STEM micro-milestones.</p>
            </div>
            <span className="text-xs font-bold text-[#13141B] flex items-center gap-1">
              <span>Start Quests</span> &rarr;
            </span>
          </Link>

          <Link
            href="/school"
            className="card-quixel card-quixel-interactive rounded-3xl p-6 border border-[#E8ECF2] bg-white space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#13141B] text-sm">Talent Showcase</h3>
              <p className="text-xs text-[#5E6573]">Moderated creation submissions for art, robotics, and writing.</p>
            </div>
            <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
              <span>Submit Project</span> &rarr;
            </span>
          </Link>

          <Link
            href="/school"
            className="card-quixel card-quixel-interactive rounded-3xl p-6 border border-[#E8ECF2] bg-white space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Play className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#13141B] text-sm">Career Simulator</h3>
              <p className="text-xs text-[#5E6573]">Interactive branching day-in-the-life choice simulator.</p>
            </div>
            <span className="text-xs font-bold text-indigo-600 flex items-center gap-1">
              <span>Play Sim</span> &rarr;
            </span>
          </Link>

          <Link
            href="/school/journal"
            className="card-quixel card-quixel-interactive rounded-3xl p-6 border border-[#E8ECF2] bg-white space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#13141B] text-sm">Growth Journal</h3>
              <p className="text-xs text-[#5E6573]">Private thoughts &bull; Guardian access on request only.</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <span>Write Notes</span> &rarr;
            </span>
          </Link>

        </div>
      </div>
    </div>
  );
}
