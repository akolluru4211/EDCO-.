"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { 
  Bot, 
  Send, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  ExternalLink, 
  Loader2, 
  FileText, 
  Video, 
  Briefcase, 
  ShieldCheck, 
  Terminal,
  HelpCircle,
  Zap,
  Code2
} from "lucide-react";
import { CopilotMessage } from "@/lib/types/career-intelligence";

const STARTER_PROMPTS = [
  "What should I work on today based on my target role?",
  "What evidence supports my Python and React skills?",
  "Why am I struggling with technical interviews?",
  "What are the top 3 gaps for Full Stack Software Engineer?",
  "How can I tailor my resume for higher ATS pass rates?"
];

export default function CareerCopilotPage() {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: "msg_welcome",
      role: "assistant",
      content: `Hello ${profile?.name?.split(" ")[0] || "there"}! I'm your **EdWorld Career Copilot**.\n\nI have real-time access to your Career Intelligence Graph, verified project evidence, historical mock interview scores, and active target role requirements.\n\nAsk me anything about what to practice today, how to close skill gaps, or how to strengthen your portfolio proof.`,
      createdAt: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const messageContent = (textToSend || input).trim();
    if (!messageContent || loading) return;

    const userMsg: CopilotMessage = {
      id: `user_${Date.now()}`,
      role: "user",
      content: messageContent,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/career/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageContent })
      });

      if (!res.ok) throw new Error("Failed to contact Career Copilot");
      const data = await res.json();

      const assistantMsg: CopilotMessage = {
        id: `asst_${Date.now()}`,
        role: "assistant",
        content: data.reply,
        evidenceCitations: data.evidenceCitations,
        actionShortcuts: data.actionShortcuts,
        createdAt: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: "assistant",
          content: "I ran into a temporary issue retrieving your career evidence. Please try asking again.",
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6FB] py-8 px-4 sm:px-6 lg:px-8 font-sans selection:bg-[#D7FC51] selection:text-black flex flex-col justify-between">
      <div className="max-w-5xl mx-auto w-full space-y-6 flex-1 flex flex-col">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8ECF2] shadow-sm">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E0FAF6] text-[#00D2B4] text-xs font-bold font-mono">
              <Bot className="w-3.5 h-3.5" />
              <span>TRACEABLE AI COPILOT</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-[#13141B] tracking-tight">
              Career Copilot
            </h1>
            <p className="text-xs sm:text-sm text-[#5E6573]">
              Context-grounded assistant analyzing your verifiable evidence, skill gaps, and daily practice plans.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/career/readiness">
              <button className="px-4 py-2 rounded-2xl bg-[#F4F6FB] hover:bg-[#E8ECF2] text-xs font-bold text-[#13141B] transition-colors">
                Readiness View
              </button>
            </Link>
            <Link href="/career/applications">
              <button className="px-4 py-2 rounded-2xl bg-[#F4F6FB] hover:bg-[#E8ECF2] text-xs font-bold text-[#13141B] transition-colors">
                Applications
              </button>
            </Link>
          </div>
        </div>

        {/* Chat History Box */}
        <div className="flex-1 bg-white rounded-3xl border border-[#E8ECF2] shadow-sm p-6 sm:p-8 space-y-6 overflow-y-auto max-h-[600px] flex flex-col">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${
                msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
                  msg.role === "user"
                    ? "bg-[#13141B] text-white"
                    : "bg-[#E0FAF6] text-[#00D2B4]"
                }`}
              >
                {msg.role === "user" ? (
                  <span className="text-xs font-bold font-mono">YOU</span>
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
              </div>

              <div
                className={`rounded-3xl p-5 text-xs sm:text-sm space-y-3 leading-relaxed ${
                  msg.role === "user"
                    ? "bg-[#13141B] text-white"
                    : "bg-[#F4F6FB] text-[#13141B] border border-[#E8ECF2]"
                }`}
              >
                <div className="whitespace-pre-line">{msg.content}</div>

                {/* Evidence Citations */}
                {msg.evidenceCitations && msg.evidenceCitations.length > 0 && (
                  <div className="pt-3 border-t border-[#E8ECF2] space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#8E95A5]">
                      Evidence Citations:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {msg.evidenceCitations.map((cite, idx) => (
                        <Link
                          key={idx}
                          href={cite.url || "#"}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-[#E8ECF2] text-[11px] font-bold text-[#7B57FF] hover:bg-[#F0F2F6] transition-colors"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span>{cite.title}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Shortcuts */}
                {msg.actionShortcuts && msg.actionShortcuts.length > 0 && (
                  <div className="pt-2 flex flex-wrap gap-2">
                    {msg.actionShortcuts.map((action, idx) => (
                      <Link
                        key={idx}
                        href={action.href}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#13141B] text-white text-[11px] font-bold hover:bg-[#2A2C38] transition-transform hover:scale-105"
                      >
                        <span>{action.label}</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 mr-auto max-w-xl animate-in fade-in">
              <div className="w-9 h-9 rounded-2xl bg-[#E0FAF6] text-[#00D2B4] flex items-center justify-center shrink-0">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <div className="rounded-3xl p-4 bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#5E6573] flex items-center gap-2 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-[#7B57FF] animate-pulse" />
                <span>Synthesizing career graph & evidence...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Starter Prompts */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[11px] font-bold text-[#8E95A5] whitespace-nowrap">Suggested:</span>
          {STARTER_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="px-3 py-1.5 rounded-xl bg-white border border-[#E8ECF2] text-[11px] font-bold text-[#5E6573] hover:text-[#13141B] hover:border-[#13141B]/30 whitespace-nowrap transition-colors cursor-pointer shadow-xs"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <div className="bg-white rounded-3xl p-3 border border-[#E8ECF2] shadow-md flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask Copilot about today's practice, missing evidence, or interview feedback..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="flex-1 px-4 py-3 bg-transparent text-xs sm:text-sm text-[#13141B] focus:outline-none placeholder:text-[#8E95A5]"
          />

          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="p-3.5 rounded-2xl bg-[#13141B] text-white hover:bg-[#2A2C38] disabled:opacity-40 transition-all cursor-pointer shadow-sm flex items-center justify-center shrink-0"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>

      </div>
    </div>
  );
}
