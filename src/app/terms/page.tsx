import React from "react";
import Link from "next/link";
import { Scale, CheckCircle2, AlertCircle, FileCode, Shield } from "lucide-react";

export const metadata = {
  title: "Terms of Service — EdWorld Co.",
  description: "Terms and conditions governing the use of the EdWorld Co. career readiness, ATS resume, and mock interview platform."
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#FCFCFB] py-16 px-4 sm:px-6 lg:px-8 text-[#13141B] font-sans selection:bg-[#00D2B4]/20 selection:text-[#0A5245]">
      <div className="max-w-4xl mx-auto space-y-10 bg-white p-6 sm:p-12 rounded-3xl border border-[#EBECEF] shadow-xs leading-relaxed">
        
        {/* Header */}
        <div className="border-b border-[#EBECEF] pb-6 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
            <Scale className="w-4 h-4 text-emerald-600" />
            <span>Binding Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#13141B] tracking-tight">
            Terms of Service
          </h1>
          <p className="text-xs text-[#5E6573]">
            Last Updated: October 2026 &bull; Governing Jurisdiction: Hyderabad, Telangana, India
          </p>
        </div>

        {/* 1. Acceptance & Eligibility */}
        <section className="space-y-3 text-xs sm:text-sm text-[#5E6573]">
          <h2 className="text-base sm:text-lg font-bold text-[#13141B]">
            1. Acceptance of Terms &amp; Eligibility
          </h2>
          <p>
            Welcome to EdWorld Co. (&ldquo;Platform&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;). By accessing our website, web applications, or services, you agree to be bound by these Terms of Service and our Privacy Policy.
          </p>
          <div className="p-4 rounded-2xl bg-[#FCFCFB] border border-[#EBECEF] space-y-2">
            <h3 className="font-bold text-[#13141B] text-xs">Age Requirements:</h3>
            <ul className="list-disc list-inside space-y-1 text-xs text-[#5E6573]">
              <li><strong>Adults (18+):</strong> You have the full legal capacity to enter into binding contracts under Indian law.</li>
              <li><strong>Minors (13–17):</strong> You may use the platform only with the verified consent and supervision of a parent or legal guardian who agrees to these Terms.</li>
              <li><strong>Children Under 13:</strong> Registration is strictly prohibited.</li>
            </ul>
          </div>
        </section>

        {/* 2. Educational Diagnostic Tools & AI Disclaimers */}
        <section className="space-y-3 text-xs sm:text-sm text-[#5E6573]">
          <h2 className="text-base sm:text-lg font-bold text-[#13141B]">
            2. Educational Diagnostic Tools &amp; AI Disclaimers (No Hiring Guarantee)
          </h2>
          <p>
            EdWorld Co. provides educational simulations, ATS keyword analysis, resume formatting tools, and adaptive AI mock interviews (powered by Myra AI).
          </p>
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-[#13141B] space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-900 text-xs sm:text-sm">
              <AlertCircle className="w-4 h-4 text-amber-700" />
              <span>Important Disclaimers on AI-Assisted Output:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-xs text-[#5E6573]">
              <li><strong>Diagnostic &amp; Advisory Only:</strong> All scores, readiness percentages, and skill benchmarks are pedagogical estimates designed to assist your self-guided practice.</li>
              <li><strong>No Employment Guarantee:</strong> EdWorld Co. does not guarantee job offers, corporate placement, interview selection, salary negotiations, or college admissions.</li>
              <li><strong>AI Companion (Myra):</strong> Myra is an artificial intelligence mentor. While engineered for technical rigor, responses are generated computationally and should be cross-verified with official academic references.</li>
            </ul>
          </div>
        </section>

        {/* 3. Subscriptions, Payments & Transparent Pricing */}
        <section className="space-y-3 text-xs sm:text-sm text-[#5E6573]">
          <h2 className="text-base sm:text-lg font-bold text-[#13141B]">
            3. Subscriptions, Payments &amp; Transparent Pricing
          </h2>
          <p>
            EdWorld Co. offers a free foundational starter tier as well as optional premium tiers (Career Pro at ₹49/month and Executive Premium at ₹99/month).
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs sm:text-sm text-[#5E6573]">
            <li><strong>All-Inclusive Pricing:</strong> All listed prices are denominated in Indian Rupees (INR - ₹) and are inclusive of applicable Goods and Services Tax (GST). There are zero hidden processing surcharges.</li>
            <li><strong>Payment Processing:</strong> Transactions are processed securely through Razorpay, a PCI-DSS Level 1 compliant gateway. We do not store credit or debit card numbers on platform servers.</li>
            <li><strong>Refund Policy:</strong> Paid plans are backed by our <Link href="/refund" className="text-emerald-700 font-bold underline">7-Day Refund Policy</Link>.</li>
            <li><strong>Cancellation:</strong> You may cancel recurring billing at any time from your account settings with zero cancellation penalties. Access remains active until the conclusion of the paid billing period.</li>
          </ul>
        </section>

        {/* 4. Acceptable Use Policy */}
        <section className="space-y-3 text-xs sm:text-sm text-[#5E6573]">
          <h2 className="text-base sm:text-lg font-bold text-[#13141B]">
            4. Acceptable Use &amp; Code of Conduct
          </h2>
          <p>
            You agree not to misuse the Platform. Specifically, you agree not to:
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs text-[#5E6573]">
            <li>Engage in harassment, abusive conduct, or inappropriate communication towards other students, recruiters, or employees.</li>
            <li>Reverse engineer, scrape, decompile, or extract the proprietary algorithms of the platform or mock interview engines.</li>
            <li>Submit fraudulent, plagiarized, or misleading qualifications, resumes, or interview responses.</li>
            <li>Bypass platform anti-cheat or fullscreen proctoring mechanisms during calibrated placement assessments.</li>
          </ul>
        </section>

        {/* 5. Intellectual Property & Open Source Font/Asset Licenses */}
        <section className="space-y-3 text-xs sm:text-sm text-[#5E6573]">
          <h2 className="text-base sm:text-lg font-bold text-[#13141B] flex items-center gap-2">
            <FileCode className="w-4 h-4 text-emerald-600" />
            <span>5. Intellectual Property &amp; Third-Party Asset Licensing</span>
          </h2>
          <p>
            The Platform, its visual design, brand marks, and software architecture are the intellectual property of EdWorld Co.
          </p>
          <div className="space-y-2 pt-1 text-xs text-[#5E6573]">
            <div className="p-3.5 rounded-2xl bg-[#FCFCFB] border border-[#EBECEF]">
              <strong className="text-[#13141B]">User-Generated Content:</strong> You retain ownership of your uploaded resumes, code solutions, and interview reflections. You grant EdWorld Co. a limited license to process this data solely to provide feedback and scoring.
            </div>
            <div className="p-3.5 rounded-2xl bg-[#FCFCFB] border border-[#EBECEF]">
              <strong className="text-[#13141B]">Font Licenses:</strong> Typography utilizes the <em>Inter</em> and <em>Fraunces</em> typefaces distributed under the SIL Open Font License (OFL) Version 1.1.
            </div>
            <div className="p-3.5 rounded-2xl bg-[#FCFCFB] border border-[#EBECEF]">
              <strong className="text-[#13141B]">Icon &amp; Visual Libraries:</strong> UI icons are provided by Lucide Contributors under the MIT License. Platform illustrations, mascots, and logos are proprietary assets of EdWorld Co.
            </div>
          </div>
        </section>

        {/* 6. Limitation of Liability */}
        <section className="space-y-3 text-xs sm:text-sm text-[#5E6573]">
          <h2 className="text-base sm:text-lg font-bold text-[#13141B]">
            6. Limitation of Liability
          </h2>
          <p>
            To the maximum extent permitted by applicable Indian law, EdWorld Co. and its officers shall not be liable for any indirect, incidental, consequential, or punitive damages arising out of your access to or inability to use the Platform, including but not limited to loss of career opportunities, loss of data, or recruitment decisions made by third-party employers.
          </p>
        </section>

        {/* 7. Governing Law & Dispute Resolution */}
        <section className="space-y-3 text-xs sm:text-sm text-[#5E6573] border-t border-[#EBECEF] pt-6">
          <h2 className="text-base sm:text-lg font-bold text-[#13141B]">
            7. Governing Law &amp; Jurisdiction
          </h2>
          <p>
            These Terms shall be governed by, construed, and enforced in accordance with the laws of the Republic of India. You agree that any dispute or claim arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the competent courts located in <strong>Hyderabad, Telangana, India</strong>.
          </p>
          <p className="pt-2 text-xs text-[#5E6573]">
            For inquiries regarding these Terms, contact our legal counsel or Grievance Officer at{" "}
            <a href="mailto:edworld.eden@gmail.com?subject=Terms%20of%20Service%20Inquiry" className="text-emerald-700 font-bold underline">
              edworld.eden@gmail.com
            </a>.
          </p>
        </section>

      </div>
    </div>
  );
}
