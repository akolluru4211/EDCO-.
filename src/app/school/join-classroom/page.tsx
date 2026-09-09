"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { 
  GraduationCap, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Eye, 
  Sparkles, 
  BookOpen,
  Loader2
} from "lucide-react";
import Button from "@/components/ui/Button";

export default function JoinClassroomPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [enrolledClasses, setEnrolledClasses] = useState<any[]>([]);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function loadMyClassrooms() {
      if (!user) return;
      try {
        const { data } = await supabase
          .from("classroom_students")
          .select("joined_at, classrooms(id, name, subject, join_code)")
          .eq("student_id", user.uid);

        let loaded = [];
        if (data) {
          loaded = data.map((d: any) => ({
            joined_at: d.joined_at,
            ...d.classrooms
          }));
        }

        // Merge local storage cached enrolled classes
        if (typeof window !== "undefined") {
          const cached = localStorage.getItem(`edworld_student_enrolled_${user.uid}`);
          if (cached) {
            const parsed: any[] = JSON.parse(cached);
            for (const c of parsed) {
              if (!loaded.find((m: any) => m.id === c.id || m.join_code === c.join_code)) {
                loaded.push(c);
              }
            }
          }
        }

        setEnrolledClasses(loaded);
      } catch (err) {
        console.warn("Classrooms student load note:", err);
      }
    }
    loadMyClassrooms();
  }, [user]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !joinCode.trim()) return;
    setLoading(true);
    setStatusMessage(null);

    const cleanCode = joinCode.trim().toUpperCase();

    try {
      const res = await fetch("/api/school/classrooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: user.uid,
          joinCode: cleanCode
        })
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to join classroom.");
      }

      const classroom = json.classroom;
      const updated = [...enrolledClasses, { ...classroom, joined_at: new Date().toISOString() }];
      setEnrolledClasses(updated);

      if (typeof window !== "undefined") {
        localStorage.setItem(`edworld_student_enrolled_${user.uid}`, JSON.stringify(updated));
      }

      setStatusMessage({
        type: "success",
        text: json.message || `Successfully joined ${classroom.name} (${classroom.subject})!`
      });
      setJoinCode("");
    } catch (e: any) {
      setStatusMessage({ type: "error", text: e.message || "Enrollment error" });
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = async (classroomId: string) => {
    if (!user) return;
    try {
      await supabase
        .from("classroom_students")
        .delete()
        .eq("classroom_id", classroomId)
        .eq("student_id", user.uid);

      const updated = enrolledClasses.filter(c => c.id !== classroomId);
      setEnrolledClasses(updated);

      if (typeof window !== "undefined") {
        localStorage.setItem(`edworld_student_enrolled_${user.uid}`, JSON.stringify(updated));
      }

      setStatusMessage({ type: "success", text: "Left classroom successfully. Your independent account progress remains intact." });
    } catch (e) {
      console.warn("Leave classroom error:", e);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-paper py-8 px-4 sm:px-6 lg:px-8 text-ink">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div className="space-y-3">
          <Link href="/school" className="text-xs font-bold text-ink-soft hover:text-ink flex items-center gap-1.5 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to School Hub</span>
          </Link>

          <div>
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-forest bg-forest/10 px-2.5 py-0.5 rounded-full border border-forest/20 inline-block">School Track</span>
            <h1 className="text-2xl sm:text-4xl font-bold font-display text-ink mt-1">Join a School Classroom</h1>
            <p className="text-xs sm:text-sm text-ink-soft">
              Enter the unique join code provided by your teacher to connect your learning activities to your class.
            </p>
          </div>
        </div>

        {/* Join Code Input Form */}
        <div className="bg-paper-raised rounded-3xl p-6 sm:p-8 border border-line shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-base font-bold font-display text-ink">Enter Class Join Code</h2>
            <p className="text-xs text-ink-soft">Example: <span className="font-mono font-bold text-ink">EDW-X9K2P</span></p>
          </div>

          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <input
                type="text"
                required
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="EDW-XXXXX"
                className="w-full p-4 rounded-2xl border border-line bg-paper font-mono font-bold text-center text-xl text-ink tracking-wider placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-forest uppercase"
              />
            </div>

            {statusMessage && (
              <div className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-medium ${
                statusMessage.type === "success" 
                  ? "bg-forest/10 text-forest border border-forest/20" 
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}>
                {statusMessage.type === "success" ? (
                  <CheckCircle2 className="w-5 h-5 text-forest shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !joinCode.trim()}
              className="w-full py-3.5 rounded-2xl bg-forest hover:bg-forest-light disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{loading ? "Joining Classroom..." : "Join Classroom & Connect"}</span>
            </button>
          </form>
        </div>

        {/* Currently Enrolled Classes */}
        <div className="space-y-4">
          <h2 className="text-base font-bold font-display text-ink">Your Enrolled Classes</h2>

          {enrolledClasses.length === 0 ? (
            <div className="bg-paper-raised rounded-3xl p-8 border border-line text-center space-y-2 shadow-sm">
              <BookOpen className="w-8 h-8 text-ink-muted mx-auto" />
              <p className="text-xs text-ink-soft">You have not joined any school classrooms yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {enrolledClasses.map((c, i) => (
                <div key={c.id || i} className="p-5 rounded-2xl bg-paper-raised border border-line shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-forest/10 text-forest border border-forest/20">
                      {c.subject}
                    </span>
                    <h3 className="font-bold text-sm text-ink">{c.name}</h3>
                    <p className="text-[10px] text-ink-muted font-mono">Code: {c.join_code}</p>
                  </div>

                  <button
                    onClick={() => handleLeave(c.id)}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 px-3 py-1.5 rounded-xl hover:bg-rose-50 transition-all"
                  >
                    Leave
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
