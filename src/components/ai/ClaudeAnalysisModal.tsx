"use client";

import React, { useState } from "react";
import { 
  X, 
  Sparkles, 
  Bot, 
  Terminal, 
  Code2, 
  FileText, 
  Layers, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  TrendingUp, 
  ShieldCheck, 
  Zap,
  Copy,
  Check
} from "lucide-react";
import { ClaudeAnalysisType } from "@/app/api/claude/analyze/route";

interface ClaudeAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: ClaudeAnalysisType;
  initialContent?: string;
  metadata?: Record<string, any>;
}

export default function ClaudeAnalysisModal({
  isOpen,
  onClose,
  defaultType = "code_review",
  initialContent = "",
  metadata = {}
}: ClaudeAnalysisModalProps) {
  const [selectedType, setSelectedType] = useState<ClaudeAnalysisType>(defaultType);
  const [content, setContent] = useState(initialContent);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleRunAnalysis = async () => {
    if (!content.trim()) {
      setError("Please enter or paste the content to analyze.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/claude/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedType,
          content: content.trim(),
          metadata
        })
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to complete Claude MCP analysis.");
      }

      setResult(json.analysis);
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred during Claude analysis.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-300 flex items-center justify-center font-bold">
              <Bot className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-tight">Claude MCP Deep Analyzer</h3>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Claude 3.5 Sonnet
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Automated code review, ATS resume calibration, system architecture &amp; interview scoring
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type Selector Tabs */}
        <div className="px-6 pt-3 pb-2 border-b border-slate-100 flex gap-2 overflow-x-auto bg-slate-50">
          {[
            { id: "code_review", label: "Code Review", icon: Code2 },
            { id: "resume_ats", label: "Resume ATS Match", icon: FileText },
            { id: "project_architecture", label: "System Architecture", icon: Layers },
            { id: "appraisal_performance", label: "Self-Appraisal", icon: TrendingUp },
            { id: "interview_response", label: "Interview STAR", icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = selectedType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedType(tab.id as ClaudeAnalysisType);
                  setResult(null);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  isSelected
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-white">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Input Area */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-slate-500" />
                <span>Input Data / Source Text</span>
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                {content.length} characters
              </span>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              placeholder={
                selectedType === "code_review"
                  ? "Paste your TypeScript, Python, or Go code snippet for architecture, security, and complexity analysis..."
                  : selectedType === "resume_ats"
                  ? "Paste your resume experience section or project bullets to calculate ATS score and keyword matching..."
                  : selectedType === "project_architecture"
                  ? "Describe your project components, APIs, database, and caching strategy..."
                  : selectedType === "appraisal_performance"
                  ? "Paste your self-appraisal draft to optimize business impact metrics and leadership positioning..."
                  : "Paste your behavioral or technical interview response for STAR framework breakdown..."
              }
              className="w-full p-3.5 text-xs font-mono rounded-2xl border border-slate-300 bg-slate-50 focus:bg-white text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Action Trigger */}
          <div className="flex justify-end">
            <button
              onClick={handleRunAnalysis}
              disabled={loading || !content.trim()}
              className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 active:bg-black text-white text-xs font-bold uppercase tracking-wider shadow-md disabled:opacity-50 flex items-center gap-2 cursor-pointer transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Analyzing with Claude MCP...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>Run Claude Analysis</span>
                </>
              )}
            </button>
          </div>

          {/* Analysis Result Display */}
          {result && (
            <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Overall Score Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-900">Analysis Verdict</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {result.mcpAuditBadge || "Claude Verified"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {result.summary || result.architectureSummary}
                  </p>
                </div>

                {result.overallScore !== undefined && (
                  <div className="text-right shrink-0">
                    <span className="text-2xl font-black text-slate-900 font-mono">
                      {result.overallScore}
                    </span>
                    <span className="text-xs font-bold text-slate-400">/100</span>
                    <p className="text-[10px] font-semibold text-emerald-600">Calibrated</p>
                  </div>
                )}
              </div>

              {/* Metrics Grid if available */}
              {result.metrics && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {Object.entries(result.metrics).map(([key, val]: any) => (
                    <div key={key} className="p-3 bg-white rounded-2xl border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {key}
                      </span>
                      <div className="text-base font-black text-slate-900 font-mono">
                        {val}%
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Findings & Recommendations */}
              {result.findings && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-800">Key Audit Findings</h4>
                  <div className="space-y-2">
                    {result.findings.map((f: any, idx: number) => (
                      <div key={idx} className="p-3 bg-white rounded-2xl border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">{f.category}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase font-semibold">
                            {f.severity}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">{f.message}</p>
                        {f.suggestion && (
                          <p className="text-[11px] text-amber-700 font-medium">
                            &rarr; Suggestion: {f.suggestion}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ATS Checklist & Keywords */}
              {result.atsChecklist && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-800">ATS Parsing Verification</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {Object.entries(result.atsChecklist).map(([k, v]: any) => (
                      <div key={k} className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="font-bold text-slate-900 font-mono text-[11px]">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Keywords */}
              {result.recommendedKeywords && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-800">High-Impact Industry Keywords</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {result.recommendedKeywords.map((kw: string) => (
                      <span key={kw} className="px-2.5 py-1 rounded-xl text-[11px] font-mono bg-white border border-slate-300 text-slate-800 font-medium">
                        +{kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Bullet Optimizations */}
              {result.bulletOptimizations && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-800">Optimized STAR Bullet Points</h4>
                  <div className="space-y-2">
                    {result.bulletOptimizations.map((b: any, idx: number) => (
                      <div key={idx} className="p-3 bg-white rounded-2xl border border-slate-200 space-y-1.5">
                        <div className="text-[11px] text-slate-500 line-through">
                          {b.before}
                        </div>
                        <div className="text-xs text-slate-900 font-medium bg-emerald-50/70 p-2 rounded-xl border border-emerald-200 flex items-start justify-between gap-2">
                          <span>{b.after}</span>
                          <button
                            onClick={() => copyToClipboard(b.after)}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 shrink-0"
                            title="Copy optimized bullet"
                          >
                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Architecture Components */}
              {result.systemComponents && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-800">System Architecture Topology</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {result.systemComponents.map((c: any, idx: number) => (
                      <div key={idx} className="p-3 bg-white rounded-2xl border border-slate-200 space-y-1">
                        <div className="text-xs font-bold text-slate-900">{c.name}</div>
                        <div className="text-[10px] font-mono text-slate-500">{c.protocol}</div>
                        <p className="text-[11px] text-slate-600 leading-snug">{c.role}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interview Talking Points */}
              {result.interviewTalkingPoints && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-800">Senior Interview Talking Points</h4>
                  <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                    {result.interviewTalkingPoints.map((tp: string, idx: number) => (
                      <li key={idx}>{tp}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Privacy & Minor Safety Notice */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              Claude MCP Analysis runs within user-controlled token boundaries. No training on student data.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
          <span className="text-[11px] text-slate-500 font-mono">
            Claude MCP Active &bull; Multi-tier Analysis
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider shadow-sm cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
