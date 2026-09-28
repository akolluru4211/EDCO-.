"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { 
  Lightbulb, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  Send, 
  FolderGit2, 
  Lock,
  Code2
} from "lucide-react";

export const dynamic = "force-dynamic";

export default function ProblemBoardPage() {
  const { user, profile, isMinor } = useAuth();
  const [problems, setProblems] = useState<any[]>([]);
  const [solutions, setSolutions] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedProblem, setSelectedProblem] = useState<any | null>(null);
  const [solutionTitle, setSolutionTitle] = useState("");
  const [solutionDescription, setSolutionDescription] = useState("");
  const [linkedProjectId, setLinkedProjectId] = useState<string>("");
  const [visibility, setVisibility] = useState<"private" | "classroom" | "public">("private");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadBoardData() {
      try {
        const ageBand = user?.ageBand || "18+";
        const res = await fetch(`/api/problems?category=${categoryFilter}&ageBand=${ageBand}&userId=${user?.uid || ""}`);
        const data = await res.json();
        if (data?.problems) setProblems(data.problems);

        // Load user's active solutions
        if (user) {
          const sRes = await fetch(`/api/problems/solutions?userId=${user.uid}&callerId=${user.uid}`);
          const sData = await sRes.json();
          if (sData?.solutions) setSolutions(sData.solutions);

          // Load user's Project Studio projects if Explorer/College
          if (!isMinor) {
            const { data: pData } = await supabase
              .from("projects")
              .select("id, title")
              .eq("user_id", user.uid);
            if (pData) setProjects(pData);
          }
        }
      } catch (err) {
        console.warn("Problem board data load note:", err);
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

      setSuccessMessage(json.message);
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

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#FCFCFB] text-[#13141B] py-8 px-4 sm:px-6 lg:px-8 xl:px-10 font-sans selection:bg-[#00D2B4]/20 selection:text-[#0A5245]">
      <div className="max-w-[1536px] mx-auto space-y-8 animate-in fade-in">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-2xl border border-[#EBECEF] shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-[#00D2B4]/10 text-[#0A5245] border border-[#00D2B4]/30 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-[#00D2B4]" />
                <span>Problem &rarr; Solution Board</span>
              </span>
              <span className="text-xs text-[#8E95A5] font-medium">&bull; Curated Real-World Challenges</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#13141B] mt-2">
              Real-World Engineering Challenges
            </h1>
            <p className="text-xs sm:text-sm text-[#5E6573] mt-1">
              Select industry problems, build verified solutions in Project Studio, and earn portfolio proof points.
            </p>
          </div>

          {successMessage && (
            <div className="px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/60 text-xs font-bold flex items-center gap-2 animate-in fade-in shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto touch-scroll-x pb-1">
          {[
            { id: "all", label: "All Challenges" },
            { id: "ai", label: "AI & PyTorch (TorchLeet)" },
            { id: "engineering", label: "GPU & Systems" },
            { id: "community", label: "Community & Social" },
            { id: "environment", label: "Environment & Energy" },
            { id: "technical", label: "Technical & Systems" },
            { id: "business", label: "Business & Operations" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                categoryFilter === cat.id
                  ? "bg-[#13141B] text-white shadow-2xs"
                  : "bg-white text-[#5E6573] border border-[#EBECEF] hover:text-[#13141B] hover:bg-[#F4F6FB]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Problems Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map((prob) => {
            const hasDraft = solutions.find((s) => s.problem_id === prob.id && s.status === "in_progress");
            const isSubmitted = solutions.find((s) => s.problem_id === prob.id && s.status === "submitted");

            return (
              <div
                key={prob.id}
                className="bg-white p-6 sm:p-7 rounded-2xl border border-[#EBECEF] hover:border-[#13141B]/30 shadow-xs hover:shadow-sm transition-all space-y-4 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-700">
                        {prob.category}
                      </span>
                      {prob.source?.includes("TorchLeet") && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/60 font-mono">
                          PyTorch
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {prob.needs_review && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/60 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>Review Scheduled</span>
                        </span>
                      )}
                      <span className="text-[11px] font-mono text-[#8E95A5]">
                        Level {prob.difficulty_level}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-bold text-lg text-[#13141B] leading-snug group-hover:text-[#00D2B4] transition-colors">
                    {prob.title}
                  </h3>

                  <p className="text-xs text-[#5E6573] leading-relaxed line-clamp-3">
                    {prob.description}
                  </p>

                  {prob.companies && prob.companies.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-[#8E95A5]">
                      <span className="font-medium text-[#5E6573]">Companies:</span>
                      <span className="text-xs font-mono">{prob.companies.join(", ")}</span>
                    </div>
                  )}

                  {prob.interest_tags && prob.interest_tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {prob.interest_tags.map((tag: string) => (
                        <span key={tag} className="text-[10px] bg-[#F4F6FB] border border-[#E8ECF2] text-[#5E6573] px-2 py-0.5 rounded-md font-mono">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-[#EBECEF] flex items-center justify-between">
                  {isSubmitted ? (
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Submitted</span>
                    </span>
                  ) : hasDraft ? (
                    <span className="text-xs font-bold text-amber-800 flex items-center gap-1">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span>Draft Active</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#8E95A5]">
                      +100 XP on solve
                    </span>
                  )}

                  <button
                    onClick={() => {
                      setSelectedProblem(prob);
                      const draft = solutions.find((s) => s.problem_id === prob.id);
                      if (draft) {
                        setSolutionTitle(draft.title || "");
                        setSolutionDescription(draft.description || "");
                        setLinkedProjectId(draft.linked_project_id || "");
                        setVisibility(draft.visibility || "private");
                      } else {
                        setSolutionTitle(`Solution for: ${prob.title}`);
                        setSolutionDescription("");
                        setLinkedProjectId("");
                        setVisibility("private");
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-[#13141B] hover:bg-[#252632] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    <span>{hasDraft ? "Edit Solution" : isSubmitted ? "View Solution" : "Solve Problem"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Work on Problem Modal */}
        {selectedProblem && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-[#EBECEF] max-h-[90vh] overflow-y-auto">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0A5245] bg-[#00D2B4]/10 border border-[#00D2B4]/30 px-2.5 py-1 rounded-md">
                  Solution Workspace
                </span>
                <h2 className="text-xl font-bold text-[#13141B] tracking-tight mt-2">
                  {selectedProblem.title}
                </h2>
                <p className="text-xs text-[#5E6573] leading-relaxed">{selectedProblem.description}</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#13141B]">
                    Solution Title
                  </label>
                  <input
                    type="text"
                    value={solutionTitle}
                    onChange={(e) => setSolutionTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8ECF2] bg-[#F4F6FB] text-[#13141B] text-xs font-medium focus:bg-white focus:outline-none focus:border-[#13141B] shadow-2xs transition-colors"
                    placeholder="e.g. Distributed Pantry Routing Algorithm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#13141B]">
                    Proposal &amp; Implementation Description
                  </label>
                  <textarea
                    rows={4}
                    value={solutionDescription}
                    onChange={(e) => setSolutionDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8ECF2] bg-[#F4F6FB] text-[#13141B] text-xs focus:bg-white focus:outline-none focus:border-[#13141B] shadow-2xs transition-colors"
                    placeholder="Explain your approach, architecture decisions, and real-world impact..."
                  />
                </div>

                {!isMinor && projects.length > 0 && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#13141B] flex items-center gap-1.5">
                      <FolderGit2 className="w-3.5 h-3.5 text-[#13141B]" />
                      <span>Link Project Studio Project (Optional)</span>
                    </label>
                    <select
                      value={linkedProjectId}
                      onChange={(e) => setLinkedProjectId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8ECF2] text-xs font-medium focus:outline-none focus:border-[#13141B] bg-[#F4F6FB] text-[#13141B] shadow-2xs"
                    >
                      <option value="">-- No project link --</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#13141B]">
                    Visibility &amp; Sharing
                  </label>
                  <select
                    value={visibility}
                    onChange={(e: any) => setVisibility(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8ECF2] text-xs font-medium focus:outline-none focus:border-[#13141B] bg-[#F4F6FB] text-[#13141B] shadow-2xs"
                  >
                    <option value="private">Private (Only you &amp; mentors/admins)</option>
                    <option value="classroom">Classroom (Moderated before peers can view)</option>
                    {!isMinor && <option value="public">Public Showcase</option>}
                  </select>
                  {visibility === "classroom" && (
                    <p className="text-[11px] text-amber-800 mt-1 flex items-center gap-1 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                      <span>Solution visibility requires platform moderation review.</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EBECEF]">
                <button
                  type="button"
                  onClick={() => setSelectedProblem(null)}
                  className="px-4 py-2 rounded-xl border border-[#E8ECF2] bg-white text-xs font-medium text-[#13141B] hover:bg-[#F4F6FB] cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmitSolution("in_progress")}
                  disabled={submitting || !solutionTitle.trim()}
                  className="px-4 py-2 rounded-xl bg-[#F4F6FB] hover:bg-[#EBECEF] border border-[#E8ECF2] text-[#13141B] text-xs font-medium transition-colors cursor-pointer"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmitSolution("submitted")}
                  disabled={submitting || !solutionTitle.trim()}
                  className="px-4 py-2 rounded-xl bg-[#13141B] hover:bg-[#252632] text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Solution (+100 XP)</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
