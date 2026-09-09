import React from "react";
import Link from "next/link";

export const metadata = {
  title: "Terms of Service — Edworld Co",
  description: "Terms and conditions governing the use of the Edworld Co platform."
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-paper py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8 bg-paper-raised p-8 sm:p-12 rounded-3xl border border-line shadow-sm text-ink leading-relaxed">
        <div className="border-b border-line pb-6 space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-forest">Legal Terms</span>
          <h1 className="text-3xl font-bold font-display text-ink">Terms of Service</h1>
          <p className="text-xs text-ink-soft">Last Updated: August 2026</p>
        </div>

        <section className="space-y-3 text-xs sm:text-sm">
          <h2 className="text-lg font-bold font-display text-ink">1. Platform Usage &amp; Age Eligibility</h2>
          <p className="text-xs text-ink-soft">
            Edworld Co serves youth (13–18) and adult career seekers (18+). Users below 13 years of age are not permitted to register. Minors (13–18) require verifiable guardian consent to enable select personalized features.
          </p>
        </section>

        <section className="space-y-3 text-xs sm:text-sm">
          <h2 className="text-lg font-bold font-display text-ink">2. Subscriptions &amp; Payments</h2>
          <p className="text-xs text-ink-soft">
            All paid subscriptions (Career Pro) are processed securely through Razorpay. Only users aged 18 and older may purchase subscriptions. Cancellations take effect at the end of the current billing cycle with self-service controls.
          </p>
        </section>

        <section className="space-y-3 text-xs sm:text-sm">
          <h2 className="text-lg font-bold font-display text-ink">3. Educational Reference Disclaimers</h2>
          <p className="text-xs text-ink-soft">
            Career-switch benchmarks, college comparison matrices, and salary reference ranges are provided strictly for educational and self-guidance purposes. Edworld Co does not guarantee employment outcomes or admission offers.
          </p>
        </section>

        <section className="space-y-3 text-xs sm:text-sm">
          <h2 className="text-lg font-bold font-display text-ink">4. Contact &amp; Questions</h2>
          <p className="text-xs text-ink-soft">
            For inquiries regarding our terms, visit our <Link href="/contact" className="text-forest font-bold underline">contact page</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
