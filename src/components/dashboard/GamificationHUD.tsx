"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { 
  Flame, 
  Sparkles, 
  Award, 
  Trophy, 
  Zap, 
  Users, 
  CheckCircle2, 
  Video, 
  Compass, 
  FolderGit2 
} from "lucide-react";

interface UserStats {
  points: number;
  current_streak: number;
  longest_streak: number;
  last_active_date?: string;
  timezone?: string;
}

interface BadgeItem {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earned_at?: string;
}

interface LeaderboardItem {
  userId: string;
  name: string;
  isCurrentUser: boolean;
  weeklyPoints: number;
  totalPoints: number;
  currentStreak: number;
  rank: number;
}

export default function GamificationHUD() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>({ points: 0, current_streak: 0, longest_streak: 0 });
  const [badges, setBadges] = useState<BadgeItem[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);

  const isCareerTrack = user?.ageBand === "18+";

  useEffect(() => {
    async function loadGamificationData() {
      if (!user) return;

      // 1. Load User Stats
      const { data: statsData } = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", user.uid)
        .maybeSingle();

      if (statsData) setStats(statsData);

      // 2. Load All Badges and User Badges
      const { data: allBadges } = await supabase.from("badges").select("*");
      const { data: earnedBadges } = await supabase
        .from("user_badges")
        .select("badge_id, earned_at")
        .eq("user_id", user.uid);

      if (allBadges) {
        const earnedMap = new Map((earnedBadges || []).map(b => [b.badge_id, b.earned_at]));
        const combined = allBadges.map(b => ({
          ...b,
          earned: earnedMap.has(b.id),
          earned_at: earnedMap.get(b.id)
        }));
        setBadges(combined);
      }

      // 3. Load Connection Leaderboard (18+ Adult Track Only)
      if (isCareerTrack) {
        try {
          const res = await fetch(`/api/gamification/leaderboard?userId=${user.uid}`);
          const json = await res.json();
          if (json.success && json.data.leaderboard) {
            setLeaderboard(json.data.leaderboard);
          }
        } catch (e) {
          console.warn("Leaderboard fetch error:", e);
        }
      }

      setLoading(false);
    }

    loadGamificationData();
  }, [user, isCareerTrack]);

  if (loading) return null;

  return (
    <div className="space-y-6">
      {/* Top Gamification Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Points */}
        <div className="card-quixel p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF6DC] text-[#FFB800] flex items-center justify-center font-black shadow-inner">
            <Sparkles className="w-6 h-6 fill-[#FFB800]" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-black tracking-wider text-[#FFB800]">Total Progress</span>
            <div className="text-2xl font-black text-[#181920]">{stats.points} XP</div>
          </div>
        </div>

        {/* Current Active Streak */}
        <div className="card-quixel p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#E0FAF6] text-[#00D2B4] flex items-center justify-center font-black shadow-inner">
            <Flame className="w-6 h-6 fill-[#00D2B4]" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-black tracking-wider text-[#00D2B4]">Active Streak</span>
            <div className="text-2xl font-black text-[#181920]">{stats.current_streak} Days</div>
          </div>
        </div>

        {/* Badges Count */}
        <div className="card-quixel p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#EDE8FD] text-[#7B57FF] flex items-center justify-center font-black shadow-inner">
            <Award className="w-6 h-6 text-[#7B57FF]" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-black tracking-wider text-[#7B57FF]">Badges Unlocked</span>
            <div className="text-2xl font-black text-[#181920]">
              {badges.filter(b => b.earned).length} / {badges.length}
            </div>
          </div>
        </div>
      </div>

      {/* Badges Shelf */}
      <div className="card-quixel p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-[#181920] flex items-center gap-2">
            <Award className="w-5 h-5 text-[#7B57FF]" />
            <span>Mastery &amp; Achievement Badges</span>
          </h3>
          <span className="text-[10px] font-black uppercase tracking-wider text-[#00D2B4] bg-[#E0FAF6] px-3 py-1 rounded-full border border-[#00D2B4]/30">
            Server-Verified
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {badges.map(b => (
            <div
              key={b.id}
              className={`p-4 rounded-2xl border text-center space-y-2 transition-all ${
                b.earned 
                  ? "bg-[#F4F6FB] border-[#7B57FF]/30 text-[#181920] shadow-sm hover:scale-105" 
                  : "bg-white border-[#E8ECF2] opacity-40 grayscale"
              }`}
            >
              <div className={`w-10 h-10 rounded-2xl shadow-sm flex items-center justify-center mx-auto ${b.earned ? "bg-[#7B57FF] text-white" : "bg-[#F4F6FB] text-[#8E95A5]"}`}>
                {b.code === "first_interview" && <Video className="w-5 h-5" />}
                {b.code === "first_quest" && <Compass className="w-5 h-5" />}
                {b.code === "streak_3" && <Flame className="w-5 h-5" />}
                {b.code === "streak_7" && <Zap className="w-5 h-5" />}
                {b.code === "projects_3" && <FolderGit2 className="w-5 h-5" />}
                {b.code === "points_500" && <Sparkles className="w-5 h-5" />}
                {b.code === "problem_solver" && <CheckCircle2 className="w-5 h-5" />}
              </div>
              <div className="text-xs font-black text-[#181920] truncate">{b.name}</div>
              <div className="text-[10px] text-[#767E94] line-clamp-2 leading-tight">{b.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 18+ Connection-Scoped Weekly Leaderboard */}
      {isCareerTrack && leaderboard.length > 0 && (
        <div className="card-quixel p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-[#181920] flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#FFB800]" />
              <span>Weekly Connections Leaderboard</span>
            </h3>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#FF7A50] bg-[#FFEFEA] border border-[#FF7A50]/30 px-3 py-1 rounded-full">
              Resets Weekly
            </span>
          </div>

          <div className="divide-y divide-[#F0F2F6]">
            {leaderboard.map(item => (
              <div
                key={item.userId}
                className={`py-3 px-3 rounded-2xl flex items-center justify-between text-xs transition-colors ${
                  item.isCurrentUser ? "bg-[#FFF6DC] font-black border border-[#FFB800]/30" : "text-[#181920] hover:bg-[#F4F6FB]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-6 text-center font-mono font-black ${
                    item.rank === 1 ? "text-[#FFB800] text-sm" : item.rank === 2 ? "text-[#8E95A5]" : item.rank === 3 ? "text-[#FF7A50]" : "text-[#8E95A5]"
                  }`}>
                    #{item.rank}
                  </span>
                  <span className="font-bold">{item.name} {item.isCurrentUser && "(You)"}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[#8E95A5] font-mono text-[11px]">{item.currentStreak}d streak</span>
                  <span className="font-black text-[#181920]">{item.weeklyPoints} XP</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
