"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { 
  ArrowLeft, 
  Users, 
  Download, 
  Plus, 
  BookOpen, 
  ShieldCheck, 
  Calendar, 
  CheckCircle2, 
  Award,
  Sparkles 
} from "lucide-react";
import Button from "@/components/ui/Button";

export default function ClassroomRosterPage() {
  const params = useParams();
  const classroomId = params.classroomId as string;
  const { user } = useAuth();

  const [classroom, setClassroom] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignTitle, setAssignTitle] = useState("");
  const [assignDueDate, setAssignDueDate] = useState("");
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadClassroomAndRoster() {
      if (!user || !classroomId) return;

      // 1. Fetch Classroom Meta
      const { data: cData } = await supabase
        .from("classrooms")
        .select("*")
        .eq("id", classroomId)
        .single();
      if (cData) setClassroom(cData);

      // 2. Fetch Strictly From Narrow View
      const { data: progressData } = await supabase
        .from("teacher_visible_student_progress")
        .select("*")
        .eq("classroom_id", classroomId);

      if (progressData) setStudents(progressData);

      // 3. Fetch Classroom Assignments
      const { data: aData } = await supabase
        .from("classroom_assignments")
        .select("*")
        .eq("classroom_id", classroomId)
        .order("created_at", { ascending: false });

      if (aData) setAssignments(aData);

      // 4. Audit Log Record (Trail of who accessed which roster)
      try {
        await supabase.from("audit_logs").insert({
          actor_id: user.uid,
          actor_role: "teacher",
          action: "teacher.roster_accessed",
          target_type: "classroom",
          target_id: classroomId,
          metadata: {
            student_count: progressData?.length || 0,
            subject: cData?.subject
          }
        });
      } catch (e) {
        console.warn("Audit log note:", e);
      }

      setLoading(false);
    }

    loadClassroomAndRoster();
  }, [user, classroomId]);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTitle.trim()) return;

    try {
      const { data, error } = await supabase
        .from("classroom_assignments")
        .insert({
          classroom_id: classroomId,
          title: assignTitle,
          due_date: assignDueDate || null,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (data) {
        setAssignments([data, ...assignments]);
        setAssignTitle("");
        setAssignDueDate("");
        setShowAssignModal(false);
        setAssignSuccess("Assignment published to student dashboards.");
        setTimeout(() => setAssignSuccess(null), 3500);
      }
    } catch (e) {
      console.warn("Assignment creation note:", e);
    }
  };

  const handleExportCSV = () => {
    if (students.length === 0) return;
    const headers = ["Student Name", "Subject Quests Completed", "Total Quests Completed", "Interview Mastery Score", "Joined Date"];
    const rows = students.map(s => [
      `"${s.name || "Student"}"`,
      s.related_quests_completed || 0,
      s.total_quests_completed || 0,
      s.related_interview_score || 0,
      `"${new Date(s.joined_at).toLocaleDateString()}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${classroom?.name || "Classroom"}_Roster_Progress.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div className="space-y-4">
          <Link href="/teacher" className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1.5">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Teacher Dashboard</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {classroom?.subject}
                </span>
                <span className="text-xs text-slate-400 font-mono">Code: {classroom?.join_code}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{classroom?.name}</h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                disabled={students.length === 0}
                className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-40"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={() => setShowAssignModal(true)}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create Assignment</span>
              </button>
            </div>
          </div>
        </div>

        {assignSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{assignSuccess}</span>
          </div>
        )}

        {/* Assigned Activities */}
        {assignments.length > 0 && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Active Classroom Assignments</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {assignments.map(a => (
                <div key={a.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="text-xs font-bold text-slate-900">{a.title}</div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3" />
                    <span>Due: {a.due_date ? new Date(a.due_date).toLocaleDateString() : "No deadline"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Student Roster Table (Backed only by narrow view) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-slate-700" />
                <span>Enrolled Student Progress Roster</span>
              </h2>
              <p className="text-xs text-slate-400">Restricted view: subject-relevant activity scores only.</p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
              {students.length} Students
            </span>
          </div>

          {students.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No students enrolled in this classroom yet. Share join code <strong>{classroom?.join_code}</strong> with your class.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 pl-2">Student Name</th>
                    <th className="pb-3 text-center">Subject Quests</th>
                    <th className="pb-3 text-center">Total Quests</th>
                    <th className="pb-3 text-center">Practice Score</th>
                    <th className="pb-3 pr-2 text-right">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map(s => (
                    <tr key={s.student_id} className="hover:bg-slate-50/70 transition-all">
                      <td className="py-3.5 pl-2 font-bold text-slate-900">{s.name || "Student"}</td>
                      <td className="py-3.5 text-center font-mono text-indigo-600 font-bold">
                        {s.related_quests_completed || 0}
                      </td>
                      <td className="py-3.5 text-center font-mono text-slate-600">
                        {s.total_quests_completed || 0}
                      </td>
                      <td className="py-3.5 text-center">
                        <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          {s.related_interview_score || 0}%
                        </span>
                      </td>
                      <td className="py-3.5 pr-2 text-right font-mono text-slate-400 text-[11px]">
                        {new Date(s.joined_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create Assignment Modal */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-6 animate-in zoom-in-95">
              <div className="space-y-1">
                <h2 className="text-lg font-black text-slate-900">Assign Classroom Task</h2>
                <p className="text-xs text-slate-500">Students will see this assigned task on their dashboard.</p>
              </div>

              <form onSubmit={handleCreateAssignment} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Assignment Title</label>
                  <input
                    type="text"
                    required
                    value={assignTitle}
                    onChange={(e) => setAssignTitle(e.target.value)}
                    placeholder="e.g. Complete AI Ethics Module or Week 2 Curiosity Quest"
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Due Date (Optional)</label>
                  <input
                    type="date"
                    value={assignDueDate}
                    onChange={(e) => setAssignDueDate(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAssignModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
                  >
                    Assign to Class
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
