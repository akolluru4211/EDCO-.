"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { 
  ShieldCheck, 
  ArrowLeft, 
  Sparkles, 
  Briefcase, 
  Building, 
  CheckCircle2, 
  AlertCircle,
  Lock
} from "lucide-react";

export const dynamic = "force-dynamic";

export default function BecomeMentorPage() {
  const router = useRouter();
  const { user } = useAuth();

  const isMinor = user?.ageBand === "13-15" || user?.ageBand === "16-18";

  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [domains, setDomains] = useState<string[]>(["Software Engineering"]);
  const [availability, setAvailability] = useState("Sat 11:00 AM IST, Sun 4:00 PM IST");
  const [linkedInUrl, setLinkedInUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const AVAILABLE_DOMAINS = [
    "Software Engineering",
    "System Design",
    "Behavioral Leadership",
    "Machine Learning",
    "UI/UX Design",
    "Data Science",
    "Cloud Architecture",
  ];

  const toggleDomain = (d: string) => {
    setDomains((prev) => (prev.includes(d) ? prev.filter((item) => item !== d) : [...prev, d]));
  };

  if (isMinor) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-mono font-bold uppercase tracking-wider">
              Adults (18+) Only
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Mentor Registration</h1>
            <p className="text-xs text-slate-600 leading-relaxed">
              Mentor registration requires working professional age verification under Edworld safety standards.
            </p>
          </div>
          <Link
            href="/networking"
            className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider shadow-md flex items-center justify-center gap-2"
          >
            <span>Back to Networking Hub</span>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !role.trim() || domains.length === 0) {
      setError("Please specify your company, role, and at least one mentorship domain.");
      return;
    }
    setError(null);
    setIsSuccess(true);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
          <Link href="/networking" className="hover:text-slate-900 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Networking Hub</span>
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-bold">Become a Mentor</span>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-2 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold font-mono border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Verified Mentor Program
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Register as an Industry Mentor
            </h1>
          </div>

          {isSuccess ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900">Application Submitted!</h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Your mentor profile is under automated verification. You will receive an email once your corporate credentials are confirmed.
                </p>
              </div>
              <Link
                href="/networking"
                className="inline-block px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold uppercase tracking-wider shadow-md"
              >
                Back to Networking Hub
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {error && (
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Company *</label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Google, Stripe, Microsoft"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Job Role / Title *</label>
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Staff Software Engineer"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Profile Headline</label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. 10+ yrs distributed systems engineering &amp; high-volume concurrency"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Mentorship Bio</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Describe your technical background, what areas you love helping with, and your mentorship style..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Mentorship Domains</label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {AVAILABLE_DOMAINS.map((domain) => (
                    <button
                      type="button"
                      key={domain}
                      onClick={() => toggleDomain(domain)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        domains.includes(domain)
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {domain}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">LinkedIn Profile</label>
                  <input
                    type="url"
                    value={linkedInUrl}
                    onChange={(e) => setLinkedInUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">GitHub Profile</label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/username"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Link
                  href="/networking"
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold uppercase tracking-wider hover:bg-slate-50"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase tracking-wider shadow-md"
                >
                  Submit Mentor Profile
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
