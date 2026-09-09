"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { 
  GraduationCap, 
  Plus, 
  Users, 
  BookOpen, 
  Copy, 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  Lock, 
  Eye, 
  Sparkles,
  AlertCircle,
  Loader2
} from "lucide-react";
import Button from "@/components/ui/Button";

export default function TeacherHubPage() {
  const { user, isMinor, isTeacher, isAdmin } = useAuth();
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSubject, setNewSubject] = useState("Computer Science");
  const [newClassName, setNewClassName] = useState("Class 10-A");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdSuccess, setCreatedSuccess] = useState<any | null>(null);
  const [isEducatorMode, setIsEducatorMode] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const activeTeacher = isTeacher || isAdmin || localStorage.getItem(`edworld_role_teacher_${user?.uid}`) === "true";
      setIsEducatorMode(Boolean(activeTeacher));
    }
  }, [user, isTeacher, isAdmin]);

  useEffect(() => {
    async function loadTeacherData() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch from API or Supabase
        const res = await fetch(`/api/school/classrooms?teacherId=${encodeURIComponent(user.uid)}`);
        const result = await res.json();
        
        let loaded = result?.classrooms || [];

        // Check local storage cached classrooms
        if (typeof window !== "undefined") {
          const cached = localStorage.getItem(`edworld_classrooms_${user.uid}`);
          if (cached) {
            const parsedCached: any[] = JSON.parse(cached);
            const merged = [...loaded];
            for (const c of parsedCached) {
              if (!merged.find(m => m.id === c.id || m.join_code === c.join_code)) {
                merged.push(c);
              }
            }
            loaded = merged;
          }
        }

        setClassrooms(loaded);
      } catch (err) {
        console.warn("Classrooms load note:", err);
      } finally {
        setLoading(false);
      }
    }

    loadTeacherData();
  }, [user]);

  const handleActivateEducator = () => {
    if (!user) return;
    localStorage.setItem(`edworld_role_teacher_${user.uid}`, "true");
    setIsEducatorMode(true);
  };

  if (user && isMinor && !isEducatorMode) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-paper py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center text-ink">
        <div className="max-w-md w-full bg-paper-raised rounded-3xl p-8 border border-line shadow-sm text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-forest/10 text-forest flex items-center justify-center mx-auto border border-forest/20">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-forest/10 text-forest border border-forest/20">
              Student Privacy Protection
            </span>
            <h2 className="text-xl font-bold font-display text-ink">Educator Workspace Restricted</h2>
            <p className="text-xs text-ink-soft leading-relaxed">
              Teacher administration and classroom management tools are restricted to verified faculty and school educators. As a student learner, your assigned quests, discovery modules, and skill benchmarks are available in your personal dashboard.
            </p>
          </div>
          <div className="space-y-2 pt-2">
            <Link
              href="/dashboard"
              className="w-full py-3 rounded-2xl bg-forest hover:bg-forest-light text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <span>Return to My Student Hub</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/school/join-classroom"
              className="w-full py-3 rounded-2xl bg-paper-soft hover:bg-paper text-ink text-xs font-bold flex items-center justify-center gap-2 transition-all border border-line"
            >
              <BookOpen className="w-4 h-4 text-forest" />
              <span>Join a School Classroom with Code</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleCreateClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newClassName.trim() || !newSubject.trim()) return;

    setCreating(true);
    setErrorMessage(null);

    const joinCode = `EDW-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    try {
      const res = await fetch("/api/school/classrooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: user.uid,
          name: newClassName.trim(),
          subject: newSubject.trim(),
          joinCode
        })
      });

      const json = await res.json();

      if (!res.ok || !json.classroom) {
        throw new Error(json.error || "Failed to create classroom.");
      }

      const created = json.classroom;
      const updatedClassrooms = [created, ...classrooms];
      setClassrooms(updatedClassrooms);

      // Persist in local storage
      if (typeof window !== "undefined") {
        localStorage.setItem(`edworld_classrooms_${user.uid}`, JSON.stringify(updatedClassrooms));
      }

      setCreatedSuccess(created);
      setShowCreateModal(false);
      setNewClassName("");
    } catch (err: any) {
      console.error("Create classroom error:", err);
      setErrorMessage(err.message || "Could not create classroom. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-paper py-8 px-4 sm:px-6 lg:px-8 text-ink">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-forest/10 text-forest border border-forest/20 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Educator Workspace</span>
              </span>
              <span className="text-xs text-ink-muted">&bull; Narrow Privacy View</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold font-display text-ink mt-1">Teacher Dashboard &amp; Classrooms</h1>
            <p className="text-xs sm:text-sm text-ink-soft max-w-xl">
              Manage student cohorts, assign curiosity quests &amp; AI literacy modules, and view subject-scoped skill mastery.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5 self-start sm:self-auto">
            <Link
              href="/school/teacher"
              className="px-4 py-2.5 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span>School Teacher Studio (5E Plans &amp; Rubrics)</span>
            </Link>
            <Link
              href="/colleges"
              className="px-4 py-2.5 rounded-xl bg-paper-soft hover:bg-paper text-ink text-xs font-bold flex items-center gap-2 transition-all border border-line"
            >
              <GraduationCap className="w-4 h-4 text-purple-600" />
              <span>Colleges &amp; TPO Hub</span>
            </Link>
            <button
              onClick={() => {
                setErrorMessage(null);
                setShowCreateModal(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-ink hover:bg-black text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-accent" />
              <span>Create Classroom</span>
            </button>
          </div>
        </div>

        {/* Success Banner if Classroom Just Created */}
        {createdSuccess && (
          <div className="p-4 rounded-2xl bg-forest/10 border border-forest/20 shadow-sm flex items-center justify-between gap-4 text-xs text-forest animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-forest shrink-0" />
              <div>
                <span className="font-bold text-ink">Classroom &quot;{createdSuccess.name}&quot; created successfully!</span>
                <p className="text-ink-soft mt-0.5">Share Join Code: <strong className="font-mono text-ink">{createdSuccess.join_code}</strong> with your students.</p>
              </div>
            </div>
            <button
              onClick={() => setCreatedSuccess(null)}
              className="text-xs font-bold text-forest hover:text-forest-dark px-2 py-1 rounded-lg hover:bg-forest/10"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Privacy Transparency Banner */}
        <div className="p-4 rounded-2xl bg-paper-raised border border-line shadow-sm flex items-start gap-3 text-xs text-ink-soft">
          <ShieldCheck className="w-5 h-5 text-forest shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-ink">Deliberately Narrow Privacy Architecture:</span>
            <p className="leading-relaxed">
              In accordance with Edworld Co minor protection standards, teachers are granted access to a purpose-built view exposing only enrolled student names and subject-specific activity completion counts. Full student profiles, private messages, resume text, interview recordings, and reflective journals remain strictly private.
            </p>
          </div>
        </div>

        {/* Classrooms Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-44 bg-paper-soft animate-pulse rounded-3xl border border-line" />
            ))}
          </div>
        ) : classrooms.length === 0 ? (
          <div className="bg-paper-raised rounded-3xl p-12 border border-line text-center space-y-4 max-w-md mx-auto shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-forest/10 text-forest flex items-center justify-center mx-auto">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold font-display text-ink">No Classrooms Yet</h3>
              <p className="text-xs text-ink-soft">Create your first class to generate a join code for your students.</p>
            </div>
            <button
              onClick={() => {
                setErrorMessage(null);
                setShowCreateModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-forest text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer hover:bg-forest-light transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Classroom</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classrooms.map(c => (
              <div key={c.id} className="bg-paper-raised rounded-3xl p-6 border border-line shadow-sm flex flex-col justify-between space-y-6 hover:shadow-md hover:border-forest/30 transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-paper-soft text-ink-soft border border-line">
                      {c.subject}
                    </span>
                    <span className="text-[11px] font-mono text-ink-muted">
                      {c.classroom_students?.[0]?.count || 0} Students
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold font-display text-ink">{c.name}</h3>
                    <p className="text-xs text-ink-soft">Subject: {c.subject}</p>
                  </div>

                  {/* Join Code Box */}
                  <div className="p-3 rounded-2xl bg-paper-soft border border-line flex items-center justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-ink-muted tracking-wider">Student Join Code</span>
                      <div className="font-mono font-bold text-sm text-ink">{c.join_code}</div>
                    </div>
                    <button
                      onClick={() => handleCopyCode(c.join_code)}
                      className="p-2 rounded-xl hover:bg-paper-raised text-ink-soft hover:text-ink transition-all cursor-pointer"
                      title="Copy Join Code"
                    >
                      {copiedCode === c.join_code ? (
                        <Check className="w-4 h-4 text-forest" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-line">
                  <Link
                    href={`/teacher/classrooms/${c.id}`}
                    className="w-full py-2.5 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <span>View Subject Roster</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Classroom Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-paper-raised rounded-3xl p-6 sm:p-8 max-w-md w-full border border-line shadow-2xl space-y-6 animate-in zoom-in-95 text-ink">
              <div className="space-y-1">
                <h2 className="text-lg font-bold font-display text-ink">Create New Classroom</h2>
                <p className="text-xs text-ink-soft">Set up a subject cohort to track skills progress.</p>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleCreateClassroom} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-ink uppercase">Class Name</label>
                  <input
                    type="text"
                    required
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    placeholder="e.g. Class 10-A or Section B"
                    className="w-full p-3 rounded-xl border border-line bg-paper text-xs text-ink focus:outline-none focus:ring-2 focus:ring-forest"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-ink uppercase">Subject Domain</label>
                  <input
                    type="text"
                    required
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="e.g. Computer Science, AI Literacy, Science"
                    className="w-full p-3 rounded-xl border border-line bg-paper text-xs text-ink focus:outline-none focus:ring-2 focus:ring-forest"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    disabled={creating}
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-ink-soft hover:bg-paper-soft cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-4 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
                  >
                    {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{creating ? "Creating..." : "Create Class"}</span>
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
