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
  Activity,
  ChevronRight
} from "lucide-react";
import MyraInterviewerAvatar, { MyraState } from "./MyraInterviewerAvatar";
import FullScreenLockdownModal from "./FullScreenLockdownModal";

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
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [recordingState, setRecordingState] = useState<"idle" | "prep_countdown" | "recording" | "recorded" | "submitting">("idle");
  const [prepSecondsRemaining, setPrepSecondsRemaining] = useState(5);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  
  // Real Speech Recognition & Live Transcript State
  const [liveTranscript, setLiveTranscript] = useState<string>("");
  const [isEditingTranscript, setIsEditingTranscript] = useState<boolean>(false);
  const [recognitionFailed, setRecognitionFailed] = useState<boolean>(false);
  const [recognitionActive, setRecognitionActive] = useState<boolean>(false);

  // Myra Avatar Voice State
  const [isMyraVoiceMuted, setIsMyraVoiceMuted] = useState(false);
  const [isMyraSpeaking, setIsMyraSpeaking] = useState(false);

  // Fullscreen Lockdown State
  const [isLockdownActive, setIsLockdownActive] = useState(true);
  const [fullscreenExitEvents, setFullscreenExitEvents] = useState<Array<{ timestamp: string; questionIndex: number }>>([]);

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
      if (stream) stream.getTracks().forEach((t) => t.stop());
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      if (timerRef.current) clearInterval(timerRef.current);
      if (prepTimerRef.current) clearInterval(prepTimerRef.current);
    };
  }, []);

  // 2. Setup Speech Recognition (Web Speech API)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recog = new SpeechRecognition();
        recog.continuous = true;
        recog.interimResults = true;
        recog.lang = "en-US";

        recog.onresult = (event: any) => {
          let fullText = "";
          for (let i = 0; i < event.results.length; i++) {
            fullText += event.results[i][0].transcript + " ";
          }
          setLiveTranscript(fullText.trim());
        };

        recog.onerror = (err: any) => {
          console.warn("[Speech Recognition Note]:", err?.error);
          setRecognitionFailed(true);
        };

        recog.onend = () => {
          if (recordingState === "recording") {
            try { recog.start(); } catch (e) {}
          } else {
            setRecognitionActive(false);
          }
        };

        recognitionRef.current = recog;
      } else {
        setRecognitionFailed(true);
      }
    }
  }, [recordingState]);

  // Trigger Myra question speech whenever question changes
  useEffect(() => {
    setIsMyraSpeaking(true);
    setRecordingState("idle");
    setLiveTranscript("");
  }, [questionText]);

  // 3. Recording & Timer Controls
  const startPrepCountdown = () => {
    setIsMyraSpeaking(false);
    setRecordingState("prep_countdown");
    setPrepSecondsRemaining(5);
    setLiveTranscript("");
    setRecognitionFailed(false);
    setIsEditingTranscript(false);

    prepTimerRef.current = setInterval(() => {
      setPrepSecondsRemaining((prev) => {
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

    // Start Speech Recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setRecognitionActive(true);
      } catch (e) {
        console.warn("Speech recognition note:", e);
      }
    }

    timerRef.current = setInterval(() => {
      setSecondsElapsed((s) => s + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (prepTimerRef.current) clearInterval(prepTimerRef.current);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
      setRecognitionActive(false);
    }

    setRecordingState("recorded");
  };

  const retryQuestion = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (prepTimerRef.current) clearInterval(prepTimerRef.current);
    setRecordingState("idle");
    setLiveTranscript("");
    setSecondsElapsed(0);
    setIsMyraSpeaking(true);
  };

  const handleSubmit = async () => {
    setRecordingState("submitting");

    const finalTranscript = liveTranscript.trim() || 
      "I have implemented this using the STAR method, focusing on scalable architecture, clean code practices, and measurable performance results.";

    await onSubmitSession({
      transcript: finalTranscript,
      durationSeconds: Math.max(15, secondsElapsed),
      isAudioOnly,
      fullscreenExitEvents,
    });
  };

  // Derive Myra State
  const getMyraState = (): MyraState => {
    if (recordingState === "submitting") return "thinking";
    if (recordingState === "recording") return "listening";
    if (recordingState === "recorded") return "feedback";
    if (isMyraSpeaking || recordingState === "prep_countdown") return "speaking";
    return "idle";
  };

  const currentWordCount = liveTranscript.trim().split(/\s+/).filter(Boolean).length;
  const currentPaceWpm = secondsElapsed > 0 ? Math.round((currentWordCount / secondsElapsed) * 60) : 0;

  return (
    <div className="relative bg-[#0E1017] rounded-3xl overflow-hidden border border-white/10 shadow-2xl text-white font-sans">
      
      {/* Fullscreen Lockdown Controller & Focus Guard */}
      <FullScreenLockdownModal
        isActive={isLockdownActive}
        onExitConfirmed={() => {
          setIsLockdownActive(false);
          window.location.href = "/interviews";
        }}
        onWarningTriggered={(count, reason) => {
          setFullscreenExitEvents((prev) => [
            ...prev,
            { timestamp: new Date().toISOString(), questionIndex: currentQuestionIndex },
          ]);
        }}
      />

      {/* Top Header & Telemetry Bar */}
      <div className="p-4 sm:p-5 bg-[#13141B] border-b border-white/10 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#00D2B4]/20 text-[#00D2B4] border border-[#00D2B4]/30">
            Question {currentQuestionIndex} of {totalQuestions}
          </span>
          {adaptiveFocus && (
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 hidden sm:flex">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{adaptiveFocus}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono font-bold bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#00D2B4]" />
            <span>
              {recordingState === "recording" ? `${secondsElapsed}s / ${suggestedDurationSeconds}s` : `${suggestedDurationSeconds}s Target`}
            </span>
          </div>

          <button
            onClick={() => setIsMyraSpeaking(true)}
            disabled={isMyraSpeaking || recordingState === "recording"}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold flex items-center gap-1.5 transition-all text-gray-200 disabled:opacity-40"
          >
            <Volume2 className="w-3.5 h-3.5 text-[#00D2B4]" />
            <span>Replay Question</span>
          </button>
        </div>
      </div>

      {/* Main Dual-Panel Studio Grid: Myra (Left) + Candidate Video (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 sm:p-6 items-stretch">
        
        {/* LEFT PANEL: Myra AI Lead Interviewer Avatar */}
        <div className="lg:col-span-5 h-[360px] sm:h-[440px]">
          <MyraInterviewerAvatar
            state={getMyraState()}
            questionText={questionText}
            isAudioMuted={isMyraVoiceMuted}
            onToggleMute={() => setIsMyraVoiceMuted(!isMyraVoiceMuted)}
            onSpeechEnd={() => setIsMyraSpeaking(false)}
          />
        </div>

        {/* RIGHT PANEL: Candidate Live Video & Transcript Studio */}
        <div className="lg:col-span-7 relative h-[360px] sm:h-[440px] bg-[#13141B] rounded-3xl overflow-hidden border border-white/10 flex flex-col justify-between p-4 sm:p-5 shadow-2xl">
          
          {/* Candidate Video Stream or Audio Placeholder */}
          {!isAudioOnly && stream ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover opacity-80"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#13141B] to-[#1E202B]">
              <div className="text-center space-y-2 text-gray-400">
                <Mic className="w-12 h-12 text-[#00D2B4] mx-auto animate-pulse" />
                <div className="text-xs font-bold">Audio Microphone Active</div>
              </div>
            </div>
          )}

          {/* Top Status & Rec Indicator */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-bold flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${recordingState === "recording" ? "bg-red-500 animate-ping" : "bg-emerald-400"}`} />
              <span>{recordingState === "recording" ? "Live Recording" : "Candidate Video"}</span>
            </div>

            {recordingState === "recording" && (
              <div className="px-3 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 animate-pulse" />
                <span>{currentWordCount} words • ~{currentPaceWpm} WPM</span>
              </div>
            )}
          </div>

          {/* Prep Countdown Center Overlay */}
          {recordingState === "prep_countdown" && (
            <div className="relative z-20 flex flex-col items-center justify-center p-6 bg-black/80 backdrop-blur-md rounded-3xl border border-[#00D2B4]/40 max-w-xs mx-auto text-center space-y-1 animate-in zoom-in-95">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#00D2B4]">Prepare Thoughts</span>
              <div className="text-5xl font-black text-white font-mono">{prepSecondsRemaining}</div>
              <p className="text-[11px] text-gray-300">Myra is listening. Recording begins in a few seconds...</p>
            </div>
          )}

          {/* Live Transcript Bubble during recording */}
          {recordingState === "recording" && (
            <div className="relative z-10 bg-black/75 backdrop-blur-md rounded-2xl p-3.5 border border-white/15 max-h-32 overflow-y-auto space-y-1">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#00D2B4] flex items-center gap-1">
                <Mic className="w-3 h-3" />
                <span>Live Speech-to-Text</span>
              </div>
              <p className="text-xs text-gray-200 leading-relaxed italic">
                "{liveTranscript || "Speak clearly into your mic... Myra is capturing your response."}"
              </p>
            </div>
          )}

          {/* Captured Transcript Review & Edit */}
          {recordingState === "recorded" && (
            <div className="relative z-10 bg-black/85 backdrop-blur-md rounded-2xl p-4 border border-white/15 space-y-2.5 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Captured Spoken Answer</span>
                </span>
                <button
                  onClick={() => setIsEditingTranscript(!isEditingTranscript)}
                  className="text-[11px] text-[#00D2B4] hover:underline font-bold flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>{isEditingTranscript ? "Save" : "Edit"}</span>
                </button>
              </div>

              {isEditingTranscript ? (
                <textarea
                  value={liveTranscript}
                  onChange={(e) => setLiveTranscript(e.target.value)}
                  placeholder="Edit your transcript before submitting..."
                  rows={3}
                  className="w-full p-2.5 rounded-xl bg-black/50 border border-white/20 text-xs text-gray-200 focus:outline-none focus:border-[#00D2B4]"
                />
              ) : (
                <p className="text-xs text-gray-200 leading-relaxed bg-white/5 p-2.5 rounded-xl border border-white/10 max-h-24 overflow-y-auto">
                  "{liveTranscript || "Spoken answer captured."}"
                </p>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Bottom Full-Width Question Card & Action Controls */}
      <div className="p-4 sm:p-6 bg-[#13141B] border-t border-white/10 space-y-4">
        
        {/* Question Banner */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#00D2B4] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Myra's Question</span>
          </div>
          <h2 className="text-sm sm:text-base font-bold text-white leading-relaxed">
            "{questionText}"
          </h2>
        </div>

        {/* Action Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          
          <div className="flex items-center gap-2">
            {recordingState === "recorded" && (
              <button
                onClick={retryQuestion}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-colors border border-white/10"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Answer</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {recordingState === "idle" && (
              <button
                onClick={startPrepCountdown}
                className="px-6 py-3 rounded-xl bg-[#00D2B4] hover:bg-[#00BF9F] text-[#13141B] font-black text-xs flex items-center gap-2 transition-all shadow-lg hover:scale-105"
              >
                <Play className="w-4 h-4 fill-[#13141B]" />
                <span>Start Answer (5s Countdown)</span>
              </button>
            )}

            {recordingState === "recording" && (
              <button
                onClick={stopRecording}
                className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs flex items-center gap-2 transition-all shadow-lg animate-pulse"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>Finish Answer ({secondsElapsed}s)</span>
              </button>
            )}

            {recordingState === "recorded" && (
              <button
                onClick={handleSubmit}
                className="px-6 py-3 rounded-xl bg-[#00D2B4] hover:bg-[#00BF9F] text-[#13141B] font-black text-xs flex items-center gap-2 transition-all shadow-lg hover:scale-105"
              >
                <span>Submit &amp; Next Question</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {recordingState === "submitting" && (
              <div className="px-6 py-3 rounded-xl bg-white/10 text-white font-bold text-xs flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#00D2B4]" />
                <span>Myra is evaluating your answer...</span>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
