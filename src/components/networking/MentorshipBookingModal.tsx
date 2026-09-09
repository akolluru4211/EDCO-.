"use client";

import React, { useState } from "react";
import { MentorProfile } from "@/lib/types";
import { 
  X, 
  Calendar, 
  Sparkles, 
  AlertCircle, 
  ShieldCheck, 
  Send, 
  Clock, 
  CheckCircle2, 
  Lock 
} from "lucide-react";

interface MentorshipBookingModalProps {
  mentor: MentorProfile | null;
  isOpen: boolean;
  onClose: () => void;
  userAgeBand?: string;
  onRequestBooking: (bookingData: {
    mentorId: string;
    topic: string;
    goal: string;
    message: string;
    preferredTime: string;
  }) => Promise<void>;
}

export default function MentorshipBookingModal({
  mentor,
  isOpen,
  onClose,
  userAgeBand = "18+",
  onRequestBooking,
}: MentorshipBookingModalProps) {
  const [topic, setTopic] = useState("");
  const [goal, setGoal] = useState("");
  const [message, setMessage] = useState("");
  const [preferredTime, setPreferredTime] = useState(mentor?.availabilitySlots?.[0] || "Mon 6:00 PM IST");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !mentor) return null;

  // Youth Safety Boundaries
  if (userAgeBand === "13-15") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
        <div className="max-w-md w-full bg-white rounded-3xl p-6 space-y-4 shadow-2xl border border-slate-200 text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Junior Track Mentorship Safety</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            As a Class 9-10 learner (13-15), 1:1 unmoderated adult mentorship is restricted under Edworld Youth Safety guidelines. You can participate in supervised group study circles and cohort masterclasses.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold uppercase tracking-wider"
          >
            Understood
          </button>
        </div>
      </div>
    );
  }

  if (userAgeBand === "16-18" && !mentor.isVerifiedMentor) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
        <div className="max-w-md w-full bg-white rounded-3xl p-6 space-y-4 shadow-2xl border border-slate-200 text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Verified Mentors Only</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Explorer Track (16-18) learners can only book sessions with <strong>Verified Mentors</strong> who have passed corporate email or background verification.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold uppercase tracking-wider"
          >
            Back to Directory
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || !message.trim()) {
      setError("Please specify a session topic and brief preparation message.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onRequestBooking({
        mentorId: mentor.id,
        topic: topic.trim(),
        goal: goal.trim(),
        message: message.trim(),
        preferredTime,
      });
      setIsSuccess(true);
    } catch (err: any) {
      setError(err?.message || "Failed to submit mentorship request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              {mentor.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Book 1:1 Mentorship Session</h3>
              <p className="text-[11px] text-slate-500">{mentor.name} &bull; {mentor.company}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Request Sent Successfully!</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                {mentor.name} has been notified. When accepted, you will receive a direct message with the meeting room link.
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold uppercase tracking-wider"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Mentorship Topic *
              </label>
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. System Design Mock &amp; Distributed Caching Review"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Your Primary Goal / Question
              </label>
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. Prepare for upcoming Senior SWE interview at Tier-1 tech company"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Preferred Time Slot
              </label>
              <select
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none bg-white"
              >
                {(mentor.availabilitySlots || ["Mon 6:00 PM IST", "Sat 11:00 AM IST"]).map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Message / Context for Mentor *
              </label>
              <textarea
                rows={3}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share your current experience level, specific problem areas, or resume context..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none leading-relaxed"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Mentorship sessions are conducted over secure Edworld encrypted video rooms.</span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold uppercase tracking-wider hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase tracking-wider shadow-md disabled:opacity-50 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? "Sending Request..." : "Send Booking Request"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
