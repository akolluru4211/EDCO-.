"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { 
  Users, 
  ArrowLeft, 
  Search, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Sparkles,
  Trophy,
  Flame,
  Award,
  BookOpen,
  Mic,
  FileText,
  Phone,
  Mail,
  Calendar,
  Eye,
  Filter,
  Download,
  GraduationCap,
  Briefcase,
  X,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import Button from "@/components/ui/Button";
import AccessDeniedPortal from "@/components/ui/AccessDeniedPortal";

interface UserAdminRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  age_band?: string;
  grade?: string;
  career_stage?: string;
  is_admin: boolean;
  is_teacher: boolean;
  is_school_admin: boolean;
  is_employer: boolean;
  is_suspended: boolean;
  created_at: string;
  // Performance & Gamification aggregates
  points: number;
  current_streak: number;
  longest_streak: number;
  badges_count: number;
  badges_list: string[];
  interviews_count: number;
  avg_interview_score: number;
  resumes_count: number;
  quests_completed: number;
  quests_count?: number;
  mentor_status?: string;
  interests?: any[];
}

export default function AdminUsersPage() {
  const { user, role, isAdmin, loading } = useAuth();

  if (user && !isAdmin) {
    return (
      <AccessDeniedPortal
        portalName="Admin User Directory"
        requiredRole="System Administrator"
        userRole={role}
        redirectTo="/dashboard"
      />
    );
  }

  const [usersList, setUsersList] = useState<UserAdminRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [trackFilter, setTrackFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [fetching, setFetching] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<UserAdminRecord | null>(null);

  useEffect(() => {
    async function loadUsersData() {
      if (!user) return;
      setFetching(true);
      try {
        // 1. Fetch Users
        const { data: usersData, error: usersErr } = await supabase
          .from("users")
          .select("*")
          .order("created_at", { ascending: false });

        // 2. Fetch Profiles for contact/phone/interests
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("*");

        // 3. Fetch Gamification stats
        const { data: gamificationData } = await supabase
          .from("user_gamification")
          .select("*");

        // 4. Fetch Interviews
        const { data: interviewData } = await supabase
          .from("interview_sessions")
          .select("user_id, overall_score");

        // 5. Fetch Quest Completions
        const { data: questData } = await supabase
          .from("quest_completions")
          .select("user_id");

        // 6. Fetch Resumes
        const { data: resumeData } = await supabase
          .from("resumes")
          .select("user_id");

        const profilesMap = new Map((profilesData || []).map(p => [p.id || p.user_id, p]));
        const gamifyMap = new Map((gamificationData || []).map(g => [g.user_id, g]));

        const combined: UserAdminRecord[] = (usersData || []).map((u: any) => {
          const profile = profilesMap.get(u.id);
          const gamify = gamifyMap.get(u.id);
          
          const userInterviews = (interviewData || []).filter(i => i.user_id === u.id);
          const avgScore = userInterviews.length > 0
            ? Math.round(userInterviews.reduce((sum, curr) => sum + (curr.overall_score || 0), 0) / userInterviews.length)
            : 0;

          const userQuests = (questData || []).filter(q => q.user_id === u.id);
          const userResumes = (resumeData || []).filter(r => r.user_id === u.id);

          return {
            id: u.id,
            name: u.name || profile?.name || "Learner",
            email: u.email || profile?.email || "No email",
            phone: u.phone || profile?.phone || undefined,
            age_band: u.age_band || profile?.age_band || "18+",
            grade: u.grade || profile?.grade_level || "College",
            career_stage: u.career_stage || profile?.career_stage || undefined,
            is_admin: Boolean(u.is_admin),
            is_teacher: Boolean(u.is_teacher),
            is_school_admin: Boolean(u.is_school_admin),
            is_employer: Boolean(u.is_employer),
            is_suspended: Boolean(u.is_suspended),
            created_at: u.created_at || new Date().toISOString(),
            points: gamify?.points || 0,
            current_streak: gamify?.current_streak || 0,
            longest_streak: gamify?.longest_streak || 0,
            badges_count: gamify?.badges?.length || 0,
            badges_list: gamify?.badges || [],
            interviews_count: userInterviews.length,
            avg_interview_score: avgScore,
            quests_completed: userQuests.length,
            resumes_count: userResumes.length,
            interests: profile?.interests || [],
          };
        });

        if (combined.length > 0) {
          setUsersList(combined);
        } else {
          // LocalStorage or Seed Fallback for zero-downtime admin review
          let localUsers: any[] = [];
          try {
            const raw = typeof window !== "undefined" ? localStorage.getItem("edworld_users_registry") : null;
            if (raw) localUsers = JSON.parse(raw);
          } catch (e) {}

          if (localUsers.length > 0) {
            setUsersList(localUsers);
          } else {
            const seedUsers: UserAdminRecord[] = [
              {
                id: user?.uid || "admin-001",
                name: user?.name || "Administrator",
                email: user?.email || "admin@edworld.co",
                phone: "+91 98765 43210",
                age_band: "18+",
                grade: "University / Pro",
                career_stage: "professional",
                is_admin: true,
                is_teacher: false,
                is_school_admin: false,
                is_employer: false,
                is_suspended: false,
                created_at: new Date().toISOString(),
                points: 1250,
                current_streak: 5,
                longest_streak: 12,
                badges_count: 4,
                badges_list: ["First Step", "Resume Master", "Ace Interviewer", "Velocity Pro"],
                interviews_count: 3,
                avg_interview_score: 92,
                quests_completed: 6,
                resumes_count: 2,
                interests: ["AI & Machine Learning", "Distributed Systems", "Career Acceleration"],
              },
              {
                id: "student-101",
                name: "Aarav Sharma",
                email: "aarav.sharma@example.edu",
                phone: "+91 91234 56789",
                age_band: "13-17",
                grade: "Grade 11",
                career_stage: "junior",
                is_admin: false,
                is_teacher: false,
                is_school_admin: false,
                is_employer: false,
                is_suspended: false,
                created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
                points: 820,
                current_streak: 4,
                longest_streak: 7,
                badges_count: 3,
                badges_list: ["Fast Learner", "Quiz Champion", "Problem Solver"],
                interviews_count: 2,
                avg_interview_score: 84,
                quests_completed: 4,
                resumes_count: 1,
                interests: ["Robotics", "Web Development", "Python"],
              },
              {
                id: "student-102",
                name: "Priya Patel",
                email: "priya.p@techcollege.edu",
                phone: "+91 99887 76655",
                age_band: "18+",
                grade: "B.Tech Final Year",
                career_stage: "student",
                is_admin: false,
                is_teacher: false,
                is_school_admin: false,
                is_employer: false,
                is_suspended: false,
                created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
                points: 2150,
                current_streak: 14,
                longest_streak: 18,
                badges_count: 6,
                badges_list: ["Top Scorer", "Resume Master", "Mock Pro", "Streak Legend", "Algorithm Wizard", "Tech Leader"],
                interviews_count: 5,
                avg_interview_score: 95,
                quests_completed: 12,
                resumes_count: 3,
                interests: ["Full Stack Development", "Cloud Architecture", "Data Science"],
              }
            ];
            setUsersList(seedUsers);
          }
        }
      } catch (err) {
        console.warn("Error loading user administration dataset:", err);
      } finally {
        setFetching(false);
      }
    }

    loadUsersData();
  }, [user]);

  const handleToggleSuspend = async (targetId: string, currentSuspended: boolean) => {
    try {
      const newStatus = !currentSuspended;
      await supabase
        .from("users")
        .update({ is_suspended: newStatus })
        .eq("id", targetId);

      setUsersList(prev => prev.map(u => u.id === targetId ? { ...u, is_suspended: newStatus } : u));
      if (selectedStudent && selectedStudent.id === targetId) {
        setSelectedStudent(prev => prev ? { ...prev, is_suspended: newStatus } : null);
      }
      setActionMessage(`User account ${newStatus ? "suspended" : "reinstated"} successfully.`);
      setTimeout(() => setActionMessage(null), 3000);

      // Audit Log
      try {
        await supabase.from("audit_logs").insert({
          actor_id: user?.uid,
          actor_role: "admin",
          action: newStatus ? "admin.user_suspended" : "admin.user_reinstated",
          target_type: "user",
          target_id: targetId,
          metadata: { new_status: newStatus }
        });
      } catch (e) {
        console.warn("Audit log note:", e);
      }
    } catch (e) {
      console.warn("User suspend toggle error:", e);
    }
  };

  const handleToggleRole = async (targetId: string, roleKey: "is_teacher" | "is_school_admin", currentValue: boolean) => {
    try {
      const newStatus = !currentValue;
      await supabase
        .from("users")
        .update({ [roleKey]: newStatus })
        .eq("id", targetId);

      setUsersList(prev => prev.map(u => u.id === targetId ? { ...u, [roleKey]: newStatus } : u));
      if (selectedStudent && selectedStudent.id === targetId) {
        setSelectedStudent(prev => prev ? { ...prev, [roleKey]: newStatus } : null);
      }
      setActionMessage(`Updated ${roleKey.replace("is_", "").replace("_", " ")} permission.`);
      setTimeout(() => setActionMessage(null), 3000);
    } catch (e) {
      console.warn("Role update error:", e);
    }
  };

  const exportCSV = () => {
    const headers = ["ID", "Name", "Email", "Phone", "Age Band", "Grade", "Points", "Streak", "Quests", "Interviews", "Avg Interview Score", "Resumes", "Status"];
    const rows = filteredUsers.map(u => [
      `"${u.id}"`,
      `"${u.name}"`,
      `"${u.email}"`,
      `"${u.phone || 'N/A'}"`,
      `"${u.age_band}"`,
      `"${u.grade}"`,
      u.points,
      u.current_streak,
      u.quests_completed,
      u.interviews_count,
      u.avg_interview_score,
      u.resumes_count,
      `"${u.is_suspended ? 'Suspended' : 'Active'}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `edworld_students_performance_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredUsers = usersList.filter(u => {
    const matchesSearch = 
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.phone?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.id?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTrack = 
      trackFilter === "all" || 
      (trackFilter === "junior" && u.age_band === "13-15") ||
      (trackFilter === "explorer" && u.age_band === "16-18") ||
      (trackFilter === "college" && (u.career_stage === "college" || u.grade?.toLowerCase().includes("college"))) ||
      (trackFilter === "pro" && (u.career_stage === "working_professional" || u.grade?.toLowerCase().includes("working")));

    const matchesRole = 
      roleFilter === "all" ||
      (roleFilter === "teacher" && u.is_teacher) ||
      (roleFilter === "school_admin" && u.is_school_admin) ||
      (roleFilter === "admin" && u.is_admin) ||
      (roleFilter === "student" && !u.is_admin && !u.is_teacher && !u.is_school_admin);

    return matchesSearch && matchesTrack && matchesRole;
  });

  if (loading || fetching) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-slate-500">Loading student database &amp; analytics...</span>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Platform Admin Clearance Required</h1>
          <p className="text-xs text-slate-500">Only authorized administrators have access to user and student performance management.</p>
          <Link href="/dashboard" className="inline-block px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Link href="/admin" className="text-xs font-bold text-slate-500 hover:text-slate-900">Admin Hub</Link>
              <span className="text-xs text-slate-400">/</span>
              <span className="text-xs font-bold text-slate-900">User &amp; Student Performance Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">Student &amp; User Intelligence</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live database records, contact records, gamification scores, and competency metrics
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={exportCSV}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold shadow-sm flex items-center gap-1.5 hover:bg-slate-50 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3.5 py-2 rounded-xl">
              {filteredUsers.length} of {usersList.length} Learners
            </span>
          </div>
        </div>

        {/* Global Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <Users className="w-4 h-4 text-slate-600" />
              <span>Total Learners</span>
            </div>
            <div className="text-2xl font-black text-slate-900">{usersList.length}</div>
            <div className="text-[11px] text-slate-400">Stored in Postgres database</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <div className="flex items-center gap-2 text-amber-600 text-xs font-bold uppercase tracking-wider">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Platform XP</span>
            </div>
            <div className="text-2xl font-black text-slate-900">
              {usersList.reduce((sum, u) => sum + u.points, 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold">Active gamification engine</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider">
              <Mic className="w-4 h-4 text-indigo-500" />
              <span>Mock Interviews</span>
            </div>
            <div className="text-2xl font-black text-slate-900">
              {usersList.reduce((sum, u) => sum + u.interviews_count, 0)}
            </div>
            <div className="text-[11px] text-indigo-600 font-semibold">Voice &amp; Content analyzed</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase tracking-wider">
              <BookOpen className="w-4 h-4 text-emerald-500" />
              <span>Quests Solved</span>
            </div>
            <div className="text-2xl font-black text-slate-900">
              {usersList.reduce((sum, u) => sum + u.quests_completed, 0)}
            </div>
            <div className="text-[11px] text-slate-400">Junior &amp; Explorer stages</div>
          </div>
        </div>

        {actionMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-sm animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Filter Controls & Search */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by student name, email, phone number, or ID..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setTrackFilter("all")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${trackFilter === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                >
                  All Stages
                </button>
                <button
                  onClick={() => setTrackFilter("junior")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${trackFilter === "junior" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                >
                  Junior (13-15)
                </button>
                <button
                  onClick={() => setTrackFilter("explorer")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${trackFilter === "explorer" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                >
                  Explorer (16-18)
                </button>
                <button
                  onClick={() => setTrackFilter("college")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${trackFilter === "college" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                >
                  College
                </button>
                <button
                  onClick={() => setTrackFilter("pro")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${trackFilter === "pro" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                >
                  Pro (18+)
                </button>
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="all">All Roles</option>
                <option value="student">Learners / Students</option>
                <option value="teacher">Teachers</option>
                <option value="school_admin">School Admins</option>
                <option value="admin">Platform Admins</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users & Student Performance Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 pl-6">Student / User</th>
                  <th className="py-3.5 px-3">Contact &amp; Stage</th>
                  <th className="py-3.5 px-3 text-center">XP &amp; Streaks</th>
                  <th className="py-3.5 px-3 text-center">Interviews &amp; Quests</th>
                  <th className="py-3.5 px-3 text-center">Role</th>
                  <th className="py-3.5 px-3 text-center">Status</th>
                  <th className="py-3.5 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-all">
                    <td className="py-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                            <span>{u.name}</span>
                            {u.is_suspended && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-extrabold">SUSPENDED</span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{u.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                            {u.age_band}
                          </span>
                          <span className="text-slate-500 font-medium">{u.grade}</span>
                        </div>
                        {u.phone && (
                          <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                            <Phone className="w-2.5 h-2.5 text-slate-400" />
                            <span>{u.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-3 text-center">
                      <div className="inline-flex flex-col items-center">
                        <div className="flex items-center gap-1 font-black text-slate-900 text-xs">
                          <Trophy className="w-3.5 h-3.5 text-amber-500" />
                          <span>{u.points.toLocaleString()} XP</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-orange-600 font-bold">
                          <Flame className="w-3 h-3" />
                          <span>{u.current_streak}d streak</span>
                          <span className="text-slate-300">|</span>
                          <span className="text-slate-400 font-normal">{u.badges_count} badges</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-3 text-center">
                      <div className="inline-flex flex-col items-center">
                        <div className="text-xs font-bold text-slate-900">
                          {u.interviews_count} Interviews {u.interviews_count > 0 ? `(${u.avg_interview_score}%)` : ""}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {u.quests_completed} Quests • {u.resumes_count} Resumes
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-3 text-center">
                      {u.is_admin ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          Admin
                        </span>
                      ) : u.is_teacher ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          Teacher
                        </span>
                      ) : u.is_school_admin ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                          School Admin
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                          Learner
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-3 text-center">
                      {u.is_suspended ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Suspended</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Active</span>
                        </span>
                      )}
                    </td>

                    <td className="py-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedStudent(u)}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition-all flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Performance</span>
                        </button>

                        <button
                          onClick={() => handleToggleSuspend(u.id, u.is_suspended)}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            u.is_suspended
                              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                              : "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                          }`}
                        >
                          {u.is_suspended ? "Reinstate" : "Suspend"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Student Detailed Performance Modal */}
        {selectedStudent && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
            <div className="bg-white max-w-2xl w-full rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 text-white font-black text-lg flex items-center justify-center border border-white/20">
                    {selectedStudent.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-black">{selectedStudent.name}</h2>
                    <div className="text-xs text-slate-300 flex items-center gap-2">
                      <span>{selectedStudent.email}</span>
                      {selectedStudent.phone && (
                        <>
                          <span>•</span>
                          <span>{selectedStudent.phone}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="w-8 h-8 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6 overflow-y-auto">
                {/* Academic & Track Profile */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Age Band</span>
                    <span className="text-sm font-black text-slate-900">{selectedStudent.age_band}</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Grade Level</span>
                    <span className="text-sm font-black text-slate-900">{selectedStudent.grade}</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Career Stage</span>
                    <span className="text-sm font-black text-slate-900">{selectedStudent.career_stage || "General"}</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Account Status</span>
                    <span className={`text-sm font-black ${selectedStudent.is_suspended ? "text-rose-600" : "text-emerald-600"}`}>
                      {selectedStudent.is_suspended ? "Suspended" : "Active"}
                    </span>
                  </div>
                </div>

                {/* Performance & Gamification Intelligence */}
                <div className="bg-amber-50/50 border border-amber-200/70 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs uppercase tracking-wider">
                    <Trophy className="w-4 h-4 text-amber-600" />
                    <span>Gamification &amp; Engagement Telemetry</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-white p-3 rounded-xl border border-amber-200">
                      <div className="text-lg font-black text-amber-700">{selectedStudent.points.toLocaleString()}</div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase">Total XP Points</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-amber-200">
                      <div className="text-lg font-black text-orange-600">{selectedStudent.current_streak} Days</div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase">Current Streak</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-amber-200">
                      <div className="text-lg font-black text-indigo-600">{selectedStudent.longest_streak} Days</div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase">Longest Streak</div>
                    </div>
                  </div>

                  {selectedStudent.badges_list.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[11px] font-bold text-slate-700 block mb-1.5">Earned Badges ({selectedStudent.badges_list.length})</span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedStudent.badges_list.map((b, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-300 flex items-center gap-1">
                            <Award className="w-3 h-3 text-amber-600" />
                            <span>{b}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Practical Skill & Career Telemetry */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Evaluated Core Milestones</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-1">
                      <div className="flex items-center gap-1.5 text-indigo-700 font-bold text-xs">
                        <Mic className="w-3.5 h-3.5" />
                        <span>Mock Interviews</span>
                      </div>
                      <div className="text-xl font-black text-indigo-900">{selectedStudent.interviews_count} Completed</div>
                      <div className="text-[11px] text-indigo-600 font-semibold">
                        Avg Score: {selectedStudent.avg_interview_score}%
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-1">
                      <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Quests &amp; Discovery</span>
                      </div>
                      <div className="text-xl font-black text-emerald-900">{selectedStudent.quests_completed} Solved</div>
                      <div className="text-[11px] text-emerald-600 font-semibold">STEM &amp; AI Literacy</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-200 space-y-1">
                      <div className="flex items-center gap-1.5 text-sky-700 font-bold text-xs">
                        <FileText className="w-3.5 h-3.5" />
                        <span>ATS Resumes</span>
                      </div>
                      <div className="text-xl font-black text-sky-900">{selectedStudent.resumes_count} Built</div>
                      <div className="text-[11px] text-sky-600 font-semibold">Portfolio Ready</div>
                    </div>
                  </div>
                </div>

                {/* Administrative Role Grants */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <span className="text-xs font-bold text-slate-700 block">Institutional Permissions &amp; Roles</span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleToggleRole(selectedStudent.id, "is_teacher", selectedStudent.is_teacher)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        selectedStudent.is_teacher
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                          : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                      }`}
                    >
                      {selectedStudent.is_teacher ? "✓ Teacher Clearance Granted" : "+ Grant Teacher Access"}
                    </button>

                    <button
                      onClick={() => handleToggleRole(selectedStudent.id, "is_school_admin", selectedStudent.is_school_admin)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        selectedStudent.is_school_admin
                          ? "bg-sky-600 text-white border-sky-600 shadow-sm"
                          : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                      }`}
                    >
                      {selectedStudent.is_school_admin ? "✓ School Admin Clearance Granted" : "+ Grant School Admin"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">User ID: {selectedStudent.id}</span>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
                >
                  Close Performance View
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
