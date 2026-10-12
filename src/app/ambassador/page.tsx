"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { 
  Award, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Send, 
  Building2, 
  Users, 
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  Gift,
  Share2,
  ExternalLink
} from "lucide-react";

export default function CampusAmbassadorApplicationPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<any>(null);
  const [ambassador, setAmbassador] = useState<any>(null);

  // Form fields
  const [collegeName, setCollegeName] = useState(profile?.institution || "");
  const [degreeYear, setDegreeYear] = useState("");
  const [whyAmbassador, setWhyAmbassador] = useState("");
  const [relevantExperience, setRelevantExperience] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [instagram, setInstagram] = useState("");
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchStatus = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/ambassador/apply?userId=${user.uid}`);
      const data = await res.json();
      if (data.application) setApplication(data.application);
      if (data.ambassador) setAmbassador(data.ambassador);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchStatus();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push("/auth/login?redirectUrl=/ambassador");
      return;
    }

    if (!collegeName.trim() || !whyAmbassador.trim()) {
      setError("Please specify your college name and why you want to represent EdWorld.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/ambassador/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          college_name: collegeName.trim(),
          why_ambassador: `${degreeYear ? `[${degreeYear}] ` : ""}${whyAmbassador.trim()}`,
          relevant_experience: relevantExperience.trim() || null,
          social_links: {
            linkedin: linkedin.trim() || null,
            instagram: instagram.trim() || null,
          }
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit application");
      } else {
        setSuccessMessage("Application submitted successfully! Our community team will review your application.");
        fetchStatus();
      }
    } catch (err: any) {
      setError(err.message || "Network error while submitting.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black py-10 px-4 sm:px-6 lg:px-8 font-sans selection:bg-black selection:text-white">
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
        
        {/* Navigation & Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Dashboard</span>
          </Link>

          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-md border border-neutral-200">
            Student Leadership Cohort
          </span>
        </div>

        {/* Hero Section */}
        <div className="border-b border-neutral-200 pb-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-black text-white text-[10px] font-black uppercase tracking-widest">
            <Award className="w-3.5 h-3.5" />
            <span>Official Campus Ambassador Program</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight">
            Lead the Tech Movement on Your Campus.
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 max-w-2xl leading-relaxed">
            Represent EdWorld Co. at your college. Organize technical workshops, guide fellow engineers in DSA and full-stack development, and earn verified leadership credentials.
          </p>
        </div>

        {/* Status / Active Ambassador Check */}
        {loading ? (
          <div className="text-center py-20 text-xs font-mono text-neutral-500">
            Verifying ambassador credentials...
          </div>
        ) : ambassador ? (
          /* State 1: Active Approved Ambassador */
          <div className="bg-white border-2 border-black rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-6">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center font-bold shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-black">Official Campus Ambassador</h2>
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600">{ambassador.college_name} Representative</p>
                </div>
              </div>

              <Link
                href="/ambassador/hub"
                className="px-5 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-black shadow-xs flex items-center gap-2 transition-all self-start sm:self-auto"
              >
                <span>Open Ambassador Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-1">
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Your Unique Referral Code</span>
                <div className="text-xl font-mono font-black text-black tracking-wider">{ambassador.referral_code}</div>
              </div>
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-1">
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Appointed Standing</span>
                <div className="text-sm font-bold text-black flex items-center gap-1.5 mt-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Verified Campus Representative</span>
                </div>
              </div>
            </div>
          </div>
        ) : application && application.status === "pending" ? (
          /* State 2: Application Submitted & Pending Review */
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-black">Application Under Review</h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-amber-100 text-amber-900 border border-amber-300">
                    Pending
                  </span>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Thank you for applying to represent <strong>{application.college_name}</strong>. Our student relations team is reviewing your application and will notify you via email shortly.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2 text-xs">
              <div className="font-bold text-neutral-700">Submitted Statement:</div>
              <p className="text-neutral-600 italic">"{application.why_ambassador}"</p>
              <div className="text-[10px] text-neutral-400 font-mono pt-1">
                Submitted on {new Date(application.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </div>
            </div>
          </div>
        ) : (
          /* State 3: Application Form */
          <div className="space-y-8">
            
            {/* Why Join Perks Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2">
                <Award className="w-5 h-5 text-black" />
                <h3 className="font-black text-xs text-black uppercase tracking-wider">Verified Credential</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Receive an official Certificate of Leadership and Verified Campus Representative badge on your profile.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2">
                <Briefcase className="w-5 h-5 text-black" />
                <h3 className="font-black text-xs text-black uppercase tracking-wider">Direct Referrals</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Priority recruiter matching for top tech internships and partner company opportunities.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2">
                <Gift className="w-5 h-5 text-black" />
                <h3 className="font-black text-xs text-black uppercase tracking-wider">Rewards &amp; Swag</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Earn milestone stipends, referral bonuses, and exclusive EdWorld developer merchandise.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2">
                <Users className="w-5 h-5 text-black" />
                <h3 className="font-black text-xs text-black uppercase tracking-wider">National Network</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Collaborate directly with campus ambassadors and engineering leads across universities in India.
                </p>
              </div>
            </div>

            {/* Application Form Card */}
            <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="border-b border-neutral-200 pb-4">
                <h2 className="text-xl font-black text-black">Apply for Campus Ambassador</h2>
                <p className="text-xs text-neutral-600 mt-0.5">
                  Complete the application below. Shortlisted applicants are onboarded with their custom campus referral code.
                </p>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                
                {/* College / Institution */}
                <div className="space-y-1">
                  <label className="font-bold text-black uppercase text-[10px] tracking-wider">
                    College / University Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Osmania University / IIT Hyderabad / BITS Pilani"
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-black text-xs font-semibold text-black bg-white"
                  />
                </div>

                {/* Degree & Year */}
                <div className="space-y-1">
                  <label className="font-bold text-black uppercase text-[10px] tracking-wider">
                    Degree, Major &amp; Expected Graduation Year
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. B.Tech Computer Science (Batch of 2026)"
                    value={degreeYear}
                    onChange={(e) => setDegreeYear(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-black text-xs font-medium text-black bg-white"
                  />
                </div>

                {/* Motivation / Why Ambassador */}
                <div className="space-y-1">
                  <label className="font-bold text-black uppercase text-[10px] tracking-wider">
                    Why do you want to represent EdWorld on your campus? *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your motivation, how you plan to introduce EdWorld to your peers, and what initiatives you'd like to lead..."
                    value={whyAmbassador}
                    onChange={(e) => setWhyAmbassador(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-black text-xs font-medium text-black bg-white leading-relaxed"
                  />
                </div>

                {/* Relevant Leadership Experience */}
                <div className="space-y-1">
                  <label className="font-bold text-black uppercase text-[10px] tracking-wider">
                    Relevant Leadership, Club or Tech Experience (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="E.g. College coding club lead, hackathon organizer, student council coordinator..."
                    value={relevantExperience}
                    onChange={(e) => setRelevantExperience(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-black text-xs font-medium text-black bg-white leading-relaxed"
                  />
                </div>

                {/* Social & Professional Links */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="font-bold text-black uppercase text-[10px] tracking-wider">
                      LinkedIn Profile URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://linkedin.com/in/username"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:border-black text-xs font-medium text-black bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-black uppercase text-[10px] tracking-wider">
                      Instagram Handle or Profile (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="@yourhandle"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:border-black text-xs font-medium text-black bg-white"
                    />
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-4 border-t border-neutral-200 flex items-center justify-between">
                  <span className="text-[11px] text-neutral-500 font-mono">
                    Applications reviewed on a rolling basis.
                  </span>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white font-black text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? "Submitting Application..." : "Submit Application"}</span>
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
