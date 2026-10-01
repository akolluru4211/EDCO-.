"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  User as UserIcon, 
  BookOpen, 
  GraduationCap, 
  RotateCcw, 
  ChevronDown, 
  Minimize2, 
  Maximize2, 
  HelpCircle, 
  Lightbulb, 
  ArrowUpRight, 
  Loader2, 
  Globe, 
  Briefcase, 
  Layers, 
  Search,
  Brain,
  Zap,
  Flame,
  CheckCircle2,
  Trash2,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  sourceUrl?: string;
  sourceTitle?: string;
}

interface CognitiveMemoryState {
  totalInteractions: number;
  frequentTopics: Array<{ topic: string; queryCount: number; estimatedMastery?: string }>;
  searchedTechnologies: Array<{ tech: string; searchCount: number }>;
  strugglePoints: Array<{ concept: string; severity?: string; advice?: string }>;
}

const DEFAULT_STARTERS = [
  { label: "🎯 Match Jobs to My Resume", prompt: "Can you analyze my resume background and recommend the best matching jobs and missing keywords?" },
  { label: "🎙️ Practice Mock Interview", prompt: "I want to practice a STAR mock interview for a Full-Stack Software Engineer role. What should I prepare?" },
  { label: "🌐 Search Latest AI & Cloud Trends", prompt: "Search the latest 2026 tech stack requirements for modern AI and Full-Stack cloud engineering." },
  { label: "📐 Solve DSA / System Design Doubt", prompt: "Can you explain how Redis distributed caching prevents database latency spikes under high concurrent traffic?" },
  { label: "💻 Explain Agent-Reach Architecture", prompt: "Can you explain what Agent-Reach (https://github.com/Panniantong/Agent-Reach.git) is and how it enables 0-cost platform access?" },
];

export default function MyraChatbot() {
  const { user, profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMemoryOpen, setIsMemoryOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toolState, setToolState] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hasUnread, setHasUnread] = useState(false);
  const [memoryState, setMemoryState] = useState<CognitiveMemoryState>({
    totalInteractions: 0,
    frequentTopics: [],
    searchedTechnologies: [],
    strugglePoints: [],
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize greeting with context awareness
  useEffect(() => {
    const studentName = profile?.name || user?.name || "Student";
    const initialGreeting: ChatMessage = {
      id: "initial-welcome",
      role: "assistant",
      content: `Hello **${studentName}**! 👋 I'm **Myra**, your dedicated AI Academic Mentor & Personal Career Companion at Edworld Co.\n\nI learn from everything you ask, search, and practice. I'm equipped with live web browsing, repository reach, resume-to-job matching, and 3D mock interview drills.\n\nWhat would you like to master or explore today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages([initialGreeting]);

    // Load initial user learning memory if logged in
    if (user?.uid) {
      fetch(`/api/ai/myra?userId=${user.uid}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.memory) {
            setMemoryState({
              totalInteractions: d.memory.totalInteractions || 0,
              frequentTopics: d.memory.frequentTopics || [],
              searchedTechnologies: d.memory.searchedTechnologies || [],
              strugglePoints: d.memory.strugglePoints || [],
            });
          }
        })
        .catch(() => {});
    }
  }, [user?.name, user?.uid, profile?.name]);

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      setTimeout(() => {
        inputRef.current?.focus();
        scrollToBottom();
      }, 150);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!customPrompt) setInput("");
    setIsLoading(true);

    const lowerQuery = textToSend.toLowerCase();
    if (lowerQuery.includes("search") || lowerQuery.includes("google") || lowerQuery.includes("browse") || lowerQuery.includes("latest")) {
      setToolState("🌐 Searching live web & documentation...");
    } else if (lowerQuery.includes("resume") || lowerQuery.includes("job")) {
      setToolState("📄 Inspecting resume & matching sector opportunities...");
    } else if (lowerQuery.includes("interview")) {
      setToolState("🎙️ Calibrating mock interview questions...");
    } else {
      setToolState("🧠 Synthesizing pedagogical response...");
    }

    try {
      // Build student profile context
      const profileContext = {
        name: profile?.name || user?.name || "Student",
        gradeLevel: profile?.gradeLevel || user?.gradeLevel || "College / Undergraduate",
        careerStage: profile?.careerStage || user?.careerStage || "STUDENT",
        cgpa: (profile as any)?.cgpa || 8.5,
        targetSector: (profile as any)?.targetSector || "AI & Software Engineering",
        targetRole: profile?.targetRole || "Software Engineer",
        interests: profile?.interests || [],
        dailyStudyHours: 2,
        institution: profile?.institution || "University Partner",
        frequentTopics: memoryState.frequentTopics,
        searchedTechnologies: memoryState.searchedTechnologies,
        strugglePoints: memoryState.strugglePoints,
      };

      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/ai/myra", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend.trim(),
          userId: user?.uid,
          profile: profileContext,
          history: historyPayload,
        }),
      });

      const data = await res.json();
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.reply || "I am here to help you solve doubts, match jobs, and practice interviews. Please try asking again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        sourceUrl: data.webReach?.url,
        sourceTitle: data.webReach?.title,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      if (!isOpen) setHasUnread(true);

      // Sync updated cognitive memory if returned
      if (data.memory) {
        setMemoryState({
          totalInteractions: data.memory.totalInteractions || memoryState.totalInteractions + 1,
          frequentTopics: data.memory.frequentTopics || memoryState.frequentTopics,
          searchedTechnologies: data.memory.searchedTechnologies || memoryState.searchedTechnologies,
          strugglePoints: data.memory.strugglePoints || memoryState.strugglePoints,
        });
      }
    } catch (err) {
      console.error("Myra chatbot fetch error:", err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: "I ran into a temporary connection issue. You can practice in our [3D Mock Interview Studio](/interviews) or explore [Resume Studio](/resumes) while I reconnect!",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setToolState(null);
    }
  };

  const handleClearChat = () => {
    const studentName = profile?.name || user?.name || "Student";
    setMessages([
      {
        id: `clear-${Date.now()}`,
        role: "assistant",
        content: `Chat cleared! Ready for your next inquiry, **${studentName}**. Ask me any doubt, search the web, or match jobs with your resume!`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  const handleResetMemory = async () => {
    if (!user?.uid) return;
    try {
      await fetch(`/api/ai/myra?userId=${user.uid}&action=reset`);
      setMemoryState({
        totalInteractions: 0,
        frequentTopics: [],
        searchedTechnologies: [],
        strugglePoints: [],
      });
      setIsMemoryOpen(false);
    } catch (e) {
      console.warn("Reset memory note:", e);
    }
  };

  // Generate dynamic starter prompts based on what student recently struggled with or searched
  const dynamicStarters = memoryState.strugglePoints.length > 0
    ? [
        {
          label: `⚡ Practice ${memoryState.strugglePoints[0].concept} Drill`,
          prompt: `Can you give me a step-by-step intuitive breakdown and practice problem for ${memoryState.strugglePoints[0].concept}?`,
        },
        ...DEFAULT_STARTERS.slice(0, 4),
      ]
    : memoryState.searchedTechnologies.length > 0
    ? [
        {
          label: `🔍 Deep Dive ${memoryState.searchedTechnologies[0].tech} Interview Questions`,
          prompt: `What are the top senior engineering interview questions asked about ${memoryState.searchedTechnologies[0].tech}?`,
        },
        ...DEFAULT_STARTERS.slice(0, 4),
      ]
    : DEFAULT_STARTERS;

  // Simple Markdown text renderer for bold, bullet points, and links
  const renderFormattedContent = (content: string) => {
    const parts = content.split(/(\[[^\]]+\]\([^)]+\)|\*\*.*?\*\*|\n)/g);
    
    return parts.map((part, index) => {
      if (!part) return null;
      
      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        const [, label, href] = linkMatch;
        return (
          <Link
            key={index}
            href={href}
            className="text-emerald-700 dark:text-[#00D2B4] underline font-semibold hover:opacity-80 inline-flex items-center gap-0.5"
          >
            {label}
            <ArrowUpRight className="w-3 h-3 inline" />
          </Link>
        );
      }

      if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
        return <strong key={index} className="font-bold text-[#13141B] dark:text-white">{part.slice(2, -2)}</strong>;
      }

      if (part === "\n") {
        return <br key={index} />;
      }

      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Trigger Button with 3D Avatar */}
      {!isOpen && (
        <div className="relative group">
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-3 px-4 py-2.5 bg-slate-950 hover:bg-slate-900 text-white rounded-full shadow-2xl border border-slate-800 transition-all transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-[#00D2B4]/30"
            aria-label="Open Myra AI Academic Assistant"
          >
            <div className="relative w-9 h-9 rounded-full overflow-hidden border border-[#00D2B4]/50 bg-slate-900 shrink-0">
              <Image
                src="/images/myra-avatar.png"
                alt="Myra AI"
                fill
                className="object-cover object-top"
              />
              {hasUnread && (
                <span className="absolute top-0 right-0 w-3 h-3 bg-[#00D2B4] border-2 border-slate-950 rounded-full animate-ping" />
              )}
            </div>
            <div className="text-left pr-1 hidden sm:block">
              <div className="text-xs font-bold flex items-center gap-1.5 leading-none text-white">
                <span>Ask Myra AI</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#00D2B4] animate-pulse"></span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium leading-none mt-1">Doubt Solver &bull; Web &bull; Careers</p>
            </div>
          </button>
        </div>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="relative w-[360px] sm:w-[430px] h-[620px] max-h-[85vh] bg-slate-950 text-slate-100 rounded-3xl shadow-2xl border border-slate-800 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          
          {/* Header */}
          <div className="bg-slate-900 px-4 py-3.5 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-2xl overflow-hidden border border-[#00D2B4]/60 bg-slate-950 shadow-md">
                <Image
                  src="/images/myra-avatar.png"
                  alt="Myra AI"
                  fill
                  className="object-cover object-top"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#00D2B4] border-2 border-slate-950 rounded-full"></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm text-white leading-none">Myra</h3>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-[#00D2B4]/20 text-[#00D2B4] border border-[#00D2B4]/30">
                    Adaptive Companion
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 leading-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                  Live Web &bull; Behavioral Memory
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-400">
              {/* Myra Memory Toggle Button */}
              <button
                onClick={() => setIsMemoryOpen(!isMemoryOpen)}
                title="View what Myra learned about you"
                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border flex items-center gap-1 transition-all ${
                  isMemoryOpen 
                    ? "bg-[#00D2B4]/20 text-[#00D2B4] border-[#00D2B4]/40"
                    : "bg-slate-800/80 text-slate-300 border-slate-700 hover:text-white"
                }`}
              >
                <Brain className="w-3 h-3 text-[#00D2B4]" />
                <span className="hidden sm:inline">Memory</span>
              </button>

              <button
                onClick={handleClearChat}
                title="Clear conversation"
                className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="Clear chat"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Minimize chatbot"
                className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="Close chatbot"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Student Profile Context Ribbon */}
          {user && (
            <div className="bg-slate-900/60 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-[11px] text-slate-300">
              <div className="flex items-center gap-1.5 font-medium truncate">
                <GraduationCap className="w-3.5 h-3.5 text-[#00D2B4] shrink-0" />
                <span className="truncate">
                  {profile?.gradeLevel || user?.gradeLevel || "Student"} &bull; {profile?.targetRole || "Software Engineer"}
                </span>
              </div>
              <span className="text-[10px] bg-[#00D2B4]/10 text-[#00D2B4] border border-[#00D2B4]/30 font-semibold px-2 py-0.5 rounded-full shrink-0">
                {memoryState.totalInteractions > 0 ? `${memoryState.totalInteractions} Insights Learned` : "Learning Active"}
              </span>
            </div>
          )}

          {/* MYRA COGNITIVE MEMORY INSPECTOR DRAWER */}
          {isMemoryOpen && (
            <div className="p-4 bg-slate-900 border-b border-slate-800 space-y-3 animate-in slide-in-from-top-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-[#00D2B4] uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5" /> What Myra Learned About You
                </span>
                <button
                  onClick={handleResetMemory}
                  className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center gap-1 font-bold"
                  title="Reset Myra's memory"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Reset Memory</span>
                </button>
              </div>

              {/* Frequent Topics */}
              {memoryState.frequentTopics.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Frequently Explored Concepts:</span>
                  <div className="flex flex-wrap gap-1">
                    {memoryState.frequentTopics.map((t, idx) => (
                      <span key={idx} className="text-[10px] font-mono bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-slate-300">
                        {t.topic} ({t.queryCount}x)
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Searched Tech */}
              {memoryState.searchedTechnologies.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Searched Tech Stacks:</span>
                  <div className="flex flex-wrap gap-1">
                    {memoryState.searchedTechnologies.map((t, idx) => (
                      <span key={idx} className="text-[10px] font-mono text-[#00D2B4] bg-[#00D2B4]/10 border border-[#00D2B4]/30 px-2 py-0.5 rounded">
                        {t.tech} ({t.searchCount}x)
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Growth Areas */}
              {memoryState.strugglePoints.length > 0 && (
                <div className="space-y-1 pt-1 border-t border-slate-800">
                  <span className="text-[10px] text-amber-400 font-bold uppercase flex items-center gap-1">
                    <Flame className="w-3 h-3" /> Recommended Practice Area:
                  </span>
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-200 truncate">{memoryState.strugglePoints[0].concept}</span>
                    <button
                      onClick={() => handleSend(`Can you give me a 5-minute practice drill on ${memoryState.strugglePoints[0].concept}?`)}
                      className="text-[10px] font-bold text-[#00D2B4] hover:underline shrink-0"
                    >
                      Start Drill &rarr;
                    </button>
                  </div>
                </div>
              )}

              {memoryState.frequentTopics.length === 0 && memoryState.searchedTechnologies.length === 0 && (
                <p className="text-[11px] text-slate-400 italic">
                  Ask doubts, search technologies, or practice mock interviews. Myra will continuously extract concepts to personalize your sessions.
                </p>
              )}
            </div>
          )}

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-950">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="relative w-7 h-7 rounded-full overflow-hidden border border-[#00D2B4]/50 bg-slate-900 shrink-0 mt-0.5">
                    <Image
                      src="/images/myra-avatar.png"
                      alt="Myra"
                      fill
                      className="object-cover object-top"
                    />
                  </div>
                )}
                
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm ${
                    msg.role === "user"
                      ? "bg-[#00D2B4] text-slate-950 rounded-tr-none font-semibold"
                      : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none font-normal"
                  }`}
                >
                  <div className="whitespace-pre-wrap break-words">
                    {renderFormattedContent(msg.content)}
                  </div>

                  {msg.sourceUrl && (
                    <div className="mt-2 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center gap-1">
                      <Globe className="w-3 h-3 text-[#00D2B4]" />
                      <span className="truncate">Source: {msg.sourceTitle || msg.sourceUrl}</span>
                    </div>
                  )}

                  <div
                    className={`text-[9px] mt-1.5 text-right ${
                      msg.role === "user" ? "text-slate-800" : "text-slate-500"
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>

                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                    <UserIcon className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 items-center">
                <div className="relative w-7 h-7 rounded-full overflow-hidden border border-[#00D2B4]/50 bg-slate-900 shrink-0">
                  <Image
                    src="/images/myra-avatar.png"
                    alt="Myra"
                    fill
                    className="object-cover object-top"
                  />
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none px-4 py-2.5 text-xs text-slate-300 flex items-center gap-2 shadow-sm">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00D2B4]" />
                  <span>{toolState || "Myra is thinking..."}</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Starter Chips */}
          <div className="p-2.5 bg-slate-900/90 border-t border-slate-800">
            <div className="flex items-center gap-1.5 mb-1.5 text-[10px] text-slate-400 font-semibold px-1">
              <Lightbulb className="w-3 h-3 text-[#00D2B4]" />
              <span>Personalized Adaptive Prompts</span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {dynamicStarters.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(chip.prompt)}
                  disabled={isLoading}
                  className="whitespace-nowrap px-2.5 py-1 text-[11px] font-medium bg-slate-950 hover:bg-[#00D2B4]/10 hover:text-[#00D2B4] hover:border-[#00D2B4]/40 border border-slate-800 rounded-xl text-slate-300 transition-colors shrink-0 disabled:opacity-50"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a doubt, search the web, or match jobs..."
              disabled={isLoading}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00D2B4]/40 focus:border-[#00D2B4] transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2.5 bg-[#00D2B4] hover:bg-[#00BF9F] text-slate-950 rounded-2xl disabled:opacity-40 transition-all shadow-md shrink-0 flex items-center justify-center font-bold"
              aria-label="Send message"
            >
              <Send className="w-4 h-4 text-slate-950" />
            </button>
          </form>

        </div>
      )}
    </div>
  );
}
