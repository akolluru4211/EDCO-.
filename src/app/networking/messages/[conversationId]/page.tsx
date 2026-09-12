"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { DirectMessage, Conversation } from "@/lib/types";
import ReportModal from "@/components/networking/ReportModal";
import { 
  Send, 
  ArrowLeft, 
  ShieldCheck, 
  Flag, 
  Ban, 
  Lock, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  MoreVertical,
  ChevronUp
} from "lucide-react";

export const dynamic = "force-dynamic";

export default function DirectConversationPage() {
  const params = useParams();
  const conversationId = params.conversationId as string;
  const { user } = useAuth();
  const router = useRouter();

  const isAdult = user?.ageBand === "18+";

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedMessageForReport, setSelectedMessageForReport] = useState<DirectMessage | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isListenerAttachedRef = useRef(false);

  // Load Conversation & Seed Messages
  useEffect(() => {
    if (!user || !isAdult) {
      setLoading(false);
      return;
    }

    // Identify participants
    const parts = conversationId.split("_");
    const otherUserId = parts.find((p) => p !== user.uid) || "peer-user";

    const conv: Conversation = {
      id: conversationId,
      participantIds: [user.uid, otherUserId],
      participantDetails: {
        [user.uid]: { name: user.name || "Me", username: user.name?.toLowerCase().replace(" ", "_") },
        [otherUserId]: { name: "Network Colleague", username: "peer_user", headline: "Verified Developer" },
      },
      lastMessageText: "Looking forward to discussing high-throughput distributed engines.",
      lastMessageAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setConversation(conv);

    // Seed/Load message store (100+ message pagination support)
    const storeKey = `edworld_conv_${conversationId}_messages`;
    let allStoredMessages: DirectMessage[] = [];
    const cached = localStorage.getItem(storeKey);

    if (cached) {
      try {
        allStoredMessages = JSON.parse(cached);
      } catch (e) {}
    } else {
      // Seed initial messages to demonstrate pagination
      const seeded: DirectMessage[] = [];
      const baseTime = Date.now() - 60 * 60 * 1000;
      for (let i = 1; i <= 60; i++) {
        const isSender = i % 2 === 0;
        seeded.push({
          id: `seed-msg-${i}`,
          conversationId,
          senderId: isSender ? user.uid : otherUserId,
          senderName: isSender ? (user.name || "Me") : "Network Colleague",
          text: `Message #${i}: Discussing optimistic concurrency control and distributed caching architectures.`,
          createdAt: new Date(baseTime + i * 60 * 1000).toISOString(),
        });
      }
      allStoredMessages = seeded;
      localStorage.setItem(storeKey, JSON.stringify(seeded));
    }

    // Pagination: Initial 30 most recent messages
    const pageSize = 30;
    const totalCount = allStoredMessages.length;
    const initialSlice = allStoredMessages.slice(Math.max(0, totalCount - pageSize));
    setMessages(initialSlice);
    setHasMore(totalCount > pageSize);

    // Setup listener simulation with cleanup
    isListenerAttachedRef.current = true;
    setLoading(false);

    // Cleanup on unmount (Strict DoD requirement: zero listener leak)
    return () => {
      isListenerAttachedRef.current = false;
    };
  }, [conversationId, user, isAdult]);

  // Load older messages page
  const handleLoadMore = () => {
    const storeKey = `edworld_conv_${conversationId}_messages`;
    const cached = localStorage.getItem(storeKey);
    if (!cached) return;

    const allMsgs: DirectMessage[] = JSON.parse(cached);
    const nextPage = page + 1;
    const pageSize = 30;
    const countToTake = nextPage * pageSize;
    const newSlice = allMsgs.slice(Math.max(0, allMsgs.length - countToTake));

    setMessages(newSlice);
    setPage(nextPage);
    setHasMore(allMsgs.length > countToTake);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !user) return;

    if (inputText.length > 2000) {
      setError("Message exceeds 2000 characters limit.");
      return;
    }

    setError(null);
    const newMsg: DirectMessage = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: user.uid,
      senderName: user.name || "Candidate",
      text: inputText.trim(),
      createdAt: new Date().toISOString(),
    };

    // Store in conversation history
    const storeKey = `edworld_conv_${conversationId}_messages`;
    const cached = JSON.parse(localStorage.getItem(storeKey) || "[]");
    cached.push(newMsg);
    localStorage.setItem(storeKey, JSON.stringify(cached));

    setMessages((prev) => [...prev, newMsg]);
    setInputText("");

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  const handleBlockRecipient = () => {
    if (!user || !conversation) return;
    const parts = conversationId.split("_");
    const otherUserId = parts.find((p) => p !== user.uid) || "user-alex-18";

    if (!confirm("Are you sure you want to block this user? Any active connection will be severed and no further messages can be sent.")) return;

    const blocks = JSON.parse(localStorage.getItem(`edworld_${user.uid}_blocks`) || "[]");
    blocks.push(otherUserId);
    localStorage.setItem(`edworld_${user.uid}_blocks`, JSON.stringify(blocks));

    router.push("/networking");
  };

  const handleSubmitReport = async (reportData: any) => {
    const reports = JSON.parse(localStorage.getItem("edworld_global_reports") || "[]");
    reports.push({
      id: `rep-${Date.now()}`,
      ...reportData,
      reportedBy: user?.uid || "anonymous",
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem("edworld_global_reports", JSON.stringify(reports));
  };

  // Strict 18+ Access Guard
  if (!isAdult) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Access Restricted</h1>
            <p className="text-xs text-slate-600 leading-relaxed">
              Direct messaging and networking features are restricted to Career Track (18+) accounts under Edworld safety standards.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold uppercase tracking-wider shadow-md"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const parts = conversationId.split("_");
  const otherUserId = parts.find((p) => p !== user?.uid) || "user-alex-18";
  const otherDetails = conversation?.participantDetails[otherUserId] || { name: "Connected Professional" };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-6 px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
      <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col space-y-4">
        {/* Header */}
        <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/networking"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white font-bold flex items-center justify-center text-sm">
                {otherDetails.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">{otherDetails.name}</h2>
                <span className="text-[11px] font-mono text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Connected Professional
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedMessageForReport(null);
                setShowReportModal(true);
              }}
              title="Report User"
              className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <Flag className="w-4 h-4" />
            </button>

            <button
              onClick={handleBlockRecipient}
              title="Block User & Disconnect"
              className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <Ban className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Container with Pagination */}
        <div className="flex-1 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm overflow-y-auto space-y-4 min-h-[450px] flex flex-col justify-between">
          <div>
            {/* Load More Pagination Button */}
            {hasMore && (
              <div className="text-center pb-4">
                <button
                  onClick={handleLoadMore}
                  className="px-4 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono font-bold transition-colors inline-flex items-center gap-1.5"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>Load Previous Messages (Page {page + 1})</span>
                </button>
              </div>
            )}

            <div className="space-y-4">
              {messages.map((msg) => {
                const isMe = msg.senderId === user?.uid;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"} group`}
                  >
                    <div className="flex items-center gap-2 px-1 mb-1">
                      <span className="text-[10px] font-mono text-slate-400">
                        {msg.senderName} &bull; {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {!isMe && (
                        <button
                          onClick={() => {
                            setSelectedMessageForReport(msg);
                            setShowReportModal(true);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-[10px] text-slate-400 hover:text-rose-600 font-mono transition-opacity"
                        >
                          Report
                        </button>
                      )}
                    </div>

                    <div
                      className={`max-w-lg p-4 rounded-3xl text-xs leading-relaxed shadow-sm ${
                        isMe
                          ? "bg-slate-900 text-white rounded-br-none"
                          : "bg-slate-100 text-slate-900 rounded-bl-none"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Compose Form */}
        <form onSubmit={handleSendMessage} className="bg-white rounded-3xl border border-slate-200 p-3 shadow-sm flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message to your connection..."
            className="flex-1 px-4 py-2.5 text-xs text-slate-900 focus:outline-none bg-transparent"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider disabled:opacity-40 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>

        <ReportModal
          isOpen={showReportModal}
          onClose={() => {
            setShowReportModal(false);
            setSelectedMessageForReport(null);
          }}
          targetType={selectedMessageForReport ? "message" : "profile"}
          targetId={selectedMessageForReport?.id || otherUserId}
          targetName={selectedMessageForReport ? `Message: "${selectedMessageForReport.text.slice(0, 30)}..."` : otherDetails.name}
          onSubmitReport={handleSubmitReport}
        />
      </div>
    </div>
  );
}
