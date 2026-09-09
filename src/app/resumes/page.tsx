"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Resume, ResumeTemplateId } from "@/lib/types";
import { DEFAULT_RESUME_CONTENT } from "@/lib/mock-data";
import { supabase } from "@/lib/supabase";
import { 
  FileText, 
  Plus, 
  Copy, 
  Trash2, 
  ExternalLink, 
  Sparkles, 
  Clock, 
  Layout, 
  CheckCircle2,
  Lock,
  ArrowRight,
  Compass,
  AlertCircle
} from "lucide-react";
import EdworldLogo from "@/components/ui/EdworldLogo";

export const dynamic = "force-dynamic";

export default function ResumesListPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Junior Track Gating (13-15 years)
  const isJuniorTrack = user?.ageBand === "13-15";

  useEffect(() => {
    if (!user || isJuniorTrack) {
      setResumes([]);
      return;
    }

    const loadUserResumes = async () => {
      // 1. Fetch from Supabase
      try {
        const { data, error } = await supabase
          .from("resumes")
          .select("*")
          .eq("user_id", user.uid);

        if (data && data.length > 0) {
          const list: Resume[] = data.map((d) => ({
            id: d.id,
            userId: d.user_id,
            title: d.title,
            templateId: "classic",
            content: d.content || DEFAULT_RESUME_CONTENT,
            createdAt: d.created_at,
            updatedAt: d.updated_at,
          }));
          setResumes(list);
          localStorage.setItem(`edworld_${user.uid}_resumes`, JSON.stringify(list));
          return;
        }
      } catch (err) {
        console.warn("[Supabase Resumes Load Note]", err);
      }

      // 2. Check user-scoped local cache
      const cached = localStorage.getItem(`edworld_${user.uid}_resumes`);
      if (cached) {
        try {
          setResumes(JSON.parse(cached));
          return;
        } catch (e) {}
      }

      // 3. If no resumes exist, initialize one for this user
      const initialSkills = profile?.interests?.map((i) => i.name) || ["TypeScript", "React", "Node.js", "REST APIs"];
      const defaultResume: Resume = {
        id: `resume-${user.uid}-default`,
        userId: user.uid,
        title: "Primary ATS Master Resume",
        templateId: "classic",
        content: {
          ...DEFAULT_RESUME_CONTENT,
          contact: {
            ...DEFAULT_RESUME_CONTENT.contact,
            fullName: user.name || "Candidate Name",
            email: user.email || "candidate@example.com",
          },
          skills: {
            ...DEFAULT_RESUME_CONTENT.skills,
            technical: initialSkills,
          },
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setResumes([defaultResume]);
      localStorage.setItem(`edworld_${user.uid}_resumes`, JSON.stringify([defaultResume]));
    };

    loadUserResumes();
  }, [user, profile, isJuniorTrack]);

  const saveResumes = async (newList: Resume[]) => {
    if (!user) return;
    setResumes(newList);
    localStorage.setItem(`edworld_${user.uid}_resumes`, JSON.stringify(newList));
  };

  const handleCreateNew = async () => {
    if (!user) return;
    const interestSkills = profile?.interests?.map((i) => i.name) || ["Python", "SQL", "Git"];
    const newResume: Resume = {
      id: `resume-${user.uid}-${Date.now()}`,
      userId: user.uid,
      title: `Resume Version #${resumes.length + 1}`,
      templateId: "classic",
      content: {
        ...DEFAULT_RESUME_CONTENT,
        contact: {
          ...DEFAULT_RESUME_CONTENT.contact,
          fullName: user.name || "",
          email: user.email || "",
        },
        skills: {
          ...DEFAULT_RESUME_CONTENT.skills,
          technical: interestSkills,
        },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await supabase
        .from("resumes")
        .insert({
          user_id: user.uid,
          title: newResume.title,
          content: newResume.content,
          created_at: newResume.createdAt,
          updated_at: newResume.updatedAt,
        });
    } catch (e) {
      console.warn("Supabase resume insert note:", e);
    }

    const updated = [newResume, ...resumes];
    await saveResumes(updated);
    router.push(`/resumes/${newResume.id}?isNew=true`);
  };

  const handleDuplicate = async (resumeToDup: Resume) => {
    if (!user) return;
    const duplicated: Resume = {
      ...resumeToDup,
      id: `resume-${user.uid}-${Date.now()}`,
      userId: user.uid,
      title: `${resumeToDup.title} (Copy)`,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    try {
      await supabase
        .from("resumes")
        .insert({
          user_id: user.uid,
          title: duplicated.title,
          content: duplicated.content,
          created_at: duplicated.createdAt,
          updated_at: duplicated.updatedAt,
        });
    } catch (e) {
      console.warn("Supabase resume duplicate note:", e);
    }

    const updated = [duplicated, ...resumes];
    await saveResumes(updated);
  };

  const confirmDelete = async () => {
    if (!user || !deleteTargetId) return;
    if (resumes.length === 1) {
      alert("You must keep at least one active resume draft.");
      setDeleteTargetId(null);
      return;
    }

    try {
      await supabase
        .from("resumes")
        .delete()
        .eq("id", deleteTargetId);
    } catch (e) {
      console.warn("Supabase resume delete note:", e);
    }

    const updated = resumes.filter((r) => r.id !== deleteTargetId);
    await saveResumes(updated);
    setDeleteTargetId(null);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-paper">
        <div className="text-center space-y-3 font-mono text-xs text-ink-soft">
          <div className="w-6 h-6 border-2 border-forest border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Loading your verified resumes...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-paper">
        <div className="max-w-md w-full bg-paper-raised rounded-3xl border border-line shadow-xl p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-paper border border-line text-forest flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold font-display text-ink tracking-tight">Sign In Required</h1>
            <p className="text-sm text-ink-soft leading-relaxed">
              Please sign in to access and manage your personalized ATS resumes.
            </p>
          </div>
          <Link
            href="/auth/login"
            className="w-full py-3.5 px-4 rounded-xl bg-forest hover:bg-forest-light active:bg-forest-dark text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <span>Sign In to Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  // If user is in Junior Track (13-15), render Junior Guidance Gate
  if (isJuniorTrack) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-paper">
        <div className="max-w-md w-full bg-paper-raised rounded-3xl border border-line shadow-xl p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-gold/15 border border-gold/30 text-gold-dark flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-8 h-8 text-gold" />
          </div>
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-gold-light text-gold-dark text-xs font-mono font-bold uppercase tracking-wider border border-gold/30">
              Junior Track (13-15)
            </span>
            <h1 className="text-3xl font-bold font-display text-ink tracking-tight">Resume Maker is for Explorer &amp; Career Tracks</h1>
            <p className="text-sm text-ink-soft leading-relaxed">
              As a Class 9-10 learner, your focus is on curious exploration, building hands-on creative projects, and learning core concepts. Resume building unlocks in the 16-18 Explorer Track.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="w-full py-3.5 px-4 rounded-xl bg-forest hover:bg-forest-light active:bg-forest-dark text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <span>Return to Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#F4F6FB] text-[#181920] pb-16">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8 animate-in fade-in duration-300">
        
        {/* Header */}
        <div className="card-quixel p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E0FAF6] border border-[#00D2B4]/30 text-[#00D2B4] text-[10px] font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ATS Optimization Studio &bull; Single-Column Formats</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#181920] tracking-tight">
              My ATS Resumes
            </h1>
            <p className="text-sm text-[#767E94] mt-1 font-medium">
              Create and tailor job-specific single-column resumes designed to pass Applicant Tracking Systems.
            </p>
          </div>

          <button
            onClick={handleCreateNew}
            className="px-6 py-3.5 rounded-2xl bg-[#13141B] hover:bg-[#252632] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:scale-105 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#D7FC51]" />
            <span>Create New Resume</span>
          </button>
        </div>

        {/* Resumes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume) => {
            const expCount = resume.content?.experience?.length || 0;
            const skillCount =
              (resume.content?.skills?.technical?.length || 0) +
              (resume.content?.skills?.tools?.length || 0);

            return (
              <div
                key={resume.id}
                className="card-quixel card-quixel-interactive p-6 flex flex-col justify-between space-y-5 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-[#EDE8FD] text-[#7B57FF] text-[10px] font-mono font-black uppercase border border-[#7B57FF]/30">
                      {resume.templateId ? resume.templateId.toUpperCase() : "CLASSIC"} ATS
                    </span>
                    <span className="text-[10px] text-[#8E95A5] font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(resume.updatedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-black text-[#181920] text-lg line-clamp-1 group-hover:text-[#7B57FF] transition-colors">
                      {resume.title}
                    </h3>
                    <p className="text-xs text-[#767E94] mt-0.5">
                      {resume.content?.contact?.fullName || "Candidate"} &bull; {resume.content?.contact?.email || ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-[#767E94] pt-2 border-t border-[#F0F2F6] font-mono text-[11px]">
                    <span>{expCount} Experiences</span>
                    <span>&bull;</span>
                    <span>{skillCount} Skills</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#F0F2F6]">
                  <div className="flex items-center gap-1">
                    <button
                      title="Duplicate Resume"
                      onClick={() => handleDuplicate(resume)}
                      className="p-2 rounded-xl text-[#8E95A5] hover:text-[#181920] hover:bg-[#F4F6FB] transition-colors cursor-pointer"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      title="Delete Resume"
                      onClick={() => setDeleteTargetId(resume.id)}
                      className="p-2 rounded-xl text-[#8E95A5] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <Link
                    href={`/resumes/${resume.id}`}
                    className="px-4 py-2 rounded-2xl bg-[#13141B] hover:bg-[#252632] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <span>Open Editor</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#D7FC51]" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteTargetId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#13141B]/60 backdrop-blur-sm animate-in fade-in">
            <div className="max-w-sm w-full bg-white rounded-4xl p-6 sm:p-8 space-y-4 shadow-2xl border border-[#E8ECF2] text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-[#181920]">Delete this resume version?</h3>
                <p className="text-xs text-[#767E94]">This action cannot be undone.</p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setDeleteTargetId(null)}
                  className="flex-1 py-3 rounded-2xl border border-[#E8ECF2] bg-[#F4F6FB] text-[#181920] text-xs font-bold hover:bg-[#E8ECF2] transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
