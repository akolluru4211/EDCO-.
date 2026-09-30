"use client";

import React, { useState } from "react";
import Button from "@/components/ui/Button";
import { Mail, Phone, MapPin, ShieldAlert, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("General Support");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          category,
          message: message.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setErrorMsg(data.error || "Failed to send message. Please try again.");
      }
    } catch (err) {
      setErrorMsg("Network error occurred. Please try again or email edworld.eden@gmail.com directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFCFB] text-[#13141B] py-16 px-4 sm:px-6 lg:px-8 font-sans selection:bg-[#00D2B4]/20 selection:text-[#0A5245]">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#00D2B4]/10 text-[#0A5245] border border-[#00D2B4]/30">
            Support &amp; Grievance Redressal
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#13141B] tracking-tight">
            Contact &amp; Grievance Officer
          </h1>
          <p className="text-xs sm:text-sm text-[#5E6573]">
            Have questions, feedback, or a data privacy inquiry? Our team and designated Grievance Officer are here to assist you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Statutory Grievance & Office Details */}
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#EBECEF] space-y-4 shadow-xs">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                <ShieldAlert className="w-5 h-5 text-emerald-600" />
                <span>Designated Grievance Officer</span>
              </div>
              <p className="text-xs text-[#5E6573] leading-relaxed">
                In accordance with the Information Technology Act 2000 and Digital Personal Data Protection Act 2023:
              </p>
              <div className="text-xs text-[#13141B] space-y-1.5 bg-[#FCFCFB] p-4 rounded-2xl border border-[#EBECEF] font-medium">
                <div><strong>Officer:</strong> Grievance Redressal Officer</div>
                <div><strong>Designation:</strong> Head of Compliance &amp; Privacy</div>
                <div>
                  <strong>Email:</strong>{" "}
                  <a
                    href="mailto:edworld.eden@gmail.com?subject=Grievance%20Redressal%20Inquiry"
                    className="text-emerald-700 hover:underline font-bold"
                  >
                    edworld.eden@gmail.com
                  </a>
                </div>
                <div><strong>Response SLA:</strong> Within 24–48 hours</div>
              </div>
            </div>

            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#EBECEF] space-y-3 text-xs text-[#5E6573] shadow-xs">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  General Support:{" "}
                  <a
                    href="mailto:edworld.eden@gmail.com?subject=EdWorld%20Support%20Request"
                    className="text-emerald-700 hover:underline font-bold"
                  >
                    edworld.eden@gmail.com
                  </a>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Operating Jurisdiction: Bengaluru, Karnataka, India</span>
              </div>
            </div>
          </div>

          {/* Contact & Inquiries Form */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EBECEF] shadow-xs">
            {submitted ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#13141B]">Inquiry Received</h3>
                <p className="text-xs text-[#5E6573] max-w-xs mx-auto">
                  Thank you. Your message has been logged. Our team will review and respond to <strong>{email}</strong> shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-base font-bold text-[#13141B]">Submit an Inquiry</h2>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                    {errorMsg}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#5E6573] uppercase mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ananya Roy"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#13141B] placeholder:text-[#8E95A5] focus:outline-none focus:border-[#13141B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5E6573] uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ananya@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#13141B] placeholder:text-[#8E95A5] focus:outline-none focus:border-[#13141B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5E6573] uppercase mb-1">Inquiry Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#13141B] font-semibold focus:outline-none focus:border-[#13141B]"
                  >
                    <option value="General Support">General Support</option>
                    <option value="Data Privacy & Consent">Data Privacy &amp; Consent (DPDP)</option>
                    <option value="Grievance / Compliance">Grievance / Compliance Escalation</option>
                    <option value="Institutional Partnership">Institutional Partnership</option>
                    <option value="Billing & Subscription">Billing &amp; Subscription</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5E6573] uppercase mb-1">Message / Details</label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your inquiry or grievance with relevant details..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#13141B] placeholder:text-[#8E95A5] focus:outline-none focus:border-[#13141B]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-[#13141B] hover:bg-[#252632] text-white font-bold text-xs transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "Sending Message..." : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
