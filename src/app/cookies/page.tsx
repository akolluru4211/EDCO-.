import React from "react";
import Link from "next/link";
import { Cookie, ShieldCheck, Sliders, CheckCircle2, Info } from "lucide-react";

export const metadata = {
  title: "Cookie Policy — EdWorld Co.",
  description: "Learn how EdWorld Co. uses essential session tokens and privacy-preserving cookies."
};

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-[#FCFCFB] py-16 px-4 sm:px-6 lg:px-8 text-[#13141B] font-sans selection:bg-[#00D2B4]/20 selection:text-[#0A5245]">
      <div className="max-w-4xl mx-auto space-y-10 bg-white p-6 sm:p-12 rounded-3xl border border-[#EBECEF] shadow-xs leading-relaxed">
        
        {/* Header */}
        <div className="border-b border-[#EBECEF] pb-6 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
            <Cookie className="w-4 h-4 text-emerald-600" />
            <span>Transparency &amp; Local Storage</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#13141B] tracking-tight">
            Cookie Policy
          </h1>
          <p className="text-xs text-[#5E6573]">
            Last Updated: October 2026 &bull; Operational Headquarters: Hyderabad, Telangana, India
          </p>
        </div>

        {/* 1. What are Cookies */}
        <section className="space-y-3 text-xs sm:text-sm text-[#5E6573]">
          <h2 className="text-base sm:text-lg font-bold text-[#13141B]">
            1. What Are Cookies &amp; Local Storage?
          </h2>
          <p>
            Cookies are small text files placed on your computer or mobile device when you browse websites. Local Storage is a modern web browser mechanism that allows web applications to store key-value data locally on your device without transmitting it over every HTTP network header.
          </p>
          <p>
            EdWorld Co. uses cookies and local storage primarily for <strong>essential security, authenticated session management, and UI personalization</strong>. We do <strong>not</strong> use third-party marketing cookies or sell advertising beacons.
          </p>
        </section>

        {/* 2. Categorization Table */}
        <section className="space-y-3 text-xs sm:text-sm text-[#5E6573]">
          <h2 className="text-base sm:text-lg font-bold text-[#13141B]">
            2. Categories of Cookies We Use
          </h2>
          <div className="space-y-4 pt-1">
            
            <div className="p-4 rounded-2xl bg-[#FCFCFB] border border-[#EBECEF] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#13141B] text-xs sm:text-sm">A. Strictly Necessary (Always Active)</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Required</span>
              </div>
              <p className="text-xs text-[#5E6573]">
                These cookies and tokens are mandatory for the website to function. They authenticate your user identity (Supabase Auth sessions), protect against Cross-Site Request Forgery (CSRF), and maintain database Row-Level Security. You cannot disable these without breaking platform access.
              </p>
              <div className="text-[11px] font-mono text-[#5E6573] bg-white p-2.5 rounded-xl border border-[#EBECEF]">
                Examples: <code>sb-access-token</code>, <code>sb-refresh-token</code>, <code>edworld_cookie_consent</code>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FCFCFB] border border-[#EBECEF] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#13141B] text-xs sm:text-sm">B. Functional &amp; User Preferences</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">Optional</span>
              </div>
              <p className="text-xs text-[#5E6573]">
                These cookies remember choices you make—such as your preferred dark/light UI mode, sidebar collapsed state, or speech synthesis audio volume in the Mock Interview Studio—to provide a seamless, continuous experience.
              </p>
              <div className="text-[11px] font-mono text-[#5E6573] bg-white p-2.5 rounded-xl border border-[#EBECEF]">
                Examples: <code>edworld_theme</code>, <code>edworld_sidebar_state</code>, <code>mock_studio_audio_vol</code>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FCFCFB] border border-[#EBECEF] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#13141B] text-xs sm:text-sm">C. Performance &amp; Diagnostic Telemetry</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">Optional</span>
              </div>
              <p className="text-xs text-[#5E6573]">
                We collect anonymous error logs and API latency metrics to ensure high platform uptime and diagnose audio connection dropouts during mock interview rounds. We do not correlate diagnostic metrics with advertising identifiers.
              </p>
              <div className="text-[11px] font-mono text-[#5E6573] bg-white p-2.5 rounded-xl border border-[#EBECEF]">
                Examples: <code>_ed_telemetry_session</code>, <code>latency_sample_id</code>
              </div>
            </div>

          </div>
        </section>

        {/* 3. Managing Preferences */}
        <section className="space-y-3 text-xs sm:text-sm text-[#5E6573]">
          <h2 className="text-base sm:text-lg font-bold text-[#13141B] flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-600" />
            <span>3. How to Manage or Withdraw Cookie Consent</span>
          </h2>
          <p>
            You have full control over non-essential cookies. You can update or withdraw your consent at any time:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs sm:text-sm text-[#5E6573]">
            <li><strong>Via Our Cookie Preferences Panel:</strong> Click the <strong>&ldquo;Cookie Preferences&rdquo;</strong> button in our website footer at any time to open the granular preference modal and toggle analytics or functional cookies.</li>
            <li><strong>Via Browser Settings:</strong> You can block or delete cookies through your browser controls (Chrome, Firefox, Safari, Edge). Please note that blocking essential cookies will prevent logging in to your EdWorld Co. account.</li>
          </ul>
        </section>

        {/* 4. Contact */}
        <section className="space-y-3 text-xs sm:text-sm text-[#5E6573] border-t border-[#EBECEF] pt-6">
          <h2 className="text-base sm:text-lg font-bold text-[#13141B]">
            4. Inquiries &amp; Privacy Officer
          </h2>
          <p>
            If you have questions regarding our use of cookies and local storage, contact our Grievance &amp; Privacy Officer at{" "}
            <a href="mailto:edworld.eden@gmail.com?subject=Cookie%20Policy%20Inquiry" className="text-emerald-700 font-bold underline">
              edworld.eden@gmail.com
            </a>{" "}
            or view our complete{" "}
            <Link href="/privacy" className="text-emerald-700 font-bold underline">
              Privacy Policy
            </Link>.
          </p>
        </section>

      </div>
    </div>
  );
}
