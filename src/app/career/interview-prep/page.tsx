"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { 
  Building2, 
  ArrowLeft, 
  Video, 
  FileText, 
  Sparkles, 
  Users, 
  ArrowRight,
  Target,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export const dynamic = "force-dynamic";

export default function UnifiedInterviewPrepPage() {
  const { user } = useAuth();
  const isAdult = user?.ageBand === "18+";

  if (!isAdult && user) {
    return (
      <div className="min-h-screen bg-[#F4F6FB] flex items-center justify-center p-6">
        <div className="card-quixel max-w-md p-8 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-[#FF7A50] mx-auto" />
          <h2 className="text-xl font-black text-[#181920]">Career Track Feature</h2>
          <p className="text-sm text-[#767E94]">The Interview Preparation Hub is exclusively available for Career Track accounts (18+).</p>
          <Link href="/dashboard" className="btn-quixel-primary inline-block">Return to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6FB] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="space-y-1">
          <Link href="/dashboard" className="inline-flex items-center text-xs font-bold text-[#5C38FF] hover:underline mb-1">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EDE8FD] text-[#5C38FF] flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#181920]">Unified Interview Preparation Workspace</h1>
              <p className="text-xs text-[#767E94]">Connect Company Research, verified Interview Experiences, Mock Panel Simulations, and post-interview reflections.</p>
            </div>
          </div>
        </div>

        {/* Quick Launch Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* 1. Mock Panel Simulation */}
          <div className="card-quixel p-6 flex flex-col justify-between space-y-4 hover:border-[#5C38FF]/40 transition-all">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FFEFEA] text-[#FF7A50] flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-[#181920]">Mock Panel Interview</h3>
              <p className="text-xs text-[#767E94]">
                Multi-persona simulation with Tech Lead, Engineering Director, and Culture Lead.
              </p>
            </div>
            <Link
              href="/interviews/panel"
              className="px-4 py-2.5 rounded-xl bg-[#FF7A50] hover:bg-[#E56840] text-white text-xs font-black flex items-center justify-between transition-all"
            >
              <span>Launch Panel Simulation</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 2. Interview Experience Database */}
          <div className="card-quixel p-6 flex flex-col justify-between space-y-4 hover:border-[#5C38FF]/40 transition-all">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#EDE8FD] text-[#5C38FF] flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-[#181920]">Interview Experiences</h3>
              <p className="text-xs text-[#767E94]">
                Review round-by-round debriefs and verified questions shared by peer candidates.
              </p>
            </div>
            <Link
              href="/interview-experiences"
              className="px-4 py-2.5 rounded-xl bg-[#5C38FF] hover:bg-[#4D2CE0] text-white text-xs font-black flex items-center justify-between transition-all"
            >
              <span>Explore Debriefs</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 3. Post-Interview Reflections */}
          <div className="card-quixel p-6 flex flex-col justify-between space-y-4 hover:border-[#5C38FF]/40 transition-all">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#E8F8F0] text-[#00C48C] flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-[#181920]">Interview Reflections</h3>
              <p className="text-xs text-[#767E94]">
                Document what went well and identify challenging question areas with AI assistance.
              </p>
            </div>
            <Link
              href="/interviews/reflection"
              className="px-4 py-2.5 rounded-xl bg-[#00C48C] hover:bg-[#00A878] text-white text-xs font-black flex items-center justify-between transition-all"
            >
              <span>Log Reflection</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
