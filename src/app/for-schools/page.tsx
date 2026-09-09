"use client";

import React, { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { CheckCircle2, ShieldCheck, GraduationCap, Building2, Send, ArrowRight } from "lucide-react";

export default function ForSchoolsPage() {
  const [submitted, setSubmitted] = useState(false);
  const [institutionName, setInstitutionName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [cohortSize, setCohortSize] = useState("50-200");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-paper py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-forest/10 text-forest border border-forest/20">
            For Educators &amp; Institutional Leaders
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold font-display text-ink tracking-tight">
            Safe, Purpose-Built Learning Infrastructure for Schools &amp; Colleges
          </h1>
          <p className="text-sm text-ink-soft">
            Deliver calibrated career telemetry, moderated study groups, and AI skill training while enforcing strict student privacy and teacher visibility boundaries.
          </p>
        </div>

        {/* Direct Workspace Portals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-paper-raised p-6 sm:p-8 rounded-3xl border border-line space-y-4 flex flex-col justify-between shadow-sm">
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300 inline-block">
                K-12 School Faculty &bull; Classes 6–12
              </span>
              <h2 className="text-xl font-bold font-display text-ink">School Teachers Studio</h2>
              <p className="text-xs text-ink-soft leading-relaxed">
                5E lesson planning, auto-grading rubrics, classroom cohorts, and DPDP-compliant parent progress digests.
              </p>
            </div>
            <Link
              href="/school/teacher"
              className="w-full py-3 rounded-2xl bg-forest hover:bg-forest-light text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <span>Launch School Teacher Studio</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-paper-raised p-6 sm:p-8 rounded-3xl border border-line space-y-4 flex flex-col justify-between shadow-sm">
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-100 text-purple-900 border border-purple-300 inline-block">
                Universities &amp; Placement Cells (TPO)
              </span>
              <h2 className="text-xl font-bold font-display text-ink">Colleges &amp; Higher Ed Portal</h2>
              <p className="text-xs text-ink-soft leading-relaxed">
                Multi-tier campus placement drives, GitHub capstone evaluations, hackathons, and NIRF/NAAC accreditation reports.
              </p>
            </div>
            <Link
              href="/colleges"
              className="w-full py-3 rounded-2xl bg-ink hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <span>Launch Colleges &amp; Placement Hub</span>
              <ArrowRight className="w-4 h-4 text-accent" />
            </Link>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-paper-raised p-6 rounded-3xl border border-line space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-forest/10 text-forest flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold font-display text-ink">Narrow Progress Visibility</h3>
            <p className="text-xs text-ink-soft leading-relaxed">
              Teachers see only subject-relevant quest progress. Private journals, emails, and interview video streams are strictly protected by Postgres RLS.
            </p>
          </div>

          <div className="bg-paper-raised p-6 rounded-3xl border border-line space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-forest/10 text-forest flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold font-display text-ink">Classroom Study Lounges</h3>
            <p className="text-xs text-ink-soft leading-relaxed">
              Automated content filtering, peer study rooms, and mandatory AI Ethics modules built directly into the school curriculum.
            </p>
          </div>

          <div className="bg-paper-raised p-6 rounded-3xl border border-line space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-forest/10 text-forest flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold font-display text-ink">Campus Placement Tools</h3>
            <p className="text-xs text-ink-soft leading-relaxed">
              For colleges: manage institutional placement drives, student mock interview benchmarks, and verified portfolio exports.
            </p>
          </div>
        </div>

        {/* Lead Capture Demo Request */}
        <div className="bg-paper-raised rounded-3xl p-8 sm:p-10 border border-line shadow-lg max-w-2xl mx-auto space-y-6">
          {submitted ? (
            <div className="p-8 text-center space-y-3 animate-in fade-in">
              <div className="w-12 h-12 rounded-full bg-forest/10 text-forest flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold font-display text-ink">Demo Request Received</h2>
              <p className="text-xs text-ink-soft">
                Thank you, {contactName}. Our institutional partnerships team will contact you at <strong>{email}</strong> within 1 business day.
              </p>
              <div className="pt-4">
                <Button variant="secondary" href="/">
                  Return to Homepage
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <h2 className="text-xl font-bold font-display text-ink">Request an Institutional Walkthrough</h2>
                <p className="text-xs text-ink-soft mt-1">
                  Tell us about your school, college, or training foundation.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink uppercase mb-1">Institution Name</label>
                <input
                  type="text"
                  required
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  placeholder="E.g., Delhi Public School, R.K. Puram"
                  className="w-full p-3 rounded-xl border border-line bg-paper-soft text-xs text-ink font-bold focus:outline-none focus:border-forest"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-ink uppercase mb-1">Contact Person</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Principal / Placement Head"
                    className="w-full p-3 rounded-xl border border-line bg-paper-soft text-xs text-ink font-bold focus:outline-none focus:border-forest"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink uppercase mb-1">Official Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@institution.edu"
                    className="w-full p-3 rounded-xl border border-line bg-paper-soft text-xs text-ink font-bold focus:outline-none focus:border-forest"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink uppercase mb-1">Estimated Student Cohort Size</label>
                <select
                  value={cohortSize}
                  onChange={(e) => setCohortSize(e.target.value)}
                  className="w-full p-3 rounded-xl border border-line bg-paper-soft text-xs text-ink font-bold focus:outline-none focus:border-forest"
                >
                  <option value="50-200">50 – 200 Students</option>
                  <option value="200-1000">200 – 1,000 Students</option>
                  <option value="1000+">1,000+ Students (Campus-wide)</option>
                </select>
              </div>

              <Button variant="primary" type="submit" className="w-full" icon={<Send className="w-4 h-4" />}>
                Submit Demo Request
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
