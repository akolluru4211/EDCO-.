import React from "react";
import Link from "next/link";
import { Sparkles, Target, ShieldCheck, Users, ArrowRight, HeartHandshake } from "lucide-react";
import Button from "@/components/ui/Button";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-paper py-16 px-4 sm:px-6 lg:px-8 text-ink">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-forest bg-forest/10 border border-forest/20">
            Our Mission &amp; Standard
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold font-display text-ink tracking-tight">
            Real Adaptivity for Every Career Stage
          </h1>
          <p className="text-base text-ink-soft max-w-2xl mx-auto leading-relaxed">
            From Class 9 students building early foundation skills to adult professionals landing senior roles — Edworld Co adapts ATS resumes, mock interviews, and learning paths to your demonstrated effective level.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-paper-raised p-8 rounded-3xl border border-line shadow-sm space-y-3 hover:shadow-md hover:border-forest/30 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-forest/10 text-forest flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-display text-ink">Stage-Aware Progression</h3>
            <p className="text-xs text-ink-soft leading-relaxed">
              We never show adult job boards to school minors, and we never show basic school trivia to working software engineers. Every track is purpose-built with its own distinct visual mode and tools.
            </p>
          </div>

          <div className="bg-paper-raised p-8 rounded-3xl border border-line shadow-sm space-y-3 hover:shadow-md hover:border-forest/30 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-forest/10 text-forest flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-display text-ink">Strict Privacy by Design</h3>
            <p className="text-xs text-ink-soft leading-relaxed">
              Under-18 students are protected with zero public profile leakage, private growth journals, and strict parental consent workflows adhering to international child safety benchmarks.
            </p>
          </div>

          <div className="bg-paper-raised p-8 rounded-3xl border border-line shadow-sm space-y-3 hover:shadow-md hover:border-forest/30 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-gold/15 text-gold-dark flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-display text-ink">AI Calibration, Not Guesswork</h3>
            <p className="text-xs text-ink-soft leading-relaxed">
              Our interview intelligence engine delivers speech-rate analysis, filler-word tracking, and STAR-method rubric scoring calibrated dynamically to your demonstrated skill level.
            </p>
          </div>

          <div className="bg-paper-raised p-8 rounded-3xl border border-line shadow-sm space-y-3 hover:shadow-md hover:border-forest/30 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-forest/10 text-forest flex items-center justify-center">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-display text-ink">Ethical Institutional Integrity</h3>
            <p className="text-xs text-ink-soft leading-relaxed">
              Educational and institutional partners receive aggregate-only telemetry, preserving individual learner autonomy.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-paper-raised text-ink border border-line rounded-3xl p-8 sm:p-10 text-center space-y-6 shadow-sm">
          <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight">
            Ready to Begin Your Growth Journey?
          </h2>
          <p className="text-xs sm:text-sm text-ink-soft max-w-xl mx-auto">
            Create your account today and experience an AI career &amp; learning platform that grows with you.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Button
              href="/auth/signup"
              variant="primary"
            >
              Get Started Free
            </Button>
            <Button
              href="/pricing"
              variant="secondary"
            >
              View Plans &amp; Pricing
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
