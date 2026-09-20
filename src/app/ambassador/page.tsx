"use client";

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
  Share2, 
  Users, 
  ArrowRight,
  ShieldCheck,
  XCircle
} from "lucide-react";

export const dynamic = "force-dynamic";

export default function CampusAmbassadorPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();

  const isCollegeTrack = user?.careerStage === "STUDENT" || profile?.careerStage === "STUDENT" || profile?.careerStage === "college";

  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<any>(null);
  const [ambassador, setAmbassador] = useState<any>(null);

  // Form fields
  const [collegeName, setCollegeName] = useState(profile?.institution || "");
  const [whyAmbassador, setWhyAmbassador] = useState("");
  const [relevantExperience, setRelevantExperience] = useState("");
  const [instagram, setInstagram] = useState("");
  const [linkedin, setLinkedin] = useState("");
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
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !collegeName || !whyAmbassador) return;

    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/ambassador/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          college_name: collegeName.trim(),
          why_ambassador: whyAmbassador.trim(),
          relevant_experience: relevantExperience.trim() || null,
          social_links: {
            instagram: instagram.trim() || null,
            linkedin: linkedin.trim() || null
          }
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit application");
      } else {
        setSuccessMessage("Application submitted successfully! Our student community team will review your application.");
        fetchStatus();
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    if (!user || !application || !confirm("Are you sure you want to withdraw your application?")) return;
    try {
      const res = await fetch("/api/ambassador/apply", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: application.id,
          userId: user.uid,
          action: "withdraw"
        })
      });
      if (res.ok) {
        fetchStatus();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!authLoading && user && !isCollegeTrack) {
    return (
      <div className="min-h-screen bg-[#F4F6FB] flex items-center justify-center p-6">
        <div className="card-quixel max-w-md p-8 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-[#FF7A50] mx-auto" />
          <h2 className="text-xl font-black text-[#181920]">College Track Only</h2>
          <p className="text-sm text-[#767E94]">
            The Campus Ambassador Program is exclusively open to enrolled university and college students representing their campuses.
          </p>
          <Link href="/dashboard" className="btn-quixel-primary inline-block">Return to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6FB] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Top Header */}
        <div className="space-y-1">
          <Link href="/dashboard" className="inline-flex items-center text-xs font-bold text-[#5C38FF] hover:underline mb-1">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EDE8FD] text-[#5C38FF] flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#181920]">Edworld Campus Ambassador Program</h1>
              <p className="text-xs text-[#767E94]">Represent Edworld Co at your college, lead developer workshops, and earn official leadership credentials.</p>
            </div>
          </div>
        </div>

        {/* Status Views */}
        {loading ? (
          <div className="text-center py-16 text-xs text-[#767E94]">Checking ambassador status...</div>
        ) : ambassador ? (
          /* Approved Ambassador Card */
          <div className="card-quixel p-8 space-y-6 border-[#00C48C]/40 bg-gradient-to-br from-white to-[#E8F8F0]/30">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E8ECF2] pb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#E8F8F0] text-[#00C48C] flex items-center justify-center font-bold shadow-sm">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-[#181920]">Official Campus Ambassador</h2>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-[#00C48C] text-white px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-[#767E94]">{ambassador.college_name} Representative</p>
                </div>
              </div>

              <Link
                href="/ambassador/hub"
                className="px-5 py-2.5 rounded-2xl bg-[#5C38FF] hover:bg-[#4D2CE0] text-white text-xs font-black shadow-lg flex items-center gap-2 transition-all hover:scale-105"
              >
                <span>Open Ambassador Hub</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-[#E8ECF2] space-y-1">
                <span className="text-xs font-bold text-[#767E94]">Your Unique Referral Code</span>
                <div className="text-lg font-mono font-black text-[#5C38FF]">{ambassador.referral_code}</div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-[#E8ECF2] space-y-1">
                <span className="text-xs font-bold text-[#767E94]">Program Standing</span>
                <div className="text-sm font-black text-[#00C48C] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Official Campus Leader
                </div>
              </div>
            </div>
          </div>
        ) : application && application.status === "pending" ? (
          /* Pending Application View */
          <div className="card-quixel p-8 space-y-5 border-[#FFB800]/40 bg-gradient-to-br from-white to-[#FFFBEB]/30">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF8E7] text-[#D97706] flex items-center justify-center font-bold">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-black text-[#181920]">Application Under Review</h2>
                <p className="text-xs text-[#767E94]">Submitted on {new Date(application.created_at).toLocaleDateString()} for {application.college_name}</p>
              </div>
            </div>

            <p className="text-xs text-[#767E94] leading-relaxed">
              Thank you for applying to represent Edworld Co at your university. Our team reviews applications weekly and will notify you with your official ambassador credentials once processed.
            </p>

            <div className="pt-3 border-t border-[#E8ECF2] flex items-center justify-between">
              <span className="text-xs font-bold text-[#D97706] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Review in progress
              </span>
              <button
                onClick={handleWithdraw}
                className="text-xs font-bold text-rose-500 hover:text-rose-700 hover:underline"
              >
                Withdraw Application
              </button>
            </div>
          </div>
        ) : application && application.status === "rejected" ? (
          /* Friendly Rejection Notice */
          <div className="card-quixel p-8 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#F4F6FB] text-[#767E94] flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-black text-[#181920]">Application Status Update</h2>
                <p className="text-xs text-[#767E94]">Cohort Selection Cycle</p>
              </div>
            </div>

            <p className="text-xs text-[#767E94] leading-relaxed">
              Thanks for applying to represent Edworld Co! We are not able to bring on an ambassador at your college right now due to cohort capacity limits. We welcome you to continue practicing on the platform and apply in future semesters.
            </p>
          </div>
        ) : (
          /* Application Form */
          <div className="card-quixel p-6 sm:p-8 space-y-6">
            <div className="border-b border-[#E8ECF2] pb-4">
              <h2 className="text-lg font-black text-[#181920]">Apply to Represent Your Campus</h2>
              <p className="text-xs text-[#767E94] mt-1">
                Help fellow engineering and product students master interview prep, organize mock interview circles, and build career evidence.
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-600 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#181920] mb-1">College / University Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Indian Institute of Technology, Madras"
                  value={collegeName}
                  onChange={e => setCollegeName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E8ECF2] text-xs font-bold bg-[#F4F6FB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5C38FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#181920] mb-1">Why do you want to be an Edworld Ambassador? *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Share your motivation, leadership interest, and how you plan to help fellow students prepare for placements..."
                  value={whyAmbassador}
                  onChange={e => setWhyAmbassador(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E8ECF2] text-xs font-medium bg-[#F4F6FB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5C38FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#181920] mb-1">Relevant Club or Leadership Experience (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. President of Coding Club, Placement Committee Coordinator, Event Lead..."
                  value={relevantExperience}
                  onChange={e => setRelevantExperience(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E8ECF2] text-xs font-medium bg-[#F4F6FB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5C38FF]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#181920] mb-1">LinkedIn Profile (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/..."
                    value={linkedin}
                    onChange={e => setLinkedin(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E8ECF2] text-xs font-medium bg-[#F4F6FB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5C38FF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#181920] mb-1">Instagram / Social Link (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://instagram.com/..."
                    value={instagram}
                    onChange={e => setInstagram(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E8ECF2] text-xs font-medium bg-[#F4F6FB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5C38FF]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#E8ECF2] flex items-center justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-[#5C38FF] hover:bg-[#4D2CE0] text-white text-xs font-black shadow-lg flex items-center gap-2 transition-all hover:scale-105"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? "Submitting Application..." : "Submit Ambassador Application"}</span>
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
