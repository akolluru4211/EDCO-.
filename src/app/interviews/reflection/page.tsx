"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { InterviewReflectionItem } from "@/lib/types";
import { 
  FileText, 
  ArrowLeft, 
  Sparkles, 
  Plus, 
  Calendar, 
  Building2, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";

export const dynamic = "force-dynamic";

export default function InterviewReflectionPage() {
  const { user } = useAuth();
  const isAdult = user?.ageBand === "18+";

  const [reflections, setReflections] = useState<InterviewReflectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [interviewDate, setInterviewDate] = useState(new Date().toISOString().split("T")[0]);
  const [wentWell, setWentWell] = useState("");
  const [difficultAspects, setDifficultAspects] = useState("");
  const [difficultQuestions, setDifficultQuestions] = useState("");
  const [improvementAreas, setImprovementAreas] = useState("");
  const [personalNotes, setPersonalNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchReflections = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/interviews/reflections?userId=${user.uid}`);
      const data = await res.json();
      if (data.reflections) {
        setReflections(data.reflections);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAdult) {
      fetchReflections();
    }
  }, [user, isAdult]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !company || !role) return;

    setSubmitting(true);
    try {
      const qList = difficultQuestions.split("\n").map(q => q.trim()).filter(Boolean);
      const res = await fetch("/api/interviews/reflections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          company: company.trim(),
          role: role.trim(),
          interview_date: interviewDate,
          went_well: wentWell.trim(),
          difficult_aspects: difficultAspects.trim(),
          difficult_questions: qList,
          improvement_areas: improvementAreas.trim(),
          personal_notes: personalNotes.trim()
        })
      });

      if (res.ok) {
        setCompany("");
        setRole("");
        setWentWell("");
        setDifficultAspects("");
        setDifficultQuestions("");
        setImprovementAreas("");
        setPersonalNotes("");
        setIsModalOpen(false);
        fetchReflections();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAdult && user) {
    return (
      <div className="min-h-screen bg-[#F4F6FB] flex items-center justify-center p-6">
        <div className="card-quixel max-w-md p-8 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-[#FF7A50] mx-auto" />
          <h2 className="text-xl font-black text-[#181920]">Career Track Feature</h2>
          <p className="text-sm text-[#767E94]">Interview Reflection is exclusively available for Career Track accounts (18+).</p>
          <Link href="/dashboard" className="btn-quixel-primary inline-block">Return to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6FB] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link href="/dashboard" className="inline-flex items-center text-xs font-bold text-[#5C38FF] hover:underline mb-1">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Dashboard
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#EDE8FD] text-[#5C38FF] flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-[#181920]">Post-Interview Reflection</h1>
                <p className="text-xs text-[#767E94]">Log your debriefs, difficult questions, and AI-assisted insights to systematically improve for future rounds.</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-2xl bg-[#5C38FF] hover:bg-[#4D2CE0] text-white text-xs font-black shadow-lg flex items-center gap-2 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>New Reflection</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 text-xs text-[#767E94]">Loading reflections...</div>
        ) : reflections.length === 0 ? (
          <div className="card-quixel p-12 text-center space-y-4">
            <FileText className="w-12 h-12 text-[#8E95A5] mx-auto opacity-50" />
            <h3 className="text-base font-black text-[#181920]">No Reflections Recorded</h3>
            <p className="text-xs text-[#767E94] max-w-sm mx-auto">
              After an interview, record what went well and what caught you off guard to build continuous interview intelligence.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#5C38FF] text-white text-xs font-bold shadow hover:bg-[#4D2CE0]"
            >
              Record First Reflection
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {reflections.map(r => (
              <div key={r.id} className="card-quixel p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[#E8ECF2] pb-3">
                  <div>
                    <h3 className="text-base font-black text-[#181920]">{r.company} — {r.role}</h3>
                    <span className="text-xs font-mono text-[#767E94]">{r.interview_date}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {r.went_well && (
                    <div className="p-3.5 rounded-2xl bg-[#E8F8F0] border border-[#00C48C]/20 space-y-1">
                      <strong className="text-[#00C48C] font-bold">What Went Well:</strong>
                      <p className="text-[#181920]">{r.went_well}</p>
                    </div>
                  )}
                  {r.difficult_aspects && (
                    <div className="p-3.5 rounded-2xl bg-[#FFEFEA] border border-[#FF7A50]/20 space-y-1">
                      <strong className="text-[#FF7A50] font-bold">Difficult Aspects:</strong>
                      <p className="text-[#181920]">{r.difficult_aspects}</p>
                    </div>
                  )}
                </div>

                {r.difficult_questions && r.difficult_questions.length > 0 && (
                  <div className="space-y-2">
                    <strong className="text-xs font-black text-[#181920]">Challenging Questions Asked:</strong>
                    <ul className="list-disc pl-5 space-y-1 text-xs text-[#767E94]">
                      {r.difficult_questions.map((q, idx) => (
                        <li key={idx}>{q}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {r.ai_summary && (
                  <div className="p-4 rounded-2xl bg-[#EDE8FD]/60 border border-[#5C38FF]/20 text-xs space-y-1">
                    <strong className="text-[#5C38FF] font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Factual AI Reflection Summary:
                    </strong>
                    <pre className="font-sans whitespace-pre-wrap text-[#181920]">{r.ai_summary}</pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[#E8ECF2] space-y-5 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-[#E8ECF2] pb-3">
                <h2 className="text-lg font-black text-[#181920]">Record Interview Reflection</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">&times;</button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#181920] mb-1">Company *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Stripe"
                      value={company}
                      onChange={e => setCompany(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#E8ECF2] text-xs font-bold bg-[#F4F6FB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5C38FF]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#181920] mb-1">Role *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Backend Engineer"
                      value={role}
                      onChange={e => setRole(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#E8ECF2] text-xs font-bold bg-[#F4F6FB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5C38FF]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#181920] mb-1">What went well?</label>
                  <textarea
                    rows={2}
                    placeholder="Clear system design explanation, good STAR behavioral answers..."
                    value={wentWell}
                    onChange={e => setWentWell(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E8ECF2] text-xs font-medium bg-[#F4F6FB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5C38FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#181920] mb-1">What was difficult?</label>
                  <textarea
                    rows={2}
                    placeholder="Deep SQL optimization question, pacing on live coding..."
                    value={difficultAspects}
                    onChange={e => setDifficultAspects(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E8ECF2] text-xs font-medium bg-[#F4F6FB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5C38FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#181920] mb-1">Difficult Questions (one per line)</label>
                  <textarea
                    rows={2}
                    placeholder="How do you handle split-brain in Raft consensus?&#10;Describe a time you disagreed with a PM."
                    value={difficultQuestions}
                    onChange={e => setDifficultQuestions(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E8ECF2] text-xs font-medium bg-[#F4F6FB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5C38FF]"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#E8ECF2]">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#767E94] hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-[#5C38FF] hover:bg-[#4D2CE0] text-white text-xs font-black shadow"
                  >
                    {submitting ? "Saving..." : "Save Reflection"}
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
