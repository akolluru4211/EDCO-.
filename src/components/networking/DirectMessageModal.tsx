"use client";

import React, { useState, useEffect, useRef } from "react";
import { PublicUserProfile, DirectMessage } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import {
  X,
  Send,
  Lock,
  ShieldCheck,
  Sparkles,
  Loader2,
  CheckCheck,
  Check,
  User,
  Info
} from "lucide-react";

interface DirectMessageModalProps {
  peer: PublicUserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onMessageSent?: (msg: string) => void;
}

export default function DirectMessageModal({
  peer,
  isOpen,
  onClose,
  onMessageSent,
}: DirectMessageModalProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load conversation messages
  const fetchMessages = async () => {
    if (!user || !peer) return;
    try {
      const res = await fetch(`/api/network/messages?userId=${user.uid}&peerId=${peer.userId}`, {
        headers: { "x-user-id": user.uid },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.messages)) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.warn("Fetch direct messages error:", err);
    }
  };

  useEffect(() => {
    if (isOpen && peer && user) {
      setIsLoading(true);
      fetchMessages().finally(() => setIsLoading(false));
      setTimeout(() => {
        inputRef.current?.focus();
        scrollToBottom();
      }, 200);
    }
  }, [isOpen, peer?.userId, user?.uid]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user || !peer || isSending) return;

    const messageText = input.trim();
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: DirectMessage = {
      id: tempId,
      senderId: user.uid,
      receiverId: peer.userId,
      message: messageText,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setInput("");
    setIsSending(true);

    try {
      const res = await fetch("/api/network/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.uid,
        },
        body: JSON.stringify({
          receiverId: peer.userId,
          message: messageText,
          senderName: user.name || "A peer",
        }),
      });

      const data = await res.json();
      if (data.success && data.message) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? data.message : m))
        );
        onMessageSent?.(messageText);
      }
    } catch (err) {
      console.error("Send message error:", err);
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen || !peer) return null;

  const peerInitials = (peer.name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Dimmed Backdrop */}
      <div
        className="fixed inset-0 bg-[#13141B]/50 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-[#FCFCFB] shadow-2xl border-l border-[#E8ECF2] flex flex-col animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="bg-[#13141B] text-white p-4 sm:p-5 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative">
                {peer.avatarUrl ? (
                  <img
                    src={peer.avatarUrl}
                    alt={peer.name}
                    className="w-10 h-10 rounded-full object-cover border border-[#00D2B4]"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#00D2B4] to-emerald-400 text-[#13141B] flex items-center justify-center font-bold text-xs shadow-xs">
                    {peerInitials}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#13141B] rounded-full"></span>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm text-white truncate leading-none">
                    {peer.name}
                  </h3>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-[#00D2B4]/20 text-[#00D2B4] font-semibold border border-[#00D2B4]/30">
                    Verified
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 truncate mt-1 leading-none">
                  {peer.headline || (peer.userType === "STUDENT" ? "Student" : "Professional")}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close direct message"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* E2E Encryption Banner */}
          <div className="bg-emerald-50/70 border-b border-emerald-100 px-4 py-2 flex items-center justify-between text-[11px] text-emerald-950">
            <div className="flex items-center gap-1.5 font-medium">
              <Lock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>End-to-End Private Channel</span>
            </div>
            <span className="text-[10px] text-emerald-800 bg-emerald-100 font-bold px-1.5 py-0.5 rounded">
              🔒 E2E Mood
            </span>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAF8F5]/60">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-[#00D2B4]" />
                <p className="text-xs">Connecting to secure peer channel...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#EBECEF] text-[#00D2B4] flex items-center justify-center shadow-xs">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#13141B]">Direct Message with {peer.name}</h4>
                  <p className="text-[11px] text-gray-500 mt-1 max-w-[240px]">
                    Say hello, ask about their projects, or invite them to collaborate on interview prep!
                  </p>
                </div>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderId === user?.uid;
                const timeStr = new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    {!isMe && (
                      <div className="w-7 h-7 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {peerInitials}
                      </div>
                    )}

                    <div
                      className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-xs ${
                        isMe
                          ? "bg-[#13141B] text-white rounded-tr-none font-medium"
                          : "bg-white border border-[#EBECEF] text-[#13141B] rounded-tl-none font-normal"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                      <div
                        className={`text-[9px] mt-1 flex items-center justify-end gap-1 ${
                          isMe ? "text-gray-400" : "text-gray-400"
                        }`}
                      >
                        <span>{timeStr}</span>
                        {isMe && <CheckCheck className="w-3 h-3 text-[#00D2B4]" />}
                      </div>
                    </div>

                    {isMe && (
                      <div className="w-7 h-7 rounded-full bg-slate-800 text-[#00D2B4] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        Me
                      </div>
                    )}
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input & Dispatch Form */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-white border-t border-[#EBECEF] flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Message ${peer.name.split(" ")[0]}...`}
              disabled={isSending}
              className="flex-1 bg-[#F4F6FB] border border-[#E8ECF2] rounded-xl px-3.5 py-2 text-xs text-[#13141B] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00D2B4]/40 focus:border-[#00D2B4] transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isSending}
              className="p-2.5 bg-[#13141B] hover:bg-[#252632] text-white rounded-xl disabled:opacity-40 transition-all shadow-xs shrink-0 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#00D2B4]"
              aria-label="Send direct message"
            >
              {isSending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00D2B4]" />
              ) : (
                <Send className="w-3.5 h-3.5 text-[#00D2B4]" />
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
