import React from "react";
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy & Minor Data Protection — Edworld Co",
  description: "Our commitment to data isolation, youth safety, and DPDP Act / COPPA / GDPR compliance."
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-paper py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8 bg-paper-raised p-8 sm:p-12 rounded-3xl border border-line shadow-sm text-ink leading-relaxed">
        <div className="border-b border-line pb-6 space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-forest">Privacy by Architecture</span>
          <h1 className="text-3xl font-bold font-display text-ink">Privacy Policy</h1>
          <p className="text-xs text-ink-soft">Last Updated: August 2026</p>
        </div>

        <section className="space-y-3 text-xs sm:text-sm">
          <h2 className="text-lg font-bold font-display text-ink">1. Core Architecture Principles</h2>
          <p>
            Edworld Co is built on the principle of minimal data collection, strict age gating, and absolute database-level Row-Level Security (RLS).
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs text-ink-soft">
            <li><strong>DOB Isolation:</strong> Dates of birth are stored in a dedicated, unlinked table (`user_dob_records`) with zero client SELECT policies.</li>
            <li><strong>Minor Protections:</strong> Learners under 18 cannot be discovered by adult users, cannot be cold-messaged, and are isolated into verified classroom spaces.</li>
            <li><strong>Teacher Progress Boundaries:</strong> Teachers have access only to enrolled progress metrics via dedicated security-invoker views (`teacher_visible_student_progress`). Private journals and messages are strictly hidden.</li>
          </ul>
        </section>

        <section className="space-y-3 text-xs sm:text-sm">
          <h2 className="text-lg font-bold font-display text-ink">2. Interview Media &amp; Retention</h2>
          <p className="text-xs text-ink-soft">
            Video and audio recordings conducted in the Mock Interview Studio are processed strictly for real-time speech evaluation. Audio recordings are removed automatically following score generation unless explicitly retained by the user.
          </p>
        </section>

        <section className="space-y-3 text-xs sm:text-sm">
          <h2 className="text-lg font-bold font-display text-ink">3. Grievance Officer &amp; Inquiries</h2>
          <p className="text-xs text-ink-soft">
            To exercise your right to access, rectify, or erase your personal data, contact our Grievance Officer directly at <Link href="/contact" className="text-forest font-bold underline">contact &amp; grievance page</Link> or email <strong>grievance-officer@edworld.co</strong>.
          </p>
        </section>
      </div>
    </div>
  );
}
