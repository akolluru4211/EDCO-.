"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { AVAILABLE_CATEGORIES } from "@/lib/mock-data";
import { SkillLevel } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import MediaRecorderStudio from "@/components/interview/MediaRecorderStudio";
import { 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  Award, 
  CheckCircle2, 
  Layers,
  HelpCircle,
  Lock,
  ArrowRight,
  FileText,
  Play,
  RotateCcw,
  Briefcase,
  Code2,
  Cpu,
  Check,
  ChevronRight,
  AlertCircle
} from "lucide-react";

interface SavedResume {
  id: string;
  title: string;
  content: any;
  updated_at: string;
}

export default function ActiveInterviewStudioPage() {
  const params = useParams();
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const categoryId = params?.category as string;

  // Career Track Gating: 18+ only
  const isMinorUser = user ? user.ageBand !== "18+" : false;

  const categoryObj = AVAILABLE_CATEGORIES.find(
    (c) => c.id === categoryId || c.name.toLowerCase().includes(categoryId?.toLowerCase() || "")
  ) || AVAILABLE_CATEGORIES[0];

  const categoryName = categoryObj.name;

  const interestObj = profile?.interests?.find(
    (i) => i.id === categoryObj.id || i.name.toLowerCase() === categoryName.toLowerCase() || categoryName.toLowerCase().includes(i.name.toLowerCase())
  );
  const effectiveLevel: SkillLevel = interestObj ? interestObj.effectiveLevel : 0;

  // State
  const [targetRole, setTargetRole] = useState(categoryName);
  const [jobDescriptionInput, setJobDescriptionInput] = useState("");
  const [savedResumes, setSavedResumes] = useState<SavedResume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("none");
  const [rawResumeInput, setRawResumeInput] = useState("");
  const [loadingResumes, setLoadingResumes] = useState(true);

  // Active Session State
  const [sessionStarted, setSessionStarted] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [aiModelUsed, setAiModelUsed] = useState<string>("");
  const [resumeConnected, setResumeConnected] = useState(false);
  const [sessionTranscripts, setSessionTranscripts] = useState<Record<number, string>>({});

  // 1. Fetch User's Saved Resumes from Supabase
  useEffect(() => {
    if (!user || isMinorUser) {
      setLoadingResumes(false);
      return;
    }

    const fetchResumes = async () => {
      try {
        const { data, error } = await supabase
          .from("resumes")
          .select("id, title, content, updated_at")
          .eq("user_id", user.uid)
          .order("updated_at", { ascending: false });

        if (data && data.length > 0) {
          setSavedResumes(data);
          // Auto-select the most recently updated resume
          setSelectedResumeId(data[0].id);
        }
      } catch (err) {
        console.warn("[Fetch Resumes Supabase Note]:", err);
      } finally {
        setLoadingResumes(false);
      }
    };

    fetchResumes();
  }, [user, isMinorUser]);

  // Selected Resume Details Preview
  const selectedResumeObj = savedResumes.find((r) => r.id === selectedResumeId);
  const resumeSkills: string[] = selectedResumeObj?.content?.skills?.technical || 
    selectedResumeObj?.content?.skills?.tools || 
    (Array.isArray(selectedResumeObj?.content?.skills) ? selectedResumeObj.content.skills : []) || [];
  const resumeProjects: Array<{ title: string; technologies?: string[] }> = selectedResumeObj?.content?.projects || [];

  const handleStartSession = async () => {
    setGenerating(true);
    try {
      const candidateName = user?.name || profile?.name || "";
      const firstName = candidateName ? candidateName.trim().split(" ")[0] : "";
      
      const payload: any = {
        category: categoryName,
        targetRole: targetRole || categoryName,
        effectiveLevel,
        candidateName,
        userId: user?.uid,
        jobDescription: jobDescriptionInput,
      };

      if (selectedResumeId && selectedResumeId !== "none" && selectedResumeId !== "custom") {
        payload.resumeId = selectedResumeId;
        payload.resumeContent = selectedResumeObj?.content;
      } else if (selectedResumeId === "custom" && rawResumeInput.trim()) {
        payload.rawResumeText = rawResumeInput.trim();
      }

      const res = await fetch("/api/interview/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setAiModelUsed(data.modelUsed || data.source || "Claude 3.5 Sonnet");
        setResumeConnected(Boolean(data.resumeConnected));
      } else {
        // Fallback questions
        setQuestions([
          {
            id: "warmup-1",
            text: firstName
              ? `Hi ${firstName}, welcome to your mock interview for ${targetRole || categoryName}. Let's begin with a high-level overview of your engineering background and what drives your technical passion.`
              : `Welcome! Let's begin with an overview of your engineering background and your focus in ${targetRole || categoryName}.`,
            difficultyLevel: 0,
            type: "warmup",
            contextSource: "Target Role Alignment",
            suggestedDurationSeconds: 90,
          },
          {
            id: "q-project-2",
            text: `Walk me through the most technically challenging project you have engineered. What architecture did you choose, what was the hardest bottleneck, and how did you measure success?`,
            difficultyLevel: 1,
            type: "project_deep_dive",
            contextSource: "Core Architecture & Trade-offs",
            suggestedDurationSeconds: 150,
          },
          {
            id: "q-tech-3",
            text: `In ${categoryName}, how do you approach fault tolerance, latency optimization, and automated testing across distributed environments?`,
            difficultyLevel: effectiveLevel,
            type: "technical",
            contextSource: "Technical Stack Rigor",
            suggestedDurationSeconds: 120,
          },
        ]);
        setAiModelUsed("Universal Deterministic Engine");
      }
      setSessionStarted(true);
    } catch (e) {
      console.warn("Question generation note:", e);
      setSessionStarted(true);
    } finally {
      setGenerating(false);
    }
  };

  const handleQuestionSubmit = async (sessionSubmission: {
    transcript: string;
    durationSeconds: number;
    isAudioOnly?: boolean;
    fullscreenExitEvents?: Array<{ timestamp: string; questionIndex: number }>;
  }) => {
    if (!user) return;

    // Record transcript for current question
    const updatedTranscripts = {
      ...sessionTranscripts,
      [currentQuestionIdx]: sessionSubmission.transcript,
    };
    setSessionTranscripts(updatedTranscripts);

    // If there are more questions, go to next question
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
      return;
    }

    // Finished all questions or final submission -> Score Session
    try {
      const combinedTranscript = Object.values(updatedTranscripts).join(" \n\n ");

      const res = await fetch("/api/interview/score-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          category: categoryName,
          targetRole: targetRole || categoryName,
          difficultyLevel: effectiveLevel,
          questions: questions.length > 0 ? questions : [{ id: "q1", text: "Interview Question", transcript: sessionSubmission.transcript }],
          transcript: combinedTranscript || sessionSubmission.transcript,
          durationSeconds: sessionSubmission.durationSeconds,
          resumeContext: selectedResumeObj?.title ? `Resume: ${selectedResumeObj.title}` : "",
          fullscreenExitEvents: sessionSubmission.fullscreenExitEvents || [],
        }),
      });

      const data = await res.json();
      if (data.success && data.sessionId) {
        localStorage.setItem(`edworld_${user.uid}_interview_${data.sessionId}`, JSON.stringify(data));
        router.push(`/interviews/results/${data.sessionId}`);
      } else {
        router.push("/interviews");
      }
    } catch (e) {
      console.warn("Session score submission error:", e);
      router.push("/interviews");
    }
  };

  if (isMinorUser) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Career Track Restricted</h1>
          <p className="text-xs text-slate-500">
            Mock interviews and speech diagnostics are available for 18+ Career Track members. Practice modules are tailored for career progression.
          </p>
          <Link href="/dashboard" className="inline-block px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestionIdx] || {
    id: "warmup-1",
    text: "Tell me about yourself, your background, and what drives your passion for this domain.",
    difficultyLevel: 0,
    type: "warmup",
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F4F6FB] py-8 px-4 sm:px-6 lg:px-8 text-[#181920]">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link href="/interviews" className="text-xs font-bold text-[#767E94] hover:text-[#181920] flex items-center gap-1.5 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Mock Interview Studio</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-[#7B57FF] bg-[#EDE8FD] border border-[#7B57FF]/30 px-3 py-1 rounded-full">
              {categoryName} • Level {effectiveLevel}
            </span>
          </div>
        </div>

        {!sessionStarted ? (
          /* PRE-SESSION SETUP: RESUME SELECTION & CLAUDE AI CONFIGURATION */
          <div className="card-quixel p-6 sm:p-8 space-y-6 animate-in fade-in">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#13141B] text-[#D7FC51] flex items-center gap-1.5 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Claude AI &bull; Resume-Connected Studio</span>
                </span>
                <span className="text-[10px] font-mono text-[#767E94] bg-white px-2 py-0.5 rounded-md border border-[#E8ECF2]">
                  v2.5 Production
                </span>
              </div>
              <h1 className="text-2xl font-black text-[#181920] tracking-tight mt-1">
                Configure Your {categoryName} Practice Session
              </h1>
              <p className="text-xs text-[#767E94] max-w-2xl leading-relaxed">
                Connect your verified resume so Claude AI can conduct a real-world interview citing your actual past projects, technical stack, architecture decisions, and metrics.
              </p>
            </div>

            {/* 1. Target Role & Category Customizer */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-[#181920] uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#7B57FF]" />
                <span>Target Position / Title</span>
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Senior Full-Stack Engineer, Distributed Systems Lead, Product Manager..."
                className="w-full p-3.5 rounded-2xl bg-white border border-[#E8ECF2] text-xs font-bold text-[#181920] focus:outline-none focus:ring-2 focus:ring-[#13141B] shadow-inner"
              />
            </div>

            {/* 2. Resume Connection Selector */}
            <div className="space-y-3 p-5 rounded-2xl bg-white border border-[#E8ECF2] shadow-xs">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black text-[#181920] uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#00D2B4]" />
                  <span>Connect Resume for AI Question Generation</span>
                </label>
                {savedResumes.length > 0 && (
                  <span className="text-[10px] font-bold text-[#00D2B4] bg-[#E0FAF6] px-2 py-0.5 rounded-full">
                    {savedResumes.length} Resume{savedResumes.length > 1 ? "s" : ""} Found in Supabase
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {savedResumes.map((resume) => (
                  <button
                    key={resume.id}
                    type="button"
                    onClick={() => setSelectedResumeId(resume.id)}
                    className={`p-3.5 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                      selectedResumeId === resume.id
                        ? "border-[#13141B] bg-[#13141B] text-white shadow-md scale-102"
                        : "border-[#E8ECF2] bg-[#F4F6FB] text-[#181920] hover:bg-slate-100"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <FileText className={`w-4 h-4 ${selectedResumeId === resume.id ? "text-[#D7FC51]" : "text-[#7B57FF]"}`} />
                        {selectedResumeId === resume.id && (
                          <CheckCircle2 className="w-4 h-4 text-[#D7FC51]" />
                        )}
                      </div>
                      <p className="font-black text-xs line-clamp-1">{resume.title || "Resume"}</p>
                      <p className={`text-[10px] line-clamp-1 ${selectedResumeId === resume.id ? "text-slate-300" : "text-[#8E95A5]"}`}>
                        Updated {new Date(resume.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </button>
                ))}

                {/* Option: Custom Paste */}
                <button
                  type="button"
                  onClick={() => setSelectedResumeId("custom")}
                  className={`p-3.5 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                    selectedResumeId === "custom"
                      ? "border-[#13141B] bg-[#13141B] text-white shadow-md scale-102"
                      : "border-[#E8ECF2] bg-[#F4F6FB] text-[#181920] hover:bg-slate-100"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Code2 className={`w-4 h-4 ${selectedResumeId === "custom" ? "text-[#D7FC51]" : "text-[#7B57FF]"}`} />
                      {selectedResumeId === "custom" && <CheckCircle2 className="w-4 h-4 text-[#D7FC51]" />}
                    </div>
                    <p className="font-black text-xs">Paste Resume Text</p>
                    <p className={`text-[10px] ${selectedResumeId === "custom" ? "text-slate-300" : "text-[#8E95A5]"}`}>
                      Manual bullet points
                    </p>
                  </div>
                </button>

                {/* Option: Standard Track */}
                <button
                  type="button"
                  onClick={() => setSelectedResumeId("none")}
                  className={`p-3.5 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                    selectedResumeId === "none"
                      ? "border-[#13141B] bg-[#13141B] text-white shadow-md scale-102"
                      : "border-[#E8ECF2] bg-[#F4F6FB] text-[#181920] hover:bg-slate-100"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Sparkles className={`w-4 h-4 ${selectedResumeId === "none" ? "text-[#D7FC51]" : "text-[#7B57FF]"}`} />
                      {selectedResumeId === "none" && <CheckCircle2 className="w-4 h-4 text-[#D7FC51]" />}
                    </div>
                    <p className="font-black text-xs">General Practice</p>
                    <p className={`text-[10px] ${selectedResumeId === "none" ? "text-slate-300" : "text-[#8E95A5]"}`}>
                      Standard role questions
                    </p>
                  </div>
                </button>
              </div>

              {/* Custom Resume Text Box if Selected */}
              {selectedResumeId === "custom" && (
                <div className="pt-2 animate-in fade-in">
                  <textarea
                    rows={4}
                    value={rawResumeInput}
                    onChange={(e) => setRawResumeInput(e.target.value)}
                    placeholder="Paste your key projects, technical skills, languages, tools, and achievements here..."
                    className="w-full p-3.5 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#181920] focus:outline-none focus:ring-2 focus:ring-[#13141B]"
                  />
                </div>
              )}

              {/* Connected Resume Deep-Dive Insights */}
              {selectedResumeObj && selectedResumeId !== "none" && selectedResumeId !== "custom" && (
                <div className="mt-3 p-4 rounded-xl bg-[#E0FAF6]/60 border border-[#00D2B4]/30 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00D2B4]" />
                    <span className="font-black text-xs text-[#181920]">
                      Resume Connected: {selectedResumeObj.title}
                    </span>
                  </div>
                  
                  {resumeSkills.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-mono uppercase text-[#767E94]">Detected Skills:</span>
                      {resumeSkills.slice(0, 6).map((sk, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-white text-[10px] font-bold text-[#181920] border border-[#E8ECF2]">
                          {sk}
                        </span>
                      ))}
                      {resumeSkills.length > 6 && (
                        <span className="text-[10px] font-bold text-[#767E94]">+{resumeSkills.length - 6} more</span>
                      )}
                    </div>
                  )}

                  {resumeProjects.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-mono uppercase text-[#767E94]">Projects for Deep-Dive:</span>
                      {resumeProjects.slice(0, 3).map((pj, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-white text-[10px] font-bold text-[#7B57FF] border border-[#7B57FF]/30">
                          {pj.title}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 3. Optional Job Description Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-[#181920] uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#7B57FF]" />
                <span>Target Job Description / Specific Focus (Optional)</span>
              </label>
              <textarea
                rows={3}
                value={jobDescriptionInput}
                onChange={(e) => setJobDescriptionInput(e.target.value)}
                placeholder="Paste key responsibilities, requirements, or focus topics from a job posting..."
                className="w-full p-3.5 rounded-2xl bg-white border border-[#E8ECF2] text-xs text-[#181920] focus:outline-none focus:ring-2 focus:ring-[#13141B] shadow-inner"
              />
            </div>

            {/* Session Features Callout */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-white border border-[#E8ECF2] space-y-1 shadow-xs">
                <div className="font-black text-[#181920] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#7B57FF]" />
                  <span>1. Resume Deep-Dive</span>
                </div>
                <p className="text-[11px] text-[#767E94]">Questions probe your exact projects and technical stack decisions.</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-white border border-[#E8ECF2] space-y-1 shadow-xs">
                <div className="font-black text-[#181920] flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-[#00D2B4]" />
                  <span>2. STAR Methodology</span>
                </div>
                <p className="text-[11px] text-[#767E94]">Evaluates Situation, Task, Action, and measurable Result.</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-white border border-[#E8ECF2] space-y-1 shadow-xs">
                <div className="font-black text-[#181920] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#FFB800]" />
                  <span>3. Claude Coaching</span>
                </div>
                <p className="text-[11px] text-[#767E94]">Provides exact "What You Said" vs "Better Way to Say It" rewrites.</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleStartSession}
                disabled={generating}
                className="btn-shine px-7 py-3.5 rounded-2xl bg-[#13141B] hover:bg-black text-[#D7FC51] text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all hover:scale-102 disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{generating ? "Claude AI Generating Tailored Questions..." : "Launch Resume-Connected Studio"}</span>
              </button>
            </div>
          </div>
        ) : (
          /* ACTIVE INTERVIEW STUDIO */
          <div className="space-y-4">
            
            {/* Header with AI Model Badge & Progress */}
            <div className="card-quixel p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-[#13141B] text-[#D7FC51]">
                  Question {currentQuestionIdx + 1} of {questions.length}
                </span>
                {currentQ.contextSource && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EDE8FD] text-[#7B57FF] border border-[#7B57FF]/30">
                    {currentQ.contextSource}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-[#767E94]">
                <span>Engine:</span>
                <span className="font-bold text-[#181920] bg-white px-2 py-0.5 rounded-md border border-[#E8ECF2]">
                  {aiModelUsed || "Claude AI"}
                </span>
              </div>
            </div>

            <MediaRecorderStudio
              questionText={currentQ.text}
              category={categoryName}
              difficultyLevel={currentQ.difficultyLevel || effectiveLevel}
              suggestedDurationSeconds={currentQ.suggestedDurationSeconds || 120}
              currentQuestionIndex={currentQuestionIdx + 1}
              totalQuestions={questions.length || 3}
              adaptiveFocus={currentQ.adaptiveFocus}
              userId={user?.uid}
              onSubmitSession={handleQuestionSubmit}
            />
          </div>
        )}

      </div>
    </div>
  );
}
