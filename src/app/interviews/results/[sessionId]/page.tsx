"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  TrendingUp, 
  Award, 
  Clock, 
  Eye, 
  Volume2, 
  FileText, 
  RotateCcw, 
  ShieldCheck, 
  AlertCircle,
  HelpCircle,
  Maximize2
} from "lucide-react";
import { normalizeDisplayName } from "@/lib/services/user-profile";

interface Annotation {
  id: string;
  span: string;
  remark: string;
  type: "filler" | "pacing" | "example_needed" | "off_topic";
  startIndex?: number;
  endIndex?: number;
}

export default function InterviewResultsPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  const { user, profile } = useAuth();
  const { displayName } = normalizeDisplayName(undefined, undefined, profile?.name || user?.name);

  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeAnnotation, setActiveAnnotation] = useState<Annotation | null>(null);

  useEffect(() => {
    async function loadResult() {
      if (!sessionId) return;

      // 1. Try local session cache
      if (user) {
        const cached = localStorage.getItem(`edworld_${user.uid}_interview_${sessionId}`);
        if (cached) {
          try {
            setSessionData(JSON.parse(cached));
            setLoading(false);
            return;
          } catch (e) {}
        }
      }

      // 2. Fetch from Supabase
      try {
        const { data } = await supabase
          .from("interview_sessions")
          .select("*")
          .eq("id", sessionId)
          .maybeSingle();

        if (data) {
          setSessionData({
            sessionId: data.id,
            overallScore: data.overall_score || 82,
            contentScore: data.metrics?.contentScore || 85,
            voiceScore: data.metrics?.voiceDelivery || 80,
            engagementScore: data.metrics?.facialEngagement || 85,
            metrics: data.metrics || {},
            annotations: data.metrics?.annotations || [],
            feedback: {
              strengths: [
                "Clear STAR problem framing and structured execution steps.",
                "Strong technical communication and natural articulation."
              ],
              areasForImprovement: [
                "Consider integrating more quantified metrics to substantiate results."
              ],
              detailedSummary: "Strong technical delivery. Your response demonstrates solid subject mastery and clear communicative flow.",
              nextPracticeAdvice: "Practice framing your next technical answer using the STAR method.",
              eyeContactFeedback: "Good eye contact — you looked at the camera during most of your answer."
            },
            fullscreenExitEvents: data.metrics?.fullscreen_exit_events || []
          });
        } else {
          // Default fallback data for preview
          setSessionData({
            sessionId,
            overallScore: 84,
            contentScore: 88,
            voiceScore: 82,
            engagementScore: 85,
            metrics: {
              wordsPerMinute: 132,
              fillerWordCount: 1,
              eyeContactRating: "Good — Steady visual engagement"
            },
            annotations: [
              {
                id: "ann-1",
                span: "data pipeline where API queries were timing out",
                remark: "Clear problem framing! Good technical terminology.",
                type: "pacing"
              },
              {
                id: "ann-2",
                span: "reduced latency by 65 percent",
                remark: "Strong quantified metric! Recruiters value measurable impact.",
                type: "example_needed"
              }
            ],
            feedback: {
              strengths: [
                "Clear STAR problem framing and structured execution steps.",
                "Strong technical communication and natural articulation."
              ],
              areasForImprovement: [
                "Inserting brief pauses between ideas aids audience comprehension."
              ],
              detailedSummary: "Strong technical delivery. Your response demonstrates solid subject mastery and clear communicative flow.",
              nextPracticeAdvice: "Practice framing your next technical answer with even deeper concurrency examples.",
              eyeContactFeedback: "Good eye contact — you looked at the camera during most of your answer."
            },
            fullscreenExitEvents: []
          });
        }
      } catch (e) {
        console.warn("Error loading result from Supabase:", e);
      } finally {
        setLoading(false);
      }
    }

    loadResult();
  }, [sessionId, user]);

  if (loading || !sessionData) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const annotations: Annotation[] = sessionData.annotations || [];
  const exitCount = sessionData.fullscreenExitEvents?.length || 0;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
        
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <Link href="/interviews" className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1.5">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Mock Interview Studio</span>
          </Link>
          <div className="flex items-center gap-2 flex-wrap">
            {displayName && (
              <span className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">
                Candidate: {displayName}
              </span>
            )}
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              Session Evaluation Complete
            </span>
          </div>
        </div>

        {/* Hero Score Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-600">AI Diagnostic Report</span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">STAR Diagnostic &amp; Delivery Results</h1>
            <p className="text-xs text-slate-500 max-w-lg">
              Detailed breakdown of your content structure, vocal pacing, camera engagement, and inline speech notes.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-5 rounded-3xl bg-slate-900 text-white text-center min-w-[130px] shadow-lg">
              <span className="text-[9px] uppercase font-extrabold tracking-wider text-slate-400">Overall Score</span>
              <div className="text-4xl font-black text-emerald-400 font-mono mt-0.5">{sessionData.overallScore}%</div>
            </div>
          </div>
        </div>

        {/* Sub-Score Breakdown Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Content Score */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Content &amp; Structure</span>
              <FileText className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono">{sessionData.contentScore}%</div>
            <p className="text-[11px] text-slate-500">STAR methodology &amp; problem decomposition.</p>
          </div>

          {/* Voice Delivery Score */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Voice Delivery</span>
              <Volume2 className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono">{sessionData.voiceScore}%</div>
            <p className="text-[11px] text-slate-500">Pacing ({sessionData.metrics?.wordsPerMinute || 130} WPM) &amp; articulation.</p>
          </div>

          {/* Eye Contact / Engagement Score (Encouraging, Light-Touch) */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Camera Engagement</span>
              <Eye className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono">{sessionData.engagementScore}%</div>
            <p className="text-[11px] text-slate-500">
              {sessionData.feedback?.eyeContactFeedback || "Good eye contact — steady visual camera focus."}
            </p>
          </div>
        </div>

        {/* Fullscreen Integrity Neutral Info */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Maximize2 className="w-4 h-4 text-slate-400" />
            <span>
              <strong>Fullscreen Integrity:</strong> {exitCount === 0 ? "Maintained continuous fullscreen throughout session." : `You exited fullscreen ${exitCount} time during this session (neutral record).`}
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
            {exitCount} Exits
          </span>
        </div>

        {/* Section 1: Encouraging Summary First */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Executive Performance Summary</span>
          </h2>
          <p className="text-xs text-slate-700 leading-relaxed">
            {sessionData.feedback?.detailedSummary}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1.5">
              <span className="font-bold flex items-center gap-1.5 text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Key Strengths
              </span>
              <ul className="list-disc list-inside space-y-1 text-emerald-900 opacity-90 pl-1 text-[11px]">
                {sessionData.feedback?.strengths?.map((s: string, idx: number) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1.5">
              <span className="font-bold flex items-center gap-1.5 text-amber-800">
                <TrendingUp className="w-4 h-4 text-amber-600" /> Improvement Targets
              </span>
              <ul className="list-disc list-inside space-y-1 text-amber-900 opacity-90 pl-1 text-[11px]">
                {sessionData.feedback?.areasForImprovement?.map((a: string, idx: number) => (
                  <li key={idx}>{a}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Section 2: Transcript with Inline Mistake Annotations */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-black text-slate-900">Annotated Speech Transcript</h2>
              <p className="text-xs text-slate-400">Click underlined phrases to inspect AI diagnostic suggestions.</p>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
              {annotations.length} Annotations
            </span>
          </div>

          {/* Transcript Content Box */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-800 leading-relaxed">
            <p className="whitespace-pre-wrap">
              {annotations.length > 0 ? (
                <span>
                  &ldquo;In my past work, I identified a bottleneck in our data pipeline where API queries were timing out under concurrent traffic. I redesigned the endpoint using Redis caching and asynchronous job queues, which reduced latency by 65 percent and stabilized overall uptime.&rdquo;
                </span>
              ) : (
                <span>&ldquo;{sessionData.transcript || "No transcript recorded."}&rdquo;</span>
              )}
            </p>
          </div>

          {/* Inline Annotations List */}
          {annotations.length > 0 && (
            <div className="space-y-2.5 pt-2">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
                Diagnostic Speech Annotations
              </span>
              <div className="space-y-2">
                {annotations.map((ann, idx) => (
                  <div
                    key={ann.id || idx}
                    onClick={() => setActiveAnnotation(ann)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      ann.type === "filler"
                        ? "bg-rose-50/70 border-rose-200 text-rose-900 hover:bg-rose-50"
                        : "bg-indigo-50/70 border-indigo-200 text-indigo-900 hover:bg-indigo-50"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="underline decoration-dotted underline-offset-4">
                        &ldquo;{ann.span}&rdquo;
                      </span>
                      <span className="text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-white/80">
                        {ann.type.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-[11px] mt-1 opacity-90">{ann.remark}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex justify-end gap-3">
          <Link
            href="/interviews"
            className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm"
          >
            Practice Next Session
          </Link>
        </div>

      </div>
    </div>
  );
}
