"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { 
  Users, 
  Mic, 
  Send, 
  CheckCircle2, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  Award, 
  RotateCcw,
  Volume2
} from "lucide-react";

export default function MockPanelInterviewPage() {
  const { user } = useAuth();
  const [targetRole, setTargetRole] = useState("Staff Software Engineer");
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [turns, setTurns] = useState<any[]>([]);
  const [userInput, setUserInput] = useState("");
  const [loadingTurn, setLoadingTurn] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const startPanel = async () => {
    setStarted(true);
    setLoadingTurn(true);
    try {
      const res = await fetch("/api/interview/panel/turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetRole, step: 0 })
      });
      const data = await res.json();
      if (data.success) {
        setTurns([data.turn]);
        setStep(1);
        setTimeout(async () => {
          const res2 = await fetch("/api/interview/panel/turn", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ targetRole, step: 1 })
          });
          const data2 = await res2.json();
          if (data2.success) {
            setTurns((prev) => [...prev, data2.turn]);
            setStep(2);
          }
          setLoadingTurn(false);
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setLoadingTurn(false);
    }
  };

  const handleSendResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || loadingTurn) return;

    const userTurn = {
      speaker: "user",
      name: user?.name || "Candidate",
      role: "Candidate",
      text: userInput.trim(),
      timestamp: new Date().toISOString()
    };

    setTurns((prev) => [...prev, userTurn]);
    const currentInput = userInput;
    setUserInput("");
    setLoadingTurn(true);

    try {
      const res = await fetch("/api/interview/panel/turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetRole, step, userMessage: currentInput })
      });
      const data = await res.json();
      if (data.success) {
        setTurns((prev) => [...prev, data.turn]);
        setStep(data.nextStep);
        if (data.panelComplete) {
          setIsCompleted(true);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTurn(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E0F15] text-slate-100 p-4 sm:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          href="/interviews"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Interview Hub</span>
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl bg-[#151621] border border-white/10 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg">
              <Users className="w-6 h-6 text-[#D7FC51]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-white">Mock Panel Interview Studio</h1>
                <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 text-[10px] font-bold border border-violet-500/30">
                  3-Persona Evaluation
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Sequential interview rounds with Technical Lead, Hiring Manager &amp; Culture Director</p>
            </div>
          </div>
        </div>

        {!started ? (
          <div className="p-8 rounded-3xl bg-[#151621] border border-white/10 space-y-6 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <h2 className="text-base font-black text-white">Select Your Target Role</h2>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white text-center font-bold"
              />
              <button
                onClick={startPanel}
                className="px-6 py-3 rounded-2xl bg-[#D7FC51] hover:bg-[#cbf13f] text-slate-950 font-black text-xs shadow-lg transition-all"
              >
                Commence Panel Session
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-3">
              {turns.map((t, idx) => {
                const isUser = t.speaker === "user";
                return (
                  <div
                    key={idx}
                    className={"p-4 sm:p-5 rounded-2xl border space-y-1.5 " + (
                      isUser
                        ? "bg-indigo-950/40 border-indigo-500/40 ml-8"
                        : "bg-[#151621] border-white/10 mr-8"
                    )}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className={"font-bold " + (isUser ? "text-indigo-300" : "text-[#D7FC51]")}>
                        {t.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{t.role}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">{t.text}</p>
                  </div>
                );
              })}

              {loadingTurn && (
                <div className="p-4 rounded-2xl bg-[#151621] border border-white/10 text-xs text-slate-400 animate-pulse">
                  Interviewer is listening and preparing next response...
                </div>
              )}
            </div>

            {!isCompleted ? (
              <form onSubmit={handleSendResponse} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type your response to the panel..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-2xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#D7FC51]"
                />
                <button
                  type="submit"
                  disabled={loadingTurn || !userInput.trim()}
                  className="px-5 py-3 rounded-2xl bg-[#D7FC51] disabled:opacity-50 text-slate-950 font-black text-xs flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </button>
              </form>
            ) : (
              <div className="p-6 rounded-3xl bg-emerald-500/20 border border-emerald-500/30 text-center space-y-3">
                <Award className="w-8 h-8 text-[#D7FC51] mx-auto" />
                <h3 className="text-base font-black text-white">Panel Interview Completed!</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  You successfully handled technical architecture, engineering leadership, and culture alignment questions.
                </p>
                <Link
                  href="/interviews"
                  className="inline-block px-5 py-2 rounded-xl bg-[#D7FC51] text-slate-950 text-xs font-bold"
                >
                  Return to Interview Hub
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
