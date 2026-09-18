"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { 
  Lightbulb, 
  Sparkles, 
  Target, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Filter, 
  Plus, 
  ShieldCheck, 
  Send, 
  FolderGit2, 
  Lock,
  MessageSquare,
  Award
} from "lucide-react";
import Button from "@/components/ui/Button";

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
      setTimeout(() => setSuccessMessage(null), 4000);

      // Refresh solutions
      const sRes = await fetch(`/api/problems/solutions?userId=${user.uid}&callerId=${user.uid}`);
      const sData = await sRes.json();
      if (sData?.solutions) setSolutions(sData.solutions);
    } catch (err: any) {
      alert(err.message || "Error submitting solution");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-paper py-8 px-4 sm:px-6 lg:px-8 text-ink">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-paper-raised p-6 sm:p-8 rounded-3xl border border-line shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-gold/15 text-gold-dark border border-gold/30 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-gold" />
                <span>Problem &rarr; Solution Board</span>
              </span>
              <span className="text-xs text-ink-muted">&bull; Curated Real-World Challenges</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-display text-ink tracking-tight mt-2">
              Real-World Problem Board
            </h1>
            <p className="text-sm text-ink-soft max-w-xl leading-relaxed mt-1">
              Pick up curated community, environmental, and technical challenges. Build solutions, link projects, and receive structured mentor feedback.
            </p>
          </div>

          {successMessage && (
            <div className="px-4 py-2.5 rounded-xl bg-forest/10 text-forest border border-forest/20 text-xs font-bold flex items-center gap-2 animate-in fade-in shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-forest" />
              <span>{successMessage}</span>
            </div>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
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
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                categoryFilter === cat.id
                  ? "bg-forest text-white shadow-sm"
                  : "bg-paper-raised text-ink border border-line hover:bg-paper-soft"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Problems Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {problems.map((prob) => {
            const hasDraft = solutions.find((s) => s.problem_id === prob.id && s.status === "in_progress");
            const isSubmitted = solutions.find((s) => s.problem_id === prob.id && s.status === "submitted");

            return (
              <div
                key={prob.id}
                className="bg-paper-raised p-6 sm:p-8 rounded-3xl border border-line shadow-sm hover:shadow-md hover:border-forest/30 transition-all space-y-4 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-forest/10 text-forest border border-forest/20">
                        {prob.category}
                      </span>
                      {prob.source?.includes("TorchLeet") && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20 font-mono">
                          TorchLeet PyTorch
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {prob.needs_review && (
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-gold/15 text-gold-dark border border-gold/30 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-gold" />
                          <span>Review Scheduled</span>
                        </span>
                      )}
                      <span className="text-[10px] font-bold text-ink-muted">
                        Level {prob.difficulty_level}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-bold font-display text-ink text-xl leading-snug group-hover:text-forest transition-colors">
                    {prob.title}
                  </h3>

                  <p className="text-xs text-ink-soft leading-relaxed">
                    {prob.description}
                  </p>

                  {prob.companies && prob.companies.length > 0 && (
                    <div className="flex items-center gap-1 text-[11px] text-ink-muted">
                      <span className="font-semibold text-ink-soft">Companies:</span>
                      <span className="text-[10px] font-mono">{prob.companies.join(", ")}</span>
                    </div>
                  )}

                  {prob.interest_tags && prob.interest_tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {prob.interest_tags.map((tag: string) => (
                        <span key={tag} className="text-[10px] bg-paper border border-line text-ink-soft px-2.5 py-0.5 rounded-lg font-mono">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-line flex items-center justify-between">
                  {isSubmitted ? (
                    <span className="text-xs font-bold text-forest flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-forest" />
                      <span>Solution Submitted</span>
                    </span>
                  ) : hasDraft ? (
                    <span className="text-xs font-bold text-gold-dark flex items-center gap-1">
                      <Clock className="w-4 h-4 text-gold" />
                      <span>Draft in Progress</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-ink-muted">
                      Earn +100 XP on submission
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
                    className="px-4 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <span>{hasDraft ? "Edit Solution" : isSubmitted ? "View My Submission" : "Solve Problem"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Work on Problem Modal */}
        {selectedProblem && (
          <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-paper-raised rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-line max-h-[90vh] overflow-y-auto">
              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-forest bg-forest/10 border border-forest/20 px-3 py-1 rounded-full">
                  Problem Solution Workspace
                </span>
                <h2 className="text-2xl font-bold font-display text-ink tracking-tight mt-2">
                  {selectedProblem.title}
                </h2>
                <p className="text-xs text-ink-soft leading-relaxed">{selectedProblem.description}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-ink mb-1">
                    Solution Title
                  </label>
                  <input
                    type="text"
                    value={solutionTitle}
                    onChange={(e) => setSolutionTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-line bg-paper text-ink text-xs font-bold focus:outline-none focus:border-forest shadow-sm"
                    placeholder="e.g. Distributed Pantry Routing Algorithm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink mb-1">
                    Proposal &amp; Implementation Description
                  </label>
                  <textarea
                    rows={4}
                    value={solutionDescription}
                    onChange={(e) => setSolutionDescription(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-line bg-paper text-ink text-xs focus:outline-none focus:border-forest shadow-sm"
                    placeholder="Explain your approach, architecture decisions, and real-world impact..."
                  />
                </div>

                {!isMinor && projects.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold text-ink mb-1 flex items-center gap-1.5">
                      <FolderGit2 className="w-3.5 h-3.5 text-forest" />
                      <span>Link Project Studio Project (Optional)</span>
                    </label>
                    <select
                      value={linkedProjectId}
                      onChange={(e) => setLinkedProjectId(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-line text-xs font-bold focus:outline-none focus:border-forest bg-paper text-ink shadow-sm"
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

                <div>
                  <label className="block text-xs font-bold text-ink mb-1">
                    Visibility &amp; Sharing
                  </label>
                  <select
                    value={visibility}
                    onChange={(e: any) => setVisibility(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-line text-xs font-bold focus:outline-none focus:border-forest bg-paper text-ink shadow-sm"
                  >
                    <option value="private">Private (Only you &amp; mentors/admins)</option>
                    <option value="classroom">Classroom (Moderated before peers can view)</option>
                    {!isMinor && <option value="public">Public Showcase</option>}
                  </select>
                  {visibility === "classroom" && (
                    <p className="text-[11px] text-gold-dark mt-1 flex items-center gap-1 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5 text-gold" />
                      <span>Solution visibility requires platform moderation review.</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-line">
                <button
                  type="button"
                  onClick={() => setSelectedProblem(null)}
                  className="px-4 py-2.5 rounded-xl border border-line bg-paper text-xs font-bold text-ink hover:bg-paper-soft cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmitSolution("in_progress")}
                  disabled={submitting || !solutionTitle.trim()}
                  className="px-4 py-2.5 rounded-xl bg-paper-soft hover:bg-paper border border-line text-ink text-xs font-bold transition-all cursor-pointer"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmitSolution("submitted")}
                  disabled={submitting || !solutionTitle.trim()}
                  className="px-5 py-2.5 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
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
