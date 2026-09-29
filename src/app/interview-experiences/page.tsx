"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { 
  Building2, 
  Briefcase, 
  Search, 
  Plus, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  Lock, 
  Filter, 
  Sparkles, 
  ArrowRight, 
  HelpCircle,
  X
} from "lucide-react";

export default function InterviewExperiencesPage() {
  const { user } = useAuth();
  const [experiences, setExperiences] = useState<any[]>([]);
  const [searchCompany, setSearchCompany] = useState("");
  const [searchRole, setSearchRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [formCompany, setFormCompany] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formDifficulty, setFormDifficulty] = useState(3);
  const [formIsAnon, setFormIsAnon] = useState(true);
  const [formRounds, setFormRounds] = useState<Array<{ roundName: string; format: string; questions: string }>>([
    { roundName: "Round 1: Technical Screening", format: "Live Coding / DSA", questions: "" }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState<string | null>(null);

  const fetchExperiences = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (searchCompany) query.append("company", searchCompany);
      if (searchRole) query.append("role", searchRole);

      const res = await fetch("/api/interviews/experiences?" + query.toString(), {
        headers: user ? { "x-user-id": user.uid } : {}
      });
      const data = await res.json();
      if (data.success) {
        setExperiences(data.experiences);
      }
    } catch (err) {
      console.error("Failed to load interview experiences:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, [searchCompany, searchRole, user]);

  const handleAddRound = () => {
    setFormRounds((prev) => [
      ...prev,
      { roundName: "Round " + (prev.length + 1) + ": Technical / Managerial", format: "System Design / Behavioral", questions: "" }
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCompany.trim() || !formRole.trim() || !formNotes.trim()) return;

    setIsSubmitting(true);
    try {
      const mappedRounds = formRounds.map((r) => ({
        roundName: r.roundName,
        format: r.format,
        questionsAsked: r.questions.split("\n").map((q) => q.trim()).filter(Boolean),
      }));

      const res = await fetch("/api/interviews/experiences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.uid || null,
          company: formCompany,
          role: formRole,
          rounds: mappedRounds,
          overallNotes: formNotes,
          difficultyRating: formDifficulty,
          isAnonymous: formIsAnon,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmitSuccessMsg("Submitted for review! Your experience will appear once approved by our moderation team.");
        setFormCompany("");
        setFormRole("");
        setFormNotes("");
        fetchExperiences();
        setTimeout(() => {
          setShowSubmitModal(false);
          setSubmitSuccessMsg(null);
        }, 3000);
      }
    } catch (err) {
      console.error("Submission failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E0F15] text-slate-100 p-4 sm:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl bg-[#151621] border border-white/10 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-lg">
              <Building2 className="w-6 h-6 text-[#D7FC51]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-white">EdArchives</h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                  Moderated UGC
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-4 py-2 rounded-xl bg-[#D7FC51] text-slate-950 font-black text-xs flex items-center gap-1.5 hover:bg-[#cbf13f] transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Share Your Experience</span>
            </button>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#151621] border border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by company (e.g. Google, Amazon, Swiggy)..."
              value={searchCompany}
              onChange={(e) => setSearchCompany(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#D7FC51]"
            />
          </div>
          <div className="relative">
            <Briefcase className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by role (e.g. SDE-1, Full Stack, Product Manager)..."
              value={searchRole}
              onChange={(e) => setSearchRole(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#D7FC51]"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
            <Clock className="w-6 h-6 animate-spin text-[#D7FC51]" />
            <span>Loading verified interview debriefs...</span>
          </div>
        ) : experiences.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-[#151621] border border-white/10 space-y-3">
            <Building2 className="w-8 h-8 text-slate-500 mx-auto" />
            <h3 className="text-sm font-bold text-white">No interview experiences found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Be the first to share your recent interview breakdown with the community.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {experiences.map((exp) => {
              const isExpanded = expandedId === exp.id;
              return (
                <div
                  key={exp.id}
                  className="p-5 sm:p-6 rounded-3xl bg-[#151621] border border-white/10 shadow-lg space-y-4 transition-all"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
                        {exp.company.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-sm sm:text-base text-white">{exp.company}</h3>
                          <span className="text-xs text-slate-400">&bull; {exp.role}</span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">
                          {exp.authorLabel} &bull; {new Date(exp.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {exp.isAuthor && exp.moderationStatus === "pending" && (
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Pending Review
                        </span>
                      )}
                      <Link
                        href={"/companies/" + encodeURIComponent(exp.company)}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[11px] font-bold text-indigo-300 transition-colors"
                      >
                        Company Insights &rarr;
                      </Link>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : exp.id)}
                        className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{exp.overallNotes}</p>

                  {isExpanded && exp.rounds && exp.rounds.length > 0 && (
                    <div className="pt-3 border-t border-white/5 space-y-3 animate-in fade-in">
                      <h4 className="text-xs font-mono font-bold text-[#D7FC51] uppercase tracking-wider">
                        Interview Rounds Breakdown ({exp.rounds.length} Rounds)
                      </h4>

                      <div className="grid grid-cols-1 gap-2.5">
                        {exp.rounds.map((rnd: any, rIdx: number) => (
                          <div key={rIdx} className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/5 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-white">{rnd.roundName}</span>
                              <span className="px-2 py-0.5 rounded-md bg-white/10 text-slate-300 text-[10px] font-mono">
                                {rnd.format}
                              </span>
                            </div>
                            {rnd.questionsAsked && rnd.questionsAsked.length > 0 && (
                              <ul className="list-disc list-inside text-xs text-slate-400 space-y-1">
                                {rnd.questionsAsked.map((q: string, qIdx: number) => (
                                  <li key={qIdx}>{q}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {showSubmitModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-[#151621] border border-white/10 shadow-2xl rounded-3xl max-w-xl w-full p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h3 className="font-bold text-base text-white">Share Interview Experience</h3>
                  <p className="text-xs text-slate-400">All submissions are moderated before becoming public.</p>
                </div>
                <button onClick={() => setShowSubmitModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {submitSuccessMsg && (
                <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{submitSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Company *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Google"
                      value={formCompany}
                      onChange={(e) => setFormCompany(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Target Role *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Software Engineer (L3)"
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Overall Experience &amp; Advice *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe how the process felt, prep advice, and timeline..."
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300">Rounds Breakdown</label>
                    <button
                      type="button"
                      onClick={handleAddRound}
                      className="text-[11px] font-bold text-[#D7FC51] hover:underline"
                    >
                      + Add Another Round
                    </button>
                  </div>

                  {formRounds.map((rnd, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-slate-900/60 border border-white/5 space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={rnd.roundName}
                          onChange={(e) => {
                            const updated = [...formRounds];
                            updated[idx].roundName = e.target.value;
                            setFormRounds(updated);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-white/10 text-xs text-white"
                        />
                        <input
                          type="text"
                          value={rnd.format}
                          onChange={(e) => {
                            const updated = [...formRounds];
                            updated[idx].format = e.target.value;
                            setFormRounds(updated);
                          }}
                          placeholder="Format (e.g. DSA, System Design)"
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-white/10 text-xs text-white"
                        />
                      </div>
                      <textarea
                        rows={2}
                        value={rnd.questions}
                        onChange={(e) => {
                          const updated = [...formRounds];
                          updated[idx].questions = e.target.value;
                          setFormRounds(updated);
                        }}
                        placeholder="Questions or topics covered (1 per line, avoid NDA secrets)..."
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-white/10 text-xs text-white"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsAnon}
                      onChange={(e) => setFormIsAnon(e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-900 border-white/10 text-[#D7FC51]"
                    />
                    <span>Post Anonymously (Hides your name from others)</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowSubmitModal(false)}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2 rounded-xl bg-[#D7FC51] text-slate-950 text-xs font-black hover:bg-[#cbf13f]"
                    >
                      {isSubmitting ? "Submitting..." : "Submit for Moderation"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
