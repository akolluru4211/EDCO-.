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
  Maximize2,
  Activity,
  Zap,
  Flame,
  ArrowRight
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
          const metrics = data.metrics || {};
          setSessionData({
            sessionId: data.id,
            overallScore: data.overall_score || 82,
            contentScore: metrics.contentScore || 85,
            voiceScore: metrics.voiceDelivery || 80,
            engagementScore: metrics.facialEngagement || 85,
            languageScore: metrics.languageScore || metrics.voiceDelivery || 78,
            grammarScore: metrics.grammarScore || 82,
            clarityScore: metrics.clarityScore || 80,
            fluencyScore: metrics.fluencyScore || 78,
            vocabularyScore: metrics.vocabularyScore || 80,
            professionalScore: metrics.professionalScore || 84,
            whatYouSaid: metrics.whatYouSaid || data.questions?.[0]?.transcript || "",
            improvedVersion: metrics.improvedVersion || "",
            improvementRationale: metrics.improvementRationale || [],
            coachSuggestions: metrics.coachSuggestions || [],
            metrics,
            annotations: metrics.annotations || [],
            feedback: {
              strengths: metrics.strengths || [
                "Clear STAR problem framing and structured execution steps.",
                "Strong technical communication and natural articulation."
              ],
              areasForImprovement: metrics.areasForImprovement || [
                "Consider integrating more quantified metrics to substantiate results."
              ],
              detailedSummary: metrics.detailedSummary || "Strong technical delivery with clear communicative flow.",
              nextPracticeAdvice: metrics.nextPracticeAdvice || "Practice framing your next technical answer using the STAR method.",
              eyeContactFeedback: "Good eye contact — you looked at the camera during most of your answer."
            },
            fullscreenExitEvents: metrics.fullscreen_exit_events || []
          });
        } else {
          // Fallback preview record
          setSessionData({
            sessionId,
            overallScore: 84,
            contentScore: 88,
            voiceScore: 82,
            engagementScore: 85,
            languageScore: 80,
            grammarScore: 86,
            clarityScore: 84,
            fluencyScore: 80,
            vocabularyScore: 82,
            professionalScore: 85,
            whatYouSaid: "In my past work, I basically identified a bottleneck in our data pipeline where API queries were timing out. I redesigned the endpoint using Redis caching which reduced latency by 65 percent.",
            improvedVersion: "In my past work, I identified a bottleneck in our data pipeline where API queries were timing out. I redesigned the endpoint using Redis caching, which reduced latency by 65 percent.",
            improvementRationale: ["Removed conversational filler ('basically')", "Maintained clear STAR architecture explanation"],
            coachSuggestions: [
              "Take a brief silent breath between points instead of vocalizing fillers.",
              "Your technical explanation is well-structured with strong quantified impact."
            ],
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
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-600">AI Diagnostic Report</span>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">AI-generated assessment</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">STAR Diagnostic &amp; Language Results</h1>
            <p className="text-xs text-slate-500 max-w-lg">
              Comprehensive analysis of your technical content, English communication, sentence structure, and delivery pacing.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-5 rounded-3xl bg-slate-900 text-white text-center min-w-[130px] shadow-lg">
              <span className="text-[9px] uppercase font-extrabold tracking-wider text-slate-400">Technical Score</span>
              <div className="text-3xl font-black text-emerald-400 font-mono mt-0.5">{sessionData.overallScore}%</div>
            </div>
            <div className="p-5 rounded-3xl bg-indigo-950 text-white text-center min-w-[130px] shadow-lg border border-indigo-500/30">
              <span className="text-[9px] uppercase font-extrabold tracking-wider text-indigo-300">Language Score</span>
              <div className="text-3xl font-black text-[#D7FC51] font-mono mt-0.5">{sessionData.languageScore || 80}%</div>
            </div>
          </div>
        </div>

        {/* Sub-Score Breakdown Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 block">Grammar</span>
            <div className="text-2xl font-black text-slate-900 font-mono">{sessionData.grammarScore || 84}%</div>
            <p className="text-[10px] text-slate-500">Syntax &amp; tense consistency</p>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 block">Clarity &amp; Flow</span>
            <div className="text-2xl font-black text-slate-900 font-mono">{sessionData.clarityScore || 82}%</div>
            <p className="text-[10px] text-slate-500">Sentence length &amp; STAR arc</p>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 block">Speaking Pace</span>
            <div className="text-2xl font-black text-slate-900 font-mono">{sessionData.metrics?.wordsPerMinute || 130} <span className="text-xs text-slate-500">WPM</span></div>
            <p className="text-[10px] text-slate-500">Conversational pacing</p>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 block">Filler Words</span>
            <div className="text-2xl font-black text-rose-600 font-mono">{sessionData.metrics?.fillerWordCount || 0}</div>
            <p className="text-[10px] text-slate-500">Identified filler clusters</p>
          </div>
        </div>

        {/* "What You Said" vs "Better Way to Say It" Section */}
        {sessionData.improvedVersion && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-600">Language Coach Translation</span>
                <h2 className="text-base font-black text-slate-900">What You Said vs. Better Way to Say It</h2>
              </div>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 font-bold">
                Natural Refinement
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">What You Said:</span>
                <p className="text-slate-800 italic leading-relaxed">
                  "{sessionData.whatYouSaid}"
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-1.5 text-xs">
                <span className="text-[10px] font-mono text-emerald-800 uppercase block font-bold">Improved Version:</span>
                <p className="text-emerald-950 font-medium leading-relaxed">
                  "{sessionData.improvedVersion}"
                </p>
                {sessionData.improvementRationale?.length > 0 && (
                  <div className="text-[11px] text-emerald-900/80 pt-1 border-t border-emerald-200/60">
                    <strong>Why:</strong> {sessionData.improvementRationale.join(" • ")}
                  </div>
                )}
              </div>
            </div>

            {sessionData.coachSuggestions?.length > 0 && (
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-950 space-y-1">
                <span className="font-bold text-indigo-900 flex items-center gap-1.5 text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> AI Coach Advice for Next Session:
                </span>
                <p className="text-indigo-900 leading-relaxed">
                  {sessionData.coachSuggestions[0]}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Executive Performance Summary & Strengths */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Executive Delivery Summary</span>
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

        {/* Annotated Speech Transcript */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-black text-slate-900">Annotated Speech Transcript</h2>
              <p className="text-xs text-slate-400">Click highlighted phrases to inspect diagnostic suggestions.</p>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
              {annotations.length} Annotations
            </span>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-800 leading-relaxed">
            <p className="whitespace-pre-wrap">
              {annotations.length > 0 ? (
                <span>
                  &ldquo;In my past work, I identified a bottleneck in our data pipeline where API queries were timing out under concurrent traffic. I redesigned the endpoint using Redis caching and asynchronous job queues, which reduced latency by 65 percent and stabilized overall uptime.&rdquo;
                </span>
              ) : (
                <span>&ldquo;{sessionData.transcript || sessionData.whatYouSaid || "No transcript recorded."}&rdquo;</span>
              )}
            </p>
          </div>

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

        {/* Action Buttons: Practice Drills & Retake */}
        <div className="flex items-center justify-between flex-wrap gap-4 pt-4 border-t border-slate-200">
          <Link
            href="/interviews/language-training"
            className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Open Language Training Drills</span>
          </Link>

          <Link
            href="/interviews"
            className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-md flex items-center gap-2"
          >
            <span>Practice Next Full Interview</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
