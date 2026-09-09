"use client";

export const dynamic = "force-dynamic";

import React from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  ArrowLeft, 
  Check, 
  X, 
  Lock, 
  Eye, 
  FileText, 
  Video, 
  MessageSquare, 
  Heart, 
  Award,
  Sparkles 
} from "lucide-react";

export default function TeacherTransparencyPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-paper py-8 px-4 sm:px-6 lg:px-8 text-ink">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div className="space-y-3">
          <Link href="/school" className="text-xs font-bold text-ink-soft hover:text-ink flex items-center gap-1.5 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to School Hub</span>
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-forest/10 text-forest border border-forest/20 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Student Privacy &amp; Data Transparency</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold font-display text-ink mt-1">What Your Teacher Can See</h1>
            <p className="text-xs sm:text-sm text-ink-soft max-w-2xl">
              Edworld Co enforces a purpose-built, narrow view for classroom educators. Your teachers only see progress metrics directly relevant to their subject cohort.
            </p>
          </div>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* WHAT TEACHERS CAN SEE */}
          <div className="bg-paper-raised rounded-3xl p-6 sm:p-8 border border-forest/20 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-forest/10 text-forest flex items-center justify-center font-bold">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-forest">Visible to Teacher</span>
                <h2 className="text-base font-bold font-display text-ink">Subject-Relevant Progress Only</h2>
              </div>
            </div>

            <div className="space-y-3 text-xs text-ink-soft">
              <div className="p-3.5 rounded-2xl bg-forest/5 border border-forest/15 flex items-start gap-2.5">
                <Check className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                <div>
                  <strong className="text-ink">Your Display Name:</strong>
                  <p className="text-ink-soft text-[11px] mt-0.5">So your teacher can match you to the class roster.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-forest/5 border border-forest/15 flex items-start gap-2.5">
                <Check className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                <div>
                  <strong className="text-ink">Subject Quests Completed:</strong>
                  <p className="text-ink-soft text-[11px] mt-0.5">Counts of completed Curiosity Quests tagged for that class subject.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-forest/5 border border-forest/15 flex items-start gap-2.5">
                <Check className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                <div>
                  <strong className="text-ink">AI Practice Mastery Score:</strong>
                  <p className="text-ink-soft text-[11px] mt-0.5">Aggregated practice score for assigned communication drills.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-forest/5 border border-forest/15 flex items-start gap-2.5">
                <Check className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                <div>
                  <strong className="text-ink">Classroom Join Date:</strong>
                  <p className="text-ink-soft text-[11px] mt-0.5">The timestamp when you entered the join code.</p>
                </div>
              </div>
            </div>
          </div>

          {/* WHAT TEACHERS CAN NEVER SEE */}
          <div className="bg-paper-raised rounded-3xl p-6 sm:p-8 border border-rose-200/80 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-rose-600">Strictly Private</span>
                <h2 className="text-base font-bold font-display text-ink">Never Exposed to Teachers</h2>
              </div>
            </div>

            <div className="space-y-3 text-xs text-ink-soft">
              <div className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-100 flex items-start gap-2.5">
                <X className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-ink">Personal Growth Journal:</strong>
                  <p className="text-ink-soft text-[11px] mt-0.5">Your reflections, mood logs, and private thoughts are 100% private.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-100 flex items-start gap-2.5">
                <X className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-ink">Email, Date of Birth &amp; Age Band:</strong>
                  <p className="text-ink-soft text-[11px] mt-0.5">Personal identity data is excluded from all educator endpoints.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-100 flex items-start gap-2.5">
                <X className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-ink">Resume Content &amp; Mock Video Recordings:</strong>
                  <p className="text-ink-soft text-[11px] mt-0.5">Draft resumes and interview recordings are strictly confidential.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-100 flex items-start gap-2.5">
                <X className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-ink">Unapproved Showcase Submissions:</strong>
                  <p className="text-ink-soft text-[11px] mt-0.5">Pending projects remain invisible until reviewed.</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Audit Guarantee Card */}
        <div className="bg-paper-raised rounded-3xl p-6 border border-line shadow-sm flex items-center justify-between text-xs text-ink-soft">
          <div className="flex items-center gap-3">
            <Eye className="w-5 h-5 text-forest shrink-0" />
            <span>
              <strong className="text-ink">Roster Access Audit Trail:</strong> Every time a teacher accesses your classroom progress roster, an immutable security event is recorded in the platform audit log.
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
