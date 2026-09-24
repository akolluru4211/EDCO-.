"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { 
  GraduationCap, 
  Building2, 
  Briefcase, 
  Users, 
  Calendar, 
  Award, 
  TrendingUp, 
  CheckCircle2, 
  Sparkles, 
  Plus, 
  Check, 
  X, 
  Search, 
  ChevronRight, 
  BarChart3, 
  Layers, 
  FileText, 
  Building,
  DollarSign
} from "lucide-react";
import Button from "@/components/ui/Button";
import { 
  PlacementDrive, 
  PlacementStudent, 
  SyllabusMapping, 
  CompanyPartner, 
  PlacementAnalytics 
} from "@/lib/types";
import { 
  getPlacementDrives, 
  savePlacementDrive, 
  getPlacementStudents, 
  getSyllabusMappings, 
  saveSyllabusMapping, 
  getCompanyPartners 
} from "@/lib/db-service";
import { runPlacementInsightAgent, AgentInsight } from "@/lib/ai-agents";
import AccessDeniedPortal from "@/components/ui/AccessDeniedPortal";
import AuthGuard from "@/components/auth/AuthGuard";

export default function CollegesPlacementHubPage() {
  const { user, role, isCollegeAdmin, isAdmin } = useAuth();

  if (user && !isCollegeAdmin && !isAdmin) {
    return (
      <AccessDeniedPortal
        portalName="College & Placement Hub"
        requiredRole="College Placement Officer or Administrator"
        userRole={role}
        redirectTo="/dashboard"
      />
    );
  }

  const [activeTab, setActiveTab] = useState<"drives" | "student_radar" | "syllabus_alignment" | "company_crm" | "analytics">("drives");

  // State
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [students, setStudents] = useState<PlacementStudent[]>([]);
  const [syllabusMaps, setSyllabusMaps] = useState<SyllabusMapping[]>([]);
  const [partners, setPartners] = useState<CompanyPartner[]>([]);
  const [aiInsights, setAiInsights] = useState<AgentInsight[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  // New Drive Modal Form
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [newCompany, setNewCompany] = useState("");
  const [newRole, setNewRole] = useState("Graduate Software Engineer");
  const [newPackage, setNewPackage] = useState(18);
  const [newMinCgpa, setNewMinCgpa] = useState(7.5);
  const [newDate, setNewDate] = useState("2026-04-10");
  const [newLocation, setNewLocation] = useState("Auditorium & Virtual");
  const [newDeadline, setNewDeadline] = useState("2026-04-05");

  // Syllabus Mapping Form
  const [progCode, setProgCode] = useState("B.Tech CSE");
  const [subCode, setSubCode] = useState("CS401");
  const [subName, setSubName] = useState("Cloud Infrastructure & Microservices");
  const [targetSkill, setTargetSkill] = useState("Kubernetes, Docker, Distributed Tracing");
  const [industryReq, setIndustryReq] = useState("Platform Engineer Hiring Rubric (Tier-1)");
  const [matchRole, setMatchRole] = useState("Site Reliability Engineer / Cloud SDE");

  const loadData = async () => {
    const [d, s, sm, p] = await Promise.all([
      getPlacementDrives(),
      getPlacementStudents(),
      getSyllabusMappings(),
      getCompanyPartners(),
    ]);

    setDrives(d.length > 0 ? d : [
      {
        id: "drv-1",
        companyName: "Atlassian",
        role: "Graduate Software Engineer (Platform)",
        packageLpa: 28.5,
        eligibilityCriteria: { minCgpa: 8.0, allowedBranches: ["CSE", "IT", "ECE"], maxBacklogs: 0 },
        driveDate: "2026-04-15",
        location: "Main Auditorium",
        applicationDeadline: "2026-04-10",
        rounds: ["Online Assessment", "System Design", "Values Interview"],
        coordinatorName: "Prof. K. Narayanan (TPO)",
        status: "OPEN",
        registeredCount: 142,
        shortlistedCount: 28,
        placedCount: 0,
        createdAt: new Date().toISOString(),
      },
      {
        id: "drv-2",
        companyName: "Razorpay",
        role: "Frontend Engineer (Core Checkout)",
        packageLpa: 18.0,
        eligibilityCriteria: { minCgpa: 7.5, allowedBranches: ["CSE", "IT", "AI/ML"], maxBacklogs: 0 },
        driveDate: "2026-04-22",
        location: "Virtual Code Sandboxes",
        applicationDeadline: "2026-04-18",
        rounds: ["Machine Coding", "Tech Interview", "HR"],
        coordinatorName: "Dr. Shalini Gupta (TPO)",
        status: "ONGOING",
        registeredCount: 198,
        shortlistedCount: 42,
        placedCount: 8,
        createdAt: new Date().toISOString(),
      }
    ]);

    setStudents(s.length > 0 ? s : [
      { id: "pstu-1", rollNo: "22CS101", fullName: "Rohan Kapoor", branch: "CSE", cgpa: 8.9, activeBacklogs: 0, appliedDrivesCount: 4, offersCount: 1, currentStage: "SELECTED", placedCompany: "Razorpay", packageOfferedLpa: 18.0 },
      { id: "pstu-2", rollNo: "22CS102", fullName: "Pooja Hegde", branch: "CSE", cgpa: 9.2, activeBacklogs: 0, appliedDrivesCount: 3, offersCount: 0, currentStage: "ROUND_2" },
      { id: "pstu-3", rollNo: "22IT105", fullName: "Kiran Rao", branch: "IT", cgpa: 8.4, activeBacklogs: 0, appliedDrivesCount: 5, offersCount: 0, currentStage: "SHORTLISTED" },
      { id: "pstu-4", rollNo: "22EC108", fullName: "Suresh Menon", branch: "ECE", cgpa: 7.8, activeBacklogs: 0, appliedDrivesCount: 2, offersCount: 0, currentStage: "APPLIED" },
    ]);

    setSyllabusMaps(sm.length > 0 ? sm : [
      { id: "map-1", academicProgram: "B.Tech Computer Science", subjectCode: "CS302", subjectName: "Distributed Databases & Storage", targetSkill: "PostgreSQL Partitioning, Sharding, ACID", industryRequirement: "Fullstack SDE-1 Backend Criteria", matchingPlacementRole: "Backend Software Engineer", alignmentScore: 94, updatedAt: new Date().toISOString() },
      { id: "map-2", academicProgram: "B.Tech Artificial Intelligence", subjectCode: "AI401", subjectName: "Agentic Systems & MCP Protocols", targetSkill: "LLM Orchestration, Prompt Engineering", industryRequirement: "Applied AI Engineer Rubric", matchingPlacementRole: "AI Engineer", alignmentScore: 88, updatedAt: new Date().toISOString() },
    ]);

    setPartners(p.length > 0 ? p : [
      { id: "cp-1", companyName: "Atlassian", industry: "Enterprise SaaS", contactPerson: "Meera Nair (University Recruiter)", contactEmail: "meera.n@atlassian.com", contactPhone: "+91 98765 44001", drivesConducted: 4, totalHired: 16, avgPackageLpa: 26.5, tier: "Tier-1", relationshipNotes: "Preferred campus partner with consistent PPO conversions." },
      { id: "cp-2", companyName: "Razorpay", industry: "FinTech & Payments", contactPerson: "Ankit Jain (Tech Talent Lead)", contactEmail: "ankit.j@razorpay.com", contactPhone: "+91 98765 44002", drivesConducted: 3, totalHired: 12, avgPackageLpa: 18.0, tier: "Tier-1", relationshipNotes: "Strong focus on frontend systems and backend microservices." },
    ]);

    try {
      const insights = await runPlacementInsightAgent("COLLEGE_ADMIN");
      setAiInsights(insights);
    } catch {
      // safe fallback
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.trim()) return;

    await savePlacementDrive({
      companyName: newCompany,
      role: newRole,
      packageLpa: Number(newPackage),
      eligibilityCriteria: { minCgpa: Number(newMinCgpa), allowedBranches: ["CSE", "IT", "ECE"], maxBacklogs: 0 },
      driveDate: newDate,
      location: newLocation,
      applicationDeadline: newDeadline,
      rounds: ["Online Assessment", "Technical Rounds", "HR"],
      coordinatorName: user?.name || "Placement Officer",
      status: "OPEN",
      registeredCount: 0,
      shortlistedCount: 0,
      placedCount: 0,
    });

    setShowDriveModal(false);
    setNewCompany("");
    setNotification("Placement Drive scheduled and open for student registration!");
    setTimeout(() => setNotification(null), 3500);
    loadData();
  };

  const handleSaveSyllabusMap = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSyllabusMapping({
      academicProgram: progCode,
      subjectCode: subCode,
      subjectName: subName,
      targetSkill,
      industryRequirement: industryReq,
      matchingPlacementRole: matchRole,
      alignmentScore: 92,
    });

    setNotification("Syllabus alignment mapping registered into institutional curriculum radar.");
    setTimeout(() => setNotification(null), 3500);
    loadData();
  };

  // Analytics summary
  const totalEligible = 340;
  const totalOffers = students.reduce((acc, s) => acc + s.offersCount, 0);
  const totalPlaced = students.filter(s => s.currentStage === "PLACED" || s.currentStage === "SELECTED").length;
  const placementPct = Math.round((totalPlaced / students.length) * 100);

  return (
    <AuthGuard allowedRoles={["COLLEGE_ADMIN", "PLACEMENT_OFFICER", "ADMIN", "SUPER_ADMIN"]}>
      <div className="min-h-screen bg-[#0E0F15] text-white p-4 sm:p-6 lg:p-8 xl:px-10 space-y-8 max-w-[1536px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#13141B] p-6 sm:p-8 lg:p-10 rounded-3xl border border-white/10 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/30">
              College &amp; University Hub
            </span>
            <span className="text-xs sm:text-sm text-[#8E95A5]">🎓 Institutional Placement OS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white font-sans">
            Colleges &amp; Placement Operations
          </h1>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => setShowDriveModal(true)}
            className="px-5 py-2.5 sm:py-3 rounded-2xl bg-[#D7FC51] hover:bg-[#E9FFA4] text-[#13141B] text-xs sm:text-sm font-black transition-all flex items-center gap-2 shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Schedule Campus Drive</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Placement Insight Agent */}
      {aiInsights.length > 0 && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-purple-950/40 via-[#13141B] to-[#13141B] border border-purple-500/20 space-y-2">
          <div className="flex items-center gap-2 text-purple-300">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-black uppercase tracking-wider">PlacementInsightAgent Drive Telemetry</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {aiInsights.map((insight) => (
              <div key={insight.id} className="p-3 rounded-2xl bg-[#1C1D26]/80 border border-white/5 space-y-1">
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                  {insight.category}
                </span>
                <h4 className="text-xs font-bold text-white mt-0.5">{insight.headline}</h4>
                <p className="text-[11px] text-[#8E95A5] leading-snug">{insight.detail}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2.5 border-b border-white/10 pb-3 overflow-x-auto">
        {[
          { id: "drives", label: "Campus Drives Scheduler", icon: Building2 },
          { id: "student_radar", label: "Student Placement Radar", icon: Users },
          { id: "syllabus_alignment", label: "Syllabus Industry Alignment", icon: Layers },
          { id: "company_crm", label: "Corporate CRM", icon: Briefcase },
          { id: "analytics", label: "Placement Analytics", icon: BarChart3 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-[#D7FC51] text-[#13141B] shadow-md font-black"
                  : "bg-[#1C1D26] text-[#8E95A5] hover:text-white hover:bg-[#252633]"
              }`}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: DRIVES SCHEDULER */}
      {activeTab === "drives" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-white">Active Campus Placement Drives ({drives.length})</h2>
            <span className="text-xs text-[#8E95A5]">Audited by TPO Placement Cell</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {drives.map((d) => (
              <div key={d.id} className="p-5 rounded-3xl bg-[#13141B] border border-white/10 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-white">{d.companyName}</h3>
                    <span className="text-xs text-[#8E95A5]">{d.role}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-[#D7FC51] font-mono">₹{d.packageLpa} LPA</span>
                    <span className="text-[10px] text-purple-400 block font-bold">{d.status}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs text-[#8E95A5]">
                  <div>
                    <span>Drive Date:</span>
                    <strong className="text-white block">{d.driveDate}</strong>
                  </div>
                  <div>
                    <span>Location:</span>
                    <strong className="text-white block">{d.location}</strong>
                  </div>
                  <div>
                    <span>Eligibility:</span>
                    <strong className="text-white block">{d.eligibilityCriteria.minCgpa}+ CGPA ({d.eligibilityCriteria.allowedBranches.join(", ")})</strong>
                  </div>
                  <div>
                    <span>Application Deadline:</span>
                    <strong className="text-rose-400 block">{d.applicationDeadline}</strong>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[#1C1D26] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span>Registered: <strong className="text-white font-mono">{d.registeredCount}</strong></span>
                    <span>Shortlisted: <strong className="text-purple-400 font-mono">{d.shortlistedCount}</strong></span>
                  </div>
                  <span className="text-[10px] text-[#8E95A5]">Coordinator: {d.coordinatorName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: STUDENT RADAR */}
      {activeTab === "student_radar" && (
        <div className="bg-[#13141B] p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-white">Student Placement Funnel Radar</h2>
            <span className="text-xs text-[#8E95A5] font-mono">{students.length} Tracked Candidates</span>
          </div>

          <div className="space-y-3">
            {students.map((stu) => (
              <div key={stu.id} className="p-4 rounded-2xl bg-[#1C1D26] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{stu.fullName}</span>
                    <span className="text-[10px] text-[#8E95A5] font-mono">({stu.rollNo})</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#D7FC51]/10 text-[#D7FC51]">
                      {stu.branch} &bull; CGPA {stu.cgpa}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#8E95A5]">
                    Applied Drives: {stu.appliedDrivesCount} {stu.placedCompany ? `&bull; Placed at ${stu.placedCompany} (₹${stu.packageOfferedLpa} LPA)` : ""}
                  </span>
                </div>

                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-black font-mono ${stu.currentStage === "SELECTED" || stu.currentStage === "PLACED" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-purple-500/10 text-purple-300 border border-purple-500/30"}`}>
                    {stu.currentStage}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SYLLABUS ALIGNMENT */}
      {activeTab === "syllabus_alignment" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="bg-[#13141B] p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
            <h2 className="text-base font-black text-white">Map Subject to Industry Role</h2>
            <form onSubmit={handleSaveSyllabusMap} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-[#8E95A5] uppercase">Academic Program</label>
                <input
                  type="text"
                  value={progCode}
                  onChange={(e) => setProgCode(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl bg-[#1C1D26] border border-white/10 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-[#8E95A5] uppercase">Subject Code</label>
                  <input
                    type="text"
                    value={subCode}
                    onChange={(e) => setSubCode(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl bg-[#1C1D26] border border-white/10 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#8E95A5] uppercase">Subject Name</label>
                  <input
                    type="text"
                    value={subName}
                    onChange={(e) => setSubName(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl bg-[#1C1D26] border border-white/10 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#8E95A5] uppercase">Target Industry Skill</label>
                <input
                  type="text"
                  value={targetSkill}
                  onChange={(e) => setTargetSkill(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl bg-[#1C1D26] border border-white/10 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#8E95A5] uppercase">Matching Placement Role</label>
                <input
                  type="text"
                  value={matchRole}
                  onChange={(e) => setMatchRole(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl bg-[#1C1D26] border border-white/10 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#D7FC51] text-[#13141B] font-black text-xs hover:bg-[#E9FFA4] transition-all"
              >
                Register Syllabus Alignment
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-[#13141B] p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
            <h2 className="text-base font-black text-white">Curriculum vs Industry Skill Alignments</h2>
            <div className="space-y-3">
              {syllabusMaps.map((sm) => (
                <div key={sm.id} className="p-4 rounded-2xl bg-[#1C1D26] border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white">{sm.subjectCode} — {sm.subjectName}</span>
                      <span className="text-[10px] text-[#8E95A5] block">{sm.academicProgram}</span>
                    </div>
                    <span className="text-lg font-black text-[#D7FC51] font-mono">{sm.alignmentScore}% Match</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-[#8E95A5] pt-1">
                    <div>Target Skill: <strong className="text-white">{sm.targetSkill}</strong></div>
                    <div>Placement Role: <strong className="text-purple-400">{sm.matchingPlacementRole}</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 4: COMPANY CRM */}
      {activeTab === "company_crm" && (
        <div className="bg-[#13141B] p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-white">Corporate Recruiting Partners</h2>
            <span className="text-xs text-[#8E95A5] font-mono">{partners.length} Active Partners</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {partners.map((p) => (
              <div key={p.id} className="p-5 rounded-2xl bg-[#1C1D26] border border-white/5 space-y-3">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <div>
                    <h3 className="text-sm font-bold text-white">{p.companyName}</h3>
                    <span className="text-[10px] text-[#8E95A5]">{p.industry}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#D7FC51]/10 text-[#D7FC51]">
                    {p.tier}
                  </span>
                </div>

                <div className="text-xs text-[#8E95A5] space-y-1">
                  <div>Contact: <strong className="text-white">{p.contactPerson}</strong> ({p.contactEmail})</div>
                  <div>Hiring History: <strong className="text-white">{p.totalHired} Students</strong> across {p.drivesConducted} drives (Avg ₹{p.avgPackageLpa} LPA)</div>
                  <div className="text-[11px] italic text-[#8E95A5] pt-1">&ldquo;{p.relationshipNotes}&rdquo;</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: PLACEMENT ANALYTICS */}
      {activeTab === "analytics" && (
        <div className="bg-[#13141B] p-6 rounded-3xl border border-white/10 shadow-xl space-y-6">
          <h2 className="text-lg font-black text-white">Annual Placement Statistics (2026 Batch)</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#1C1D26] border border-white/5 space-y-1">
              <span className="text-[10px] font-bold text-[#8E95A5] uppercase">Total Eligible Students</span>
              <div className="text-3xl font-black text-white font-mono">{totalEligible}</div>
              <span className="text-[10px] text-[#8E95A5]">Across Engineering Disciplines</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#1C1D26] border border-white/5 space-y-1">
              <span className="text-[10px] font-bold text-[#8E95A5] uppercase">Total Offers Made</span>
              <div className="text-3xl font-black text-[#D7FC51] font-mono">{totalOffers + 18}</div>
              <span className="text-[10px] text-emerald-400 font-bold">Includes Super Dream offers</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#1C1D26] border border-white/5 space-y-1">
              <span className="text-[10px] font-bold text-[#8E95A5] uppercase">Highest Package</span>
              <div className="text-3xl font-black text-purple-400 font-mono">₹28.5 LPA</div>
              <span className="text-[10px] text-[#8E95A5]">Atlassian Platform Track</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#1C1D26] border border-white/5 space-y-1">
              <span className="text-[10px] font-bold text-[#8E95A5] uppercase">Average Package</span>
              <div className="text-3xl font-black text-emerald-400 font-mono">₹14.2 LPA</div>
              <span className="text-[10px] text-emerald-400 font-bold">+18% vs Last Year</span>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Drive Modal */}
      {showDriveModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#13141B] border border-white/15 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white">Schedule Campus Placement Drive</h3>
              <button onClick={() => setShowDriveModal(false)} className="text-[#8E95A5] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDrive} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-[#8E95A5] uppercase">Company Name</label>
                <input
                  type="text"
                  required
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  placeholder="e.g. Microsoft / Amazon"
                  className="w-full mt-1 p-2.5 rounded-xl bg-[#1C1D26] border border-white/10 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#8E95A5] uppercase">Role Title</label>
                <input
                  type="text"
                  required
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl bg-[#1C1D26] border border-white/10 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-[#8E95A5] uppercase">Package (LPA)</label>
                  <input
                    type="number"
                    value={newPackage}
                    onChange={(e) => setNewPackage(Number(e.target.value))}
                    className="w-full mt-1 p-2 rounded-xl bg-[#1C1D26] border border-white/10 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#8E95A5] uppercase">Min CGPA</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newMinCgpa}
                    onChange={(e) => setNewMinCgpa(Number(e.target.value))}
                    className="w-full mt-1 p-2 rounded-xl bg-[#1C1D26] border border-white/10 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-[#8E95A5] uppercase">Drive Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl bg-[#1C1D26] border border-white/10 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#8E95A5] uppercase">Application Deadline</label>
                  <input
                    type="date"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl bg-[#1C1D26] border border-white/10 text-xs text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#D7FC51] text-[#13141B] font-black text-xs hover:bg-[#E9FFA4] transition-all mt-2"
              >
                Schedule &amp; Open Registrations
              </button>
            </form>
          </div>
        </div>
      )}
      </div>
    </AuthGuard>
  );
}
