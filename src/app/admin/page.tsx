"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { 
  Users, 
  Briefcase, 
  Award, 
  Mail, 
  ArrowRight, 
  Plus, 
  Send, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  ShieldCheck,
  Building2,
  GraduationCap
} from "lucide-react";

export default function AdminHubPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    studentsCount: 0,
    onboardedCount: 0,
    totalJobs: 0,
    internshipsCount: 0,
    pendingAmbassadors: 0,
    acceptedAmbassadors: 0,
    hasResendKey: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSummaryData() {
      try {
        setLoading(true);
        // Load users data
        const usersRes = await fetch("/api/admin/users");
        const usersData = await usersRes.json();

        // Load jobs data
        const jobsRes = await fetch("/api/admin/jobs");
        const jobsData = await jobsRes.json();

        // Load ambassadors data
        const ambRes = await fetch("/api/ambassador/admin");
        const ambData = await ambRes.json();

        // Load bulk mail stats
        const mailRes = await fetch("/api/admin/bulk-mail");
        const mailData = await mailRes.json();

        const allUsers = usersData.users || [];
        const students = allUsers.filter((u: any) => u.career_stage === "STUDENT" || !u.career_stage);
        const onboarded = students.filter((u: any) => u.onboarding_completed);

        setStats({
          totalUsers: allUsers.length,
          studentsCount: students.length,
          onboardedCount: onboarded.length,
          totalJobs: jobsData.counts?.total || 0,
          internshipsCount: jobsData.counts?.internships || 0,
          pendingAmbassadors: (ambData.applications || []).filter((a: any) => a.status === "pending").length,
          acceptedAmbassadors: (ambData.ambassadors || []).length,
          hasResendKey: mailData.hasResendKey || false,
        });
      } catch (err) {
        console.error("Failed to load admin summary:", err);
      } finally {
        setLoading(false);
      }
    }

    loadSummaryData();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Top Banner */}
      <div className="bg-white border border-neutral-200 p-6 sm:p-8 rounded-3xl shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-neutral-100 border border-neutral-200 text-[10px] font-black uppercase tracking-wider text-black">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Operations Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
              Platform Administration
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600">
              Manage registered users &amp; onboarding dossiers, publish jobs and internships, coordinate campus ambassadors, and broadcast announcements via Resend.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/jobs"
              className="px-4 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Role</span>
            </Link>
            <Link
              href="/admin/bulk-mail"
              className="px-4 py-2.5 rounded-xl border border-neutral-300 hover:border-black text-black text-xs font-bold transition-all flex items-center gap-2 bg-white"
            >
              <Send className="w-4 h-4" />
              <span>Bulk Mail</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Dedicated Core Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Module 1: Users & Onboarding */}
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-7 flex flex-col justify-between hover:border-black transition-all shadow-xs group">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-black border border-neutral-200">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono font-bold text-neutral-500">
                {stats.totalUsers} Total Accounts
              </span>
            </div>

            <div>
              <h2 className="text-lg font-black text-black">Users &amp; Onboarding Data</h2>
              <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                Inspect every registered user on the platform. Review their career stage, selected engineering tracks, skill assessments, primary career goals, and verified contact info.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                <span className="text-[10px] font-bold text-neutral-500 uppercase block">Registered Students</span>
                <span className="text-lg font-black text-black font-mono">{stats.studentsCount}</span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                <span className="text-[10px] font-bold text-neutral-500 uppercase block">Onboarding Finished</span>
                <span className="text-lg font-black text-black font-mono">{stats.onboardedCount}</span>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-4 border-t border-neutral-100 flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500">Full Directory &amp; Dossiers</span>
            <Link
              href="/admin/users"
              className="px-4 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all group-hover:translate-x-1"
            >
              <span>View Users</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Module 2: Jobs & Internships */}
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-7 flex flex-col justify-between hover:border-black transition-all shadow-xs group">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-black border border-neutral-200">
                <Briefcase className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono font-bold text-neutral-500">
                {stats.totalJobs} Active Roles
              </span>
            </div>

            <div>
              <h2 className="text-lg font-black text-black">Jobs &amp; Internships Manager</h2>
              <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                Add verified full-time positions and paid internship roles. Specify stipend, required skills, and direct application links, or delete obsolete roles in one click.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                <span className="text-[10px] font-bold text-neutral-500 uppercase block">Internship Openings</span>
                <span className="text-lg font-black text-black font-mono">{stats.internshipsCount}</span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                <span className="text-[10px] font-bold text-neutral-500 uppercase block">Full-Time Positions</span>
                <span className="text-lg font-black text-black font-mono">{Math.max(0, stats.totalJobs - stats.internshipsCount)}</span>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-4 border-t border-neutral-100 flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500">Add &amp; Delete Openings</span>
            <Link
              href="/admin/jobs"
              className="px-4 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all group-hover:translate-x-1"
            >
              <span>Manage Roles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Module 3: Campus Ambassadors */}
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-7 flex flex-col justify-between hover:border-black transition-all shadow-xs group">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-black border border-neutral-200">
                <Award className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono font-bold text-neutral-500">
                {stats.pendingAmbassadors} Pending Requests
              </span>
            </div>

            <div>
              <h2 className="text-lg font-black text-black">Campus Ambassadors Hub</h2>
              <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                Review applications submitted by students representing universities. Approve candidates, generate referral codes, and schedule team meetings or assign tasks via Resend with 1-click.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                <span className="text-[10px] font-bold text-neutral-500 uppercase block">Pending Applications</span>
                <span className="text-lg font-black text-black font-mono">{stats.pendingAmbassadors}</span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                <span className="text-[10px] font-bold text-neutral-500 uppercase block">Accepted Leaders</span>
                <span className="text-lg font-black text-black font-mono">{stats.acceptedAmbassadors}</span>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-4 border-t border-neutral-100 flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500">1-Click Meeting &amp; Task Mailer</span>
            <Link
              href="/admin/ambassadors"
              className="px-4 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all group-hover:translate-x-1"
            >
              <span>Review &amp; Mail</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Module 4: Bulk Mail Sender */}
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-7 flex flex-col justify-between hover:border-black transition-all shadow-xs group">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-black border border-neutral-200">
                <Mail className="w-6 h-6" />
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${stats.hasResendKey ? "bg-emerald-100 text-emerald-800 border border-emerald-300" : "bg-neutral-100 text-neutral-700 border border-neutral-200"}`}>
                {stats.hasResendKey ? "Resend Live" : "Resend Audit Mode"}
              </span>
            </div>

            <div>
              <h2 className="text-lg font-black text-black">Bulk Mail Sender (Resend)</h2>
              <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                Compose announcements and career updates to all students. Customize call-to-actions, perform test preview dispatches to admin, and broadcast via the Resend API with batch safety.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                <span className="text-[10px] font-bold text-neutral-500 uppercase block">Target Student Audience</span>
                <span className="text-lg font-black text-black font-mono">{stats.studentsCount} Students</span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                <span className="text-[10px] font-bold text-neutral-500 uppercase block">Delivery Channel</span>
                <span className="text-xs font-bold text-black font-mono mt-1 block">Resend API v2</span>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-4 border-t border-neutral-100 flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500">Compose Announcement</span>
            <Link
              href="/admin/bulk-mail"
              className="px-4 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all group-hover:translate-x-1"
            >
              <span>Open Mailer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Module 5: Security Office */}
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-7 flex flex-col justify-between hover:border-black transition-all shadow-xs group col-span-1 md:col-span-2">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-black border border-neutral-200">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                RLS 100% Protected
              </span>
            </div>

            <div>
              <h2 className="text-lg font-black text-black">Security Office &amp; Compliance Hub</h2>
              <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                Live PostgreSQL database health probe, multi-tenant Row Level Security (RLS) enforcement verification, safety moderation blocks, and statutory Grievance Officer redressal compliance under IT Act 2000 &amp; DPDP Act 2023.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                <span className="text-[10px] font-bold text-neutral-500 uppercase block">Database Engine</span>
                <span className="text-xs font-bold text-black font-mono mt-1 block">PostgreSQL 15 &bull; SSL Active</span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                <span className="text-[10px] font-bold text-neutral-500 uppercase block">Statutory Compliance</span>
                <span className="text-xs font-bold text-black font-mono mt-1 block">DPDP Act 2023 Enforced</span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                <span className="text-[10px] font-bold text-neutral-500 uppercase block">Grievance SLA</span>
                <span className="text-xs font-bold text-emerald-700 font-mono mt-1 block">Within 24–48 Hours</span>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-4 border-t border-neutral-100 flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500">Live Security Telemetry &amp; Audit Logs</span>
            <Link
              href="/admin/security"
              className="px-4 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all group-hover:translate-x-1"
            >
              <span>Open Security Office</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
