"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Cake, 
  Sparkles, 
  Send, 
  Calendar, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronRight,
  Info
} from "lucide-react";
import SendBirthdayWishModal from "@/components/networking/SendBirthdayWishModal";

interface BirthdayItem {
  connection_user_id: string;
  name: string;
  month: number;
  day: number;
  is_today: boolean;
  days_until: number;
  has_wished: boolean;
}

interface ConnectionBirthdaysWidgetProps {
  userId?: string;
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export default function ConnectionBirthdaysWidget({ userId }: ConnectionBirthdaysWidgetProps) {
  const [birthdays, setBirthdays] = useState<BirthdayItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeWishRecipient, setActiveWishRecipient] = useState<{ id: string; name: string } | null>(null);

  const fetchBirthdays = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/network/upcoming-birthdays?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setBirthdays(data.birthdays || []);
      }
    } catch (err) {
      console.warn("[Connection Birthdays Widget Warning]:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBirthdays();
  }, [userId]);

  const handleWishSent = (recipientId: string) => {
    setBirthdays((prev) =>
      prev.map((b) => (b.connection_user_id === recipientId ? { ...b, has_wished: true } : b))
    );
  };

  return (
    <>
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#EBECEF] shadow-xs space-y-4 font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#EBECEF] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shadow-2xs">
              <Cake className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#13141B]">
                Upcoming Birthdays
              </h3>
            </div>
          </div>

          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 border border-zinc-200">
            Next 7 Days
          </span>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="py-6 text-center space-y-2">
            <div className="w-5 h-5 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-[11px] text-zinc-400">Loading birthdays...</p>
          </div>
        ) : birthdays.length === 0 ? (
          <div className="py-5 text-center space-y-2">
            <div className="w-9 h-9 mx-auto rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-zinc-700">No birthdays coming up</p>
            <p className="text-[10px] text-zinc-400 max-w-xs mx-auto leading-relaxed">
              Connections who opt-in to share their birthday will appear here within 7 days of their celebration.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {birthdays.map((item) => {
              const formattedDate = `${MONTH_NAMES[item.month - 1]} ${item.day}`;
              
              return (
                <div
                  key={item.connection_user_id}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    item.is_today 
                      ? "bg-amber-50/50 border-amber-200/90 shadow-2xs" 
                      : "bg-[#FCFCFB] border-[#EBECEF] hover:border-zinc-300"
                  }`}
                >
                  <div className="min-w-0 flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 ${
                      item.is_today 
                        ? "bg-amber-500 text-white shadow-2xs" 
                        : "bg-zinc-100 text-zinc-700 border border-zinc-200"
                    }`}>
                      {item.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-zinc-900 truncate">
                          {item.name}
                        </span>
                        {item.is_today && (
                          <span className="px-1.5 py-0.2 rounded-md bg-amber-500 text-white text-[9px] font-black uppercase shadow-2xs">
                            🎂 Today
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-500 font-medium">
                        {item.is_today 
                          ? "Celebrating today!" 
                          : item.days_until === 1 
                          ? "Tomorrow" 
                          : `In ${item.days_until} days (${formattedDate})`}
                      </p>
                    </div>
                  </div>

                  {/* Action */}
                  {item.is_today ? (
                    item.has_wished ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Wished</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => setActiveWishRecipient({ id: item.connection_user_id, name: item.name })}
                        className="px-2.5 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-[10px] shadow-xs active:scale-95 transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        <Send className="w-3 h-3 text-[#00B49B]" />
                        <span>Send Wish</span>
                      </button>
                    )
                  ) : (
                    <span className="text-[10px] font-mono text-zinc-400 shrink-0">
                      {formattedDate}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Privacy Note Footer */}
        <div className="pt-2 border-t border-[#EBECEF] flex items-center justify-between text-[10px] text-zinc-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Opt-in privacy (no age/year)</span>
          </span>
          <Link href="/profile" className="font-bold text-zinc-900 hover:underline">
            Manage Settings
          </Link>
        </div>

      </div>

      {/* Modal Trigger for Sending One-Way Wish */}
      {activeWishRecipient && userId && (
        <SendBirthdayWishModal
          isOpen={Boolean(activeWishRecipient)}
          onClose={() => setActiveWishRecipient(null)}
          senderId={userId}
          recipientId={activeWishRecipient.id}
          recipientName={activeWishRecipient.name}
          onWishSent={handleWishSent}
        />
      )}
    </>
  );
}
