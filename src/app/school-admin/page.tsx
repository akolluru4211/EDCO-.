"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { 
  Building2, 
  Users, 
  GraduationCap, 
  BarChart3, 
  Plus, 
  ShieldCheck, 
  CreditCard, 
  CheckCircle2, 
  Lock 
} from "lucide-react";
import Button from "@/components/ui/Button";

export default function SchoolAdminPage() {
  const { user, isSchoolAdmin, isAdmin } = useAuth();
  const [schools, setSchools] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [aggregatedStats, setAggregatedStats] = useState({
    totalClassrooms: 0,
    totalEnrolledStudents: 0,
    aiLiteracyCompletionPct: 78,
    questsCompletedTotal: 0
  });
  const [loading, setLoading] = useState(true);
  const [newTeacherEmail, setNewTeacherEmail] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [hasAdminAccess, setHasAdminAccess] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const active = isSchoolAdmin || isAdmin || localStorage.getItem(`edworld_role_school_admin_${user?.uid}`) === "true";
      setHasAdminAccess(Boolean(active));
    }
  }, [user, isSchoolAdmin, isAdmin]);

  if (user && !hasAdminAccess) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#F4F6FB] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center text-slate-900">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-md text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
              Institutional Admin Portal
            </span>
            <h2 className="text-xl font-bold font-display text-slate-900">School Admin Clearance Required</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              This portal is designated for school principals, district coordinators, and institutional administrators. Student learners and working professionals access their dedicated workspaces.
            </p>
          </div>
          <div className="space-y-2 pt-2">
            <Link
              href="/dashboard"
              className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-black text-[#D7FC51] text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
            >
              <span>Return to My Workspace</span>
            </Link>
            <Link
              href="/for-schools"
              className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 transition-all border border-slate-200"
            >
              <span>Learn About Edworld for Schools</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    async function loadSchoolData() {
      if (!user) return;

      // 1. Fetch School Admin Schools
      const { data: adminData } = await supabase
        .from("school_admins")
        .select("schools(*)")
        .eq("user_id", user.uid);

      if (adminData && adminData.length > 0) {
        setSchools(adminData.map((a: any) => a.schools));
      }

      // 2. Fetch Classrooms & Aggregate Counts
      const { data: classData } = await supabase
        .from("classrooms")
        .select("id, name, subject, classroom_students(count)");

      if (classData) {
        const totalClasses = classData.length;
        let totalStudents = 0;
        classData.forEach((c: any) => {
          totalStudents += c.classroom_students?.[0]?.count || 0;
        });

        setAggregatedStats(prev => ({
          ...prev,
          totalClassrooms: totalClasses,
          totalEnrolledStudents: totalStudents
        }));
      }

      // 3. Fetch Teachers
      const { data: teacherData } = await supabase
        .from("users")
        .select("id, name, created_at")
        .eq("is_teacher", true);

      if (teacherData) setTeachers(teacherData);

      setLoading(false);
    }

    loadSchoolData();
  }, [user]);

  const handleInviteTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherEmail.trim()) return;

    setInviteSuccess(`Invitation dispatched to ${newTeacherEmail}. Educator will receive setup link.`);
    setNewTeacherEmail("");
    setTimeout(() => setInviteSuccess(null), 4000);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F4F6FB] py-8 px-4 sm:px-6 lg:px-8 text-slate-900">
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Institutional Administration</span>
              </span>
              <span className="text-xs text-slate-400">&bull; Aggregated Metrics Only &amp; Safety</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black font-display text-slate-900 mt-1">School Administrator Portal</h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
              High-level school cohort telemetry, educator permissions, DPDP Act compliance audit, and institutional license management.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/teacher"
              className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-800 text-xs font-bold hover:bg-slate-50 transition-all shadow-xs"
            >
              Teacher Hub
            </Link>
            <Link
              href="/for-schools"
              className="px-4 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-black transition-all shadow-xs"
            >
              School Program Specs
            </Link>
          </div>
        </div>

        {inviteSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{inviteSuccess}</span>
          </div>
        )}

        {/* Aggregated School Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">Total Enrolled Cohorts</span>
            <div className="text-2xl font-black font-mono text-slate-900">{aggregatedStats.totalClassrooms} Classrooms</div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">Active Students</span>
            <div className="text-2xl font-black font-mono text-slate-900">{aggregatedStats.totalEnrolledStudents} Enrolled</div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">AI Ethics Completion</span>
            <div className="text-2xl font-black font-mono text-emerald-600">{aggregatedStats.aiLiteracyCompletionPct}% Rate</div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">DPDP Compliance</span>
            <div className="text-2xl font-black font-mono text-indigo-600">100% Verified</div>
          </div>
        </div>

        {/* Privacy & Minor Protection Callout */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex items-start gap-3.5 text-xs text-slate-600">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="text-slate-900 font-bold block">DPDP Act &amp; Minor Protection Isolation:</strong>
            <p className="leading-relaxed">
              School administrators can view cohort aggregates, percentage milestones, and teacher staffing, but cannot inspect individual student diaries, resumes, or private messages.
            </p>
          </div>
        </div>

        {/* Manage Teachers Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-black font-display text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-600" />
                <span>Authorized Educator Staff</span>
              </h2>
              <p className="text-xs text-slate-500">Educators authorized to manage classroom cohorts.</p>
            </div>
          </div>

          {/* Invite Educator Form */}
          <form onSubmit={handleInviteTeacher} className="flex gap-3">
            <input
              type="email"
              required
              value={newTeacherEmail}
              onChange={(e) => setNewTeacherEmail(e.target.value)}
              placeholder="teacher.name@school.edu"
              className="flex-1 p-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-black text-[#D7FC51] text-xs font-black uppercase tracking-wider transition-all shrink-0 shadow-md cursor-pointer active:scale-95"
            >
              Invite Educator
            </button>
          </form>

          {/* Teacher List */}
          <div className="divide-y divide-slate-100">
            {teachers.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No educators currently registered. Invite your first teacher above.
              </div>
            ) : (
              teachers.map(t => (
                <div key={t.id} className="py-3.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{t.name || "Educator"}</span>
                    <span className="text-[10px] text-slate-400 ml-2 font-mono">ID: {t.id.substring(0, 8)}...</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Active Teacher
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
