"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { 
  Sparkles, 
  Volume2, 
  VolumeX, 
  X, 
  Video, 
  FileText, 
  MessageSquare, 
  ArrowRight,
  RotateCcw
} from "lucide-react";

interface MyraWelcomeModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export default function MyraWelcomeModal({ forceOpen = false, onClose }: MyraWelcomeModalProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  const firstName = user?.name ? user.name.split(" ")[0] : "Learner";
  const greetingText = user?.name
    ? `Welcome to EdWorld Co., ${firstName}! I'm Myra, your AI companion. Let's master your skills and reach your dream goals together!`
    : "Welcome to EdWorld Co.! I'm Myra, your AI career and learning companion. Let's explore your opportunities and master your skills together!";

  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
      
      const seen = sessionStorage.getItem("edworld_myra_welcome_seen");
      if (!seen || forceOpen) {
        // Small delay so page loads smoothly before popup
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, [forceOpen]);

  const speakGreeting = () => {
    if (!synthRef.current) return;

    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(greetingText);
    
    // Configure voice for a cheerful, bright young girl / friendly companion tone
    utterance.pitch = 1.45; // Sweet, youthful higher pitch
    utterance.rate = 1.02;  // Energetic pacing
    utterance.volume = 1.0;

    // Pick optimal natural/female voice if available
    const voices = synthRef.current.getVoices();
    const sweetVoice = voices.find(v => 
      (v.name.includes("Zira") || 
       v.name.includes("Samantha") || 
       v.name.includes("Karen") || 
       v.name.includes("Victoria") || 
       v.name.includes("Google US English") || 
       v.name.includes("Female")) && v.lang.startsWith("en")
    ) || voices.find(v => v.lang.startsWith("en"));

    if (sweetVoice) {
      utterance.voice = sweetVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setHasInteracted(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    synthRef.current.speak(utterance);
  };

  const handleClose = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsSpeaking(false);
    setIsOpen(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("edworld_myra_welcome_seen", "true");
    }
    if (onClose) onClose();
  };

  // Attempt initial speech when modal pops open
  useEffect(() => {
    if (isOpen && !hasInteracted) {
      // Browsers allow speech synthesis directly on interactive trigger, or on load
      speakGreeting();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl border border-zinc-200/90 shadow-2xl shadow-zinc-950/20 overflow-hidden text-zinc-950 p-6 sm:p-8 space-y-6"
        role="dialog"
        aria-modal="true"
      >
        {/* Decorative Ambient Aura */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#00D2B4]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-[#D7FC51]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Icon Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors z-10"
          aria-label="Close Welcome Popup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 3D Myra Avatar Showcase */}
        <div className="flex flex-col items-center text-center space-y-3 pt-2 relative z-10">
          
          <div className="relative group cursor-pointer" onClick={speakGreeting} title="Click to hear Myra!">
            <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-3xl overflow-hidden border-2 border-zinc-900 shadow-xl bg-gradient-to-b from-zinc-100 to-zinc-200 p-0.5">
              <Image
                src="/images/myra-avatar.png"
                alt="Myra AI Avatar"
                fill
                priority
                className={`object-cover object-top transition-transform duration-300 ${isSpeaking ? "scale-105 animate-pulse" : "group-hover:scale-105"}`}
              />
            </div>
            
            {/* Live Speaking Badge */}
            <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-950 text-white text-[10px] font-bold shadow-md border border-zinc-800">
              <span className={`w-2 h-2 rounded-full ${isSpeaking ? "bg-[#00D2B4] animate-ping" : "bg-[#00D2B4]"}`} />
              <span>{isSpeaking ? "Speaking..." : "Myra AI"}</span>
            </div>
          </div>

          <div className="pt-2">
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight flex items-center justify-center gap-2">
              <span>Welcome to EdWorld Co.!</span>
              <Sparkles className="w-5 h-5 text-[#00D2B4] fill-[#00D2B4]" />
            </h2>
            {user?.name && (
              <p className="text-sm font-bold text-[#00B49B] mt-0.5">
                Hi {firstName}, happy to have you here!
              </p>
            )}
          </div>

        </div>

        {/* Speech Bubble & Voice Visualizer */}
        <div className="relative p-4 sm:p-5 rounded-2xl bg-zinc-50 border border-zinc-200 text-center space-y-3">
          
          <p className="text-xs sm:text-sm text-zinc-700 font-medium leading-relaxed">
            &ldquo;{greetingText}&rdquo;
          </p>

          {/* Voice Visualizer Waveform & Audio Controls */}
          <div className="flex items-center justify-between pt-1 border-t border-zinc-200/60 text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={speakGreeting}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 text-white font-bold text-[11px] hover:bg-zinc-800 active:scale-95 transition-all shadow-sm"
              >
                {isSpeaking ? <Volume2 className="w-3.5 h-3.5 text-[#00D2B4] animate-bounce" /> : <RotateCcw className="w-3.5 h-3.5" />}
                <span>{isSpeaking ? "Speaking" : "Replay Voice"}</span>
              </button>
              {isSpeaking && (
                <button
                  onClick={() => {
                    synthRef.current?.cancel();
                    setIsSpeaking(false);
                  }}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200 transition-colors"
                  title="Mute"
                >
                  <VolumeX className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Simulated Voice Waveform */}
            <div className="flex items-end gap-1 h-4">
              <span className={`w-1 rounded-full bg-[#00D2B4] ${isSpeaking ? "h-3.5 animate-[bounce_0.6s_infinite_100ms]" : "h-1.5"}`} />
              <span className={`w-1 rounded-full bg-[#00D2B4] ${isSpeaking ? "h-4 animate-[bounce_0.6s_infinite_200ms]" : "h-2"}`} />
              <span className={`w-1 rounded-full bg-[#00D2B4] ${isSpeaking ? "h-2 animate-[bounce_0.6s_infinite_300ms]" : "h-1"}`} />
              <span className={`w-1 rounded-full bg-[#00D2B4] ${isSpeaking ? "h-3.5 animate-[bounce_0.6s_infinite_150ms]" : "h-2"}`} />
              <span className={`w-1 rounded-full bg-[#00D2B4] ${isSpeaking ? "h-4 animate-[bounce_0.6s_infinite_250ms]" : "h-1.5"}`} />
            </div>
          </div>

        </div>

        {/* Quick Recommended Actions */}
        <div className="grid grid-cols-2 gap-2.5">
          <Link
            href="/interviews"
            onClick={handleClose}
            className="p-3 rounded-2xl bg-white border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-sm transition-all text-left space-y-1 group"
          >
            <div className="flex items-center gap-1.5 text-xs font-black text-zinc-900">
              <Video className="w-3.5 h-3.5 text-[#00D2B4]" />
              <span>3D Mock Interview</span>
            </div>
            <p className="text-[10px] text-zinc-500 leading-tight">
              Spoken drills with Myra AI
            </p>
          </Link>

          <Link
            href="/resumes"
            onClick={handleClose}
            className="p-3 rounded-2xl bg-white border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-sm transition-all text-left space-y-1 group"
          >
            <div className="flex items-center gap-1.5 text-xs font-black text-zinc-900">
              <FileText className="w-3.5 h-3.5 text-[#00D2B4]" />
              <span>Match Jobs</span>
            </div>
            <p className="text-[10px] text-zinc-500 leading-tight">
              ATS score &amp; sector matching
            </p>
          </Link>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={handleClose}
          className="w-full py-3.5 rounded-2xl bg-zinc-950 text-white hover:bg-zinc-800 active:scale-[0.98] font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
        >
          <span>Let&apos;s Get Started</span>
          <ArrowRight className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
}
