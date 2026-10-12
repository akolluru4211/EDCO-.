"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Briefcase, Plus, Users, ArrowRight, Eye, CheckCircle2, ShieldCheck } from "lucide-react";

export default function EmployerDashboardPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEmployerJobs() {
      if (!user) return;
      try {
        const resp = await fetch(`/api/employer/jobs?employerId=${user.uid}`);
        const json = await resp.json();
        if (json.success && Array.isArray(json.jobs)) {
          setJobs(json.jobs);
        }
      } catch (err) {
        console.warn("Load employer jobs error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadEmployerJobs();
  }, [user]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#FAF8F5] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Employer Portal</span>
              </span>
              <span className="text-xs text-stone-400">&bull; Role-Isolated Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1 font-serif">
              Candidate Sourcing &amp; Active Listings
            </h1>
            <p className="text-xs text-stone-500 max-w-xl">
              Post verified openings, evaluate candidate match scores, and review immutable resume snapshots.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/jobs/employer"
              className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <Users className="w-4 h-4" />
              <span>Open ATS Studio</span>
            </Link>
          </div>
        </div>

        {/* Listings List */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <h2 className="text-base font-bold text-stone-900 font-serif">Your Postings</h2>
            <span className="text-xs text-stone-500 font-semibold">{jobs.length} Active Posts</span>
          </div>

          {loading ? (
            <p className="text-xs text-stone-400 py-6 text-center">Loading postings...</p>
          ) : jobs.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-500 flex items-center justify-center mx-auto">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-stone-800 text-sm font-serif">No Active Listings Yet</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Create your first job posting to source pre-calibrated candidates with verified skill backgrounds.
              </p>
              <Link
                href="/jobs/employer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-bold mt-2 hover:bg-emerald-900 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Job Posting</span>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {jobs.map((j) => (
                <div key={j.id} className="py-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm font-serif">{j.title}</h3>
                    <p className="text-xs text-stone-500">{j.company} &bull; {j.location}</p>
                    <span className="text-[10px] text-stone-400">
                      Applicants: {j.applicant_count || 0} ({j.pending_count || 0} unreviewed)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/jobs/${j.id}`}
                      className="px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-xs font-bold text-stone-700 flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </Link>
                    <Link
                      href="/jobs/employer"
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold text-emerald-800 flex items-center gap-1.5"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Review ATS</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
