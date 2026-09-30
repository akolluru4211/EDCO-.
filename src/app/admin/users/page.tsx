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
import { downloadUsersAsExcel, downloadUsersAsCsv } from "@/lib/excel-export";

interface UserAdminRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  age_band?: string;
  grade?: string;
  career_stage?: string;
  is_admin: boolean;
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
        const res = await fetch("/api/admin/users");
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.users)) {
            setUsersList(json.users);
            return;
          }
        }

        // Direct Supabase Fallback if API fails
        const { data: usersData } = await supabase
          .from("users")
          .select("*")
          .order("created_at", { ascending: false });

        const { data: profilesData } = await supabase
          .from("profiles")
          .select("*");

        const { data: gamificationData } = await supabase
          .from("user_gamification")
          .select("*");

        const { data: interviewData } = await supabase
          .from("interview_sessions")
          .select("user_id, overall_score, score");

        const { data: questData } = await supabase
          .from("quest_completions")
          .select("user_id");

        const { data: resumeData } = await supabase
          .from("resumes")
          .select("user_id");

        const profilesMap = new Map((profilesData || []).map(p => [p.id || p.user_id, p]));
        const gamifyMap = new Map((gamificationData || []).map(g => [g.user_id, g]));

        const combined: UserAdminRecord[] = (usersData || profilesData || []).map((u: any) => {
          const profile = profilesMap.get(u.id || u.user_id) || u;
          const gamify = gamifyMap.get(u.id || u.user_id);
          
          const userInterviews = (interviewData || []).filter(i => i.user_id === u.id || i.user_id === u.user_id);
          const avgScore = userInterviews.length > 0
            ? Math.round(userInterviews.reduce((sum, curr) => sum + (curr.overall_score || curr.score || 0), 0) / userInterviews.length)
            : 0;

          const userQuests = (questData || []).filter(q => q.user_id === u.id || q.user_id === u.user_id);
          const userResumes = (resumeData || []).filter(r => r.user_id === u.id || r.user_id === u.user_id);

          return {
            id: u.id || u.user_id,
            name: profile?.display_name || profile?.name || u.name || "Learner",
            email: profile?.email || u.email || "No email",
            phone: profile?.phone || u.phone || undefined,
            age_band: profile?.age_band || u.age_band || "18+",
            grade: profile?.grade_level || u.grade || "College",
            career_stage: profile?.career_stage || u.career_stage || undefined,
            is_admin: Boolean(u.is_admin || profile?.role === "ADMIN" || profile?.role === "SUPER_ADMIN"),
            is_employer: Boolean(u.is_employer || profile?.role === "EMPLOYER"),
            is_suspended: Boolean(u.is_suspended || profile?.status === "SUSPENDED"),
            created_at: u.created_at || profile?.created_at || new Date().toISOString(),
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

        setUsersList(combined);
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

  

  const handleExportExcel = () => {
    downloadUsersAsExcel(filteredUsers, "edworld_students_directory");
  };

  const handleExportCsv = () => {
    downloadUsersAsCsv(filteredUsers, "edworld_students_directory");
  };

  const filteredUsers = usersList.filter(u => {
    const matchesSearch = 
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.phone?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.id?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTrack = 
      trackFilter === "all" || 
      (trackFilter === "student" && (u.career_stage === "STUDENT" || u.career_stage === "college" || u.grade?.toLowerCase().includes("college") || u.grade?.toLowerCase().includes("year"))) ||
      (trackFilter === "pro" && (u.career_stage === "PROFESSIONAL" || u.career_stage === "working_professional" || u.grade?.toLowerCase().includes("working")));

    const matchesRole = 
      roleFilter === "all" ||
                  (roleFilter === "admin" && u.is_admin) ||
      (roleFilter === "student" && !u.is_admin );

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
          <div className="flex items-center flex-wrap gap-2 self-start sm:self-auto">
            <button
              onClick={handleExportExcel}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all"
              title="Download full user dataset formatted for Microsoft Excel & Google Sheets"
            >
              <Download className="w-3.5 h-3.5 text-white" />
              <span>Export Excel (.xls / .xlsx)</span>
            </button>
            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold shadow-sm flex items-center gap-1.5 hover:bg-slate-50 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
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
                  onClick={() => setTrackFilter("student")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${trackFilter === "student" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                >
                  College &amp; Student
                </button>
                <button
                  onClick={() => setTrackFilter("pro")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${trackFilter === "pro" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                >
                  Working Professional
                </button>
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="all">All Roles</option>
                <option value="student">Learners / Students</option>
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
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="font-bold text-slate-600 text-xs">No registered learners found</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Learners will appear here once they register or log in.</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
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
                )))}
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
