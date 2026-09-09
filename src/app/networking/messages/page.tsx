"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { MessageThread } from "@/lib/types";
import { 
  MessageSquare, 
  ShieldCheck, 
  ArrowLeft, 
  Search, 
  Clock, 
  ArrowRight, 
  CheckCheck, 
  Lock 
} from "lucide-react";

export const dynamic = "force-dynamic";

export default function MessagesInboxPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const isJunior = user?.ageBand === "13-15";

  const THREADS: MessageThread[] = [
    {
      id: "thread-mentor-1",
      participants: [user?.uid || "user-1", "user-mentor-1"],
      participantDetails: {
        "user-mentor-1": { name: "Dr. Arvind Subramanian", isMentor: true },
        [user?.uid || "user-1"]: { name: user?.name || "Candidate" },
      },
      lastMessage: "Looking forward to our System Design session tomorrow! Here is the meeting room link.",
      lastMessageAt: "10 mins ago",
      unreadCounts: { [user?.uid || "user-1"]: 1 },
    },
    {
      id: "thread-circle-1",
      participants: [user?.uid || "user-1", "user-peer-1"],
      participantDetails: {
        "user-peer-1": { name: "Software Engineering Peer Study Circle" },
        [user?.uid || "user-1"]: { name: user?.name || "Candidate" },
      },
      lastMessage: "Alex: We just uploaded the STAR mock problem sheet in the circle drive.",
      lastMessageAt: "2 hours ago",
      unreadCounts: { [user?.uid || "user-1"]: 0 },
      isSupervisedCohort: true,
    },
  ];

  if (isJunior) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-mono font-bold uppercase tracking-wider">
              Junior Track (13-15)
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Direct Messaging Restricted</h1>
            <p className="text-xs text-slate-600 leading-relaxed">
              Under Edworld Youth Safety guidelines, 1:1 direct messaging is restricted for Class 9-10 accounts. You can participate in supervised classroom discussions and study cohorts.
            </p>
          </div>
          <Link
            href="/networking"
            className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider shadow-md flex items-center justify-center gap-2"
          >
            <span>Back to Networking Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
          <Link href="/networking" className="hover:text-slate-900 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Networking Hub</span>
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-bold">Messages</span>
        </div>

        {/* Header */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-xs font-bold font-mono border border-brand-200">
                Encrypted Session Chat
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Direct Messages &amp; Cohorts
            </h1>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Youth PII Sanitizer Enabled</span>
          </div>
        </div>

        {/* Thread List */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
          {THREADS.map((thread) => {
            const otherParticipantId = thread.participants.find((p) => p !== (user?.uid || "user-1")) || "user-mentor-1";
            const details = thread.participantDetails[otherParticipantId];
            const unread = thread.unreadCounts[user?.uid || "user-1"] || 0;

            return (
              <Link
                key={thread.id}
                href={`/networking/messages/${thread.id}`}
                className="p-5 hover:bg-slate-50/80 transition-colors flex items-start sm:items-center justify-between gap-4 group block"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white font-bold flex items-center justify-center text-sm shrink-0">
                    {details?.name?.slice(0, 2).toUpperCase() || "ME"}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                        {details?.name}
                      </h3>
                      {details?.isMentor && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-mono font-bold border border-emerald-200">
                          Mentor
                        </span>
                      )}
                      {thread.isSupervisedCohort && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[10px] font-mono font-bold border border-blue-200">
                          Supervised Cohort
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-1 max-w-lg">
                      {thread.lastMessage}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className="text-[11px] font-mono text-slate-400">{thread.lastMessageAt}</span>
                  {unread > 0 && (
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-mono font-bold flex items-center justify-center">
                      {unread}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
