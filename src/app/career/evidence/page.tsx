"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { CareerEvidenceItem, CareerEvidenceType } from "@/lib/types";
import { 
  FolderGit2, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Lock, 
  Globe, 
  FileText, 
  Sparkles,
  ArrowLeft,
  Award,
  CheckCircle2,
  Calendar,
  Layers,
  AlertCircle
} from "lucide-react";

export const dynamic = "force-dynamic";

const EVIDENCE_TYPES: { type: CareerEvidenceType; label: string }[] = [
  { type: "project", label: "Project" },
  { type: "certification", label: "Certification" },
  { type: "award", label: "Award" },
  { type: "hackathon", label: "Hackathon" },
  { type: "publication", label: "Publication" },
  { type: "internship", label: "Internship" },
  { type: "work_achievement", label: "Work Achievement" },
  { type: "leadership", label: "Leadership" },
  { type: "open_source", label: "Open Source" },
  { type: "competition", label: "Competition" }
];

export default function CareerEvidencePage() {
  const { user } = useAuth();
  const isAdult = user?.ageBand === "18+";

  const [evidenceList, setEvidenceList] = useState<CareerEvidenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [type, setType] = useState<CareerEvidenceType>("project");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [visibility, setVisibility] = useState<"private" | "portfolio" | "resume">("private");
  const [submitting, setSubmitting] = useState(false);

  const fetchEvidence = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/career/evidence?userId=${user.uid}`);
      const data = await res.json();
      if (data.evidence) {
        setEvidenceList(data.evidence);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAdult) {
      fetchEvidence();
    }
  }, [user, isAdult]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim()) return;

    setSubmitting(true);
    try {
      const skills = skillsInput.split(",").map(s => s.trim()).filter(Boolean);
      const res = await fetch("/api/career/evidence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          type,
          title: title.trim(),
          description: description.trim(),
          date,
          evidence_url: evidenceUrl.trim(),
          skills,
          visibility
        })
      });

      if (res.ok) {
        setTitle("");
        setDescription("");
        setEvidenceUrl("");
        setSkillsInput("");
        setVisibility("private");
        setIsModalOpen(false);
        fetchEvidence();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user || !confirm("Are you sure you want to delete this evidence record?")) return;
    try {
      const res = await fetch(`/api/career/evidence?id=${id}&userId=${user.uid}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setEvidenceList(prev => prev.filter(e => e.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isAdult && user) {
    return (
      <div className="min-h-screen bg-[#F4F6FB] flex items-center justify-center p-6">
        <div className="card-quixel max-w-md p-8 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-[#FF7A50] mx-auto" />
          <h2 className="text-xl font-black text-[#181920]">Career Track Feature</h2>
          <p className="text-sm text-[#767E94]">The Career Evidence Vault is exclusively available for Career Track accounts (18+).</p>
          <Link href="/dashboard" className="btn-quixel-primary inline-block">Return to Dashboard</Link>
        </div>
      </div>
    );
  }

  const filtered = filterType === "all" 
    ? evidenceList 
    : evidenceList.filter(e => e.type === filterType);

  return (
    <div className="min-h-screen bg-[#F4F6FB] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link href="/dashboard" className="inline-flex items-center text-xs font-bold text-[#5C38FF] hover:underline mb-1">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Dashboard
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#EDE8FD] text-[#5C38FF] flex items-center justify-center font-bold">
                <FolderGit2 className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-[#181920]">Career Evidence Vault</h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link href="/career/readiness" className="px-3.5 py-2 rounded-2xl bg-white border border-[#E8ECF2] hover:bg-[#EDE8FD] text-xs font-bold text-[#181920] transition-colors">
              Readiness View
            </Link>
            <Link href="/career/applications" className="px-3.5 py-2 rounded-2xl bg-white border border-[#E8ECF2] hover:bg-[#EDE8FD] text-xs font-bold text-[#181920] transition-colors">
              Applications
            </Link>
            <Link href="/career/copilot" className="px-3.5 py-2 rounded-2xl bg-white border border-[#E8ECF2] hover:bg-[#EDE8FD] text-xs font-bold text-[#181920] transition-colors">
              Copilot
            </Link>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-2xl bg-[#5C38FF] hover:bg-[#4D2CE0] text-white text-xs font-black shadow-lg flex items-center gap-2 transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>Add Evidence</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === "all"
                ? "bg-[#181920] text-white"
                : "bg-white text-[#767E94] hover:bg-slate-100 border border-[#E8ECF2]"
            }`}
          >
            All Types ({evidenceList.length})
          </button>
          {EVIDENCE_TYPES.map(t => {
            const count = evidenceList.filter(e => e.type === t.type).length;
            return (
              <button
                key={t.type}
                onClick={() => setFilterType(t.type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  filterType === t.type
                    ? "bg-[#5C38FF] text-white"
                    : "bg-white text-[#767E94] hover:bg-slate-100 border border-[#E8ECF2]"
                }`}
              >
                {t.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Evidence List */}
        {loading ? (
          <div className="text-center py-16 text-xs text-[#767E94]">Loading evidence vault...</div>
        ) : filtered.length === 0 ? (
          <div className="card-quixel p-12 text-center space-y-4">
            <FolderGit2 className="w-12 h-12 text-[#8E95A5] mx-auto opacity-50" />
            <h3 className="text-base font-black text-[#181920]">No Evidence Recorded Yet</h3>
            <p className="text-xs text-[#767E94] max-w-sm mx-auto">
              Add your verified projects, certifications, hackathon awards, or publications to power your ATS resumes and portfolio.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#5C38FF] text-white text-xs font-bold shadow hover:bg-[#4D2CE0]"
            >
              Add Your First Evidence
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(item => (
              <div key={item.id} className="card-quixel p-5 flex flex-col justify-between space-y-4 hover:border-[#5C38FF]/40 transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-[#EDE8FD] text-[#5C38FF] px-2.5 py-1 rounded-full border border-[#5C38FF]/20">
                      {item.type.replace('_', ' ')}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {item.visibility === "private" ? (
                        <span className="text-[10px] font-bold text-[#767E94] flex items-center gap-1 bg-[#F4F6FB] px-2 py-0.5 rounded-full border border-[#E8ECF2]">
                          <Lock className="w-3 h-3" /> Private
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-[#00C48C] flex items-center gap-1 bg-[#E8F8F0] px-2 py-0.5 rounded-full border border-[#00C48C]/20">
                          <Globe className="w-3 h-3" /> {item.visibility}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-[#181920] line-clamp-1">{item.title}</h3>
                    {item.description && (
                      <p className="text-xs text-[#767E94] mt-1 line-clamp-2">{item.description}</p>
                    )}
                  </div>

                  {item.skills && item.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {item.skills.map((s, idx) => (
                        <span key={idx} className="text-[10px] font-bold text-[#5C38FF] bg-[#EDE8FD]/60 px-2 py-0.5 rounded-md">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-[#E8ECF2] flex items-center justify-between text-xs text-[#767E94]">
                  <span className="font-mono text-[11px]">{item.date || "No date"}</span>
                  <div className="flex items-center gap-2">
                    {item.evidence_url && (
                      <a 
                        href={item.evidence_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-[#5C38FF] hover:underline flex items-center gap-1 font-bold"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal: Add Evidence */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[#E8ECF2] space-y-5 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-[#E8ECF2] pb-3">
                <h2 className="text-lg font-black text-[#181920]">Add Career Evidence</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">&times;</button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#181920] mb-1">Evidence Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as CareerEvidenceType)}
                    className="w-full p-2.5 rounded-xl border border-[#E8ECF2] text-xs font-bold bg-[#F4F6FB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5C38FF]"
                  >
                    {EVIDENCE_TYPES.map(t => (
                      <option key={t.type} value={t.type}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#181920] mb-1">Title / Milestone Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Distributed Cache Engine, AWS Solution Architect"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E8ECF2] text-xs font-bold bg-[#F4F6FB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5C38FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#181920] mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Key impact, architecture details, or context..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E8ECF2] text-xs font-medium bg-[#F4F6FB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5C38FF]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#181920] mb-1">Date</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#E8ECF2] text-xs font-medium bg-[#F4F6FB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5C38FF]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#181920] mb-1">Visibility</label>
                    <select
                      value={visibility}
                      onChange={(e) => setVisibility(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-[#E8ECF2] text-xs font-bold bg-[#F4F6FB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5C38FF]"
                    >
                      <option value="private">Private (Vault Only)</option>
                      <option value="portfolio">Public Portfolio</option>
                      <option value="resume">Resume Builder Only</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#181920] mb-1">Skills (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Go, Redis, System Design, Concurrency"
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E8ECF2] text-xs font-medium bg-[#F4F6FB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5C38FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#181920] mb-1">Evidence URL / GitHub / Verification Link</label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={evidenceUrl}
                    onChange={(e) => setEvidenceUrl(e.target.value)}
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
                    {submitting ? "Saving..." : "Save Evidence"}
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
