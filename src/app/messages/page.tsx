"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import {
  MessageSquare,
  Search,
  Send,
  UserPlus,
  ArrowLeft,
  Check,
  CheckCheck,
  Loader2,
  Users,
  ShieldCheck,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Plus,
  Radio
} from "lucide-react";

interface ConversationThread {
  id: string;
  conversationId: string;
  partnerId: string;
  partnerName: string;
  partnerUsername: string;
  partnerHeadline: string;
  partnerAvatarUrl?: string | null;
  lastMessage: string;
  lastSenderId: string;
  isLastFromMe: boolean;
  unreadCount: number;
  updatedAt: string;
}

interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  conversationId: string;
  message: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface ConnectedPartner {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerUsername: string;
  partnerHeadline: string;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const initialPeerId = searchParams.get("peerId");

  const [threads, setThreads] = useState<ConversationThread[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(initialPeerId || null);
  const [activePartner, setActivePartner] = useState<any | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingThreads, setIsLoadingThreads] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isRealtimeActive, setIsRealtimeActive] = useState(true);

  // New Chat Modal state
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [connectedPartners, setConnectedPartners] = useState<ConnectedPartner[]>([]);
  const [isLoadingPartners, setIsLoadingPartners] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom of message stream
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch threads list
  const loadThreads = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const res = await fetch("/api/network/messages", {
        headers: { "x-user-id": user.uid },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.threads)) {
        setThreads(data.threads);
        if (typeof data.totalUnreadCount === "number") {
          window.dispatchEvent(
            new CustomEvent("edworld:messages_read", {
              detail: { unreadCount: data.totalUnreadCount },
            })
          );
        }
      }
    } catch (err) {
      console.warn("Failed to load conversation threads:", err);
    } finally {
      setIsLoadingThreads(false);
    }
  }, [user?.uid]);

  // Fetch message stream for selected partner
  const loadMessages = useCallback(async (partnerId: string) => {
    if (!user?.uid || !partnerId) return;
    try {
      const res = await fetch(`/api/network/messages?peerId=${partnerId}`, {
        headers: { "x-user-id": user.uid },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.messages)) {
        setMessages(data.messages);
        window.dispatchEvent(
          new CustomEvent("edworld:messages_read", {
            detail: { unreadCount: 0 },
          })
        );
      }
    } catch (err) {
      console.warn("Failed to load message stream:", err);
    } finally {
      setIsLoadingMessages(false);
    }
  }, [user?.uid]);

  // Load connected peers for "New Chat" modal
  const loadConnectedPartners = async () => {
    if (!user?.uid) return;
    setIsLoadingPartners(true);
    try {
      const res = await fetch("/api/network/connections", {
        headers: { "x-user-id": user.uid },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.connections)) {
        setConnectedPartners(data.connections);
      }
    } catch (err) {
      console.warn("Failed to load connections:", err);
    } finally {
      setIsLoadingPartners(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (user?.uid) {
      loadThreads();
    }
  }, [user?.uid, loadThreads]);

  // 1. Supabase Realtime User Channel & Postgres WAL changes
  useEffect(() => {
    if (!user?.uid) return;

    const userChannel = supabase
      .channel(`edworld_user_${user.uid}`)
      .on("broadcast", { event: "new_message" }, (payload: any) => {
        loadThreads();
        const incomingMsg = payload?.payload?.message;
        if (
          incomingMsg &&
          selectedPartnerId &&
          (incomingMsg.senderId === selectedPartnerId || incomingMsg.receiverId === selectedPartnerId)
        ) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === incomingMsg.id)) return prev;
            return [...prev, incomingMsg];
          });
          fetch(`/api/network/messages?peerId=${selectedPartnerId}`, {
            headers: { "x-user-id": user.uid },
          }).catch(() => {});
          window.dispatchEvent(new CustomEvent("edworld:messages_read", { detail: { unreadCount: 0 } }));
        }
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setIsRealtimeActive(true);
        }
      });

    const dbChannel = supabase
      .channel(`db_messages_${user.uid}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "direct_messages",
          filter: `receiver_id=eq.${user.uid}`,
        },
        () => {
          loadThreads();
          if (selectedPartnerId) {
            loadMessages(selectedPartnerId);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(userChannel);
      supabase.removeChannel(dbChannel);
    };
  }, [user?.uid, selectedPartnerId, loadThreads, loadMessages]);

  // 2. Active Conversation Realtime Channel (Instant sub-100ms message sync)
  useEffect(() => {
    if (!user?.uid || !selectedPartnerId) return;

    const canonicalConvId = [user.uid, selectedPartnerId].sort().join(":");
    const chatChannel = supabase
      .channel(`edworld_chat_${canonicalConvId}`)
      .on("broadcast", { event: "new_message" }, (payload: any) => {
        const incomingMsg = payload?.payload;
        if (incomingMsg) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === incomingMsg.id)) return prev;
            return [...prev, incomingMsg];
          });
          loadThreads();
          fetch(`/api/network/messages?peerId=${selectedPartnerId}`, {
            headers: { "x-user-id": user.uid },
          }).catch(() => {});
          window.dispatchEvent(new CustomEvent("edworld:messages_read", { detail: { unreadCount: 0 } }));
        }
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setIsRealtimeActive(true);
        }
      });

    return () => {
      supabase.removeChannel(chatChannel);
    };
  }, [user?.uid, selectedPartnerId, loadThreads]);

  // 3. Periodic fallback poll (relaxed 12s interval for background consistency)
  useEffect(() => {
    if (!user?.uid) return;
    const interval = setInterval(() => {
      loadThreads();
      if (selectedPartnerId) {
        loadMessages(selectedPartnerId);
      }
    }, 12000);
    return () => clearInterval(interval);
  }, [user?.uid, selectedPartnerId, loadThreads, loadMessages]);

  // Update active partner info whenever selectedPartnerId or threads change
  useEffect(() => {
    if (selectedPartnerId) {
      setIsLoadingMessages(true);
      loadMessages(selectedPartnerId);

      // Check if thread exists for partner
      const matchedThread = threads.find((t) => t.partnerId === selectedPartnerId);
      if (matchedThread) {
        setActivePartner({
          partnerId: matchedThread.partnerId,
          partnerName: matchedThread.partnerName,
          partnerHeadline: matchedThread.partnerHeadline,
          partnerUsername: matchedThread.partnerUsername,
        });
      } else {
        // If deep-linked or new chat, fetch profile detail
        fetch(`/api/network/members?query=${selectedPartnerId}`, {
          headers: user?.uid ? { "x-user-id": user.uid } : {},
        })
          .then((r) => r.json())
          .then((d) => {
            const member = d.members?.find((m: any) => m.userId === selectedPartnerId);
            if (member) {
              setActivePartner({
                partnerId: member.userId,
                partnerName: member.name,
                partnerHeadline: member.headline,
                partnerUsername: member.username,
              });
            }
          })
          .catch(() => {});
      }
    } else {
      setActivePartner(null);
      setMessages([]);
    }
  }, [selectedPartnerId, threads, user?.uid, loadMessages]);

  // Scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send message handler
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user?.uid || !selectedPartnerId || !inputText.trim() || isSending) return;

    const messageContent = inputText.trim();
    setInputText("");
    setIsSending(true);

    // Optimistic message append
    const tempMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      senderId: user.uid,
      receiverId: selectedPartnerId,
      conversationId: [user.uid, selectedPartnerId].sort().join(":"),
      message: messageContent,
      content: messageContent,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const res = await fetch("/api/network/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.uid,
        },
        body: JSON.stringify({
          receiverId: selectedPartnerId,
          content: messageContent,
          senderName: user.name || "A connected peer",
        }),
      });

      const data = await res.json();
      if (data.success && data.message) {
        const savedMessage = data.message;
        setMessages((prev) =>
          prev.map((m) => (m.id === tempMsg.id ? savedMessage : m))
        );
        loadThreads();

        // 1. Instant WebSocket broadcast to active chat room
        const canonicalConvId = [user.uid, selectedPartnerId].sort().join(":");
        const chatChannel = supabase.channel(`edworld_chat_${canonicalConvId}`);
        chatChannel.send({
          type: "broadcast",
          event: "new_message",
          payload: savedMessage,
        });

        // 2. Instant notification broadcast to receiver's user channel
        const userChannel = supabase.channel(`edworld_user_${selectedPartnerId}`);
        userChannel.send({
          type: "broadcast",
          event: "new_message",
          payload: { senderId: user.uid, message: savedMessage },
        });

        // 3. Dispatch local event for Navbar
        window.dispatchEvent(new CustomEvent("edworld:message_sent"));
      }
    } catch (err) {
      console.error("Send message error:", err);
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const filteredThreads = threads.filter((t) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.partnerName.toLowerCase().includes(q) ||
      t.lastMessage.toLowerCase().includes(q) ||
      t.partnerHeadline.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#FCFCFB] text-[#13141B] font-sans pt-4 pb-12">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Messenger Card Shell */}
        <div className="bg-white border border-[#EBECEF] rounded-3xl shadow-sm overflow-hidden flex flex-col md:flex-row h-[calc(100vh-100px)] min-h-[600px]">
          
          {/* LEFT SIDEBAR: Conversations List */}
          <div
            className={`w-full md:w-80 lg:w-96 border-r border-[#EBECEF] flex flex-col shrink-0 bg-white ${
              selectedPartnerId ? "hidden md:flex" : "flex"
            }`}
          >
            {/* Sidebar Header */}
            <div className="p-4 sm:p-5 border-b border-[#EBECEF] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h1 className="text-base font-black text-[#13141B] leading-none">Messages</h1>
                      {isRealtimeActive && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Supabase Realtime Sync Connected" />
                      )}
                    </div>
                    <span className="text-[10px] text-gray-500 font-medium">Verified Peer Network</span>
                  </div>
                </div>

                {/* New Chat Button */}
                <button
                  onClick={() => {
                    loadConnectedPartners();
                    setIsNewChatOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#13141B] hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                  title="Start a new chat with your connections"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Chat</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full pl-8 pr-3 py-2 text-xs bg-[#F4F6FB] border border-[#E8ECF2] rounded-xl text-[#13141B] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00D2B4]/40 transition-all"
                />
              </div>
            </div>

            {/* Conversation Threads Scroll Area */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#F4F6FB]">
              {isLoadingThreads ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                      <div className="w-11 h-11 rounded-2xl bg-gray-200"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-3.5 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-100 rounded w-3/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredThreads.length === 0 ? (
                <div className="p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#F4F6FB] text-gray-400 flex items-center justify-center mx-auto">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h3 className="text-xs font-bold text-[#13141B]">No messages yet</h3>
                  <p className="text-[11px] text-gray-500 max-w-xs mx-auto">
                    Connect with members on the network to start 1-on-1 conversations.
                  </p>
                  <Link
                    href="/network"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors"
                  >
                    <span>Browse Network</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                filteredThreads.map((thread) => {
                  const isSelected = selectedPartnerId === thread.partnerId;
                  const initials = thread.partnerName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                  const timeDisplay = new Date(thread.updatedAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <button
                      key={thread.partnerId}
                      onClick={() => setSelectedPartnerId(thread.partnerId)}
                      className={`w-full p-3.5 sm:p-4 text-left flex items-start gap-3 transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-slate-100/80 border-l-4 border-[#00D2B4]"
                          : "hover:bg-[#F9FAFC]"
                      }`}
                    >
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#13141B] to-slate-800 text-[#00D2B4] flex items-center justify-center font-black text-xs shadow-2xs">
                          {initials}
                        </div>
                        {thread.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center border-2 border-white">
                            {thread.unreadCount}
                          </span>
                        )}
                      </div>

                      {/* Content Summary */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <h4 className="text-xs font-bold text-[#13141B] truncate">
                            {thread.partnerName}
                          </h4>
                          <span className="text-[10px] text-gray-400 shrink-0 font-mono">
                            {timeDisplay}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 truncate leading-tight">
                          {thread.isLastFromMe ? <span className="font-semibold text-gray-600">You: </span> : null}
                          {thread.lastMessage}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT PANEL: Active Chat Room */}
          <div
            className={`flex-1 flex flex-col bg-[#FAF8F5]/30 ${
              selectedPartnerId ? "flex" : "hidden md:flex"
            }`}
          >
            {selectedPartnerId && activePartner ? (
              <>
                {/* Chat Room Header */}
                <div className="p-3.5 sm:p-4 bg-white border-b border-[#EBECEF] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Mobile Back Button */}
                    <button
                      onClick={() => setSelectedPartnerId(null)}
                      className="p-1.5 rounded-xl hover:bg-slate-100 text-gray-600 md:hidden cursor-pointer"
                      title="Back to conversations"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>

                    {/* Partner Avatar & Info */}
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#13141B] to-slate-800 text-[#00D2B4] flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                      {(activePartner.partnerName || "U")
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <h2 className="text-xs sm:text-sm font-bold text-[#13141B]">
                          {activePartner.partnerName}
                        </h2>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Connected
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 truncate max-w-xs sm:max-w-md">
                        {activePartner.partnerHeadline || "EdWorld Network Member"}
                      </p>
                    </div>
                  </div>

                  {/* Actions & Realtime Status */}
                  <div className="flex items-center gap-2">
                    {isRealtimeActive && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="hidden sm:inline">Realtime Active</span>
                      </div>
                    )}
                    <Link
                      href={`/network`}
                      className="text-[11px] font-bold text-gray-500 hover:text-[#13141B] px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors flex items-center gap-1"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Network</span>
                    </Link>
                  </div>
                </div>

                {/* Message Stream Area */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-[#FAF8F5]/30">
                  {isLoadingMessages ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                        <Loader2 className="w-4 h-4 animate-spin text-[#00D2B4]" />
                        <span>Loading messages...</span>
                      </div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-2 p-6">
                      <div className="w-10 h-10 rounded-2xl bg-white border border-[#EBECEF] text-emerald-600 flex items-center justify-center shadow-xs">
                        <Sparkles className="w-5 h-5 text-[#00D2B4]" />
                      </div>
                      <h4 className="text-xs font-bold text-[#13141B]">Start the conversation</h4>
                      <p className="text-[11px] text-gray-500 max-w-xs">
                        Say hello to {activePartner.partnerName}! Discuss engineering topics, projects, or career advice.
                      </p>
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
                          className={`flex items-end gap-2 ${
                            isMe ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[78%] sm:max-w-[65%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-2xs ${
                              isMe
                                ? "bg-[#13141B] text-white rounded-br-none font-medium"
                                : "bg-white border border-[#EBECEF] text-[#13141B] rounded-bl-none font-normal"
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words">{msg.content || msg.message}</p>
                            <div
                              className={`text-[9px] mt-1 flex items-center justify-end gap-1 ${
                                isMe ? "text-gray-400" : "text-gray-400"
                              }`}
                            >
                              <span>{timeStr}</span>
                              {isMe && (
                                <CheckCheck
                                  className={`w-3 h-3 ${
                                    msg.isRead ? "text-[#00D2B4]" : "text-gray-400"
                                  }`}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input Bar */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 sm:p-4 bg-white border-t border-[#EBECEF] flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={`Message ${activePartner.partnerName}...`}
                    className="flex-1 px-4 py-2.5 text-xs bg-[#F4F6FB] border border-[#E8ECF2] rounded-2xl text-[#13141B] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00D2B4]/40 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim() || isSending}
                    className="p-2.5 rounded-2xl bg-[#13141B] hover:bg-slate-800 disabled:opacity-40 text-white transition-all shadow-xs shrink-0 cursor-pointer"
                    title="Send Message"
                  >
                    {isSending ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#00D2B4]" />
                    ) : (
                      <Send className="w-4 h-4 text-[#00D2B4]" />
                    )}
                  </button>
                </form>
              </>
            ) : (
              /* Empty State (No Conversation Selected) */
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-white border border-[#EBECEF] text-emerald-600 flex items-center justify-center shadow-xs">
                  <MessageSquare className="w-8 h-8 text-[#00D2B4]" />
                </div>
                <div className="space-y-1 max-w-sm">
                  <h3 className="text-base font-bold text-[#13141B]">Your Direct Messages</h3>
                  <p className="text-xs text-gray-500">
                    Select an existing conversation on the left, or connect with peers across the network to begin messaging.
                  </p>
                </div>
                <button
                  onClick={() => {
                    loadConnectedPartners();
                    setIsNewChatOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#13141B] hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#00D2B4]" />
                  <span>Start New Conversation</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* NEW CHAT MODAL */}
      {isNewChatOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#EBECEF] shadow-2xl max-w-md w-full overflow-hidden p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#EBECEF]">
              <div>
                <h3 className="text-sm font-bold text-[#13141B]">Start New Chat</h3>
                <p className="text-[11px] text-gray-500">Select a connected network member to message</p>
              </div>
              <button
                onClick={() => setIsNewChatOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2">
              {isLoadingPartners ? (
                <div className="text-center py-8 text-xs text-gray-500">Loading your connections...</div>
              ) : connectedPartners.length === 0 ? (
                <div className="text-center py-8 space-y-2">
                  <Users className="w-8 h-8 text-gray-300 mx-auto" />
                  <p className="text-xs text-gray-500">You do not have any accepted connections yet.</p>
                  <Link
                    href="/network"
                    onClick={() => setIsNewChatOpen(false)}
                    className="inline-block text-xs font-bold text-emerald-700 hover:underline"
                  >
                    Go to Network &amp; Connect with Peers &rarr;
                  </Link>
                </div>
              ) : (
                connectedPartners.map((c) => (
                  <button
                    key={c.partnerId}
                    onClick={() => {
                      setSelectedPartnerId(c.partnerId);
                      setIsNewChatOpen(false);
                    }}
                    className="w-full p-3 rounded-2xl hover:bg-[#F4F6FB] border border-[#E8ECF2] text-left flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-[#13141B]">{c.partnerName}</h4>
                      <p className="text-[10px] text-gray-500 truncate">{c.partnerHeadline}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
