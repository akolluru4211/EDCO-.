"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { Briefcase, Plus, Users, ArrowRight, Eye, CheckCircle2 } from "lucide-react";
import Button from "@/components/ui/Button";

export default function EmployerDashboardPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEmployerJobs() {
      if (!user) return;
      try {
        const { data } = await supabase
          .from("jobs")
          .select("*, job_applications(count)")
          .eq("employer_id", user.uid);
        if (data) setJobs(data);
      } catch (err) {
        console.warn("Load employer jobs note:", err);
      } finally {
        setLoading(false);
      }
    }
    loadEmployerJobs();
  }, [user]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Employer Portal</span>
              </span>
              <span className="text-xs text-slate-400">&bull; Scoped Job Listings</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Candidate Sourcing &amp; Postings
            </h1>
            <p className="text-xs text-slate-500 max-w-xl">
              Post verified openings, review candidate skill levels, and evaluate applicant resumes.
            </p>
          </div>

          <Link
            href="/jobs/employer"
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Post New Job</span>
          </Link>
        </div>

        {/* Listings List */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Your Active Job Listings</h2>
            <span className="text-xs text-slate-500">{jobs.length} Active Posts</span>
          </div>

          {jobs.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">No Active Listings Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Create your first job posting to source pre-calibrated candidates with verified effective levels.
              </p>
              <Link
                href="/jobs/employer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold mt-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Job Posting</span>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {jobs.map((j) => (
                <div key={j.id} className="py-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{j.title}</h3>
                    <p className="text-xs text-slate-500">{j.company} &bull; {j.location}</p>
                  </div>
                  <Link
                    href={`/jobs/${j.id}`}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Post</span>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
