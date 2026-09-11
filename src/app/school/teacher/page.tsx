"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { 
  School, 
  Users, 
  Calendar, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Award, 
  MessageSquare, 
  Sparkles, 
  Plus, 
  Check, 
  X, 
  Search, 
  ChevronRight,
  TrendingUp,
  AlertCircle,
  FileText,
  Send
} from "lucide-react";
import Button from "@/components/ui/Button";
import { 
  TeacherClass, 
  StudentRecord, 
  GradeRecord, 
  LessonPlan, 
  ParentMessage 
} from "@/lib/types";
import { 
  getTeacherClasses, 
  getStudentsByClass, 
  getGradeRecords, 
  saveGradeRecord, 
  getLessonPlans, 
  saveLessonPlan, 
  getParentMessages, 
  sendParentMessage 
} from "@/lib/db-service";
import { runSchoolOperationsAgent, AgentInsight } from "@/lib/ai-agents";
import AccessDeniedPortal from "@/components/ui/AccessDeniedPortal";
import AuthGuard from "@/components/auth/AuthGuard";

export default function SchoolTeacherStudioPage() {
  const { user, role, isTeacher, isAdmin } = useAuth();

  if (user && !isTeacher && !isAdmin) {
    return (
      <AccessDeniedPortal
        portalName="Teacher Studio"
        requiredRole="School Teacher or Administrator"
        userRole={role}
        redirectTo="/dashboard"
      />
    );
  }

  const [activeTab, setActiveTab] = useState<"dashboard" | "classes" | "attendance_radar" | "gradebook" | "lesson_planner" | "parent_comm">("dashboard");

  // State
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [parentMessages, setParentMessages] = useState<ParentMessage[]>([]);
  const [aiInsights, setAiInsights] = useState<AgentInsight[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  // Grade Entry Form
  const [gradeStudentId, setGradeStudentId] = useState("");
  const [gradeAssessment, setGradeAssessment] = useState("Unit 3 — Data Structures Assessment");
  const [gradeMarks, setGradeMarks] = useState(45);
  const [gradeMax, setGradeMax] = useState(50);
  const [gradeRemarks, setGradeRemarks] = useState("Exemplary recursive algorithm design.");

  // Lesson Plan Form
  const [planSubject, setPlanSubject] = useState("Computer Science");
  const [planGrade, setPlanGrade] = useState("Grade 10");
  const [planTopic, setPlanTopic] = useState("Binary Search & Complexity Analysis");
  const [planDate, setPlanDate] = useState("2026-03-24");
  const [planObjectives, setPlanObjectives] = useState("Understand divide-and-conquer logic\nImplement iterative binary search");
  const [planActivities, setPlanActivities] = useState("Interactive card sorting demonstration\nLive code walkthrough");
  const [planHomework, setPlanHomework] = useState("Complete textbook exercises 4.1 to 4.5");

  // Parent Message Form
  const [msgStudentId, setMsgStudentId] = useState("");
  const [msgSubject, setMsgSubject] = useState("Weekly Academic Progress & Attendance Digest");
  const [msgBody, setMsgBody] = useState("");

  const loadData = async () => {
    const [c, s, g, lp, pm] = await Promise.all([
      getTeacherClasses(),
      getStudentsByClass(),
      getGradeRecords(),
      getLessonPlans(),
      getParentMessages(),
    ]);

    setClasses(c.length > 0 ? c : [
      { id: "cls-1", name: "Grade 10 - Section A", subject: "Computer Science & AI", totalStudents: 38, scheduleTime: "09:00 AM - 10:00 AM", room: "Lab 3" },
      { id: "cls-2", name: "Grade 9 - Section B", subject: "Physics & Logic", totalStudents: 34, scheduleTime: "11:15 AM - 12:15 PM", room: "Room 204" },
      { id: "cls-3", name: "Grade 11 - Section A", subject: "Applied Mathematics", totalStudents: 28, scheduleTime: "01:30 PM - 02:30 PM", room: "Room 102" },
    ]);

    setStudents(s.length > 0 ? s : [
      { id: "stu-1", rollNumber: "10A01", name: "Aarav Sharma", classId: "cls-1", className: "Grade 10 - Section A", parentName: "Rajesh Sharma", parentEmail: "rajesh.sharma@parent.com", parentPhone: "+91 98765 00111", attendancePercentage: 96, overallGrade: "A+" },
      { id: "stu-2", rollNumber: "10A02", name: "Ananya Iyer", classId: "cls-1", className: "Grade 10 - Section A", parentName: "Meenakshi Iyer", parentEmail: "meenakshi@parent.com", parentPhone: "+91 98765 00222", attendancePercentage: 78, overallGrade: "B+" },
      { id: "stu-3", rollNumber: "10A03", name: "Devansh Patel", classId: "cls-1", className: "Grade 10 - Section A", parentName: "Sanjay Patel", parentEmail: "sanjay.patel@parent.com", parentPhone: "+91 98765 00333", attendancePercentage: 92, overallGrade: "A" },
      { id: "stu-4", rollNumber: "10A04", name: "Isha Nair", classId: "cls-1", className: "Grade 10 - Section A", parentName: "Deepa Nair", parentEmail: "deepa.nair@parent.com", parentPhone: "+91 98765 00444", attendancePercentage: 98, overallGrade: "A+" },
    ]);

    setGrades(g.length > 0 ? g : [
      { id: "gr-1", studentId: "stu-1", studentName: "Aarav Sharma", classId: "cls-1", assessmentTitle: "Midterm Assessment", marksObtained: 48, maxMarks: 50, grade: "A+", remarks: "Outstanding conceptual clarity", date: "2026-03-01" },
      { id: "gr-2", studentId: "stu-2", studentName: "Ananya Iyer", classId: "cls-1", assessmentTitle: "Midterm Assessment", marksObtained: 38, maxMarks: 50, grade: "B+", remarks: "Needs more practice on graph traversals", date: "2026-03-01" },
      { id: "gr-3", studentId: "stu-3", studentName: "Devansh Patel", classId: "cls-1", assessmentTitle: "Midterm Assessment", marksObtained: 44, maxMarks: 50, grade: "A", remarks: "Very good analytical approach", date: "2026-03-01" },
    ]);

    setLessonPlans(lp);
    setParentMessages(pm);

    try {
      const insights = await runSchoolOperationsAgent("TEACHER");
      setAiInsights(insights);
    } catch {
      // safe fallback
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find(s => s.id === gradeStudentId) || students[0];
    if (!student) return;

    const pct = (gradeMarks / gradeMax) * 100;
    const computedGrade = pct >= 90 ? "A+" : pct >= 80 ? "A" : pct >= 70 ? "B+" : pct >= 60 ? "B" : "C";

    await saveGradeRecord({
      studentId: student.id,
      studentName: student.name,
      classId: student.classId,
      assessmentTitle: gradeAssessment,
      marksObtained: Number(gradeMarks),
      maxMarks: Number(gradeMax),
      grade: computedGrade,
      remarks: gradeRemarks,
      date: new Date().toISOString().split("T")[0],
    });

    setNotification("Grade entry saved & computed successfully!");
    setTimeout(() => setNotification(null), 3500);
    loadData();
  };

  const handleSaveLessonPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planTopic.trim()) return;

    await saveLessonPlan({
      teacherId: user?.uid || "tea_1",
      subject: planSubject,
      gradeLevel: planGrade,
      topic: planTopic,
      date: planDate,
      objectives: planObjectives.split("\n").filter(Boolean),
      activities: planActivities.split("\n").filter(Boolean),
      resources: ["EdWorld Interactive Code Sandboxes", "CBSE Syllabus Guide"],
      homework: planHomework,
      status: "PLANNED",
    });

    setNotification("Lesson plan registered for upcoming class!");
    setTimeout(() => setNotification(null), 3500);
    loadData();
  };

  const handleSendParentMsg = async (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find(s => s.id === msgStudentId) || students[0];
    if (!student || !msgBody.trim()) return;

    await sendParentMessage({
      teacherId: user?.uid || "tea_1",
      teacherName: user?.name || "Faculty Member",
      studentId: student.id,
      studentName: student.name,
      parentName: student.parentName,
      parentEmail: student.parentEmail,
      subject: msgSubject,
      message: msgBody,
    });

    setMsgBody("");
    setNotification(`Direct communication sent to parent (${student.parentEmail})`);
    setTimeout(() => setNotification(null), 3500);
    loadData();
  };

  // Gradebook calculations
  const avgMarks = grades.length > 0 ? (grades.reduce((a, b) => a + b.marksObtained, 0) / grades.length).toFixed(1) : "N/A";
  const maxScore = grades.length > 0 ? Math.max(...grades.map(g => g.marksObtained)) : "N/A";
  const minScore = grades.length > 0 ? Math.min(...grades.map(g => g.marksObtained)) : "N/A";

  return (
    <AuthGuard allowedRoles={["TEACHER", "FOUNDER", "EXECUTIVE", "ADMIN", "SUPER_ADMIN"]}>
      <div className="min-h-screen bg-[#0E0F15] text-white p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1440px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#13141B] p-6 rounded-3xl border border-white/10 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Academic Faculty Studio
            </span>
            <span className="text-xs text-[#8E95A5]">🏫 School Operations OS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-sans">
            Teacher Operations Workspace
          </h1>
          <p className="text-xs text-[#8E95A5]">
            Class roster management, attendance radar, calibrated gradebook, 5E lesson planning &amp; parent digests.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab("lesson_planner")}
            className="px-4 py-2.5 rounded-2xl bg-[#D7FC51] hover:bg-[#E9FFA4] text-[#13141B] text-xs font-black transition-all flex items-center gap-1.5 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Create Lesson Plan</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* School Operations Agent Radar */}
      {aiInsights.length > 0 && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-[#13141B] to-[#13141B] border border-emerald-500/20 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-black uppercase tracking-wider">SchoolOperationsAgent Real-Time Telemetry</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {aiInsights.map((insight) => (
              <div key={insight.id} className="p-3 rounded-2xl bg-[#1C1D26]/80 border border-white/5 space-y-1">
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  {insight.category}
                </span>
                <h4 className="text-xs font-bold text-white mt-0.5">{insight.headline}</h4>
                <p className="text-[11px] text-[#8E95A5] leading-snug">{insight.detail}</p>
                {insight.actionableStep && (
                  <p className="text-[10px] text-[#D7FC51] font-semibold pt-1">
                    &rarr; {insight.actionableStep}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto">
        {[
          { id: "dashboard", label: "Today's Schedule & Alerts", icon: Clock },
          { id: "classes", label: "Classes & Roster", icon: School },
          { id: "attendance_radar", label: "Attendance Radar", icon: CheckCircle2 },
          { id: "gradebook", label: "Gradebook & Assessments", icon: Award },
          { id: "lesson_planner", label: "5E Lesson Planner", icon: BookOpen },
          { id: "parent_comm", label: "Parent Communication", icon: MessageSquare },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                isActive
                  ? "bg-[#D7FC51] text-[#13141B] shadow-md font-black"
                  : "bg-[#1C1D26] text-[#8E95A5] hover:text-white hover:bg-[#252633]"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: TODAY'S DASHBOARD */}
      {activeTab === "dashboard" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-base font-black text-white">Today&apos;s Academic Schedule</h2>
            <div className="space-y-3">
              {classes.map((cls) => (
                <div key={cls.id} className="p-4 rounded-2xl bg-[#13141B] border border-white/10 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{cls.name}</span>
                      <span className="text-xs text-[#8E95A5]">&bull; {cls.subject}</span>
                    </div>
                    <span className="text-[11px] text-[#8E95A5] font-mono">
                      {cls.scheduleTime} &bull; Room: {cls.room} &bull; {cls.totalStudents} Students
                    </span>
                  </div>
                  <button 
                    onClick={() => setActiveTab("attendance_radar")}
                    className="px-3.5 py-1.5 rounded-xl bg-[#1C1D26] hover:bg-[#252633] text-[#D7FC51] text-xs font-bold border border-white/10"
                  >
                    Take Attendance &rarr;
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-base font-black text-white">Academic Alerts</h2>
            <div className="p-5 rounded-3xl bg-[#13141B] border border-white/10 space-y-3">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span>Attendance Digest Required</span>
                </span>
                <p className="text-[11px] text-amber-300/80">
                  Grade 10 Section A has 1 student below 80% monthly attendance threshold.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#1C1D26] border border-white/5 text-xs text-[#8E95A5] space-y-1">
                <span className="font-bold text-white block">Upcoming Unit 3 Assessment</span>
                <p className="text-[11px]">Scheduled for March 28, 2026 across all sections.</p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: CLASSES & ROSTER */}
      {activeTab === "classes" && (
        <div className="bg-[#13141B] p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-white">Class Roster &amp; Student Directory</h2>
            <span className="text-xs text-[#8E95A5] font-mono">{students.length} Enrolled Students</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {students.map((stu) => (
              <div key={stu.id} className="p-4 rounded-2xl bg-[#1C1D26] border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-[#D7FC51] bg-[#D7FC51]/10 px-2 py-0.5 rounded">
                    {stu.rollNumber}
                  </span>
                  <span className="text-xs font-black text-emerald-400 font-mono">{stu.overallGrade}</span>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-white">{stu.name}</h3>
                  <span className="text-[10px] text-[#8E95A5] block">{stu.className}</span>
                </div>

                <div className="space-y-1 text-[10px] text-[#8E95A5] pt-2 border-t border-white/5">
                  <div>Parent: <strong className="text-white">{stu.parentName}</strong></div>
                  <div>Attendance: <strong className={stu.attendancePercentage < 80 ? "text-rose-400 font-mono" : "text-emerald-400 font-mono"}>{stu.attendancePercentage}%</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ATTENDANCE RADAR */}
      {activeTab === "attendance_radar" && (
        <div className="bg-[#13141B] p-6 rounded-3xl border border-white/10 shadow-xl space-y-6">
          <div>
            <h2 className="text-lg font-black text-white">Class Attendance Radar</h2>
            <p className="text-xs text-[#8E95A5]">Daily presence tracking and student attendance analytics.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#1C1D26] border border-white/5 space-y-1">
              <span className="text-[10px] font-bold text-[#8E95A5] uppercase">Average Attendance</span>
              <div className="text-2xl font-black text-emerald-400 font-mono">91.0%</div>
              <span className="text-[10px] text-emerald-400">Class 10 Section A</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#1C1D26] border border-white/5 space-y-1">
              <span className="text-[10px] font-bold text-[#8E95A5] uppercase">Total Present Today</span>
              <div className="text-2xl font-black text-white font-mono">37 / 38</div>
              <span className="text-[10px] text-[#8E95A5]">1 Absent with medical note</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#1C1D26] border border-white/5 space-y-1">
              <span className="text-[10px] font-bold text-[#8E95A5] uppercase">Chronic Absence Risk</span>
              <div className="text-2xl font-black text-amber-400 font-mono">1 Student</div>
              <span className="text-[10px] text-amber-400">Below 80% threshold</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: GRADEBOOK & ASSESSMENTS */}
      {activeTab === "gradebook" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Grade Entry Form */}
          <div className="bg-[#13141B] p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
            <h2 className="text-base font-black text-white">Record Student Assessment</h2>
            <form onSubmit={handleSaveGrade} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-[#8E95A5] uppercase">Select Student</label>
                <select
                  value={gradeStudentId}
                  onChange={(e) => setGradeStudentId(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl bg-[#1C1D26] border border-white/10 text-xs text-white"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.rollNumber})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#8E95A5] uppercase">Assessment Title</label>
                <input
                  type="text"
                  required
                  value={gradeAssessment}
                  onChange={(e) => setGradeAssessment(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl bg-[#1C1D26] border border-white/10 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-[#8E95A5] uppercase">Marks</label>
                  <input
                    type="number"
                    value={gradeMarks}
                    onChange={(e) => setGradeMarks(Number(e.target.value))}
                    className="w-full mt-1 p-2 rounded-xl bg-[#1C1D26] border border-white/10 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#8E95A5] uppercase">Max Marks</label>
                  <input
                    type="number"
                    value={gradeMax}
                    onChange={(e) => setGradeMax(Number(e.target.value))}
                    className="w-full mt-1 p-2 rounded-xl bg-[#1C1D26] border border-white/10 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#8E95A5] uppercase">Remarks</label>
                <input
                  type="text"
                  value={gradeRemarks}
                  onChange={(e) => setGradeRemarks(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl bg-[#1C1D26] border border-white/10 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#D7FC51] text-[#13141B] font-black text-xs hover:bg-[#E9FFA4] transition-all"
              >
                Record Grade in Gradebook
              </button>
            </form>
          </div>

          {/* Gradebook Table & Analytics */}
          <div className="lg:col-span-2 bg-[#13141B] p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-white">Gradebook Records</h2>
                <span className="text-xs text-[#8E95A5]">Class Average: <strong className="text-white font-mono">{avgMarks}</strong> &bull; Highest: <strong className="text-emerald-400 font-mono">{maxScore}</strong> &bull; Lowest: <strong className="text-amber-400 font-mono">{minScore}</strong></span>
              </div>
            </div>

            <div className="space-y-2">
              {grades.map((g) => (
                <div key={g.id} className="p-3.5 rounded-2xl bg-[#1C1D26] border border-white/5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white block">{g.studentName}</span>
                    <span className="text-[10px] text-[#8E95A5]">{g.assessmentTitle} &bull; &ldquo;{g.remarks}&rdquo;</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-[#D7FC51] font-mono">{g.marksObtained} / {g.maxMarks}</span>
                    <span className="text-[10px] text-[#8E95A5] block font-bold">Grade {g.grade}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 5: 5E LESSON PLANNER */}
      {activeTab === "lesson_planner" && (
        <div className="bg-[#13141B] p-6 rounded-3xl border border-white/10 shadow-xl space-y-6">
          <div>
            <h2 className="text-lg font-black text-white">5E Model Lesson Planner</h2>
            <p className="text-xs text-[#8E95A5]">Engage, Explore, Explain, Elaborate, and Evaluate.</p>
          </div>

          <form onSubmit={handleSaveLessonPlan} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-bold text-[#8E95A5] uppercase">Subject</label>
                <input
                  type="text"
                  value={planSubject}
                  onChange={(e) => setPlanSubject(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl bg-[#1C1D26] border border-white/10 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#8E95A5] uppercase">Grade Level</label>
                <input
                  type="text"
                  value={planGrade}
                  onChange={(e) => setPlanGrade(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl bg-[#1C1D26] border border-white/10 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#8E95A5] uppercase">Date</label>
                <input
                  type="date"
                  value={planDate}
                  onChange={(e) => setPlanDate(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl bg-[#1C1D26] border border-white/10 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#8E95A5] uppercase">Topic / Concept</label>
              <input
                type="text"
                required
                value={planTopic}
                onChange={(e) => setPlanTopic(e.target.value)}
                className="w-full mt-1 p-2.5 rounded-xl bg-[#1C1D26] border border-white/10 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-[#8E95A5] uppercase">Learning Objectives</label>
                <textarea
                  rows={3}
                  value={planObjectives}
                  onChange={(e) => setPlanObjectives(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl bg-[#1C1D26] border border-white/10 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#8E95A5] uppercase">Class Activities</label>
                <textarea
                  rows={3}
                  value={planActivities}
                  onChange={(e) => setPlanActivities(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl bg-[#1C1D26] border border-white/10 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#8E95A5] uppercase">Homework / Assignment</label>
              <input
                type="text"
                value={planHomework}
                onChange={(e) => setPlanHomework(e.target.value)}
                className="w-full mt-1 p-2.5 rounded-xl bg-[#1C1D26] border border-white/10 text-xs text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-[#D7FC51] text-[#13141B] font-black text-xs hover:bg-[#E9FFA4] transition-all shadow-md"
            >
              Save &amp; Publish Lesson Plan
            </button>
          </form>
        </div>
      )}

      {/* TAB 6: PARENT COMMUNICATION */}
      {activeTab === "parent_comm" && (
        <div className="bg-[#13141B] p-6 rounded-3xl border border-white/10 shadow-xl space-y-6">
          <div>
            <h2 className="text-lg font-black text-white">Direct Parent Communication</h2>
            <p className="text-xs text-[#8E95A5]">Send individual progress updates and attendance digests to verified guardians.</p>
          </div>

          <form onSubmit={handleSendParentMsg} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-[#8E95A5] uppercase">Recipient Student &amp; Parent</label>
              <select
                value={msgStudentId}
                onChange={(e) => setMsgStudentId(e.target.value)}
                className="w-full mt-1 p-2.5 rounded-xl bg-[#1C1D26] border border-white/10 text-xs text-white"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} &bull; Parent: {s.parentName} ({s.parentEmail})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#8E95A5] uppercase">Subject</label>
              <input
                type="text"
                value={msgSubject}
                onChange={(e) => setMsgSubject(e.target.value)}
                className="w-full mt-1 p-2.5 rounded-xl bg-[#1C1D26] border border-white/10 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#8E95A5] uppercase">Message Content</label>
              <textarea
                rows={4}
                required
                value={msgBody}
                onChange={(e) => setMsgBody(e.target.value)}
                placeholder="Dear Guardian, This is an update regarding your ward's classroom engagement and weekly assessment marks..."
                className="w-full mt-1 p-3 rounded-xl bg-[#1C1D26] border border-white/10 text-xs text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-[#D7FC51] text-[#13141B] font-black text-xs hover:bg-[#E9FFA4] transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Dispatch Parent Notification</span>
            </button>
          </form>
        </div>
      )}
      </div>
    </AuthGuard>
  );
}
