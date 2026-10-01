"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Mic, 
  Radio, 
  Brain, 
  CheckCircle2,
  Smile
} from "lucide-react";

export type MyraState = "idle" | "speaking" | "listening" | "thinking" | "feedback";
export type TeddyState = MyraState; // Backward compatibility alias

interface MyraInterviewerAvatarProps {
  state: MyraState;
  questionText?: string;
  isAudioMuted?: boolean;
  onToggleMute?: () => void;
  onSpeechEnd?: () => void;
}

export default function MyraInterviewerAvatar({
  state,
  questionText = "",
  isAudioMuted = false,
  onToggleMute,
  onSpeechEnd,
}: MyraInterviewerAvatarProps) {
  const [speechActive, setSpeechActive] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Text-To-Speech triggered when Myra speaks
  useEffect(() => {
    if (!synthRef.current) return;

    if (state === "speaking" && questionText && !isAudioMuted) {
      synthRef.current.cancel(); // Stop any pending speech

      const utterance = new SpeechSynthesisUtterance(questionText);
      utterance.rate = 0.95; // Clear pedagogical pacing
      utterance.pitch = 1.05; // Friendly warm pitch

      // Attempt to find high quality natural voice
      const voices = synthRef.current.getVoices();
      const friendlyVoice = voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          (v.name.includes("Natural") ||
            v.name.includes("Google") ||
            v.name.includes("Samantha") ||
            v.name.includes("Daniel") ||
            v.name.includes("Alex") ||
            v.name.includes("Karen") ||
            v.name.includes("Victoria") ||
            v.name.includes("Zira"))
      );
      if (friendlyVoice) utterance.voice = friendlyVoice;

      utterance.onstart = () => setSpeechActive(true);
      utterance.onend = () => {
        setSpeechActive(false);
        onSpeechEnd?.();
      };
      utterance.onerror = () => {
        setSpeechActive(false);
        onSpeechEnd?.();
      };

      utteranceRef.current = utterance;
      synthRef.current.speak(utterance);
    } else {
      if (synthRef.current) synthRef.current.cancel();
      setSpeechActive(false);
    }

    return () => {
      if (synthRef.current) synthRef.current.cancel();
    };
  }, [state, questionText, isAudioMuted, onSpeechEnd]);

  // Status Badge Configuration
  const getStatusBadge = () => {
    switch (state) {
      case "speaking":
        return {
          label: "Myra is Speaking...",
          color: "bg-emerald-500/20 text-[#00D2B4] border-[#00D2B4]/40",
          icon: Radio,
          dotColor: "bg-[#00D2B4] animate-ping",
        };
      case "listening":
        return {
          label: "Myra is Listening to You",
          color: "bg-blue-500/20 text-blue-300 border-blue-400/40",
          icon: Mic,
          dotColor: "bg-blue-400 animate-pulse",
        };
      case "thinking":
        return {
          label: "Myra is Analyzing Response...",
          color: "bg-purple-500/20 text-purple-300 border-purple-400/40",
          icon: Brain,
          dotColor: "bg-purple-400 animate-pulse",
        };
      case "feedback":
        return {
          label: "Great Delivery! Analyzing...",
          color: "bg-amber-500/20 text-amber-300 border-amber-400/40",
          icon: Smile,
          dotColor: "bg-amber-400",
        };
      case "idle":
      default:
        return {
          label: "Myra • Lead AI Interviewer",
          color: "bg-slate-800 text-slate-300 border-slate-700",
          icon: Sparkles,
          dotColor: "bg-emerald-400",
        };
    }
  };

  const badge = getStatusBadge();
  const IconComponent = badge.icon;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-6 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
      {/* Background Animated Glow Aura */}
      <div 
        className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${
          state === "speaking" 
            ? "opacity-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#00D2B4]/30 via-slate-950/0 to-transparent" 
            : state === "listening"
            ? "opacity-30 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/30 via-slate-950/0 to-transparent"
            : "opacity-15 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500/20 via-slate-950/0 to-transparent"
        }`} 
      />

      {/* Top Header: Badge + Audio Mute Controls */}
      <div className="w-full flex items-center justify-between z-10">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold backdrop-blur-md transition-all ${badge.color}`}>
          <span className={`w-2 h-2 rounded-full ${badge.dotColor}`} />
          <IconComponent className="w-3.5 h-3.5" />
          <span>{badge.label}</span>
        </div>

        {onToggleMute && (
          <button
            onClick={onToggleMute}
            className={`p-2 rounded-xl border backdrop-blur-md transition-all ${
              isAudioMuted
                ? "bg-rose-500/20 border-rose-500/40 text-rose-300 hover:bg-rose-500/30"
                : "bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700/80 hover:text-white"
            }`}
            title={isAudioMuted ? "Unmute Myra Voice" : "Mute Myra Voice"}
            aria-label={isAudioMuted ? "Unmute Myra Voice" : "Mute Myra Voice"}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Center 3D Myra Character View */}
      <div className="relative flex flex-col items-center justify-center my-auto z-10">
        {/* Animated Glow Rings during Speech */}
        {state === "speaking" && (
          <div className="absolute w-56 h-56 rounded-full border-2 border-[#00D2B4]/40 animate-ping pointer-events-none" />
        )}
        {state === "listening" && (
          <div className="absolute w-52 h-52 rounded-full border-2 border-blue-400/40 animate-pulse pointer-events-none" />
        )}

        {/* Myra Character Image Container with Dynamic Animations */}
        <div
          className={`relative w-44 h-44 sm:w-52 sm:h-52 rounded-3xl overflow-hidden border-2 transition-all duration-500 shadow-2xl bg-slate-950 ${
            state === "speaking"
              ? "border-[#00D2B4] shadow-[#00D2B4]/20 scale-105"
              : state === "listening"
              ? "border-blue-400 shadow-blue-400/20 scale-100"
              : state === "thinking"
              ? "border-purple-400 shadow-purple-400/20 animate-pulse"
              : "border-slate-700 hover:border-slate-500"
          }`}
        >
          <Image
            src="/images/teddy-interviewer.png"
            alt="Myra - AI Lead Interviewer & Academic Mentor"
            fill
            priority
            className={`object-cover object-top transition-transform duration-500 ${
              state === "speaking" ? "scale-110" : "scale-100"
            }`}
          />

          {/* Interactive Overlay Waveform when speaking */}
          {state === "speaking" && (
            <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-slate-950/90 to-transparent flex items-end justify-center pb-2 gap-1 px-4">
              <span className="w-1 bg-[#00D2B4] rounded-full h-3 animate-[bounce_0.6s_infinite_100ms]" />
              <span className="w-1 bg-[#00D2B4] rounded-full h-6 animate-[bounce_0.6s_infinite_200ms]" />
              <span className="w-1 bg-[#00D2B4] rounded-full h-4 animate-[bounce_0.6s_infinite_300ms]" />
              <span className="w-1 bg-[#00D2B4] rounded-full h-7 animate-[bounce_0.6s_infinite_150ms]" />
              <span className="w-1 bg-[#00D2B4] rounded-full h-5 animate-[bounce_0.6s_infinite_250ms]" />
            </div>
          )}
        </div>

        {/* Name Tag */}
        <div className="mt-3 flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 px-3 py-1 rounded-full text-xs font-bold text-slate-200 shadow-md">
          <span className="w-2 h-2 rounded-full bg-[#00D2B4]" />
          <span>Myra &bull; AI Lead Interviewer</span>
        </div>
      </div>

      {/* Bottom Subtitle / Instruction Hint */}
      <div className="w-full text-center z-10">
        <p className="text-xs text-slate-400 font-medium tracking-wide">
          {state === "speaking"
            ? "Listen carefully to Myra's question. Formulate your answer using the STAR method."
            : state === "listening"
            ? "Speak clearly into your microphone. Myra is evaluating your technical depth & clarity."
            : state === "thinking"
            ? "Myra is computing your delivery metrics and technical accuracy..."
            : "Myra is ready. Press Start to begin your calibrated session."}
        </p>
      </div>
    </div>
  );
}
