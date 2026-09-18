"use client";

import React, { useState } from "react";
import Button from "@/components/ui/Button";
import { Mail, Phone, MapPin, ShieldAlert, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("General Support");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-paper py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-forest/10 text-forest border border-forest/20">
            Support &amp; Grievance Redressal
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold font-display text-ink tracking-tight">
            Contact &amp; Grievance Officer
          </h1>
          <p className="text-sm text-ink-soft">
            Have questions, feedback, or a data privacy inquiry? Our team and designated Grievance Officer are here to assist you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Statutory Grievance & Office Details */}
          <div className="space-y-6">
            <div className="bg-paper-raised p-6 rounded-3xl border border-line space-y-4">
              <div className="flex items-center gap-2 text-forest font-bold text-sm">
                <ShieldAlert className="w-5 h-5 text-forest" />
                <span>Designated Grievance Officer</span>
              </div>
              <p className="text-xs text-ink-soft leading-relaxed">
                In accordance with the Information Technology Act 2000 and Digital Personal Data Protection Act 2023:
              </p>
              <div className="text-xs text-ink space-y-1 bg-paper-soft p-4 rounded-2xl border border-line font-medium">
                <div><strong>Officer:</strong> Grievance Redressal Officer</div>
                <div><strong>Designation:</strong> Head of Compliance &amp; Privacy</div>
                <div><strong>Email:</strong> grievance-officer@edworld.co</div>
                <div><strong>Response SLA:</strong> Within 24–48 hours</div>
              </div>
            </div>

            <div className="bg-paper-raised p-6 rounded-3xl border border-line space-y-3 text-xs text-ink-soft">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-forest shrink-0" />
                <span>General Support: support@edworld.co</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-forest shrink-0" />
                <span>Bengaluru, Karnataka, India</span>
              </div>
            </div>
          </div>

          {/* Contact Inquiry Form */}
          <div className="bg-paper-raised p-8 rounded-3xl border border-line shadow-sm">
            {submitted ? (
              <div className="p-8 text-center space-y-3 animate-in fade-in">
                <CheckCircle2 className="w-10 h-10 text-forest mx-auto" />
                <h3 className="text-lg font-bold font-display text-ink">Inquiry Submitted</h3>
                <p className="text-xs text-ink-soft">
                  Thank you, {name}. We will review your message and reply to {email} shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-lg font-bold font-display text-ink">Send us a message</h3>
                
                <div>
                  <label className="block text-xs font-bold text-ink uppercase mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 rounded-xl border border-line bg-paper-soft text-xs text-ink font-medium focus:outline-none focus:border-forest"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 rounded-xl border border-line bg-paper-soft text-xs text-ink font-medium focus:outline-none focus:border-forest"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink uppercase mb-1">Inquiry Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-3 rounded-xl border border-line bg-paper-soft text-xs text-ink font-medium focus:outline-none focus:border-forest"
                  >
                    <option value="General Support">General Support</option>
                    <option value="Billing & Razorpay">Billing &amp; Razorpay</option>
                    <option value="Colleges & Universities">College & University Placement Partnership</option>
                    <option value="Privacy & Data Deletion">Data Privacy / Account Deletion Request</option>
                    <option value="Grievance Appeal">Formal Grievance Appeal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink uppercase mb-1">Message</label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="How can we help you?"
                    className="w-full p-3 rounded-xl border border-line bg-paper-soft text-xs text-ink font-medium focus:outline-none focus:border-forest"
                  />
                </div>

                <Button variant="primary" type="submit" className="w-full">
                  Send Message
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
