"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { 
  Briefcase, 
  Plus, 
  Calendar, 
  ExternalLink, 
  Building2, 
  MapPin, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle,
  FileText,
  Video,
  ArrowRight,
  Filter,
  Search,
  Loader2,
  Trash2,
  Edit3
} from "lucide-react";
import Button from "@/components/ui/Button";
import { JobApplicationItem, ApplicationStage } from "@/lib/types/career-intelligence";

const STAGES: { key: ApplicationStage; label: string; color: string; bg: string }[] = [
  { key: "saved", label: "Saved Jobs", color: "text-slate-700", bg: "bg-slate-100" },
  { key: "applied", label: "Applied", color: "text-blue-700", bg: "bg-blue-50" },
  { key: "viewed", label: "Viewed / Screened", color: "text-amber-700", bg: "bg-amber-50" },
  { key: "interview", label: "Interviewing", color: "text-purple-700", bg: "bg-purple-50" },
  { key: "offer", label: "Offer Received", color: "text-emerald-700", bg: "bg-emerald-50" },
  { key: "rejected", label: "Archived", color: "text-rose-700", bg: "bg-rose-50" }
];

export default function ApplicationsCommandCenterPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<JobApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStageFilter, setActiveStageFilter] = useState<string>("all");
  
  // New Application Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobLocation, setJobLocation] = useState("");
  const [salaryRange, setSalaryRange] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [status, setStatus] = useState<ApplicationStage>("saved");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/career/applications");
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
      }
    } catch (e) {
      console.error("Failed to load applications:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !jobTitle) {
      setError("Please provide company name and job title.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/career/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          jobTitle,
          jobLocation,
          salaryRange,
          jobUrl,
          status,
          notes
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to save application");
      }

      setShowAddModal(false);
      setCompanyName("");
      setJobTitle("");
      setJobLocation("");
      setSalaryRange("");
      setJobUrl("");
      setNotes("");
      fetchApplications();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleStageChange = async (appId: string, newStage: ApplicationStage) => {
    try {
      await fetch("/api/career/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: appId, status: newStage })
      });
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: newStage } : a));
    } catch (e) {
      console.error("Failed to update status:", e);
    }
  };

  const handleDelete = async (appId: string) => {
    if (!confirm("Are you sure you want to remove this application?")) return;
    try {
      await fetch(`/api/career/applications?id=${appId}`, { method: "DELETE" });
      setApplications(prev => prev.filter(a => a.id !== appId));
    } catch (e) {
      console.error("Failed to delete application:", e);
    }
  };

  const filteredApps = applications.filter(app => {
    const matchesSearch = app.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = activeStageFilter === "all" || app.status === activeStageFilter;
    return matchesSearch && matchesStage;
  });

  return (
    <div className="min-h-screen bg-[#F4F6FB] py-8 px-4 sm:px-6 lg:px-8 font-sans selection:bg-[#D7FC51] selection:text-black">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-[#E8ECF2] shadow-sm">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E0FAF6] text-[#00D2B4] text-xs font-bold font-mono">
              <Briefcase className="w-3.5 h-3.5" />
              <span>CAREER EXECUTION ENGINE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-[#13141B] tracking-tight">
              Application Command Center
            </h1>
            <p className="text-xs sm:text-sm text-[#5E6573]">
              Track opportunities, link tailored ATS resume versions, and launch company-specific interview prep.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/career/readiness">
              <button className="px-4 py-2.5 rounded-2xl bg-[#F4F6FB] hover:bg-[#E8ECF2] text-xs font-bold text-[#13141B] transition-colors flex items-center gap-2">
                <span>Readiness View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 rounded-2xl bg-[#13141B] hover:bg-[#2A2C38] text-white text-xs font-black uppercase tracking-wider transition-transform hover:scale-[1.02] active:scale-98 flex items-center gap-2 shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Opportunity</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E8ECF2] shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#8E95A5] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search companies or roles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#13141B] focus:outline-none focus:border-[#13141B]"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <button
              onClick={() => setActiveStageFilter("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                activeStageFilter === "all" ? "bg-[#13141B] text-white" : "bg-[#F4F6FB] text-[#5E6573] hover:text-[#13141B]"
              }`}
            >
              All ({applications.length})
            </button>
            {STAGES.map(s => {
              const count = applications.filter(a => a.status === s.key).length;
              return (
                <button
                  key={s.key}
                  onClick={() => setActiveStageFilter(s.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                    activeStageFilter === s.key ? "bg-[#13141B] text-white" : "bg-[#F4F6FB] text-[#5E6573] hover:text-[#13141B]"
                  }`}
                >
                  {s.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Applications List / Empty State */}
        {loading ? (
          <div className="bg-white rounded-3xl p-12 border border-[#E8ECF2] text-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#7B57FF] animate-spin mx-auto" />
            <p className="text-xs text-[#5E6573] font-bold">Loading your application pipeline...</p>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-[#E8ECF2] text-center space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-[#F4F6FB] text-[#8E95A5] flex items-center justify-center mx-auto">
              <Briefcase className="w-7 h-7" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-base font-black text-[#13141B]">No applications found</h3>
              <p className="text-xs text-[#5E6573]">
                {searchQuery || activeStageFilter !== "all" 
                  ? "Try clearing filters to view all opportunities." 
                  : "Start adding target jobs to link your ATS resume and prepare interview questions."}
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-[#13141B] text-white text-xs font-bold hover:bg-[#2A2C38] transition-colors"
            >
              Add First Application
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredApps.map((app) => {
              const stageMeta = STAGES.find(s => s.key === app.status) || STAGES[0];
              return (
                <div 
                  key={app.id} 
                  className="bg-white rounded-3xl p-5 border border-[#E8ECF2] hover:border-[#13141B]/20 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${stageMeta.bg} ${stageMeta.color}`}>
                          {stageMeta.label}
                        </span>
                        <h3 className="text-base font-black text-[#13141B] group-hover:text-[#7B57FF] transition-colors mt-1">
                          {app.jobTitle}
                        </h3>
                        <p className="text-xs font-bold text-[#5E6573] flex items-center gap-1.5 mt-0.5">
                          <Building2 className="w-3.5 h-3.5 text-[#8E95A5]" />
                          <span>{app.companyName}</span>
                        </p>
                      </div>

                      <button
                        onClick={() => handleDelete(app.id)}
                        className="text-[#8E95A5] hover:text-rose-600 transition-colors p-1"
                        title="Delete application"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 text-[11px] text-[#5E6573]">
                      {app.jobLocation && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#8E95A5]" />
                          <span>{app.jobLocation}</span>
                        </div>
                      )}
                      {app.salaryRange && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-[#8E95A5]" />
                          <span>{app.salaryRange}</span>
                        </div>
                      )}
                    </div>

                    {app.notes && (
                      <p className="text-xs text-[#5E6573] bg-[#F4F6FB] p-2.5 rounded-xl border border-[#E8ECF2] line-clamp-2">
                        {app.notes}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 pt-3 border-t border-[#E8ECF2]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#8E95A5] text-[11px]">Move Stage:</span>
                      <select
                        value={app.status}
                        onChange={(e) => handleStageChange(app.id, e.target.value as ApplicationStage)}
                        className="text-[11px] font-bold bg-[#F4F6FB] border border-[#E8ECF2] rounded-lg px-2 py-1 text-[#13141B] focus:outline-none"
                      >
                        {STAGES.map(s => (
                          <option key={s.key} value={s.key}>{s.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <Link 
                        href={`/interviews?role=${encodeURIComponent(app.jobTitle)}&company=${encodeURIComponent(app.companyName)}`}
                        className="flex-1 py-2 px-3 rounded-xl bg-[#F4F6FB] hover:bg-[#E8ECF2] text-[11px] font-bold text-[#13141B] transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Video className="w-3.5 h-3.5 text-[#7B57FF]" />
                        <span>Prep Interview</span>
                      </Link>

                      {app.jobUrl && (
                        <a
                          href={app.jobUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-[#F4F6FB] hover:bg-[#E8ECF2] text-[#13141B] transition-colors"
                          title="Open Original Job Link"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Add New Application */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#E8ECF2] shadow-2xl space-y-5 animate-in zoom-in-95">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-[#13141B]">Track New Opportunity</h3>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="text-[#8E95A5] hover:text-[#13141B] text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#13141B] uppercase tracking-wider mb-1">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Razorpay"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#13141B] focus:outline-none focus:border-[#13141B]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#13141B] uppercase tracking-wider mb-1">
                      Job Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Full Stack Engineer"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#13141B] focus:outline-none focus:border-[#13141B]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#13141B] uppercase tracking-wider mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bengaluru / Remote"
                      value={jobLocation}
                      onChange={(e) => setJobLocation(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#13141B] focus:outline-none focus:border-[#13141B]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#13141B] uppercase tracking-wider mb-1">
                      Salary / CTC
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ₹18–24 LPA"
                      value={salaryRange}
                      onChange={(e) => setSalaryRange(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#13141B] focus:outline-none focus:border-[#13141B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#13141B] uppercase tracking-wider mb-1">
                    Job Posting URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#13141B] focus:outline-none focus:border-[#13141B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#13141B] uppercase tracking-wider mb-1">
                    Initial Stage
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ApplicationStage)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#13141B] focus:outline-none focus:border-[#13141B]"
                  >
                    {STAGES.map(s => (
                      <option key={s.key} value={s.key}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#13141B] uppercase tracking-wider mb-1">
                    Notes & Key Requirements
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Requires Next.js 15, PostgreSQL, and AWS experience..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#13141B] focus:outline-none focus:border-[#13141B]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#5E6573] hover:text-[#13141B]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 rounded-xl bg-[#13141B] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#2A2C38] disabled:opacity-50 transition-colors flex items-center gap-2"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>Save Application</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
