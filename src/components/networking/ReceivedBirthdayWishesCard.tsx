"use client";

import React, { useState, useEffect } from "react";
import { 
  Cake, 
  Sparkles, 
  Heart, 
  Calendar, 
  MessageSquareOff 
} from "lucide-react";

interface ReceivedWish {
  id: string;
  sender_id: string;
  sender_name: string;
  message: string;
  year: number;
  created_at: string;
}

interface ReceivedBirthdayWishesCardProps {
  userId?: string;
}

export default function ReceivedBirthdayWishesCard({ userId }: ReceivedBirthdayWishesCardProps) {
  const [wishes, setWishes] = useState<ReceivedWish[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetchWishes = async () => {
      try {
        const res = await fetch(`/api/network/birthday-wishes?userId=${userId}`);
        if (res.ok) {
          const data = await res.json();
          setWishes(data.wishes || []);
        }
      } catch (err) {
        console.warn("[Received Wishes Warning]:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishes();
  }, [userId]);

  if (isLoading || wishes.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#EBECEF] shadow-xs space-y-4 font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#EBECEF] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-2xs">
            <Cake className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[#13141B]">
              Birthday Wishes Received
            </h3>
            <p className="text-[10px] text-zinc-500">
              Warm greetings sent by your connections (Private to you)
            </p>
          </div>
        </div>

        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
          {wishes.length} {wishes.length === 1 ? "Wish" : "Wishes"}
        </span>
      </div>

      {/* Wishes List */}
      <div className="space-y-2.5">
        {wishes.map((w) => (
          <div
            key={w.id}
            className="p-3.5 rounded-xl bg-[#FCFCFB] border border-[#EBECEF] space-y-1.5 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-zinc-950 text-white text-[10px] font-bold flex items-center justify-center">
                  {w.sender_name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-bold text-zinc-900">
                  {w.sender_name}
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono">
                {new Date(w.created_at).toLocaleDateString([], { month: "short", day: "numeric" })}
              </span>
            </div>

            <p className="text-xs text-zinc-700 italic font-medium pl-8">
              &ldquo;{w.message}&rdquo;
            </p>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-[#EBECEF] text-[10px] text-zinc-400 flex items-center gap-1">
        <MessageSquareOff className="w-3.5 h-3.5" />
        <span>One-way greetings — strictly private and no reply inbox generated.</span>
      </div>

    </div>
  );
}
