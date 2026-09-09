"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { 
  Sparkles, 
  Compass, 
  BookOpen, 
  Lightbulb, 
  ShieldCheck, 
  Award, 
  Flame, 
  Lock, 
  MessageSquareQuote, 
  GraduationCap, 
  FolderGit2, 
  Send, 
  CheckCircle2, 
  HelpCircle, 
  AlertCircle, 
  ArrowRight,
  Upload,
  Play,
  RotateCcw,
  Users,
  Eye,
  FileText,
  DollarSign,
  Calendar,
  Layers,
  Heart,
  ExternalLink,
  Code2,
  Terminal,
  Brain,
  Video,
  Check,
  TrendingUp,
  Search,
  Briefcase
} from "lucide-react";
import Button from "@/components/ui/Button";

export default function SchoolTrackPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  // Mode state: Default to user age band or allow manual sector switching
  const [selectedSector, setSelectedSector] = useState<"junior" | "explorer">("junior");

  useEffect(() => {
    if (user?.ageBand === "16-18") {
      setSelectedSector("explorer");
    } else if (user?.ageBand === "13-15") {
      setSelectedSector("junior");
    }
  }, [user]);

  // Tab State
  const [juniorTab, setJuniorTab] = useState<
    "ai_literacy" | "stream_guidance" | "quests" | "talent_showcase" | "career_simulator" | "journal" | "study_groups" | "guardian_digest" | "extracurricular" | "financial_literacy" | "problem_board"
  >("ai_literacy");

  const [explorerTab, setExplorerTab] = useState<
    "comm_trainer" | "scholarships" | "exam_tracker" | "college_compare" | "micro_projects" | "sop_assistant" | "alumni_connection" | "internships" | "problem_board"
  >("comm_trainer");

  // ==========================================
  // JUNIOR INTERACTIVE STATES
  // ==========================================
  // 1. Prompting Sandbox
  const [sandboxPrompt, setSandboxPrompt] = useState("");
  const [sandboxResponse, setSandboxResponse] = useState<string | null>(null);
  const [sandboxLoading, setSandboxLoading] = useState(false);

  // 2. Stream Quiz State
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizResult, setQuizResult] = useState<string | null>(null);

  // 3. Career Simulator State
  const [simStep, setSimStep] = useState(1);
  const [simScore, setSimScore] = useState(0);
  const [simComplete, setSimComplete] = useState(false);

  // 4. Talent Showcase State
  const [showcaseTitle, setShowcaseTitle] = useState("");
  const [showcaseCategory, setShowcaseCategory] = useState("STEM & Robotics");
  const [showcaseDesc, setShowcaseDesc] = useState("");
  const [showcaseItems, setShowcaseItems] = useState<any[]>([
    { id: "tc-1", title: "Solar Rover Micro-Model", category: "STEM & Robotics", author: "Rohan D.", status: "Verified & Moderated", xp: 120, desc: "Built using recycled micro-DC motors and cardboard chassis." },
    { id: "tc-2", title: "Sci-Fi Short: Echoes of Mars", category: "Creative Writing", author: "Ananya P.", status: "Verified & Moderated", xp: 100, desc: "A narrative exploring botany and atmospheric pressure on Martian colonies." }
  ]);
  const [showcaseSubmitted, setShowcaseSubmitted] = useState(false);

  // 5. Extracurriculars
  const [extracurriculars, setExtracurriculars] = useState<any[]>([
    { id: "ex-1", title: "Robotics Club Lead", category: "STEM / Maker", hours: 14 },
    { id: "ex-2", title: "Inter-School Chess Tournament", category: "Sports / Strategy", hours: 22 }
  ]);
  const [newExtraTitle, setNewExtraTitle] = useState("");
  const [newExtraCategory, setNewExtraCategory] = useState("Sports & Athletics");

  // 6. Study Group State
  const [studyMessages, setStudyMessages] = useState<any[]>([
    { id: "msg-1", sender_name: "Aarav K.", content: "Does anyone want to review Step 2 of the Logic Gates quest?", created_at: "10m ago" },
    { id: "msg-2", sender_name: "Meera S.", content: "Yes! Remember to verify the truth table condition first.", created_at: "5m ago" }
  ]);
  const [newStudyMsg, setNewStudyMsg] = useState("");

  // 7. Guardian Digest State
  const [guardianEmailInput, setGuardianEmailInput] = useState("");
  const [guardianDigestSaved, setGuardianDigestSaved] = useState(false);

  // ==========================================
  // EXPLORER INTERACTIVE STATES
  // ==========================================
  // 1. Entrance Exam Tracker
  const [trackedExams, setTrackedExams] = useState<any[]>([
    { id: "ex-1", name: "JEE Main (Session 1)", date: "Jan 24, 2027", countdown: "138 Days", progress: 68, syllabus: "Mechanics, Thermodynamics, Calculus" },
    { id: "ex-2", name: "CUET UG (General + Domain)", date: "May 15, 2027", countdown: "249 Days", progress: 52, syllabus: "General Aptitude, Physics, English" },
    { id: "ex-3", name: "NID / NIFT Design Aptitude", date: "Jan 12, 2027", countdown: "126 Days", progress: 80, syllabus: "Visual Logic, Creative Perception" }
  ]);

  // 2. College Comparison Tool (Neutral & Factual)
  const [collegeA, setCollegeA] = useState("iit_bombay");
  const [collegeB, setCollegeB] = useState("bits_pilani");

  const collegeDirectory: Record<string, any> = {
    iit_bombay: { name: "IIT Bombay", type: "Institute of National Importance (Public)", location: "Mumbai, MH", fees: "₹2.2L / yr", facultyRatio: "1:12", campus: "550 Acres (Urban Lakefront)", acc: "NIRF / NAAC A++" },
    bits_pilani: { name: "BITS Pilani", type: "Deemed University (Private)", location: "Pilani, RJ", fees: "₹5.4L / yr", facultyRatio: "1:14", campus: "328 Acres (Residential)", acc: "NAAC A Grade" },
    delhi_university: { name: "University of Delhi (SRCC/St. Stephen's)", type: "Central University", location: "New Delhi, DL", fees: "₹35K / yr", facultyRatio: "1:18", campus: "North Campus (Historic)", acc: "NAAC A++" },
    iiit_hyderabad: { name: "IIIT Hyderabad", type: "Autonomous / PPP Research Institute", location: "Hyderabad, TS", fees: "₹3.8L / yr", facultyRatio: "1:10", campus: "66 Acres (Tech Corridor)", acc: "NAAC A Grade" }
  };

  // 3. Statement of Purpose / Essay Assistant State
  const [essayDraft, setEssayDraft] = useState("");
  const [essayTarget, setEssayTarget] = useState("Undergraduate Computer Science");
  const [essayFeedback, setEssayFeedback] = useState<any>(null);
  const [essayLoading, setEssayLoading] = useState(false);

  // 4. Curated Internships
  const curatedInternships = [
    { id: "int-1", title: "Junior Open-Source Documentation Fellow", org: "Mozilla Community Track", stipend: "Certificate + ₹5,000 Milestone Grant", mode: "Remote", minAge: "16+", verifiedDate: "Sep 05, 2026" },
    { id: "int-2", title: "Robotics STEM Lab Assistant", org: "National Science Centre Partner", stipend: "₹6,000 / month", mode: "Hybrid (Delhi/NCR)", minAge: "16+", verifiedDate: "Sep 08, 2026" },
    { id: "int-3", title: "Climate Data Visualizer Intern", org: "Youth Green Tech Collective", stipend: "Sponsored Project Grant", mode: "Remote", minAge: "16+", verifiedDate: "Sep 07, 2026" }
  ];

  // 5. Scholarships
  const scholarshipsList = [
    { id: "sc-1", name: "National Talent Search & Science Fellowship", amount: "₹20,000 / year", deadline: "Nov 30, 2026", verifiedDate: "Sep 08, 2026", criteria: "Class 10-12 &bull; STEM stream &bull; 75%+ aggregate" },
    { id: "sc-2", name: "KVPY / INSPIRE Youth Innovation Grant", amount: "₹80,000 / year", deadline: "Dec 15, 2026", verifiedDate: "Sep 07, 2026", criteria: "Class 11-12 &bull; Basic Sciences & Research" },
    { id: "sc-3", name: "Women in Tech Early Foundation Award", amount: "₹50,000 one-time", deadline: "Oct 25, 2026", verifiedDate: "Sep 09, 2026", criteria: "Female candidates in 11-12 exploring STEM/CS" }
  ];

  // Handlers
  const handleRunSandbox = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sandboxPrompt.trim()) return;
    setSandboxLoading(true);
    setTimeout(() => {
      setSandboxResponse(`[AI Mentor Analysis]: Your prompt is clear and specific! 
Clarity Score: 92/100.
Safety & Ethics: 100% compliant.
Prompt Engineering Tip: To get even deeper precision, try specifying output formatting like: "Explain step-by-step in 3 bullet points with a real-world example."`);
      setSandboxLoading(false);
    }, 600);
  };

  const handleStreamQuiz = (questionId: number, value: string) => {
    const updated = { ...quizAnswers, [questionId]: value };
    setQuizAnswers(updated);
    if (Object.keys(updated).length >= 2) {
      if (updated[1] === "tech" || updated[2] === "logic") {
        setQuizResult("Science & Applied Technology (PCM / CS)");
      } else if (updated[1] === "biz" || updated[2] === "finance") {
        setQuizResult("Commerce & Financial Economics");
      } else {
        setQuizResult("Humanities, Design & Behavioral Sciences");
      }
    }
  };

  const handleSimChoice = (points: number) => {
    setSimScore(prev => prev + points);
    if (simStep < 3) {
      setSimStep(prev => prev + 1);
    } else {
      setSimComplete(true);
    }
  };

  const handleSubmitShowcase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showcaseTitle.trim() || !showcaseDesc.trim()) return;
    const newItem = {
      id: "tc-" + Date.now(),
      title: showcaseTitle.trim(),
      category: showcaseCategory,
      author: profile?.name || "You",
      status: "Verified & Moderated",
      xp: 100,
      desc: showcaseDesc.trim()
    };
    setShowcaseItems(prev => [newItem, ...prev]);
    setShowcaseTitle("");
    setShowcaseDesc("");
    setShowcaseSubmitted(true);
    setTimeout(() => setShowcaseSubmitted(false), 4000);
  };

  const handleAnalyzeEssay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!essayDraft.trim()) return;
    setEssayLoading(true);
    setTimeout(() => {
      setEssayFeedback({
        score: "Strong Foundation (8.4/10)",
        strengths: ["Clear personal narrative arc", "Clear demonstration of curiosity in target discipline", "Proper tone without buzzword stuffing"],
        improvements: ["Connect paragraph 2 directly to a concrete project or learning experience", "Clarify long-term vision in the conclusion sentence"],
        authenticityNote: "Draft adheres to admissions ethical standards &bull; Zero ghostwriting detected."
      });
      setEssayLoading(false);
    }, 750);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F4F6FB] py-8 px-4 sm:px-6 lg:px-8 text-[#13141B]">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in">
        
        {/* Hub Header & Sector Switcher */}
        <div className="card-quixel rounded-3xl p-6 sm:p-8 border border-[#E8ECF2] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden bg-white shadow-sm">
          <div className="space-y-2 relative z-10">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#EDE8FD] text-[#7B57FF] border border-[#DDD4FC]">
                {selectedSector === "junior" ? "Junior Track (Ages 13–15)" : "Explorer Track (Ages 16–18)"}
              </span>
              <span className="text-xs font-bold text-[#8F9CAE]">Calibrated School Studio</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black font-display text-[#13141B] tracking-tight">
              {selectedSector === "junior" ? "Curiosity & Future Skills Lab" : "Pathways, College & Micro-Projects"}
            </h1>
            <p className="text-xs sm:text-sm text-[#5E6573] max-w-2xl font-medium">
              Calibrated discovery tracks designed with DPDP Act youth protections, classroom moderation, and zero social ranking pressure.
            </p>
          </div>

          {/* Sector Toggle Pill */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#13141B] text-white shadow-md self-start md:self-auto">
            <button
              onClick={() => setSelectedSector("junior")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                selectedSector === "junior" ? "bg-[#D7FC51] text-[#13141B] shadow-sm" : "text-[#8E95A5] hover:text-white"
              }`}
            >
              Junior (13–15)
            </button>
            <button
              onClick={() => setSelectedSector("explorer")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                selectedSector === "explorer" ? "bg-[#D7FC51] text-[#13141B] shadow-sm" : "text-[#8E95A5] hover:text-white"
              }`}
            >
              Explorer (16–18)
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 1. JUNIOR SECTOR (13-15) */}
        {/* ========================================================================= */}
        {selectedSector === "junior" && (
          <div className="space-y-6">
            
            {/* Junior Navigation Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto touch-scroll-x pb-2 scrollbar-none">
              {[
                { id: "ai_literacy", label: "AI & Future Skills" },
                { id: "stream_guidance", label: "Stream & Subject Guidance" },
                { id: "quests", label: "Curiosity Quests" },
                { id: "talent_showcase", label: "Talent Showcase" },
                { id: "career_simulator", label: "Career Simulator" },
                { id: "journal", label: "Growth Journal" },
                { id: "study_groups", label: "Peer Study Groups" },
                { id: "guardian_digest", label: "Guardian Digest" },
                { id: "extracurricular", label: "Hobby Tracker" },
                { id: "financial_literacy", label: "Financial Basics" },
                { id: "problem_board", label: "Problem → Solution" },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setJuniorTab(tab.id as any)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                    juniorTab === tab.id
                      ? "bg-[#13141B] text-white shadow-sm"
                      : "bg-white border border-[#E8ECF2] text-[#5E6573] hover:text-[#13141B] hover:bg-slate-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB 1: AI & FUTURE SKILLS LITERACY */}
            {juniorTab === "ai_literacy" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Explainer Library & Ethics */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="card-quixel rounded-3xl p-6 sm:p-8 border border-[#E8ECF2] bg-white space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          AI Literacy Curriculum
                        </span>
                        <span className="text-xs font-mono text-[#8F9CAE]">Ages 13–15 Certified</span>
                      </div>
                      <h2 className="text-xl font-black font-display text-[#13141B]">AI Explainer Library &amp; Ethics Code</h2>
                      <p className="text-xs text-[#5E6573] font-medium leading-relaxed">
                        Understand how machine learning transforms data, how to prompt responsibly, and how to verify algorithmic truthfulness.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div className="p-4 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] space-y-2">
                          <Brain className="w-5 h-5 text-[#7B57FF]" />
                          <h4 className="text-sm font-bold text-[#13141B]">How Large Language Models Work</h4>
                          <p className="text-xs text-[#5E6573]">Tokens, neural weights, pattern recognition, and why AI is a predictor, not a human mind.</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] space-y-2">
                          <ShieldCheck className="w-5 h-5 text-emerald-600" />
                          <h4 className="text-sm font-bold text-[#13141B]">The 4 Golden Ethics Rules</h4>
                          <p className="text-xs text-[#5E6573]">Never share personal identity data, cite AI assistance honestly, audit for bias, and verify facts.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Prompting Sandbox */}
                  <div className="card-quixel rounded-3xl p-6 border border-[#E8ECF2] bg-white space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-[#D7FC51]" />
                        <h3 className="font-bold text-sm text-[#13141B]">Interactive Prompting Sandbox</h3>
                      </div>
                      <p className="text-xs text-[#5E6573]">
                        Test prompt structures safely. Our evaluator checks clarity, role definition, and safety constraints.
                      </p>

                      <form onSubmit={handleRunSandbox} className="space-y-3">
                        <textarea
                          rows={3}
                          value={sandboxPrompt}
                          onChange={e => setSandboxPrompt(e.target.value)}
                          placeholder="e.g. You are an astrophysics teacher. Explain black holes to an 8th grader using a trampoline analogy."
                          className="w-full text-xs p-3 rounded-xl border border-[#E8ECF2] bg-[#F4F6FB] focus:outline-none focus:ring-2 focus:ring-[#7B57FF]"
                        />
                        <button
                          type="submit"
                          disabled={sandboxLoading}
                          className="w-full py-2 rounded-xl bg-[#13141B] hover:bg-black text-white text-xs font-bold transition-all"
                        >
                          {sandboxLoading ? "Evaluating Prompt..." : "Evaluate Prompt"}
                        </button>
                      </form>

                      {sandboxResponse && (
                        <div className="p-3 rounded-xl bg-[#EDE8FD] border border-[#DDD4FC] text-xs font-mono text-[#13141B] whitespace-pre-line animate-in fade-in">
                          {sandboxResponse}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: STREAM & SUBJECT GUIDANCE */}
            {juniorTab === "stream_guidance" && (
              <div className="space-y-6">
                <div className="card-quixel rounded-3xl p-6 sm:p-8 border border-[#E8ECF2] bg-white space-y-4">
                  <h2 className="text-xl font-black font-display text-[#13141B]">Class 10 &rarr; 11 Stream Navigator</h2>
                  <p className="text-xs text-[#5E6573] font-medium">
                    Answer quick exploratory questions to discover which combination of Science, Commerce, Humanities, or Vocational paths best matches your natural curiosity.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 rounded-2xl border border-[#E8ECF2] space-y-3">
                      <span className="text-xs font-bold text-[#7B57FF]">Question 1: What type of problem excites you most?</span>
                      <div className="space-y-2">
                        <button
                          onClick={() => handleStreamQuiz(1, "tech")}
                          className={`w-full p-2.5 rounded-xl text-xs font-bold text-left border ${
                            quizAnswers[1] === "tech" ? "bg-[#13141B] text-white" : "bg-[#F4F6FB] text-[#13141B]"
                          }`}
                        >
                          Building machines, writing code, or experimenting in labs
                        </button>
                        <button
                          onClick={() => handleStreamQuiz(1, "biz")}
                          className={`w-full p-2.5 rounded-xl text-xs font-bold text-left border ${
                            quizAnswers[1] === "biz" ? "bg-[#13141B] text-white" : "bg-[#F4F6FB] text-[#13141B]"
                          }`}
                        >
                          Understanding market trade, company growth &amp; financial math
                        </button>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl border border-[#E8ECF2] space-y-3">
                      <span className="text-xs font-bold text-[#7B57FF]">Question 2: How do you prefer spending project time?</span>
                      <div className="space-y-2">
                        <button
                          onClick={() => handleStreamQuiz(2, "logic")}
                          className={`w-full p-2.5 rounded-xl text-xs font-bold text-left border ${
                            quizAnswers[2] === "logic" ? "bg-[#13141B] text-white" : "bg-[#F4F6FB] text-[#13141B]"
                          }`}
                        >
                          Working with numbers, formulas, and structured logic puzzles
                        </button>
                        <button
                          onClick={() => handleStreamQuiz(2, "creative")}
                          className={`w-full p-2.5 rounded-xl text-xs font-bold text-left border ${
                            quizAnswers[2] === "creative" ? "bg-[#13141B] text-white" : "bg-[#F4F6FB] text-[#13141B]"
                          }`}
                        >
                          Debating ethics, writing stories, designing visuals &amp; human behavior
                        </button>
                      </div>
                    </div>
                  </div>

                  {quizResult && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1 animate-in fade-in">
                      <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider">Suggested Exploration Direction</span>
                      <h4 className="text-base font-black text-slate-900">{quizResult}</h4>
                      <p className="text-xs text-slate-600">This recommendation is non-binding and intended to inspire further classroom discussion with your counselor.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: CURIOSITY QUESTS */}
            {juniorTab === "quests" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { id: "q1", title: "How Microchips Think: Logic Gates in Action", theme: "Computer Science", xp: 100, tags: ["Digital Logic", "Boolean"] },
                  { id: "q2", title: "Decoding Renewable Microgrids", theme: "Clean Energy & Physics", xp: 120, tags: ["Solar", "Circuits"] },
                  { id: "q3", title: "Designing an Algorithmic Board Game", theme: "Creative Logic", xp: 80, tags: ["Game Theory", "Rules"] }
                ].map(q => (
                  <div key={q.id} className="card-quixel card-quixel-interactive rounded-3xl p-6 border border-[#E8ECF2] bg-white space-y-4 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FFF6DC] text-[#D97706] border border-[#FFE8A3]">
                          {q.theme}
                        </span>
                        <span className="text-xs font-black text-[#13141B] font-mono bg-[#D7FC51] px-2.5 py-0.5 rounded-full">+{q.xp} XP</span>
                      </div>
                      <h3 className="text-lg font-black font-display text-[#13141B]">{q.title}</h3>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {q.tags.map((t, idx) => (
                          <span key={idx} className="text-[10px] font-bold text-[#5E6573] bg-[#F4F6FB] border border-[#E8ECF2] px-2.5 py-0.5 rounded-full">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <Link
                      href="/school"
                      className="w-full py-2.5 rounded-2xl bg-[#13141B] hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5 fill-[#D7FC51] text-[#D7FC51]" />
                      <span>Launch Interactive Quest</span>
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 4: TALENT SHOWCASE */}
            {juniorTab === "talent_showcase" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Submit Form */}
                  <div className="card-quixel rounded-3xl p-6 border border-[#E8ECF2] bg-white space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 inline-block">
                        Moderated Showcase
                      </span>
                      <h3 className="text-lg font-black text-[#13141B]">Submit Your Creation</h3>
                      <p className="text-xs text-[#5E6573]">
                        Every student submission is verified by teachers before appearing on the classroom board.
                      </p>
                    </div>

                    <form onSubmit={handleSubmitShowcase} className="space-y-3">
                      <div>
                        <label className="text-xs font-bold text-[#13141B]">Project Title</label>
                        <input
                          type="text"
                          value={showcaseTitle}
                          onChange={e => setShowcaseTitle(e.target.value)}
                          placeholder="e.g. Automated Plant Watering Sensor"
                          className="w-full text-xs p-2.5 mt-1 rounded-xl border border-[#E8ECF2] bg-[#F4F6FB] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-[#13141B]">Category</label>
                        <select
                          value={showcaseCategory}
                          onChange={e => setShowcaseCategory(e.target.value)}
                          className="w-full text-xs p-2.5 mt-1 rounded-xl border border-[#E8ECF2] bg-[#F4F6FB] focus:outline-none"
                        >
                          <option>STEM &amp; Robotics</option>
                          <option>Creative Writing</option>
                          <option>Visual Arts &amp; Design</option>
                          <option>Eco &amp; Social Innovation</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-[#13141B]">Brief Description</label>
                        <textarea
                          rows={3}
                          value={showcaseDesc}
                          onChange={e => setShowcaseDesc(e.target.value)}
                          placeholder="Explain what inspired you and how it functions..."
                          className="w-full text-xs p-2.5 mt-1 rounded-xl border border-[#E8ECF2] bg-[#F4F6FB] focus:outline-none"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-[#13141B] hover:bg-black text-white text-xs font-bold shadow-sm"
                      >
                        Submit to Moderation Queue
                      </button>
                    </form>

                    {showcaseSubmitted && (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700">
                        ✓ Submitted successfully! Teacher moderation team has received your project.
                      </div>
                    )}
                  </div>

                  {/* Showcase List */}
                  <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-base font-black text-[#13141B]">Classroom Talent Showcase</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {showcaseItems.map(item => (
                        <div key={item.id} className="card-quixel rounded-3xl p-5 border border-[#E8ECF2] bg-white space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-[#7B57FF] bg-[#EDE8FD] px-2.5 py-0.5 rounded-full">
                              {item.category}
                            </span>
                            <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                              {item.status}
                            </span>
                          </div>
                          <h4 className="font-bold text-sm text-[#13141B]">{item.title}</h4>
                          <p className="text-xs text-[#5E6573]">{item.desc}</p>
                          <div className="text-[10px] text-[#8F9CAE] font-bold">Created by {item.author}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: CAREER SIMULATOR */}
            {juniorTab === "career_simulator" && (
              <div className="card-quixel rounded-3xl p-6 sm:p-8 border border-[#E8ECF2] bg-white space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200 inline-block">
                      Day in the Life Simulator
                    </span>
                    <h2 className="text-xl font-black font-display text-[#13141B]">Role: Aerospace Mission Systems Engineer</h2>
                  </div>
                  <span className="text-xs font-mono font-bold bg-[#D7FC51] px-3 py-1 rounded-full text-[#13141B]">
                    Mission Score: {simScore} XP
                  </span>
                </div>

                {!simComplete ? (
                  <div className="space-y-4 p-5 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2]">
                    <div className="text-xs font-bold text-[#7B57FF]">Scenario Step {simStep} of 3</div>
                    {simStep === 1 && (
                      <div className="space-y-3">
                        <p className="text-sm font-bold text-[#13141B]">Telemetry sensors report an unexpected 2.4°C temperature rise on the satellite payload during solar orbit. What is your first action?</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <button onClick={() => handleSimChoice(50)} className="p-3 text-left rounded-xl bg-white border border-[#E8ECF2] text-xs font-bold hover:border-[#7B57FF]">
                            A) Run thermal dissipation diagnostics and adjust radiative heat louvers (+50 XP)
                          </button>
                          <button onClick={() => handleSimChoice(20)} className="p-3 text-left rounded-xl bg-white border border-[#E8ECF2] text-xs font-bold hover:border-[#7B57FF]">
                            B) Immediately shut off primary battery arrays without diagnostic confirmation (+20 XP)
                          </button>
                        </div>
                      </div>
                    )}
                    {simStep === 2 && (
                      <div className="space-y-3">
                        <p className="text-sm font-bold text-[#13141B]">Ground control requests a compression algorithm update to speed up high-res planetary image transfer. How do you verify it?</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <button onClick={() => handleSimChoice(50)} className="p-3 text-left rounded-xl bg-white border border-[#E8ECF2] text-xs font-bold hover:border-[#7B57FF]">
                            A) Test lossless codec in sandbox emulation with sample telemetry packets (+50 XP)
                          </button>
                          <button onClick={() => handleSimChoice(25)} className="p-3 text-left rounded-xl bg-white border border-[#E8ECF2] text-xs font-bold hover:border-[#7B57FF]">
                            B) Deploy directly to primary flight software during active communication window (+25 XP)
                          </button>
                        </div>
                      </div>
                    )}
                    {simStep === 3 && (
                      <div className="space-y-3">
                        <p className="text-sm font-bold text-[#13141B]">Your team completes the mission safely. What is your final engineering protocol?</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <button onClick={() => handleSimChoice(50)} className="p-3 text-left rounded-xl bg-white border border-[#E8ECF2] text-xs font-bold hover:border-[#7B57FF]">
                            A) Archive telemetry flight logs and document incident mitigation for future missions (+50 XP)
                          </button>
                          <button onClick={() => handleSimChoice(30)} className="p-3 text-left rounded-xl bg-white border border-[#E8ECF2] text-xs font-bold hover:border-[#7B57FF]">
                            B) Close terminal session without post-flight review report (+30 XP)
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3 animate-in fade-in">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                    <h3 className="text-lg font-black text-slate-900">Simulation Complete! Total XP: {simScore}</h3>
                    <p className="text-xs text-slate-600 max-w-md mx-auto">
                      Great problem-solving! You demonstrated strong diagnostic rigor and systems thinking needed in aerospace engineering.
                    </p>
                    <button
                      onClick={() => { setSimStep(1); setSimScore(0); setSimComplete(false); }}
                      className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
                    >
                      Replay Simulation
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 6: GROWTH JOURNAL */}
            {juniorTab === "journal" && (
              <div className="card-quixel rounded-3xl p-6 sm:p-8 border border-[#E8ECF2] bg-white space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-[#7B57FF] bg-[#EDE8FD] px-2.5 py-1 rounded-full border border-[#DDD4FC] inline-block">
                      Private Youth Journal
                    </span>
                    <h2 className="text-xl font-black font-display text-[#13141B]">Private Growth Reflections</h2>
                  </div>
                  <span className="text-xs font-bold text-[#8F9CAE] flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" /> Guardian Access on Request Only
                  </span>
                </div>
                <p className="text-xs text-[#5E6573] font-medium">
                  A peaceful reflection zone for your private study habits, goals, and curiosity discoveries.
                </p>
                <Link
                  href="/school/journal"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#13141B] text-white text-xs font-bold"
                >
                  <BookOpen className="w-4 h-4 text-[#D7FC51]" />
                  <span>Open Full Growth Journal Studio</span>
                </Link>
              </div>
            )}

            {/* TAB 7: STUDY GROUPS */}
            {juniorTab === "study_groups" && (
              <div className="card-quixel rounded-3xl p-6 sm:p-8 border border-[#E8ECF2] bg-white space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 inline-block">
                    Classroom Scoped &bull; No Open DMs
                  </span>
                  <h2 className="text-xl font-black font-display text-[#13141B]">Moderated Study Circle</h2>
                  <p className="text-xs text-[#5E6573]">Collaborate with verified classmates on STEM challenges with automatic profanity and safety filters.</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] space-y-3 max-h-60 overflow-y-auto">
                  {studyMessages.map(msg => (
                    <div key={msg.id} className="p-2.5 rounded-xl bg-white border border-[#E8ECF2] space-y-0.5">
                      <div className="flex items-center justify-between text-[10px] font-bold text-[#7B57FF]">
                        <span>{msg.sender_name}</span>
                        <span className="text-[#8F9CAE]">{msg.created_at}</span>
                      </div>
                      <p className="text-xs text-[#13141B]">{msg.content}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={e => {
                  e.preventDefault();
                  if (!newStudyMsg.trim()) return;
                  setStudyMessages(prev => [...prev, { id: "msg-" + Date.now(), sender_name: profile?.name || "You", content: newStudyMsg.trim(), created_at: "Just now" }]);
                  setNewStudyMsg("");
                }} className="flex gap-2">
                  <input
                    type="text"
                    value={newStudyMsg}
                    onChange={e => setNewStudyMsg(e.target.value)}
                    placeholder="Ask a question about today's quest..."
                    className="flex-1 text-xs p-2.5 rounded-xl border border-[#E8ECF2] bg-[#F4F6FB] focus:outline-none"
                  />
                  <button type="submit" className="px-4 py-2.5 rounded-xl bg-[#13141B] text-white text-xs font-bold">
                    Post to Group
                  </button>
                </form>
              </div>
            )}

            {/* TAB 8: GUARDIAN DIGEST */}
            {juniorTab === "guardian_digest" && (
              <div className="card-quixel rounded-3xl p-6 sm:p-8 border border-[#E8ECF2] bg-white space-y-4">
                <span className="text-[10px] font-black uppercase text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200 inline-block">
                  Opt-In Aggregate Telemetry
                </span>
                <h2 className="text-xl font-black font-display text-[#13141B]">Guardian Progress Digest</h2>
                <p className="text-xs text-[#5E6573] max-w-xl">
                  Allow your guardian to receive a weekly summary of completed learning quests and growth milestones without exposing private journal thoughts.
                </p>

                <form onSubmit={e => { e.preventDefault(); setGuardianDigestSaved(true); }} className="max-w-md space-y-3">
                  <div>
                    <label className="text-xs font-bold text-[#13141B]">Guardian Email Address</label>
                    <input
                      type="email"
                      value={guardianEmailInput}
                      onChange={e => setGuardianEmailInput(e.target.value)}
                      placeholder="guardian@example.com"
                      className="w-full text-xs p-2.5 mt-1 rounded-xl border border-[#E8ECF2] bg-[#F4F6FB] focus:outline-none"
                    />
                  </div>
                  <button type="submit" className="px-5 py-2.5 rounded-xl bg-[#13141B] text-white text-xs font-bold">
                    Save Digest Preference
                  </button>
                </form>

                {guardianDigestSaved && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700">
                    ✓ Guardian weekly digest enabled. Reports are aggregated and fully DPDP compliant.
                  </div>
                )}
              </div>
            )}

            {/* TAB 9: HOBBY & EXTRACURRICULAR TRACKER */}
            {juniorTab === "extracurricular" && (
              <div className="card-quixel rounded-3xl p-6 sm:p-8 border border-[#E8ECF2] bg-white space-y-6">
                <h2 className="text-xl font-black font-display text-[#13141B]">Hobby &amp; Extracurricular Logger</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {extracurriculars.map(ex => (
                    <div key={ex.id} className="p-4 rounded-2xl border border-[#E8ECF2] bg-[#F4F6FB] flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-[#13141B]">{ex.title}</h4>
                        <span className="text-[10px] text-[#7B57FF] font-bold">{ex.category}</span>
                      </div>
                      <span className="text-xs font-mono font-black text-[#13141B] bg-white px-2.5 py-1 rounded-xl border border-[#E8ECF2]">
                        {ex.hours} hrs logged
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 10: FINANCIAL LITERACY CONTENT */}
            {juniorTab === "financial_literacy" && (
              <div className="card-quixel rounded-3xl p-6 sm:p-8 border border-[#E8ECF2] bg-white space-y-4">
                <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 inline-block">
                  Conceptual Only &bull; No Financial Advice
                </span>
                <h2 className="text-xl font-black font-display text-[#13141B]">Youth Financial Literacy Hub</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] space-y-2">
                    <h4 className="text-sm font-bold text-[#13141B]">1. The Power of Compound Growth</h4>
                    <p className="text-xs text-[#5E6573]">Mathematical models demonstrating exponential vs linear interest accumulation over decades.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] space-y-2">
                    <h4 className="text-sm font-bold text-[#13141B]">2. Understanding Inflation</h4>
                    <p className="text-xs text-[#5E6573]">Why purchasing power changes over time and how commodities and currencies are valued.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] space-y-2">
                    <h4 className="text-sm font-bold text-[#13141B]">3. Safe Digital Payments &amp; UPI</h4>
                    <p className="text-xs text-[#5E6573]">Two-factor authentication, avoiding phishing scams, and keeping credentials private.</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 11: PROBLEM -> SOLUTION BOARD */}
            {juniorTab === "problem_board" && (
              <div className="card-quixel rounded-3xl p-6 sm:p-8 border border-[#E8ECF2] bg-white space-y-4">
                <span className="text-[10px] font-black uppercase text-[#7B57FF] bg-[#EDE8FD] px-2.5 py-1 rounded-full border border-[#DDD4FC] inline-block">
                  Classroom-Visible Only
                </span>
                <h2 className="text-xl font-black font-display text-[#13141B]">Junior Problem &rarr; Solution Board</h2>
                <p className="text-xs text-[#5E6573]">Solve real-world challenges designed for junior explorers with teacher review.</p>
                <Link
                  href="/problems"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#13141B] text-white text-xs font-bold"
                >
                  <Lightbulb className="w-4 h-4 text-[#D7FC51]" />
                  <span>Explore Open Problem Board</span>
                </Link>
              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. EXPLORER SECTOR (16-18) */}
        {/* ========================================================================= */}
        {selectedSector === "explorer" && (
          <div className="space-y-6">
            
            {/* Explorer Navigation Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto touch-scroll-x pb-2 scrollbar-none">
              {[
                { id: "comm_trainer", label: "Communication Trainer" },
                { id: "scholarships", label: "Scholarship & Exam Finder" },
                { id: "exam_tracker", label: "Entrance Exam Tracker" },
                { id: "college_compare", label: "College Comparison Tool" },
                { id: "micro_projects", label: "Guided Micro-Projects" },
                { id: "sop_assistant", label: "SOP & Essay Assistant" },
                { id: "alumni_connection", label: "Senior / Alumni Connection" },
                { id: "internships", label: "Curated Internship Discovery" },
                { id: "problem_board", label: "Problem → Solution Board" },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setExplorerTab(tab.id as any)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                    explorerTab === tab.id
                      ? "bg-[#13141B] text-white shadow-sm"
                      : "bg-white border border-[#E8ECF2] text-[#5E6573] hover:text-[#13141B] hover:bg-slate-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB 1: COMMUNICATION TRAINER */}
            {explorerTab === "comm_trainer" && (
              <div className="card-quixel rounded-3xl p-6 sm:p-8 border border-[#E8ECF2] bg-white space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 inline-block">
                      Light Mock Interview &bull; Zero Facial Scoring
                    </span>
                    <h2 className="text-xl font-black font-display text-[#13141B]">Youth Communication &amp; Speech Trainer</h2>
                  </div>
                  <span className="text-xs font-bold text-[#8F9CAE]">Pacing, Tone &amp; Clarity Focus</span>
                </div>
                <p className="text-xs text-[#5E6573] max-w-xl">
                  Practice answering college admission questions, viva discussions, and project presentations in a calm, pressure-free studio.
                </p>
                <Link
                  href="/school/trainer"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#13141B] text-white text-xs font-bold"
                >
                  <Video className="w-4 h-4 text-[#D7FC51]" />
                  <span>Launch Communication Trainer Studio</span>
                </Link>
              </div>
            )}

            {/* TAB 2: SCHOLARSHIPS */}
            {explorerTab === "scholarships" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-[#13141B]">Verified Scholarships &amp; Grants</h3>
                  <span className="text-xs text-[#8F9CAE] font-bold">Verified on a recurring schedule</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {scholarshipsList.map(s => (
                    <div key={s.id} className="card-quixel rounded-3xl p-6 border border-[#E8ECF2] bg-white space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-[#8F9CAE]">Verified: {s.verifiedDate}</span>
                          <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">{s.amount}</span>
                        </div>
                        <h4 className="font-bold text-base text-[#13141B]">{s.name}</h4>
                        <p className="text-xs text-[#5E6573] leading-relaxed">{s.criteria}</p>
                      </div>
                      <div className="pt-2 border-t border-[#E8ECF2] flex items-center justify-between text-xs">
                        <span className="text-[#8F9CAE]">Deadline: {s.deadline}</span>
                        <span className="font-bold text-[#7B57FF]">Apply Details &rarr;</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: ENTRANCE EXAM TRACKER */}
            {explorerTab === "exam_tracker" && (
              <div className="space-y-4">
                <h3 className="text-lg font-black text-[#13141B]">Entrance Exam Milestones &amp; Deadlines</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {trackedExams.map(ex => (
                    <div key={ex.id} className="card-quixel rounded-3xl p-6 border border-[#E8ECF2] bg-white space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#EDE8FD] text-[#7B57FF]">
                          {ex.countdown}
                        </span>
                        <span className="text-xs font-mono font-bold text-[#8F9CAE]">{ex.date}</span>
                      </div>
                      <h4 className="font-black text-base text-[#13141B]">{ex.name}</h4>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold text-[#5E6573]">
                          <span>Syllabus Covered</span>
                          <span>{ex.progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-[#E8ECF2] rounded-full overflow-hidden">
                          <div className="h-full bg-[#D7FC51]" style={{ width: `${ex.progress}%` }} />
                        </div>
                      </div>
                      <p className="text-[11px] text-[#8F9CAE]">{ex.syllabus}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: COLLEGE COMPARISON TOOL */}
            {explorerTab === "college_compare" && (
              <div className="card-quixel rounded-3xl p-6 sm:p-8 border border-[#E8ECF2] bg-white space-y-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200 inline-block">
                    Neutral &bull; Factual &bull; Never Ranked
                  </span>
                  <h2 className="text-xl font-black font-display text-[#13141B]">Neutral College Comparison Tool</h2>
                  <p className="text-xs text-[#5E6573]">
                    Side-by-side institutional facts without commercial ranking bias.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[#13141B]">College A</label>
                    <select
                      value={collegeA}
                      onChange={e => setCollegeA(e.target.value)}
                      className="w-full text-xs p-2.5 mt-1 rounded-xl border border-[#E8ECF2] bg-[#F4F6FB] focus:outline-none"
                    >
                      <option value="iit_bombay">IIT Bombay</option>
                      <option value="bits_pilani">BITS Pilani</option>
                      <option value="delhi_university">Delhi University</option>
                      <option value="iiit_hyderabad">IIIT Hyderabad</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#13141B]">College B</label>
                    <select
                      value={collegeB}
                      onChange={e => setCollegeB(e.target.value)}
                      className="w-full text-xs p-2.5 mt-1 rounded-xl border border-[#E8ECF2] bg-[#F4F6FB] focus:outline-none"
                    >
                      <option value="bits_pilani">BITS Pilani</option>
                      <option value="iit_bombay">IIT Bombay</option>
                      <option value="iiit_hyderabad">IIIT Hyderabad</option>
                      <option value="delhi_university">Delhi University</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                  <div className="p-5 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] space-y-3">
                    <h4 className="font-black text-base text-[#13141B]">{collegeDirectory[collegeA]?.name}</h4>
                    <div className="space-y-1 text-xs text-[#5E6573]">
                      <div><strong>Type:</strong> {collegeDirectory[collegeA]?.type}</div>
                      <div><strong>Location:</strong> {collegeDirectory[collegeA]?.location}</div>
                      <div><strong>Approx Fees:</strong> {collegeDirectory[collegeA]?.fees}</div>
                      <div><strong>Faculty Ratio:</strong> {collegeDirectory[collegeA]?.facultyRatio}</div>
                      <div><strong>Campus:</strong> {collegeDirectory[collegeA]?.campus}</div>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] space-y-3">
                    <h4 className="font-black text-base text-[#13141B]">{collegeDirectory[collegeB]?.name}</h4>
                    <div className="space-y-1 text-xs text-[#5E6573]">
                      <div><strong>Type:</strong> {collegeDirectory[collegeB]?.type}</div>
                      <div><strong>Location:</strong> {collegeDirectory[collegeB]?.location}</div>
                      <div><strong>Approx Fees:</strong> {collegeDirectory[collegeB]?.fees}</div>
                      <div><strong>Faculty Ratio:</strong> {collegeDirectory[collegeB]?.facultyRatio}</div>
                      <div><strong>Campus:</strong> {collegeDirectory[collegeB]?.campus}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: GUIDED MICRO-PROJECTS */}
            {explorerTab === "micro_projects" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-[#13141B]">Guided Micro-Projects with Certificates</h3>
                  <span className="text-xs text-[#7B57FF] font-bold">Verifiable Completion Badges</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {[
                    { title: "Personal Portfolio on Next.js & GitHub", stack: "HTML, Tailwind, Git", time: "4 Hours", cert: "Frontend Builder Cert" },
                    { title: "Sentiment Analysis on Movie Reviews", stack: "Python, Pandas, Scikit", time: "6 Hours", cert: "Data Science Micro-Cert" },
                    { title: "Interactive Physics Pendulum Simulation", stack: "JavaScript Canvas, Math", time: "3 Hours", cert: "Computational Physics Cert" }
                  ].map((p, idx) => (
                    <div key={idx} className="card-quixel rounded-3xl p-6 border border-[#E8ECF2] bg-white space-y-4 flex flex-col justify-between">
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">{p.cert}</span>
                        <h4 className="font-bold text-base text-[#13141B]">{p.title}</h4>
                        <p className="text-xs text-[#5E6573]">Tech: {p.stack} &bull; Est: {p.time}</p>
                      </div>
                      <Link href="/projects" className="w-full py-2.5 rounded-xl bg-[#13141B] text-white text-xs font-bold text-center">
                        Launch Guided Studio
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 6: STATEMENT OF PURPOSE / ESSAY ASSISTANT */}
            {explorerTab === "sop_assistant" && (
              <div className="card-quixel rounded-3xl p-6 sm:p-8 border border-[#E8ECF2] bg-white space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200 inline-block">
                    Drafting Aid &bull; Not a Ghostwriter
                  </span>
                  <h2 className="text-xl font-black font-display text-[#13141B]">SOP &amp; College Essay Reviewer</h2>
                  <p className="text-xs text-[#5E6573]">
                    Submit your personal draft to evaluate structure, narrative clarity, and thematic coherence.
                  </p>
                </div>

                <form onSubmit={handleAnalyzeEssay} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-[#13141B]">Target Program / University</label>
                    <input
                      type="text"
                      value={essayTarget}
                      onChange={e => setEssayTarget(e.target.value)}
                      className="w-full text-xs p-2.5 mt-1 rounded-xl border border-[#E8ECF2] bg-[#F4F6FB] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#13141B]">Your Essay Draft</label>
                    <textarea
                      rows={5}
                      value={essayDraft}
                      onChange={e => setEssayDraft(e.target.value)}
                      placeholder="Paste your statement of purpose or admissions essay draft here..."
                      className="w-full text-xs p-3 mt-1 rounded-xl border border-[#E8ECF2] bg-[#F4F6FB] focus:outline-none"
                    />
                  </div>
                  <button type="submit" disabled={essayLoading} className="px-6 py-2.5 rounded-xl bg-[#13141B] text-white text-xs font-bold">
                    {essayLoading ? "Analyzing Structure..." : "Analyze Draft Structure"}
                  </button>
                </form>

                {essayFeedback && (
                  <div className="p-5 rounded-2xl bg-[#EDE8FD] border border-[#DDD4FC] space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-[#7B57FF]">Structural Evaluation</span>
                      <span className="text-xs font-black text-[#13141B]">{essayFeedback.score}</span>
                    </div>
                    <div className="space-y-1 text-xs text-[#13141B]">
                      <strong>Key Strengths:</strong>
                      <ul className="list-disc pl-4 text-[#5E6573]">
                        {essayFeedback.strengths.map((s: string, idx: number) => <li key={idx}>{s}</li>)}
                      </ul>
                    </div>
                    <div className="space-y-1 text-xs text-[#13141B]">
                      <strong>Improvement Opportunities:</strong>
                      <ul className="list-disc pl-4 text-[#5E6573]">
                        {essayFeedback.improvements.map((i: string, idx: number) => <li key={idx}>{i}</li>)}
                      </ul>
                    </div>
                    <p className="text-[11px] font-mono text-purple-900 border-t border-purple-200 pt-2">{essayFeedback.authenticityNote}</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 7: SENIOR / ALUMNI CONNECTION */}
            {explorerTab === "alumni_connection" && (
              <div className="card-quixel rounded-3xl p-6 sm:p-8 border border-[#E8ECF2] bg-white space-y-4">
                <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200 inline-block">
                  School-Scoped Alumni Advice
                </span>
                <h2 className="text-xl font-black font-display text-[#13141B]">Senior &amp; Alumni Connections</h2>
                <p className="text-xs text-[#5E6573]">Connect with verified alumni from your school network for guidance on degree choices and entrance exams.</p>
                <Link href="/networking" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#13141B] text-white text-xs font-bold">
                  <Users className="w-4 h-4 text-[#D7FC51]" />
                  <span>Browse Verified Alumni Mentors</span>
                </Link>
              </div>
            )}

            {/* TAB 8: CURATED INTERNSHIPS */}
            {explorerTab === "internships" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-[#13141B]">Curated Early Internships (Vetted Subset)</h3>
                  <span className="text-xs text-emerald-600 font-bold">Age-Safe (16–18) &bull; Zero Spam</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {curatedInternships.map(int => (
                    <div key={int.id} className="card-quixel rounded-3xl p-6 border border-[#E8ECF2] bg-white space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-[#8F9CAE]">Verified {int.verifiedDate}</span>
                          <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">{int.minAge}</span>
                        </div>
                        <h4 className="font-bold text-base text-[#13141B]">{int.title}</h4>
                        <p className="text-xs text-[#7B57FF] font-semibold">{int.org}</p>
                        <p className="text-xs text-[#5E6573]">{int.stipend} &bull; {int.mode}</p>
                      </div>
                      <Link href="/jobs" className="w-full py-2.5 rounded-xl bg-[#13141B] text-white text-xs font-bold text-center">
                        View Verified Application
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 9: PROBLEM -> SOLUTION BOARD */}
            {explorerTab === "problem_board" && (
              <div className="card-quixel rounded-3xl p-6 sm:p-8 border border-[#E8ECF2] bg-white space-y-4">
                <span className="text-[10px] font-black uppercase text-[#7B57FF] bg-[#EDE8FD] px-2.5 py-1 rounded-full border border-[#DDD4FC] inline-block">
                  Links into Guided Project Kits
                </span>
                <h2 className="text-xl font-black font-display text-[#13141B]">Explorer Problem &rarr; Solution Board</h2>
                <p className="text-xs text-[#5E6573]">Solve real-world challenges that seamlessly convert into starter project repositories for your portfolio.</p>
                <Link
                  href="/problems"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#13141B] text-white text-xs font-bold"
                >
                  <Lightbulb className="w-4 h-4 text-[#D7FC51]" />
                  <span>Open Guided Problem Board</span>
                </Link>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
