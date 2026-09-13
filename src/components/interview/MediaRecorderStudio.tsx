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
  Edit3,
  Check,
  Flame,
  Activity
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
  adaptiveFocus?: string;
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
  adaptiveFocus,
  onSubmitSession,
}: MediaRecorderStudioProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isAudioOnly, setIsAudioOnly] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [recordingState, setRecordingState] = useState<"idle" | "prep_countdown" | "recording" | "recorded" | "submitting">("idle");
  const [prepSecondsRemaining, setPrepSecondsRemaining] = useState(5);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  
  // Real Speech Recognition & Live Transcript State
  const [liveTranscript, setLiveTranscript] = useState<string>("");
  const [isEditingTranscript, setIsEditingTranscript] = useState<boolean>(false);
  const [recognitionFailed, setRecognitionFailed] = useState<boolean>(false);
  const [recognitionActive, setRecognitionActive] = useState<boolean>(false);

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
  const recognitionRef = useRef<any>(null);

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
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  // 2. Setup Speech Recognition Instance
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          let interim = "";
          let final = "";

          for (let i = 0; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              final += transcript + " ";
            } else {
              interim += transcript;
            }
          }

          const combined = (final + interim).trim();
          if (combined) {
            setLiveTranscript(combined);
            setRecognitionFailed(false);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn("[SpeechRecognition Error]:", event.error);
          if (event.error !== "no-speech") {
            setRecognitionFailed(true);
          }
        };

        recognition.onend = () => {
          setRecognitionActive(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  // 3. Play Voice-Delivered Question Audio (TTS)
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

  useEffect(() => {
    setHasPlayedAudio(false);
    playQuestionAudio();
  }, [questionText]);

  // 4. Fullscreen Integrity Mode Listeners
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);

      if (!isCurrentlyFullscreen && (recordingState === "recording" || recordingState === "prep_countdown")) {
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

  // 5. Recording & Timer Logic
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
    setLiveTranscript("");
    setRecognitionFailed(false);
    setIsEditingTranscript(false);

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

    // Start Audio/Video MediaRecorder
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

    // Start Real Speech Recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setRecognitionActive(true);
      } catch (e) {
        console.warn("Speech recognition already running or error:", e);
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
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        setRecognitionActive(false);
      } catch (e) {}
    }
    setRecordingState("recorded");

    // If transcript is still empty after stopping, prompt manual edit
    setTimeout(() => {
      setLiveTranscript(prev => {
        if (!prev || prev.trim().length === 0) {
          setRecognitionFailed(true);
        }
        return prev;
      });
    }, 400);
  };

  const handleSubmit = async () => {
    const finalTranscript = liveTranscript.trim();

    if (!finalTranscript) {
      setRecognitionFailed(true);
      return;
    }

    setRecordingState("submitting");

    await onSubmitSession({
      transcript: finalTranscript,
      durationSeconds: Math.max(15, secondsElapsed),
      isAudioOnly,
      fullscreenExitEvents
    });
  };

  // Live Pace Calculations
  const currentWordCount = liveTranscript.trim().split(/\s+/).filter(Boolean).length;
  const currentPaceWpm = secondsElapsed > 0 ? Math.round((currentWordCount / secondsElapsed) * 60) : 0;

  return (
    <div className="relative bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl text-white">
      
      {/* Top Session Progress Bar */}
      <div className="p-4 sm:p-5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            Question {currentQuestionIndex} of {totalQuestions}
          </span>
          {adaptiveFocus && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Adaptive Focus: {adaptiveFocus}</span>
            </span>
          )}
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
      <div className="relative min-h-[400px] sm:min-h-[460px] bg-slate-950 flex flex-col justify-between p-6">
        
        {/* Video / Audio stream or Placeholder */}
        {!isAudioOnly && stream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover opacity-75"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950">
            <div className="text-center space-y-3 text-slate-400">
              <Mic className="w-12 h-12 text-indigo-400 mx-auto animate-pulse" />
              <div className="text-xs font-bold">Audio-Only Interview Mode</div>
            </div>
          </div>
        )}

        {/* Question Text Overlay */}
        <div className="relative z-10 max-w-2xl bg-slate-900/90 backdrop-blur-md rounded-2xl p-5 border border-slate-700/80 shadow-xl space-y-1">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Voice-Delivered Question</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
            "{questionText}"
          </h2>
        </div>

        {/* Live Speech Recognition & Transcript Overlay */}
        {recordingState === "recording" && (
          <div className="relative z-10 max-w-2xl bg-slate-950/85 backdrop-blur-md rounded-2xl p-4 border border-indigo-500/40 shadow-xl space-y-2 mt-4 animate-in fade-in">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <Activity className="w-3 h-3 animate-pulse" />
                Live Speech Recognition Active
              </span>
              <span>{currentWordCount} words &bull; ~{currentPaceWpm} WPM</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic min-h-[40px]">
              {liveTranscript || "Listening to your spoken answer... speak clearly into your microphone."}
            </p>
          </div>
        )}

        {/* Prep Countdown Center Overlay */}
        {recordingState === "prep_countdown" && (
          <div className="relative z-20 flex flex-col items-center justify-center p-8 bg-slate-900/90 rounded-3xl border border-indigo-500/40 max-w-sm mx-auto shadow-2xl text-center space-y-2 animate-in zoom-in-95">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400">Prepare Your Thoughts</span>
            <div className="text-5xl font-black text-white font-mono">{prepSecondsRemaining}</div>
            <p className="text-xs text-slate-400">Recording and live speech recognition begin in a few seconds...</p>
          </div>
        )}

        {/* Post-Recording Review & Manual Transcript Edit */}
        {recordingState === "recorded" && (
          <div className="relative z-10 max-w-2xl bg-slate-900/95 backdrop-blur-md rounded-2xl p-5 border border-slate-700/90 shadow-2xl space-y-3 mt-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Captured Spoken Transcript</span>
              </span>
              <button
                onClick={() => setIsEditingTranscript(!isEditingTranscript)}
                className="text-xs text-indigo-300 hover:text-indigo-200 font-bold flex items-center gap-1 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20"
              >
                <Edit3 className="w-3 h-3" />
                <span>{isEditingTranscript ? "Done Editing" : "Edit Transcript"}</span>
              </button>
            </div>

            {isEditingTranscript ? (
              <textarea
                value={liveTranscript}
                onChange={(e) => setLiveTranscript(e.target.value)}
                placeholder="Edit or refine your transcript before submitting for language & technical analysis..."
                rows={4}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
              />
            ) : (
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                "{liveTranscript || "No transcript detected. Click 'Edit Transcript' to type your answer or retry speaking."}"
              </p>
            )}

            {recognitionFailed && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Couldn't clearly understand audio or mic input was silent. Please edit your transcript above or click Re-record.</span>
              </div>
            )}
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
                className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center gap-2 shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Begin Spoken Answer (5s Prep)</span>
              </button>
            )}

            {recordingState === "recording" && (
              <button
                onClick={stopRecording}
                className="px-6 py-3 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-black flex items-center gap-2 shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Finish Answer</span>
              </button>
            )}

            {recordingState === "recorded" && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setRecordingState("idle");
                    setLiveTranscript("");
                    setRecognitionFailed(false);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Re-record</span>
                </button>

                <button
                  onClick={handleSubmit}
                  className="btn-shine px-6 py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-black flex items-center gap-2 shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit for AI Language & STAR Evaluation</span>
                </button>
              </div>
            )}

            {recordingState === "submitting" && (
              <div className="px-6 py-3 rounded-2xl bg-indigo-600 text-white text-xs font-bold flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing Communication, Grammar & STAR Structure...</span>
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
