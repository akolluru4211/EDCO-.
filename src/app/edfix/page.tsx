"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import AuthGuard from "@/components/auth/AuthGuard";
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  Send, 
  FolderGit2, 
  Lock,
  Layers,
  Search,
  Check,
  Tag,
  Building2,
  ExternalLink,
  Flame,
  Award,
  Zap,
  X
} from "lucide-react";

export const dynamic = "force-dynamic";

interface EdFixProblem {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty_level: number;
  min_age_band: string;
  interest_tags: string[];
  companies?: string[];
  source: string;
  is_active: boolean;
  created_at: string;
  last_reviewed_at?: string;
  points?: number;
}

export default function EdFixPage() {
  const { user, profile, isMinor } = useAuth();
  const [problems, setProblems] = useState<EdFixProblem[]>([]);
  const [solutions, setSolutions] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Solution Submission Modal State
  const [selectedProblem, setSelectedProblem] = useState<EdFixProblem | null>(null);
  const [solutionTitle, setSolutionTitle] = useState("");
  const [solutionDescription, setSolutionDescription] = useState("");
  const [linkedProjectId, setLinkedProjectId] = useState<string>("");
  const [visibility, setVisibility] = useState<"private" | "classroom" | "public">("public");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadBoardData() {
      try {
        const ageBand = user?.ageBand || "18+";
        const res = await fetch(`/api/problems?category=${categoryFilter}&ageBand=${ageBand}&userId=${user?.uid || ""}`);
        const data = await res.json();
        
        if (data?.problems) {
          const formatted: EdFixProblem[] = data.problems.map((p: any) => ({
            ...p,
            last_reviewed_at: p.last_reviewed_at || "September 24, 2026",
            points: p.points || (p.difficulty_level >= 3 ? 150 : p.difficulty_level >= 2 ? 100 : 50)
          }));
          setProblems(formatted);
        }

        // Load user's active solutions
        if (user) {
          const sRes = await fetch(`/api/problems/solutions?userId=${user.uid}&callerId=${user.uid}`);
          const sData = await sRes.json();
          if (sData?.solutions) setSolutions(sData.solutions);

          // Load user's Project Studio projects if not minor
          if (!isMinor) {
            const { data: pData } = await supabase
              .from("projects")
              .select("id, title")
              .eq("user_id", user.uid);
            if (pData) setProjects(pData);
          }
        }
      } catch (err) {
        console.warn("EdFix data load note:", err);
      } finally {
        setLoading(false);
      }
    }

    loadBoardData();
  }, [user, categoryFilter, isMinor]);

  const handleSubmitSolution = async (status: "in_progress" | "submitted") => {
    if (!user || !selectedProblem || !solutionTitle.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/problems/solutions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: selectedProblem.id,
          userId: user.uid,
          title: solutionTitle.trim(),
          description: solutionDescription.trim(),
          linkedProjectId: isMinor ? null : linkedProjectId || null,
          status,
          visibility
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to submit solution.");

      setSuccessMessage(json.message || "Solution submitted successfully! Points credited.");
      setSelectedProblem(null);
      setSolutionTitle("");
      setSolutionDescription("");
      setLinkedProjectId("");

      // Refresh solutions
      const sRes = await fetch(`/api/problems/solutions?userId=${user.uid}&callerId=${user.uid}`);
      const sData = await sRes.json();
      if (sData?.solutions) setSolutions(sData.solutions);
    } catch (err: any) {
      alert(err.message || "Failed to submit solution.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      const matchesSearch = !searchQuery.trim() || 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.interest_tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSearch;
    });
  }, [problems, searchQuery]);

  const CATEGORIES = [
    { id: "all", label: "All Problems" },
    { id: "ai", label: "AI & PyTorch (TorchLeet)" },
    { id: "engineering", label: "GPU & Distributed Systems" },
    { id: "technical", label: "Backend & Cloud Architecture" },
    { id: "community", label: "Product & EdTech Workflows" },
    { id: "environment", label: "Energy & Infrastructure" },
  ];

  return (
    <AuthGuard>
      <div className="min-h-[calc(100vh-4rem)] bg-[#FCFCFB] text-[#13141B] py-8 px-4 sm:px-6 lg:px-8 xl:px-10 font-sans selection:bg-[#00D2B4]/20 selection:text-[#0A5245]">
        <div className="max-w-[1536px] mx-auto space-y-8 animate-in fade-in">
          
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-[#EBECEF] shadow-xs">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-[#13141B] text-[#00D2B4] flex items-center gap-1.5 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>EdFix Problem Board</span>
                </span>
                <span className="text-xs font-mono text-[#5E6573] bg-[#FCFCFB] px-2 py-0.5 rounded-md border border-[#EBECEF]">
                  Live Curation
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#13141B]">
                EdFix
              </h1>
            </div>

            {successMessage && (
              <div className="px-4 py-3 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in shadow-2xs self-start md:self-auto">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}
          </div>

          {/* Search & Category Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto touch-scroll-x pb-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    categoryFilter === cat.id
                      ? "bg-[#13141B] text-white shadow-2xs"
                      : "bg-white text-[#5E6573] border border-[#EBECEF] hover:bg-slate-50 hover:text-[#13141B]"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px] sm:w-72">
              <Search className="w-4 h-4 text-[#8F9CAE] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search problems, skills, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white border border-[#EBECEF] text-xs text-[#13141B] placeholder:text-[#8F9CAE] focus:outline-none focus:ring-2 focus:ring-[#00D2B4] shadow-xs"
              />
            </div>
          </div>

          {/* User's Submitted Solutions Strip (if any) */}
          {solutions.length > 0 && (
            <div className="bg-white p-5 rounded-2xl border border-[#EBECEF] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#00D2B4]" />
                  <h3 className="text-xs font-bold text-[#13141B] uppercase tracking-wider">
                    My Active Problem Solutions ({solutions.length})
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-[#5E6573]">Portfolio Verified</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {solutions.map((sol) => (
                  <div key={sol.id} className="p-3.5 rounded-xl bg-[#FCFCFB] border border-[#EBECEF] flex items-center justify-between">
                    <div className="space-y-0.5 min-w-0 pr-2">
                      <p className="text-xs font-bold text-[#13141B] truncate">{sol.title}</p>
                      <p className="text-[10px] text-[#5E6573]">{sol.status === "submitted" ? "Submitted for Review" : "In Progress"}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#00D2B4]/10 text-[#0A5245] border border-[#00D2B4]/20 shrink-0">
                      {sol.status === "submitted" ? "Active" : "Draft"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Problems Grid */}
          {loading ? (
            <div className="py-16 text-center text-xs font-medium text-[#5E6573]">
              Loading curated EdFix problems...
            </div>
          ) : filteredProblems.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center space-y-3 border border-[#EBECEF] shadow-xs max-w-md mx-auto">
              <Sparkles className="w-8 h-8 text-[#8F9CAE] mx-auto" />
              <p className="text-xs font-bold text-[#13141B]">No problems found matching this filter.</p>
              <p className="text-[11px] text-[#5E6573]">Try selecting a different category or clearing your search keywords.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProblems.map((prob) => {
                const diffLabel = prob.difficulty_level >= 3 ? "Advanced" : prob.difficulty_level === 2 ? "Intermediate" : "Foundational";
                const diffColor = prob.difficulty_level >= 3 
                  ? "bg-rose-50 text-rose-700 border-rose-200" 
                  : prob.difficulty_level === 2 
                    ? "bg-amber-50 text-amber-800 border-amber-200" 
                    : "bg-emerald-50 text-emerald-800 border-emerald-200";

                return (
                  <div
                    key={prob.id}
                    className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EBECEF] shadow-xs hover:border-[#D1D5DC] transition-all flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-3">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${diffColor}`}>
                          {diffLabel}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono font-bold text-[#00D2B4] bg-[#00D2B4]/10 border border-[#00D2B4]/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            +{prob.points || 100} pts
                          </span>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <div className="space-y-1.5">
                        <h3 className="text-base font-extrabold text-[#13141B] group-hover:text-[#00D2B4] transition-colors line-clamp-2">
                          {prob.title}
                        </h3>
                        <p className="text-xs text-[#5E6573] line-clamp-3 leading-relaxed">
                          {prob.description}
                        </p>
                      </div>

                      {/* Company & Source */}
                      {prob.companies && prob.companies.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          <Building2 className="w-3 h-3 text-[#8F9CAE]" />
                          <span className="text-[10px] font-mono text-[#5E6573]">Citing:</span>
                          {prob.companies.slice(0, 3).map((comp) => (
                            <span key={comp} className="px-2 py-0.5 rounded-md bg-[#FCFCFB] border border-[#EBECEF] text-[10px] font-bold text-[#13141B]">
                              {comp}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Tags */}
                      {prob.interest_tags && prob.interest_tags.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          {prob.interest_tags.slice(0, 4).map((tag) => (
                            <span key={tag} className="text-[10px] font-mono text-[#8F9CAE] bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer: Last Reviewed Timestamp & Submit Action */}
                    <div className="pt-3 border-t border-[#EBECEF] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#5E6573]">
                        <Clock className="w-3 h-3 text-[#8F9CAE]" />
                        <span>Last reviewed: {prob.last_reviewed_at || "Sept 2026"}</span>
                      </div>

                      <button
                        onClick={() => setSelectedProblem(prob)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#13141B] hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                      >
                        <span>Solve Problem</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#00D2B4]" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Solution Submission Modal */}
          {selectedProblem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
              <div className="max-w-lg w-full bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4">
                
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#00D2B4]" />
                    <h3 className="text-base font-bold text-slate-900">
                      Submit Solution &bull; EdFix
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedProblem(null)}
                    className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Problem Context Pill */}
                <div className="p-3.5 rounded-2xl bg-[#FCFCFB] border border-[#EBECEF] space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#00D2B4] font-bold">Target Challenge</span>
                  <p className="text-xs font-bold text-[#13141B]">{selectedProblem.title}</p>
                </div>

                {/* Submission Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmitSolution("submitted");
                  }}
                  className="space-y-4 text-xs"
                >
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Solution / Architecture Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={solutionTitle}
                      onChange={(e) => setSolutionTitle(e.target.value)}
                      placeholder="e.g. Distributed Lock Manager with Redis Redlock & Failover"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00D2B4]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Technical Explanation &amp; Approach *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={solutionDescription}
                      onChange={(e) => setSolutionDescription(e.target.value)}
                      placeholder="Explain your approach, design decisions, trade-offs, and how you validated the solution..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00D2B4]"
                    />
                  </div>

                  {!isMinor && projects.length > 0 && (
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <FolderGit2 className="w-3.5 h-3.5 text-[#00D2B4]" />
                        <span>Link Project Studio Repository (Optional)</span>
                      </label>
                      <select
                        value={linkedProjectId}
                        onChange={(e) => setLinkedProjectId(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#00D2B4]"
                      >
                        <option value="">-- Select a project from Studio --</option>
                        {projects.map((p) => (
                          <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setSelectedProblem(null)}
                      className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSubmitSolution("in_progress")}
                        disabled={submitting}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-colors disabled:opacity-50"
                      >
                        Save Draft
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-5 py-2 rounded-xl bg-[#13141B] hover:bg-black text-white font-bold flex items-center gap-1.5 shadow-md transition-all disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5 text-[#00D2B4]" />
                        <span>{submitting ? "Submitting..." : "Submit Solution"}</span>
                      </button>
                    </div>
                  </div>
                </form>

              </div>
            </div>
          )}

        </div>
      </div>
    </AuthGuard>
  );
}
