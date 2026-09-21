"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { 
  Building2, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Lock, 
  ArrowLeft, 
  Check, 
  Briefcase,
  DollarSign,
  MapPin,
  Sparkles
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function OfferComparisonPage() {
  const { user } = useAuth();
  const [offers, setOffers] = useState<any[]>([
    {
      id: "offer-1",
      company: "Acme Cloud Corp",
      role: "Senior Backend Engineer",
      baseComp: "145,000",
      bonus: "15,000",
      equity: "40,000 / yr (4yr vest)",
      location: "San Francisco / Hybrid",
      workMode: "Hybrid",
      benefits: "401k match 5%, $3k learning stipend, Comprehensive health",
      notes: "Infra platform team; high autonomy, on-call rotation 1 wk/mo"
    },
    {
      id: "offer-2",
      company: "Globex Digital",
      role: "Staff Software Engineer",
      baseComp: "160,000",
      bonus: "20,000",
      equity: "25,000 / yr",
      location: "Remote (US/Canada)",
      workMode: "Remote",
      benefits: "Unlimited PTO, $2k home office setup, full dental/vision",
      notes: "Leading developer experience team; full remote flexibility"
    }
  ]);

  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      const cached = localStorage.getItem("edworld_" + user.uid + "_offers");
      if (cached) {
        try { setOffers(JSON.parse(cached)); } catch(e) {}
      }
    }
  }, [user]);

  const handleAddOffer = () => {
    const newOffer = {
      id: "offer-" + Date.now(),
      company: "Company " + (offers.length + 1),
      role: "Software Engineer",
      baseComp: "120,000",
      bonus: "10,000",
      equity: "20,000",
      location: "Remote",
      workMode: "Remote",
      benefits: "Standard Health, 401(k)",
      notes: "Key considerations..."
    };
    setOffers((prev) => [...prev, newOffer]);
  };

  const updateOffer = (idx: number, field: string, val: string) => {
    const updated = [...offers];
    updated[idx] = { ...updated[idx], [field]: val };
    setOffers(updated);
  };

  const removeOffer = (idx: number) => {
    setOffers((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (user?.uid) {
      localStorage.setItem("edworld_" + user.uid + "_offers", JSON.stringify(offers));
      try {
        await supabase.from("offer_comparisons").upsert({
          user_id: user.uid,
          offers,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {}
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#0E0F15] text-slate-100 p-4 sm:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl bg-[#151621] border border-white/10 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-lg">
              <Briefcase className="w-6 h-6 text-[#D7FC51]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-white">Private Offer Comparison Tool</h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center gap-1 border border-emerald-500/30">
                  <Lock className="w-3 h-3" /> Confidential
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAddOffer}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Offer</span>
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-[#D7FC51] text-slate-950 text-xs font-black hover:bg-[#cbf13f] flex items-center gap-1.5 shadow-md transition-all"
            >
              <Check className="w-4 h-4" />
              <span>{isSaved ? "Saved!" : "Save Comparison"}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {offers.map((offer, idx) => (
            <div
              key={offer.id || idx}
              className="p-5 sm:p-6 rounded-3xl bg-[#151621] border border-white/10 shadow-lg space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-[10px] font-mono font-bold text-[#D7FC51] uppercase">Offer #{idx + 1}</span>
                  <button
                    onClick={() => removeOffer(idx)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                    title="Remove Offer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">Company</label>
                  <input
                    type="text"
                    value={offer.company}
                    onChange={(e) => updateOffer(idx, "company", e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs font-bold text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">Target Role</label>
                  <input
                    type="text"
                    value={offer.role}
                    onChange={(e) => updateOffer(idx, "role", e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">Base Salary</label>
                    <input
                      type="text"
                      value={offer.baseComp}
                      onChange={(e) => updateOffer(idx, "baseComp", e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-emerald-400 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">Annual Bonus</label>
                    <input
                      type="text"
                      value={offer.bonus || ""}
                      onChange={(e) => updateOffer(idx, "bonus", e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">Equity / Stock</label>
                  <input
                    type="text"
                    value={offer.equity || ""}
                    onChange={(e) => updateOffer(idx, "equity", e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">Work Mode</label>
                    <select
                      value={offer.workMode || "Remote"}
                      onChange={(e) => updateOffer(idx, "workMode", e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
                    >
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="On-site">On-site</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">Location</label>
                    <input
                      type="text"
                      value={offer.location}
                      onChange={(e) => updateOffer(idx, "location", e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">Key Benefits &amp; Perks</label>
                  <textarea
                    rows={2}
                    value={offer.benefits || ""}
                    onChange={(e) => updateOffer(idx, "benefits", e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">Personal Notes &amp; Trade-offs</label>
                  <textarea
                    rows={2}
                    value={offer.notes || ""}
                    onChange={(e) => updateOffer(idx, "notes", e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-300"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
