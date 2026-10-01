"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Lock,
  AlertTriangle,
  ShieldAlert,
  Maximize2,
  XCircle,
  CheckCircle2,
  HelpCircle,
  RotateCcw
} from "lucide-react";

interface FullScreenLockdownModalProps {
  isActive: boolean;
  onExitConfirmed: () => void;
  onWarningTriggered?: (warningCount: number, reason: string) => void;
}

export default function FullScreenLockdownModal({
  isActive,
  onExitConfirmed,
  onWarningTriggered,
}: FullScreenLockdownModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [warnings, setWarnings] = useState<Array<{ timestamp: string; reason: string }>>([]);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showWarningToast, setShowWarningToast] = useState<string | null>(null);

  // Request true browser fullscreen
  const enterFullscreen = useCallback(async () => {
    try {
      if (document.documentElement && !document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      }
    } catch (err) {
      console.warn("Fullscreen request note:", err);
    }
  }, []);

  // Monitor Fullscreen Change, Visibility Change, and Window Blur
  useEffect(() => {
    if (!isActive) return;

    // Initial fullscreen attempt
    enterFullscreen();

    const handleFullscreenChange = () => {
      const isNowFullscreen = Boolean(document.fullscreenElement);
      setIsFullscreen(isNowFullscreen);

      if (!isNowFullscreen && isActive) {
        recordWarning("Exited Fullscreen mode during live interview.");
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && isActive) {
        recordWarning("Switched browser tabs / window lost visibility.");
      }
    };

    const handleBlur = () => {
      if (isActive) {
        recordWarning("Window lost focus / clicked outside.");
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [isActive, enterFullscreen]);

  const recordWarning = (reason: string) => {
    const newWarning = {
      timestamp: new Date().toLocaleTimeString(),
      reason,
    };
    setWarnings((prev) => {
      const updated = [...prev, newWarning];
      onWarningTriggered?.(updated.length, reason);
      return updated;
    });

    setShowWarningToast(`⚠️ Focus Alert: ${reason}`);
    setTimeout(() => {
      setShowWarningToast(null);
    }, 4000);
  };

  const handleConfirmExit = async () => {
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch (e) {}
    }
    setShowExitConfirm(false);
    onExitConfirmed();
  };

  if (!isActive) return null;

  return (
    <>
      {/* 1. Fullscreen Integrity Bar at Top */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#13141B]/90 backdrop-blur-md text-white px-4 py-2 flex items-center justify-between border-b border-white/10 text-xs font-sans">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#00D2B4]" />
            Locked Interview Environment
          </span>
          {warnings.length > 0 && (
            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold">
              {warnings.length} Focus Warning{warnings.length > 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!isFullscreen && (
            <button
              onClick={enterFullscreen}
              className="px-2.5 py-1 rounded-lg bg-[#00D2B4] text-[#13141B] font-bold text-[11px] flex items-center gap-1 hover:bg-[#00BF9F] transition-colors"
            >
              <Maximize2 className="w-3 h-3" />
              <span>Re-enter Fullscreen</span>
            </button>
          )}

          <button
            onClick={() => setShowExitConfirm(true)}
            className="text-gray-400 hover:text-red-400 text-[11px] font-semibold transition-colors"
          >
            End Early
          </button>
        </div>
      </div>

      {/* 2. Real-Time Focus Warning Toast */}
      {showWarningToast && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-amber-950 text-amber-100 border border-amber-500/50 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs animate-in fade-in slide-in-from-top-2 duration-200">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-semibold">{showWarningToast}</span>
        </div>
      )}

      {/* 3. Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-[#13141B] border border-white/15 rounded-3xl p-6 text-white text-left space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-white">Exit Active Interview Session?</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Leaving this session early will terminate the live recording and score only the responses answered so far.
              </p>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors"
              >
                Resume Interview
              </button>
              <button
                onClick={handleConfirmExit}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors"
              >
                Confirm &amp; Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
