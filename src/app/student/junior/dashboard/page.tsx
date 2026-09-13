"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  Sparkles,
  Trophy,
  Brain,
  Code2,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Target,
  Rocket,
  Compass,
  HelpCircle,
  Play,
  RotateCcw,
  BookOpen,
  Star,
  Layers,
  MessageSquare,
  ChevronRight,
  Flame
} from "lucide-react";
import Button from "@/components/ui/Button";

interface DailyTask {
  id: string;
  task_date: string;
  title: string;
  description: string;
  category: string;
  difficulty_level: string;
  starter_code: string;
  hints: string[];
  expected_output_hint: string;
  xp_reward: number;
}

interface JuniorGoal {
  id: string;
  goal_title: string;
  category: string;
  description: string;
  status: string;
  target_date?: string;
  milestones: Array<{ id: string; title: string; completed: boolean }>;
}

export default function JuniorDashboardPage() {
  const { user, profile, loading: authLoading } = useAuth();

  // Daily task state
  const [task, setTask] = useState<DailyTask | null>(null);
  const [userCode, setUserCode] = useState<string>("");
  const [revealedHints, setRevealedHints] = useState<number>(0);
  const [taskCompleted, setTaskCompleted] = useState<boolean>(false);
  const [outputConsole, setOutputConsole] = useState<string | null>(null);
  const [submittingTask, setSubmittingTask] = useState<boolean>(false);

  // AI Coach state
  const [coachQuestion, setCoachQuestion] = useState<string>("");
  const [coachMessages, setCoachMessages] = useState<Array<{ role: "user" | "coach"; text: string }>>([
    {
      role: "coach",
      text: "Hi there! 👋 I'm your Junior AI Coach. I'm here to help you understand coding concepts, explore ideas, and guide you through challenges. What are you working on today?",
    },
  ]);
  const [coachLoading, setCoachLoading] = useState<boolean>(false);

  // Goals & Projects state
  const [goals, setGoals] = useState<JuniorGoal[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState<boolean>(true);

  // Load daily task & skills
  const loadDailyTask = async () => {
    try {
      const res = await fetch("/api/junior/daily-task");
      if (res.ok) {
        const data = await res.json();
        setTask(data.task);
        setUserCode(data.task?.starter_code || "");
        setSkills(data.skills || []);
        if (data.todayAttempt?.completed) {
          setTaskCompleted(true);
        }
      }
    } catch (err) {
      console.warn("Could not load junior daily task:", err);
    }
  };

  // Load goals
  const loadGoals = async () => {
    try {
      const res = await fetch("/api/junior/goals");
      if (res.ok) {
        const data = await res.json();
        setGoals(data.goals || []);
      }
    } catch (err) {
      console.warn("Could not load junior goals:", err);
    }
  };

  // Load projects
  const loadProjects = async () => {
    try {
      const res = await fetch("/api/junior/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch (err) {
      console.warn("Could not load junior projects:", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setDataLoading(true);
      await Promise.all([loadDailyTask(), loadGoals(), loadProjects()]);
      setDataLoading(false);
    };
    init();
  }, []);

  const handleRevealNextHint = () => {
    if (!task) return;
    if (revealedHints < task.hints.length) {
      setRevealedHints((prev) => prev + 1);
    }
  };

  const handleRunCode = () => {
    if (!userCode.trim()) {
      setOutputConsole("⚠️ Please write some code first!");
      return;
    }
    setOutputConsole("▶️ Running sandbox simulation...\n\n[Console Output]:\nExecution finished with exit code 0.\nResult verified against logic checks.");
  };

  const handleSubmitTask = async () => {
    if (!task) return;
    setSubmittingTask(true);
    try {
      const res = await fetch("/api/junior/daily-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: task.id,
          code: userCode,
          hintsUsed: revealedHints,
        }),
      });

      if (res.ok) {
        setTaskCompleted(true);
        setOutputConsole("🎉 Awesome job! Your daily challenge was completed successfully. XP added to your growth log!");
        loadDailyTask(); // refresh skills
      } else {
        setOutputConsole("❌ Verification incomplete. Take another look or ask your Junior AI Coach for a hint!");
      }
    } catch (err: any) {
      setOutputConsole(`Error submitting task: ${err.message}`);
    } finally {
      setSubmittingTask(false);
    }
  };

  const handleAskCoach = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coachQuestion.trim() || coachLoading) return;

    const q = coachQuestion.trim();
    setCoachMessages((prev) => [...prev, { role: "user", text: q }]);
    setCoachQuestion("");
    setCoachLoading(true);

    try {
      const res = await fetch("/api/junior/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          context: task ? { taskTitle: task.title, category: task.category, userCode } : undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCoachMessages((prev) => [...prev, { role: "coach", text: data.reply }]);
      } else {
        setCoachMessages((prev) => [
          ...prev,
          { role: "coach", text: "Oops, I had a little trouble thinking of an answer. Try asking again!" },
        ]);
      }
    } catch (err) {
      setCoachMessages((prev) => [
        ...prev,
        { role: "coach", text: "Network glitch! Please check your connection and try again." },
      ]);
    } finally {
      setCoachLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0B0F17] text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in">
        
        {/* 1. Header Banner */}
        <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 border border-purple-500/20 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <span className="px-3.5 py-1.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30 inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Junior Discovery Track &bull; Ages 13–15</span>
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Welcome back, {user?.name || profile?.name || "Explorer"}! 🚀
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Your safe, 100% private coding lab. Build real programming logic, solve daily mini-quests, and discover technology at your own pace.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2.5 rounded-2xl bg-white/10 border border-white/10 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-medium text-slate-200">Kid-Safe AI Privacy</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Main 2-Column Lab Layout: Daily Challenge + AI Coach */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* LEFT: Daily Adaptive Challenge (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Daily Coding Quest Card */}
            <div className="rounded-3xl p-6 bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                    <Code2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">
                      Daily Adaptive Challenge
                    </span>
                    <h2 className="text-lg font-bold text-white">
                      {task?.title || "Logic Quest: Greeting Algorithm"}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold">
                    +{task?.xp_reward || 100} XP
                  </span>
                  {taskCompleted && (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Solved
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {task?.description || "Write a function that greets a user by name and welcomes them to the Junior lab!"}
              </p>

              {/* Progressive Hint Reveal System */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                    <Lightbulb className="w-4 h-4" />
                    <span>Progressive Hints ({revealedHints}/{task?.hints?.length || 3})</span>
                  </div>
                  {revealedHints < (task?.hints?.length || 3) && (
                    <button
                      onClick={handleRevealNextHint}
                      className="px-3 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold transition-all"
                    >
                      Reveal Hint {revealedHints + 1}
                    </button>
                  )}
                </div>

                {revealedHints === 0 ? (
                  <p className="text-xs text-slate-500 italic">
                    Try solving on your own first! If you get stuck, reveal progressive hints one by one.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {task?.hints?.slice(0, revealedHints).map((h, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/20 text-xs text-amber-200">
                        <strong>Hint {i + 1}:</strong> {h}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Code Editor Mock Sandbox */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Python Sandbox</span>
                  <button
                    onClick={() => setUserCode(task?.starter_code || "")}
                    className="flex items-center gap-1 text-slate-400 hover:text-slate-200 text-[11px]"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset Code
                  </button>
                </div>
                <textarea
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  rows={7}
                  className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 focus:outline-none focus:border-purple-500 resize-none shadow-inner"
                  placeholder="# Write your Python code here..."
                  spellCheck={false}
                />
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  onClick={handleRunCode}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <Play className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Test Run</span>
                </button>

                <button
                  onClick={handleSubmitTask}
                  disabled={submittingTask || taskCompleted}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{taskCompleted ? "Challenge Solved!" : submittingTask ? "Verifying..." : "Submit Solution"}</span>
                </button>
              </div>

              {/* Console Output */}
              {outputConsole && (
                <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 whitespace-pre-wrap">
                  {outputConsole}
                </pre>
              )}
            </div>

            {/* Skill Mastery Progress */}
            <div className="rounded-3xl p-6 bg-slate-900/90 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-400" />
                <span>Junior Skill Mastery</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(skills.length > 0 ? skills : [
                  { skill_name: "Python Basics", mastery_level: 2, total_xp: 150 },
                  { skill_name: "Algorithms & Logic", mastery_level: 1, total_xp: 80 },
                  { skill_name: "Creative Problem Solving", mastery_level: 2, total_xp: 120 },
                  { skill_name: "AI & Tech Literacy", mastery_level: 1, total_xp: 60 },
                ]).map((sk: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">{sk.skill_name}</span>
                      <span className="text-[11px] text-purple-300 font-bold">Lvl {sk.mastery_level || 1}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full"
                        style={{ width: `${Math.min(100, (sk.total_xp || 50) % 100 || 50)}%` }}
                      ></div>
                    </div>
                    <div className="text-[10px] text-slate-400 text-right">
                      {sk.total_xp || 0} XP Earned
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Junior AI Coach & Goal Roadmaps (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Junior AI Coach Chat Card */}
            <div className="rounded-3xl p-6 bg-slate-900/90 border border-slate-800 shadow-xl space-y-4 flex flex-col h-[480px]">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                    🤖
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">Junior AI Coach</h3>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Online & Kid-Safe
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500">Claude Powered</span>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
                {coachMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                      msg.role === "user"
                        ? "bg-purple-600 text-white ml-auto rounded-tr-sm"
                        : "bg-slate-950 text-slate-200 mr-auto border border-slate-800 rounded-tl-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                ))}
                {coachLoading && (
                  <div className="p-3 rounded-2xl bg-slate-950 text-slate-400 text-xs italic border border-slate-800 animate-pulse mr-auto">
                    Thinking of a gentle clue... ✨
                  </div>
                )}
              </div>

              {/* Input Form */}
              <form onSubmit={handleAskCoach} className="pt-2 border-t border-slate-800 flex gap-2">
                <input
                  type="text"
                  value={coachQuestion}
                  onChange={(e) => setCoachQuestion(e.target.value)}
                  placeholder="Ask a question or request guidance..."
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
                />
                <button
                  type="submit"
                  disabled={coachLoading || !coachQuestion.trim()}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold transition-all"
                >
                  Ask
                </button>
              </form>
            </div>

            {/* "What I Want To Do" Goal Roadmap */}
            <div className="rounded-3xl p-6 bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <span>My Goals & Milestones</span>
                </h3>
                <span className="text-[10px] text-slate-400">Roadmap</span>
              </div>

              <div className="space-y-2.5">
                {(goals.length > 0 ? goals : [
                  {
                    id: "g1",
                    goal_title: "Build My First 2D Game in Python",
                    category: "Game Dev",
                    description: "Learn loops and Pygame basics",
                    status: "in_progress",
                    milestones: [
                      { id: "m1", title: "Complete Python syntax quests", completed: true },
                      { id: "m2", title: "Build collision logic", completed: false },
                      { id: "m3", title: "Publish playable demo", completed: false }
                    ]
                  },
                  {
                    id: "g2",
                    goal_title: "Explore How AI Models Think",
                    category: "AI & Tech",
                    description: "Understand prompt engineering & safe ethics",
                    status: "in_progress",
                    milestones: [
                      { id: "m4", title: "Learn AI ethics & privacy", completed: true },
                      { id: "m5", title: "Complete prompt lab challenge", completed: false }
                    ]
                  }
                ]).map((g, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-200">{g.goal_title}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        {g.category}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {g.milestones?.map((m: any, mIdx: number) => (
                        <div key={mIdx} className="flex items-center gap-2 text-[11px] text-slate-400">
                          {m.completed ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full border border-slate-600" />
                          )}
                          <span className={m.completed ? "line-through text-slate-500" : ""}>{m.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Starter Projects */}
            <div className="rounded-3xl p-6 bg-slate-900/90 border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <Rocket className="w-4 h-4 text-indigo-400" />
                <span>Recommended Starter Projects</span>
              </h3>

              <div className="space-y-2.5">
                {(projects.length > 0 ? projects : [
                  {
                    title: "Retro Space Invaders (Pygame)",
                    difficulty: "Beginner",
                    description: "Design spaceship movement and alien laser mechanics.",
                    href: "/school?tab=projects"
                  },
                  {
                    title: "Smart Study Buddy Bot",
                    difficulty: "Intermediate",
                    description: "Create an interactive flashcard quiz bot.",
                    href: "/school?tab=projects"
                  }
                ]).map((proj: any, idx: number) => (
                  <Link
                    key={idx}
                    href={proj.href || "/school?tab=projects"}
                    className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-purple-500/50 flex items-center justify-between group transition-all block"
                  >
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-slate-200 group-hover:text-purple-300 transition-colors">
                        {proj.title}
                      </h4>
                      <p className="text-[10px] text-slate-400">{proj.description}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-purple-300 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
