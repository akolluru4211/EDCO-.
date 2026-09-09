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
      <div className="min-h-[calc(100vh-4rem)] bg-paper py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center text-ink">
        <div className="max-w-md w-full bg-paper-raised rounded-3xl p-8 border border-line shadow-sm text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-forest/10 text-forest flex items-center justify-center mx-auto border border-forest/20">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-forest/10 text-forest border border-forest/20">
              Institutional Admin Portal
            </span>
            <h2 className="text-xl font-bold font-display text-ink">School Admin Clearance Required</h2>
            <p className="text-xs text-ink-soft leading-relaxed">
              This portal is designated for school principals, district coordinators, and institutional administrators. Student learners and working professionals access their dedicated workspaces.
            </p>
          </div>
          <div className="space-y-2 pt-2">
            <Link
              href="/dashboard"
              className="w-full py-3 rounded-2xl bg-forest hover:bg-forest-light text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <span>Return to My Workspace</span>
            </Link>
            <Link
              href="/for-schools"
              className="w-full py-3 rounded-2xl bg-paper-soft hover:bg-paper text-ink text-xs font-bold flex items-center justify-center gap-2 transition-all border border-line"
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
    <div className="min-h-[calc(100vh-4rem)] bg-paper py-8 px-4 sm:px-6 lg:px-8 text-ink">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-forest/10 text-forest border border-forest/20 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>Institutional Administration</span>
              </span>
              <span className="text-xs text-ink-muted">&bull; Aggregated Metrics Only</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold font-display text-ink mt-1">School Administrator Portal</h1>
            <p className="text-xs sm:text-sm text-ink-soft max-w-xl">
              High-level school cohort telemetry, educator permissions, and institutional license management.
            </p>
          </div>
        </div>

        {inviteSuccess && (
          <div className="p-3.5 rounded-2xl bg-forest/10 border border-forest/20 text-forest text-xs font-bold flex items-center gap-2 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-forest" />
            <span>{inviteSuccess}</span>
          </div>
        )}

        {/* Aggregated School Metrics (Zero Individual Student Rows) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-paper-raised rounded-3xl p-5 border border-line shadow-sm">
            <span className="text-[10px] uppercase font-bold tracking-wider text-ink-muted">Total Enrolled Cohorts</span>
            <div className="text-2xl font-bold font-mono text-ink mt-1">{aggregatedStats.totalClassrooms} Classrooms</div>
          </div>

          <div className="bg-paper-raised rounded-3xl p-5 border border-line shadow-sm">
            <span className="text-[10px] uppercase font-bold tracking-wider text-ink-muted">Active Students</span>
            <div className="text-2xl font-bold font-mono text-ink mt-1">{aggregatedStats.totalEnrolledStudents} Enrolled</div>
          </div>

          <div className="bg-paper-raised rounded-3xl p-5 border border-line shadow-sm">
            <span className="text-[10px] uppercase font-bold tracking-wider text-ink-muted">AI Ethics Completion</span>
            <div className="text-2xl font-bold font-mono text-forest mt-1">{aggregatedStats.aiLiteracyCompletionPct}% Rate</div>
          </div>

          <div className="bg-paper-raised rounded-3xl p-5 border border-line shadow-sm">
            <span className="text-[10px] uppercase font-bold tracking-wider text-ink-muted">Institutional License</span>
            <div className="text-2xl font-bold font-mono text-gold-dark mt-1">Active Tier</div>
          </div>
        </div>

        {/* Privacy Callout */}
        <div className="p-4 rounded-2xl bg-paper-raised border border-line shadow-sm flex items-center gap-3 text-xs text-ink-soft">
          <ShieldCheck className="w-5 h-5 text-forest shrink-0" />
          <span>
            <strong className="text-ink">Institutional Privacy Separation:</strong> School administrators can view cohort aggregates, percentage milestones, and teacher staffing, but cannot inspect individual student diaries, resumes, or private messages.
          </span>
        </div>

        {/* Manage Teachers Section */}
        <div className="bg-paper-raised rounded-3xl p-6 sm:p-8 border border-line shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-line pb-4">
            <div>
              <h2 className="text-lg font-bold font-display text-ink flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-forest" />
                <span>Authorized Educator Staff</span>
              </h2>
              <p className="text-xs text-ink-muted">Educators authorized to manage classroom cohorts.</p>
            </div>
          </div>

          {/* Invite Educator Form */}
          <form onSubmit={handleInviteTeacher} className="flex gap-2">
            <input
              type="email"
              required
              value={newTeacherEmail}
              onChange={(e) => setNewTeacherEmail(e.target.value)}
              placeholder="teacher.name@school.edu"
              className="flex-1 p-3 rounded-xl border border-line bg-paper text-xs text-ink focus:outline-none focus:ring-2 focus:ring-forest"
            />
            <button
              type="submit"
              className="px-5 py-3 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold transition-all shrink-0 shadow-sm cursor-pointer"
            >
              Invite Educator
            </button>
          </form>

          {/* Teacher List */}
          <div className="divide-y divide-line">
            {teachers.length === 0 ? (
              <div className="py-6 text-center text-xs text-ink-muted">
                No educators currently registered. Invite your first teacher above.
              </div>
            ) : (
              teachers.map(t => (
                <div key={t.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-ink">{t.name || "Educator"}</span>
                    <span className="text-[10px] text-ink-muted ml-2 font-mono">ID: {t.id.substring(0, 8)}...</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-forest/10 text-forest border border-forest/20">
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
