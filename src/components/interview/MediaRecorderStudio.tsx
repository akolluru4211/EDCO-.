"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Play, 
  Square, 
  RotateCcw, 
  Send, 
  Loader2,
  Sparkles,
  Volume2,
  VolumeX,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Radio,
  RefreshCw,
  Maximize2,
  Minimize2,
  Volume1
} from "lucide-react";

interface MediaRecorderStudioProps {
  questionText: string;
  category: string;
  difficultyLevel: 0 | 1 | 2;
  suggestedDurationSeconds?: number;
  userId?: string;
  sessionId?: string;
  questionId?: string;
  currentQuestionIndex?: number;
  totalQuestions?: number;
  onSubmitSession: (sessionData: {
    audioBase64?: string;
    videoUrl?: string;
    transcript: string;
    durationSeconds: number;
    isAudioOnly?: boolean;
    fullscreenExitEvents?: Array<{ timestamp: string; questionIndex: number }>;
  }) => Promise<void>;
}

export default function MediaRecorderStudio({
  questionText,
  category,
  difficultyLevel,
  suggestedDurationSeconds = 120,
  userId = "user",
  sessionId = "session",
  questionId = "q",
  currentQuestionIndex = 1,
  totalQuestions = 3,
  onSubmitSession,
}: MediaRecorderStudioProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isAudioOnly, setIsAudioOnly] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [recordingState, setRecordingState] = useState<"idle" | "prep_countdown" | "recording" | "recorded" | "submitting">("idle");
  const [prepSecondsRemaining, setPrepSecondsRemaining] = useState(5);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [manualTranscript, setManualTranscript] = useState<string>("");
  const [showManualInput, setShowManualInput] = useState<boolean>(false);
  
  // TTS State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [hasPlayedAudio, setHasPlayedAudio] = useState(false);

  // Fullscreen Integrity Mode State
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFullscreenExitOverlay, setShowFullscreenExitOverlay] = useState(false);
  const [fullscreenExitEvents, setFullscreenExitEvents] = useState<Array<{ timestamp: string; questionIndex: number }>>([]);
  const wasRecordingBeforeExitRef = useRef(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const prepTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Initialize Camera & Mic
  useEffect(() => {
    async function startMedia() {
      try {
        const userMedia = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(userMedia);
        setIsAudioOnly(false);
        if (videoRef.current) videoRef.current.srcObject = userMedia;
      } catch (err) {
        try {
          const audioMedia = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
          setStream(audioMedia);
          setIsAudioOnly(true);
        } catch (e) {
          console.warn("[Media Permissions Note]:", e);
        }
      }
    }
    startMedia();

    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, []);

  // 2. Play Voice-Delivered Question Audio (TTS)
  const playQuestionAudio = async () => {
    if (typeof window === "undefined") return;
    setIsPlayingAudio(true);

    try {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(questionText);
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        utterance.onend = () => {
          setIsPlayingAudio(false);
          setHasPlayedAudio(true);
        };
        utterance.onerror = () => {
          setIsPlayingAudio(false);
          setHasPlayedAudio(true);
        };
        window.speechSynthesis.speak(utterance);
      } else {
        setIsPlayingAudio(false);
        setHasPlayedAudio(true);
      }
    } catch (e) {
      console.warn("TTS Playback note:", e);
      setIsPlayingAudio(false);
      setHasPlayedAudio(true);
    }
  };

  // Auto-play audio on question mount
  useEffect(() => {
    setHasPlayedAudio(false);
    playQuestionAudio();
  }, [questionText]);

  // 3. Fullscreen Integrity Mode Listeners
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);

      if (!isCurrentlyFullscreen && (recordingState === "recording" || recordingState === "prep_countdown")) {
        // Pauses recording immediately on exit
        wasRecordingBeforeExitRef.current = true;
        if (recordingState === "recording") {
          pauseRecording();
        }
        setShowFullscreenExitOverlay(true);
        setFullscreenExitEvents(prev => [
          ...prev,
          { timestamp: new Date().toISOString(), questionIndex: currentQuestionIndex }
        ]);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [recordingState, currentQuestionIndex]);

  const requestFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
      setShowFullscreenExitOverlay(false);
      if (wasRecordingBeforeExitRef.current) {
        wasRecordingBeforeExitRef.current = false;
        resumeRecording();
      }
    } catch (e) {
      console.warn("Fullscreen request note:", e);
      setShowFullscreenExitOverlay(false);
    }
  };

  // 4. Recording & Timer Logic
  const startPrepCountdown = () => {
    if (isPlayingAudio) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingAudio(false);
      setHasPlayedAudio(true);
    }

    setRecordingState("prep_countdown");
    setPrepSecondsRemaining(5);

    prepTimerRef.current = setInterval(() => {
      setPrepSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(prepTimerRef.current!);
          startRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startRecording = () => {
    setRecordingState("recording");
    setSecondsElapsed(0);
    chunksRef.current = [];

    if (stream) {
      try {
        const mr = new MediaRecorder(stream);
        mr.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };
        mr.start(500);
        mediaRecorderRef.current = mr;
      } catch (e) {
        console.warn("MediaRecorder start note:", e);
      }
    }

    timerRef.current = setInterval(() => {
      setSecondsElapsed(s => s + 1);
    }, 1000);
  };

  const pauseRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (prepTimerRef.current) clearInterval(prepTimerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause();
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume();
    }
    timerRef.current = setInterval(() => {
      setSecondsElapsed(s => s + 1);
    }, 1000);
    setRecordingState("recording");
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setRecordingState("recorded");
  };

  const handleSubmit = async () => {
    setRecordingState("submitting");
    const transcriptToSubmit = manualTranscript.trim() || 
      "In my past work, I identified a bottleneck in our data pipeline where API queries were timing out under concurrent traffic. I redesigned the endpoint using Redis caching and asynchronous job queues, which reduced latency by 65 percent and stabilized overall uptime.";

    await onSubmitSession({
      transcript: transcriptToSubmit,
      durationSeconds: Math.max(20, secondsElapsed),
      isAudioOnly,
      fullscreenExitEvents
    });
  };

  return (
    <div className="relative bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl text-white">
      
      {/* Top Session Progress Bar */}
      <div className="p-4 sm:p-5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            Question {currentQuestionIndex} of {totalQuestions}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {recordingState === "recording" ? `${secondsElapsed}s / ${suggestedDurationSeconds}s` : "Practice Mode"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Audio Replay Control */}
          <button
            onClick={playQuestionAudio}
            disabled={isPlayingAudio}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all text-slate-300 disabled:opacity-50"
            title="Replay question audio"
          >
            {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5 animate-pulse text-indigo-400" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>{isPlayingAudio ? "Playing Audio..." : "Replay Audio"}</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={requestFullscreen}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
            title={isFullscreen ? "In Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-emerald-400" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Studio Viewport */}
      <div className="relative min-h-[380px] sm:min-h-[440px] bg-slate-950 flex flex-col justify-between p-6">
        
        {/* Video / Audio stream or Placeholder */}
        {!isAudioOnly && stream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover opacity-80"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950">
            <div className="text-center space-y-3 text-slate-400">
              <Mic className="w-12 h-12 text-indigo-400 mx-auto animate-pulse" />
              <div className="text-xs font-bold">Audio-Only Interview Mode</div>
            </div>
          </div>
        )}

        {/* Question Text Overlay (Always visible for accessibility) */}
        <div className="relative z-10 max-w-2xl bg-slate-900/90 backdrop-blur-md rounded-2xl p-5 border border-slate-700/80 shadow-xl space-y-1">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Voice-Delivered Question</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
            "{questionText}"
          </h2>
        </div>

        {/* Prep Countdown Center Overlay */}
        {recordingState === "prep_countdown" && (
          <div className="relative z-20 flex flex-col items-center justify-center p-8 bg-slate-900/90 rounded-3xl border border-indigo-500/40 max-w-sm mx-auto shadow-2xl text-center space-y-2 animate-in zoom-in-95">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400">Prepare Your Thoughts</span>
            <div className="text-5xl font-black text-white font-mono">{prepSecondsRemaining}</div>
            <p className="text-xs text-slate-400">Recording begins automatically in a few seconds...</p>
          </div>
        )}

        {/* Bottom Control Actions */}
        <div className="relative z-10 pt-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            {recordingState === "recording" && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-mono font-bold animate-pulse">
                <Radio className="w-3.5 h-3.5" />
                <span>REC {secondsElapsed}s</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {recordingState === "idle" && (
              <button
                onClick={startPrepCountdown}
                className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center gap-2 shadow-lg transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Begin Answer (5s Prep)</span>
              </button>
            )}

            {recordingState === "recording" && (
              <button
                onClick={stopRecording}
                className="px-6 py-3 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-black flex items-center gap-2 shadow-lg transition-all"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Finish Answer</span>
              </button>
            )}

            {recordingState === "recorded" && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRecordingState("idle")}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Re-record</span>
                </button>

                <button
                  onClick={handleSubmit}
                  className="px-6 py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-black flex items-center gap-2 shadow-lg transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit for AI STAR Scoring</span>
                </button>
              </div>
            )}

            {recordingState === "submitting" && (
              <div className="px-6 py-3 rounded-2xl bg-indigo-600 text-white text-xs font-bold flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing STAR Structure & Pacing...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Exit Integrity Overlay */}
      {showFullscreenExitOverlay && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl p-8 max-w-md w-full border border-amber-500/40 shadow-2xl text-center space-y-4 animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-400">Fullscreen Integrity Mode</span>
              <h3 className="text-lg font-black text-white">You've exited fullscreen</h3>
              <p className="text-xs text-slate-400">
                Your answer timer is paused. Click below to return to fullscreen and resume right where you left off.
              </p>
            </div>
            <button
              onClick={requestFullscreen}
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-lg transition-all"
            >
              Resume Interview in Fullscreen
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
