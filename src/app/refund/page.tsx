import React from "react";
import Link from "next/link";
import { RefreshCcw, ShieldCheck, Clock, CheckCircle2, AlertCircle, Mail } from "lucide-react";

export const metadata = {
  title: "Refund & Cancellation Policy — EdWorld Co.",
  description: "Transparent 7-day refund guarantee and cancellation terms for paid subscriptions on EdWorld Co."
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FCFCFB] py-16 px-4 sm:px-6 lg:px-8 text-[#13141B] font-sans selection:bg-[#00D2B4]/20 selection:text-[#0A5245]">
      <div className="max-w-4xl mx-auto space-y-10 bg-white p-6 sm:p-12 rounded-3xl border border-[#EBECEF] shadow-xs leading-relaxed">
        
        {/* Header */}
        <div className="border-b border-[#EBECEF] pb-6 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
            <RefreshCcw className="w-4 h-4 text-emerald-600" />
            <span>Fair &amp; Transparent Billing</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#13141B] tracking-tight">
            Refund &amp; Cancellation Policy
          </h1>
          <p className="text-xs text-[#5E6573]">
            Last Updated: October 2026 &bull; Operational Headquarters: Hyderabad, Telangana, India
          </p>
        </div>

        {/* 1. 7-Day Money-Back Guarantee */}
        <section className="space-y-3 text-xs sm:text-sm text-[#5E6573]">
          <h2 className="text-base sm:text-lg font-bold text-[#13141B] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>1. 7-Day Cooling-Off Period &amp; Money-Back Guarantee</span>
          </h2>
          <p>
            At EdWorld Co., we want every learner and job seeker to be fully confident in our tools. When you upgrade to a paid tier (such as <strong>Career Pro at ₹49/month</strong> or <strong>Executive Premium at ₹99/month</strong>), your initial subscription purchase is covered by our <strong>7-Day Money-Back Guarantee</strong>.
          </p>
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-[#13141B] space-y-2">
            <div className="font-bold text-emerald-900 text-xs sm:text-sm">Eligibility for 100% Refund:</div>
            <ul className="list-disc list-inside space-y-1 text-xs text-[#5E6573]">
              <li>Your refund request is submitted within <strong>7 calendar days</strong> from the initial subscription transaction timestamp.</li>
              <li>You have completed fewer than 3 full AI Mock Interview sessions during the initial 7-day period (to prevent bad-faith scraping of proprietary question banks).</li>
            </ul>
          </div>
        </section>

        {/* 2. Self-Service Subscription Cancellation */}
        <section className="space-y-3 text-xs sm:text-sm text-[#5E6573]">
          <h2 className="text-base sm:text-lg font-bold text-[#13141B] flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>2. Frictionless Subscription Cancellation (Zero Hidden Traps)</span>
          </h2>
          <p>
            We strictly reject dark patterns and deceptive billing. You have total autonomy to cancel auto-renewal at any time:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs sm:text-sm text-[#5E6573]">
            <li><strong>Self-Service 1-Click Cancellation:</strong> Navigate to your Account Settings &rarr; Billing &rarr; Click <em>&ldquo;Cancel Subscription&rdquo;</em>. There are no retention quizzes, hidden phone lines, or penalty fees.</li>
            <li><strong>Access Until Cycle End:</strong> If you cancel after the 7-day refund window, your subscription will not renew, and you will retain full access to Pro tools until the end of your prepaid monthly cycle.</li>
          </ul>
        </section>

        {/* 3. Refund Processing & Timelines */}
        <section className="space-y-3 text-xs sm:text-sm text-[#5E6573]">
          <h2 className="text-base sm:text-lg font-bold text-[#13141B]">
            3. Processing Method &amp; Turnaround SLA
          </h2>
          <p>
            Approved refunds are credited directly to the original payment source through Razorpay:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3.5 rounded-2xl bg-[#FCFCFB] border border-[#EBECEF]">
              <div className="font-bold text-[#13141B] text-xs mb-1">UPI Payments</div>
              <p className="text-xs text-[#5E6573]">Credited back to your VPA/bank account within <strong>24–48 hours</strong>.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#FCFCFB] border border-[#EBECEF]">
              <div className="font-bold text-[#13141B] text-xs mb-1">Debit &amp; Credit Cards</div>
              <p className="text-xs text-[#5E6573]">Reflected on your banking statement within <strong>5–7 business days</strong>.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#FCFCFB] border border-[#EBECEF]">
              <div className="font-bold text-[#13141B] text-xs mb-1">Net Banking</div>
              <p className="text-xs text-[#5E6573]">Credited back per your bank&rsquo;s NEFT/RTGS settlement (usually <strong>2–4 days</strong>).</p>
            </div>
          </div>
        </section>

        {/* 4. Non-Refundable Circumstances */}
        <section className="space-y-3 text-xs sm:text-sm text-[#5E6573]">
          <h2 className="text-base sm:text-lg font-bold text-[#13141B]">
            4. Exceptions &amp; Non-Refundable Scenarios
          </h2>
          <p>
            Refunds cannot be issued under the following conditions:
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs text-[#5E6573]">
            <li>Requests submitted after the 7-day cooling-off window has elapsed.</li>
            <li>Accounts that have been suspended or terminated due to verified violations of our Terms of Service (e.g. cheating, malicious scraping, or harassment).</li>
            <li>Custom enterprise campus placement drive contracts (governed by separate signed institutional Master Service Agreements).</li>
          </ul>
        </section>

        {/* 5. How to Initiate a Refund */}
        <section className="space-y-3 text-xs sm:text-sm text-[#5E6573] border-t border-[#EBECEF] pt-6">
          <h2 className="text-base sm:text-lg font-bold text-[#13141B] flex items-center gap-2">
            <Mail className="w-4 h-4 text-emerald-600" />
            <span>5. How to Request a Refund</span>
          </h2>
          <p>
            To initiate a refund, simply send an email from your registered account email to:
          </p>
          <div className="p-4 rounded-2xl bg-[#FCFCFB] border border-[#EBECEF] space-y-1 text-xs text-[#13141B]">
            <div><strong>Email:</strong> <a href="mailto:edworld.eden@gmail.com?subject=Refund%20Request" className="font-bold text-emerald-700 underline">edworld.eden@gmail.com</a></div>
            <div><strong>Subject:</strong> Refund Request - [Your Registered Email]</div>
            <div><strong>Include:</strong> Razorpay Payment ID or Transaction Date</div>
            <div><strong>Resolution SLA:</strong> Our finance team in Hyderabad reviews and responds within 24 hours.</div>
          </div>
        </section>

      </div>
    </div>
  );
}
