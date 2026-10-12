import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, UserX, Database, HelpCircle, FileText, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Privacy Policy & Data Protection — EdWorld Co.",
  description: "Comprehensive privacy disclosures, minor safety architecture, and compliance with the Digital Personal Data Protection Act (DPDP Act 2023), GDPR, and COPPA."
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FCFCFB] py-16 px-4 sm:px-6 lg:px-8 text-[#13141B] font-sans selection:bg-[#00D2B4]/20 selection:text-[#0A5245]">
      <div className="max-w-4xl mx-auto space-y-10 bg-white p-6 sm:p-12 rounded-3xl border border-[#EBECEF] shadow-xs leading-relaxed">
        
        {/* Header */}
        <div className="border-b border-[#EBECEF] pb-6 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>DPDP Act 2023 &amp; Global Privacy Standards</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#13141B] tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs text-[#5E6573]">
            Last Updated &amp; Effective: October 2026 &bull; Operational Headquarters: Hyderabad, Telangana, India
          </p>
        </div>

        {/* 1. Introduction & Scope */}
        <section className="space-y-3 text-xs sm:text-sm text-[#5E6573]">
          <h2 className="text-base sm:text-lg font-bold text-[#13141B] flex items-center gap-2">
            <span>1. Introduction &amp; Commitment to Privacy</span>
          </h2>
          <p>
            EdWorld Co. (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), operating from Hyderabad, Telangana, India, provides education, skill calibration, career readiness, ATS resume optimization, and mock interview simulation services. We believe that student and professional career data must be treated with the highest standard of security, integrity, and transparency.
          </p>
          <p>
            This Privacy Policy sets forth our policies regarding the collection, use, processing, and disclosure of personal data in strict compliance with the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act, India)</strong>, the <strong>General Data Protection Regulation (GDPR, EU)</strong>, and the <strong>Children&rsquo;s Online Privacy Protection Act (COPPA, US)</strong>.
          </p>
        </section>

        {/* 2. Data We Collect & Minimization */}
        <section className="space-y-3 text-xs sm:text-sm text-[#5E6573]">
          <h2 className="text-base sm:text-lg font-bold text-[#13141B]">
            2. Categories of Data Collected &amp; Data Minimization
          </h2>
          <p>
            We strictly enforce the principle of <em>Data Minimization</em>: we only collect data that is strictly necessary to deliver personalized educational and career preparation tools.
          </p>
          <div className="space-y-3 pt-1">
            <div className="p-4 rounded-2xl bg-[#FCFCFB] border border-[#EBECEF]">
              <h3 className="font-bold text-[#13141B] text-xs sm:text-sm mb-1">A. Account &amp; Identity Data</h3>
              <p className="text-xs text-[#5E6573]">
                Full name, email address, password (stored solely in cryptographically salted and hashed form via Supabase Auth), and optional phone number (collected solely for SMS two-factor authentication or account security).
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[#FCFCFB] border border-[#EBECEF]">
              <h3 className="font-bold text-[#13141B] text-xs sm:text-sm mb-1">B. Educational &amp; Career Portfolio Data</h3>
              <p className="text-xs text-[#5E6573]">
                Academic qualifications, university/college, graduation year, target roles, technical skills, and user-generated resume markdown. Resumes are processed strictly to calculate keyword compatibility and ATS readability scores.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[#FCFCFB] border border-[#EBECEF]">
              <h3 className="font-bold text-[#13141B] text-xs sm:text-sm mb-1">C. Mock Interview Audio &amp; Transcripts</h3>
              <p className="text-xs text-[#5E6573]">
                Audio responses in the Mock Interview Studio are converted to speech-to-text transcripts in real time for rubric scoring (STAR framework). Raw audio buffers are purged following evaluation score generation.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[#FCFCFB] border border-[#EBECEF]">
              <h3 className="font-bold text-[#13141B] text-xs sm:text-sm mb-1">D. Technical &amp; Operational Telemetry</h3>
              <p className="text-xs text-[#5E6573]">
                IP address, browser type, device information, and anonymous performance logs to prevent fraud, enforce rate limits, and maintain platform uptime.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Child & Minor Data Protection */}
        <section className="space-y-3 text-xs sm:text-sm text-[#5E6573]">
          <h2 className="text-base sm:text-lg font-bold text-[#13141B] flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>3. Protection of Minors (DPDP Act Section 9 &amp; COPPA)</span>
          </h2>
          <p>
            We take youth safety with the utmost seriousness:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs sm:text-sm text-[#5E6573]">
            <li><strong>Age Gate:</strong> Users under the age of 13 years are strictly prohibited from creating accounts.</li>
            <li><strong>Parental / Guardian Consent:</strong> For users between 13 and 17 years of age, affirmative verification of parental or legal guardian consent is required during registration.</li>
            <li><strong>No Behavioral Tracking of Children:</strong> In accordance with Section 9 of the DPDP Act 2023, we do not engage in targeted behavioral advertising, psychological profiling, or commercial tracking directed at children.</li>
            <li><strong>Minor Isolation:</strong> Minor learners cannot receive unsolicited direct messages from unverified external accounts and are protected by private classroom routing.</li>
          </ul>
        </section>

        {/* 4. Purpose & Legal Basis */}
        <section className="space-y-3 text-xs sm:text-sm text-[#5E6573]">
          <h2 className="text-base sm:text-lg font-bold text-[#13141B]">
            4. Purpose of Processing &amp; Legal Grounds
          </h2>
          <p>
            We process your personal data under the following lawful grounds:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs sm:text-sm text-[#5E6573]">
            <li><strong>Performance of Contract:</strong> To provision your account, calculate resume match scores, generate mock interview questions, and process paid Career Pro subscriptions.</li>
            <li><strong>Consent:</strong> Where you have granted explicit consent (e.g., subscribing to platform newsletters or enabling optional analytics).</li>
            <li><strong>Legal Compliance:</strong> To comply with applicable tax, financial reporting, and statutory obligations under Indian law.</li>
          </ul>
        </section>

        {/* 5. Sub-processors & Third-Party SDKs */}
        <section className="space-y-3 text-xs sm:text-sm text-[#5E6573]">
          <h2 className="text-base sm:text-lg font-bold text-[#13141B]">
            5. Sub-Processors &amp; Third-Party Services Audit
          </h2>
          <p>
            We do not sell, rent, or trade your personal data to data brokers or third-party advertisers. We engage only vetted enterprise infrastructure partners bound by strict Data Processing Agreements:
          </p>
          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-xs border border-[#EBECEF] rounded-xl overflow-hidden">
              <thead className="bg-[#FCFCFB] text-[#13141B] font-bold border-b border-[#EBECEF]">
                <tr>
                  <th className="p-3">Partner / Sub-Processor</th>
                  <th className="p-3">Purpose</th>
                  <th className="p-3">Data Handled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBECEF] text-[#5E6573]">
                <tr>
                  <td className="p-3 font-semibold text-[#13141B]">Supabase (PostgreSQL &amp; Auth)</td>
                  <td className="p-3">Database hosting &amp; encrypted authentication</td>
                  <td className="p-3">Account credentials, profile data, Row-Level Security</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-[#13141B]">Razorpay Software Ltd</td>
                  <td className="p-3">Payment processing (PCI-DSS Level 1)</td>
                  <td className="p-3">Billing tokens, order amounts (card numbers never touch our servers)</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-[#13141B]">Resend Technologies</td>
                  <td className="p-3">Transactional &amp; security notifications</td>
                  <td className="p-3">Recipient email, password reset tokens, security OTPs</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-[#13141B]">Anthropic / Google Gemini</td>
                  <td className="p-3">Stateless AI inference &amp; interview scoring</td>
                  <td className="p-3">Anonymized interview transcripts (zero data retention for model training)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 6. Data Retention & Erasure */}
        <section className="space-y-3 text-xs sm:text-sm text-[#5E6573]">
          <h2 className="text-base sm:text-lg font-bold text-[#13141B]">
            6. Data Retention &amp; Storage Periods
          </h2>
          <p>
            We retain personal data only for as long as your account remains active or as required to fulfill educational services:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs sm:text-sm text-[#5E6573]">
            <li><strong>Account Profiles:</strong> Retained until account closure or explicit deletion request.</li>
            <li><strong>Mock Interview Media:</strong> Raw audio streams are discarded immediately upon score generation; text rubrics remain in your account for personal study until deleted.</li>
            <li><strong>Financial Invoices:</strong> Retained for statutory periods mandated under Indian tax law (GST regulations).</li>
          </ul>
        </section>

        {/* 7. Your Statutory Rights & Data Deletion */}
        <section className="space-y-4 text-xs sm:text-sm text-[#5E6573]">
          <h2 className="text-base sm:text-lg font-bold text-[#13141B] flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-600" />
            <span>7. Your Rights: Access, Correction &amp; Erasure (Data Deletion)</span>
          </h2>
          <p>
            Under the DPDP Act 2023 and GDPR, you have the following rights as a Data Principal:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-2xl bg-[#FCFCFB] border border-[#EBECEF]">
              <div className="font-bold text-[#13141B] text-xs mb-1">Right to Access &amp; Summary</div>
              <p className="text-xs text-[#5E6573]">Obtain a summary of personal data held about you and details of processing activities.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#FCFCFB] border border-[#EBECEF]">
              <div className="font-bold text-[#13141B] text-xs mb-1">Right to Correction &amp; Updating</div>
              <p className="text-xs text-[#5E6573]">Correct inaccurate, incomplete, or out-of-date personal data at any time from your profile settings.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#FCFCFB] border border-[#EBECEF]">
              <div className="font-bold text-[#13141B] text-xs mb-1">Right to Erasure (Data Deletion)</div>
              <p className="text-xs text-[#5E6573]">Request permanent deletion and erasure of your account and associated personal data.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#FCFCFB] border border-[#EBECEF]">
              <div className="font-bold text-[#13141B] text-xs mb-1">Right to Grievance Redressal</div>
              <p className="text-xs text-[#5E6573]">Lodge a grievance with our designated Grievance Officer, resolved within 48 hours.</p>
            </div>
          </div>

          <div className="mt-4 p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-[#13141B] space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs sm:text-sm">
              <UserX className="w-4 h-4 text-emerald-700" />
              <span>How to Request Immediate Account &amp; Data Deletion</span>
            </div>
            <p className="text-xs text-[#5E6573] leading-relaxed">
              You can exercise your right to erasure in two ways:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-xs text-[#5E6573] pl-1 font-medium">
              <li><strong>Self-Service:</strong> In your logged-in workspace, go to Profile Settings &rarr; Privacy &amp; Data &rarr; <em>Delete My Account &amp; Purge Data</em>.</li>
              <li><strong>Email Verification:</strong> Send an email from your registered address to <a href="mailto:edworld.eden@gmail.com?subject=DPDP%20Data%20Erasure%20Request" className="font-bold text-emerald-700 underline">edworld.eden@gmail.com</a> with the subject &ldquo;Data Erasure Request&rdquo;. All personal data will be purged within 7 business days.</li>
            </ol>
          </div>
        </section>

        {/* 8. Statutory Grievance Redressal Officer */}
        <section className="space-y-3 text-xs sm:text-sm text-[#5E6573] border-t border-[#EBECEF] pt-6">
          <h2 className="text-base sm:text-lg font-bold text-[#13141B]">
            8. Grievance Redressal Officer &amp; Statutory Inquiries
          </h2>
          <p>
            In compliance with Rule 3(2) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, and the DPDP Act 2023, the details of our designated Grievance Officer are:
          </p>
          <div className="bg-[#FCFCFB] p-5 rounded-2xl border border-[#EBECEF] space-y-1.5 text-xs text-[#13141B]">
            <div><strong>Designation:</strong> Grievance Redressal &amp; Data Protection Officer</div>
            <div><strong>Entity:</strong> EdWorld Co.</div>
            <div><strong>Operating Headquarters:</strong> Hyderabad, Telangana, India</div>
            <div>
              <strong>Email:</strong>{" "}
              <a href="mailto:edworld.eden@gmail.com?subject=DPDP%20Grievance%20Inquiry" className="text-emerald-700 font-bold underline">
                edworld.eden@gmail.com
              </a>
            </div>
            <div><strong>Response Window:</strong> Acknowledgement within 24 hours, resolution within 48–72 hours.</div>
          </div>
          <p className="text-xs text-[#5E6573] pt-2">
            You may also submit a general inquiry through our{" "}
            <Link href="/contact" className="text-emerald-700 font-bold underline">
              Contact &amp; Support Page
            </Link>.
          </p>
        </section>

      </div>
    </div>
  );
}
