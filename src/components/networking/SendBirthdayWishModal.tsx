"use client";

import React, { useState } from "react";
import { 
  Cake, 
  X, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Heart
} from "lucide-react";

interface SendBirthdayWishModalProps {
  isOpen: boolean;
  onClose: () => void;
  senderId: string;
  recipientId: string;
  recipientName: string;
  onWishSent?: (recipientId: string) => void;
}

const WISH_TEMPLATES = [
  "Happy Birthday! 🎉 Wishing you a fantastic year filled with joy and success!",
  "Wishing you a very Happy Birthday and continued breakthroughs in your career! 🚀",
  "Happy Birthday! May this year bring exciting engineering challenges and great wins! 🌟",
  "Have a wonderful birthday! Proud to be connected with you on EdWorld Co.! 🎂",
];

export default function SendBirthdayWishModal({
  isOpen,
  onClose,
  senderId,
  recipientId,
  recipientName,
  onWishSent,
}: SendBirthdayWishModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>(WISH_TEMPLATES[0]);
  const [customNote, setCustomNote] = useState<string>("");
  const [useCustom, setUseCustom] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentMessage = useCustom ? customNote : selectedTemplate;
  const charCount = currentMessage.trim().length;

  const handleSend = async () => {
    if (!currentMessage.trim()) {
      setErrorMessage("Please select a template or write a custom wish.");
      return;
    }

    if (charCount > 200) {
      setErrorMessage("Birthday wish cannot exceed 200 characters.");
      return;
    }

    setIsSending(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/network/birthday-wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId,
          recipientId,
          message: currentMessage.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send birthday wish");
      }

      setIsSuccess(true);
      if (onWishSent) {
        onWishSent(recipientId);
      }

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1800);
    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong while sending your wish.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-zinc-200 shadow-2xl overflow-hidden p-6 sm:p-7 space-y-5 text-zinc-950">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSending}
          className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shadow-xs shrink-0">
            <Cake className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black tracking-tight text-zinc-950">
              Send Birthday Wish
            </h3>
            <p className="text-xs text-zinc-500 font-medium">
              To <strong className="text-zinc-900">{recipientName}</strong> (One-way greeting)
            </p>
          </div>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-3 animate-in zoom-in-95">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 shadow-xs">
              <CheckCircle2 className="w-8 h-8 animate-bounce" />
            </div>
            <h4 className="text-base font-black text-zinc-950">Wish Sent Successfully!</h4>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto">
              {recipientName} will see your warm birthday greeting in their notifications and profile.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* Mode Switcher */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-zinc-100 rounded-2xl border border-zinc-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setUseCustom(false)}
                className={`py-1.5 rounded-xl transition-all cursor-pointer ${
                  !useCustom 
                    ? "bg-white text-zinc-950 shadow-xs" 
                    : "text-zinc-500 hover:text-zinc-950"
                }`}
              >
                Pre-written Template
              </button>
              <button
                type="button"
                onClick={() => setUseCustom(true)}
                className={`py-1.5 rounded-xl transition-all cursor-pointer ${
                  useCustom 
                    ? "bg-white text-zinc-950 shadow-xs" 
                    : "text-zinc-500 hover:text-zinc-950"
                }`}
              >
                Custom Note
              </button>
            </div>

            {/* Template Selector */}
            {!useCustom ? (
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                  Select a Warm Template:
                </span>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {WISH_TEMPLATES.map((tmpl, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedTemplate(tmpl)}
                      className={`p-3 rounded-2xl border text-xs leading-relaxed transition-all cursor-pointer flex items-start gap-2.5 ${
                        selectedTemplate === tmpl
                          ? "bg-zinc-900 text-white border-zinc-900 shadow-xs"
                          : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100 hover:text-zinc-950"
                      }`}
                    >
                      <Sparkles className={`w-4 h-4 shrink-0 mt-0.5 ${selectedTemplate === tmpl ? "text-[#00B49B]" : "text-zinc-400"}`} />
                      <span>{tmpl}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Custom Note Input */
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor="custom-birthday-note" className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                    Write Your Wish:
                  </label>
                  <span className={`text-[10px] font-mono font-bold ${charCount > 200 ? "text-rose-600" : "text-zinc-400"}`}>
                    {charCount}/200
                  </span>
                </div>
                <textarea
                  id="custom-birthday-note"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="Wishing you a wonderful birthday and huge career wins this year! 🎉"
                  rows={3}
                  maxLength={200}
                  className="w-full p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-950 placeholder-zinc-400 focus:outline-hidden focus:border-zinc-900 focus:bg-white transition-all resize-none"
                />
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Privacy & Scope Note */}
            <p className="text-[10px] text-zinc-400 leading-tight italic">
              * Wishes are strictly one-way transactional greetings. No chat thread or reply capability will be created.
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSending}
                className="w-1/3 py-2.5 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={isSending || charCount === 0 || charCount > 200}
                className="flex-1 py-2.5 rounded-2xl bg-zinc-950 hover:bg-zinc-800 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSending ? (
                  <span>Sending Wish...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Birthday Wish</span>
                  </>
                )}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
