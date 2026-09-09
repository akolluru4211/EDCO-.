"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { 
  FileText, 
  Video, 
  Briefcase, 
  Users, 
  Sparkles, 
  ArrowRight, 
  TrendingUp, 
  CheckCircle2, 
  Code2, 
  FolderGit2,
  Trophy,
  Layers,
  Search,
  Building2,
  Calendar,
  Send,
  DollarSign,
  Award,
  Check,
  Zap,
  Target,
  Plus,
  Compass,
  AlertCircle,
  Bot
} from "lucide-react";
import Button from "@/components/ui/Button";
import ClaudeAnalysisModal from "@/components/ai/ClaudeAnalysisModal";
import { ClaudeAnalysisType } from "@/app/api/claude/analyze/route";

export default function CareerDashboardPage() {
  const { user, profile } = useAuth();
  
  // Track Mode: Default based on user profile or toggle between College & Working Professional
  const [selectedTrack, setSelectedTrack] = useState<"college" | "professional">("professional");

  useEffect(() => {
    if (profile?.careerStage === "college" || profile?.gradeLevel === "College") {
      setSelectedTrack("college");
    } else {
      setSelectedTrack("professional");
    }
  }, [profile, user]);

  // College Tabs
  const [collegeTab, setCollegeTab] = useState<
    "placements" | "internships" | "hackathons" | "peer_review" | "micro_certs" | "problem_board"
  >("placements");

  // Professional Tabs
  const [proTab, setProTab] = useState<
    "career_switch" | "job_pipeline" | "referrals" | "salary_intel" | "self_appraisal" | "cert_tracker"
  >("career_switch");

  // ==========================================
  // COLLEGE INTERACTIVE STATES
  // ==========================================
  // 1. Campus Placement Drives
  const [placementDrives, setPlacementDrives] = useState<any[]>([
    { id: "dr-1", company: "Atlassian", tier: "Super Dream", role: "Graduate Software Engineer", testDate: "Oct 14, 2026", ctc: "₹24–32 LPA", status: "OA Scheduled", progress: 50 },
    { id: "dr-2", company: "Razorpay", tier: "Dream", role: "Frontend Platform Engineer", testDate: "Oct 22, 2026", ctc: "₹18–22 LPA", status: "Shortlisted", progress: 25 },
    { id: "dr-3", company: "Flipkart", tier: "Super Dream", role: "SDE-1 (Backend Core)", testDate: "Nov 02, 2026", ctc: "₹22–28 LPA", status: "Applied", progress: 10 }
  ]);

  // 2. Hackathons
  const hackathons = [
    { id: "hk-1", title: "Smart City AI & Urban Tech Hackathon", host: "GovTech India", prize: "₹5,00,000", deadline: "Oct 18, 2026", teamStatus: "2/4 Members Needed", tags: ["Python", "FastAPI", "IoT"] },
    { id: "hk-2", title: "Web3 & Zero-Knowledge Devcon Sprint", host: "Ethereum Global Track", prize: "$10,000 USD", deadline: "Nov 05, 2026", teamStatus: "1/3 Member Needed", tags: ["Solidity", "Rust", "Next.js"] },
    { id: "hk-3", title: "HealthTech Open Diagnostic Challenge", host: "BioInformatics Hub", prize: "₹3,50,000", deadline: "Oct 30, 2026", teamStatus: "Looking for UI Lead", tags: ["Computer Vision", "PyTorch"] }
  ];

  // 3. Peer Resume Review
  const [peerReviews, setPeerReviews] = useState<any[]>([
    { id: "pr-1", reviewer: "Karan M. (Senior at IITD)", resumeName: "SDE_General_2026.pdf", score: "88/100", verdict: "Strong technical bullet metrics. Add quantifiable API latency reductions." },
    { id: "pr-2", reviewer: "Divya R. (Google SWE)", resumeName: "Fullstack_ATS_Resume.pdf", score: "94/100", verdict: "Excellent STAR format on Distributed Cache section." }
  ]);

  // 4. Skill Micro-Certifications
  const microCerts = [
    { id: "mc-1", name: "High-Throughput API Architecture", authority: "Edworld Project Studio", badge: "Level 2 Certified", date: "Aug 2026", verifyId: "ED-API-9942" },
    { id: "mc-2", name: "Fullstack React & Next.js Scalability", authority: "Edworld Project Studio", badge: "Level 2 Certified", date: "Sep 2026", verifyId: "ED-WEB-8114" }
  ];

  // ==========================================
  // WORKING PROFESSIONAL INTERACTIVE STATES
  // ==========================================
  // 1. Career Switch Gap Analysis State
  const [currentRole, setCurrentRole] = useState("QA / SDET");
  const [targetRole, setTargetRole] = useState("Backend Systems Engineer");
  const [gapAnalysis, setGapAnalysis] = useState<any>({
    matchScore: 74,
    transferableSkills: ["Python Automation", "CI/CD Pipelines", "Test-Driven Development", "API Load Testing"],
    missingSkills: ["Distributed Event Streaming (Kafka/RabbitMQ)", "Postgres Index Optimization & Query Plans", "System Design Trade-offs (CAP Theorem)"],
    suggestedBridgeCourses: ["High-Scale Microservices Track", "Database Internals & Partitioning Sprint"]
  });

  // 2. Job Search Pipeline Kanban
  const [kanbanApps, setKanbanApps] = useState<any[]>([
    { id: "k-1", company: "Stripe", role: "Staff Engineer", stage: "System Design", date: "Sep 02" },
    { id: "k-2", company: "Uber", role: "Senior Backend Eng", stage: "Tech Screen", date: "Sep 04" },
    { id: "k-3", company: "Zomato", role: "Lead Architect", stage: "Offer", date: "Sep 06" },
    { id: "k-4", company: "Coinbase", role: "Backend Engineer", stage: "Applied", date: "Sep 07" }
  ]);

  // 3. Referral Request Generator
  const [refCompany, setRefCompany] = useState("Google");
  const [refRole, setRefRole] = useState("Senior Software Engineer");
  const [refNote, setRefNote] = useState("");

  const handleGenerateReferralNote = () => {
    setRefNote(`Hi [Connection Name],

I noticed you're working at ${refCompany} and have been following the engineering team's recent milestones. 

I'm currently targeting the ${refRole} position (Job ID: [12345]) and have 4+ years scaling high-throughput distributed backends (p99 < 15ms, 120k QPS).

If you have 2 minutes, I'd deeply appreciate if you could share a referral on the internal portal. My resume and calibrated ATS scorecard are linked here: [Resume Link].

Thanks so much for your time!`);
  };

  // 4. Performance Appraisal Assistant State
  const [appraisalRaw, setAppraisalRaw] = useState("");
  const [appraisalGenerated, setAppraisalGenerated] = useState<string[]>([]);

  // 5. Claude MCP Analyzer State
  const [isClaudeModalOpen, setIsClaudeModalOpen] = useState(false);
  const [claudeAnalysisType, setClaudeAnalysisType] = useState<ClaudeAnalysisType>("appraisal_performance");
  const [claudeInitialContent, setClaudeInitialContent] = useState("");

  const handleGenerateAppraisalBullets = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appraisalRaw.trim()) return;
    setAppraisalGenerated([
      `Architected and deployed distributed caching layer using Redis Clusters, reducing p95 database query latency by 42% across 1.4M daily transactions.`,
      `Spearheaded migration of legacy monolith authentication to OAuth2/JWT microservices, slashing operational auth failures to <0.01% SLA.`,
      `Mentored 4 junior engineers on distributed system design patterns and established automated CI/CD PR quality gates, cutting rollback rates by 35%.`
    ]);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F4F6FB] py-8 px-4 sm:px-6 lg:px-8 text-[#13141B]">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in">
        
        {/* Hub Header & Sector Switcher */}
        <div className="card-quixel rounded-3xl p-6 sm:p-8 border border-[#E8ECF2] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden bg-white shadow-sm">
          <div className="space-y-2 relative z-10">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#13141B] text-white">
                {selectedTrack === "college" ? "Higher Ed / College Track (18–22)" : "Working Professional Track (22+)"}
              </span>
              <span className="text-xs font-bold text-[#8F9CAE]">Career Acceleration Studio</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black font-display text-[#13141B] tracking-tight">
              {selectedTrack === "college" ? "Placements, Hackathons & Micro-Certs" : "Career Switches, Pipeline & Performance Appraisal"}
            </h1>
            <p className="text-xs sm:text-sm text-[#5E6573] max-w-2xl font-medium">
              Calibrated practice, JD-tailored resumes, live mock interviews, and verifiable milestone credentials.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5 self-start md:self-auto">
            <button
              onClick={() => {
                setClaudeAnalysisType(selectedTrack === "college" ? "resume_ats" : "appraisal_performance");
                setClaudeInitialContent(
                  selectedTrack === "college"
                    ? `Experience:\nSoftware Engineer Intern (May 2026 - Jul 2026)\n- Developed Next.js features and REST endpoints\n- Wrote unit tests in Jest with 90% coverage`
                    : `Self-Appraisal Draft:\n- Led backend service rewrite in Go cutting latency by 35%\n- Mentored junior engineers on CI/CD pipelines and PR quality gates`
                );
                setIsClaudeModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 border border-amber-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Bot className="w-4 h-4 text-amber-600" />
              <span>Claude MCP Analyzer</span>
            </button>

            {/* Sector Switcher Pill */}
            <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#13141B] text-white shadow-md">
              <button
                onClick={() => setSelectedTrack("college")}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  selectedTrack === "college" ? "bg-[#D7FC51] text-[#13141B] shadow-sm" : "text-[#8E95A5] hover:text-white"
                }`}
              >
                College (18–22)
              </button>
              <button
                onClick={() => setSelectedTrack("professional")}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  selectedTrack === "professional" ? "bg-[#D7FC51] text-[#13141B] shadow-sm" : "text-[#8E95A5] hover:text-white"
                }`}
              >
                Professional (22+)
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 1. COLLEGE SECTOR (18-22) */}
        {/* ========================================================================= */}
        {selectedTrack === "college" && (
          <div className="space-y-6">
            
            {/* College Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto touch-scroll-x pb-2 scrollbar-none">
              {[
                { id: "placements", label: "Campus Placement Tracker" },
                { id: "internships", label: "Internship Job Board Filter" },
                { id: "hackathons", label: "Hackathon & Group Project Finder" },
                { id: "peer_review", label: "Peer Resume Review" },
                { id: "micro_certs", label: "Skill Micro-Certifications" },
                { id: "problem_board", label: "Problem → Solution Studio" },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setCollegeTab(tab.id as any)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                    collegeTab === tab.id
                      ? "bg-[#13141B] text-white shadow-sm"
                      : "bg-white border border-[#E8ECF2] text-[#5E6573] hover:text-[#13141B] hover:bg-slate-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB 1: CAMPUS PLACEMENT TRACKER */}
            {collegeTab === "placements" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-[#13141B]">On-Campus Placement Drives &amp; Milestones</h3>
                  <span className="text-xs font-bold text-[#7B57FF]">3 Active Company Drives</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {placementDrives.map(drive => (
                    <div key={drive.id} className="card-quixel rounded-3xl p-6 border border-[#E8ECF2] bg-white space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#EDE8FD] text-[#7B57FF]">
                          {drive.tier}
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">{drive.ctc}</span>
                      </div>
                      <div>
                        <h4 className="font-black text-lg text-[#13141B]">{drive.company}</h4>
                        <p className="text-xs text-[#5E6573]">{drive.role}</p>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold text-[#5E6573]">
                          <span>Status: {drive.status}</span>
                          <span>Test: {drive.testDate}</span>
                        </div>
                        <div className="w-full h-2 bg-[#E8ECF2] rounded-full overflow-hidden">
                          <div className="h-full bg-[#D7FC51]" style={{ width: `${drive.progress}%` }} />
                        </div>
                      </div>
                      <div className="pt-2 flex gap-2">
                        <Link href="/resumes" className="flex-1 py-2 text-center rounded-xl bg-[#13141B] text-white text-xs font-bold">
                          Tailor Resume
                        </Link>
                        <Link href="/interviews" className="flex-1 py-2 text-center rounded-xl bg-[#F4F6FB] border border-[#E8ECF2] text-[#13141B] text-xs font-bold">
                          Practice Mock
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: INTERNSHIP JOB BOARD */}
            {collegeTab === "internships" && (
              <div className="card-quixel rounded-3xl p-6 sm:p-8 border border-[#E8ECF2] bg-white space-y-4">
                <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 inline-block">
                  Student-Friendly &bull; High Stipend &bull; Zero Spam
                </span>
                <h2 className="text-xl font-black font-display text-[#13141B]">Curated College Internship Board</h2>
                <p className="text-xs text-[#5E6573]">Filter by Summer/Winter batches, remote/on-site, and verified stipends with single-click applications.</p>
                <Link href="/jobs" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#13141B] text-white text-xs font-bold">
                  <Briefcase className="w-4 h-4 text-[#D7FC51]" />
                  <span>Explore 140+ Curated Internships</span>
                </Link>
              </div>
            )}

            {/* TAB 3: HACKATHONS */}
            {collegeTab === "hackathons" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-[#13141B]">Upcoming Hackathons &amp; Team Matching</h3>
                  <span className="text-xs text-[#8F9CAE]">National &amp; Global Competitions</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {hackathons.map(hk => (
                    <div key={hk.id} className="card-quixel rounded-3xl p-6 border border-[#E8ECF2] bg-white space-y-4 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full">Prize: {hk.prize}</span>
                          <span className="text-[10px] font-mono text-[#8F9CAE]">Ends: {hk.deadline}</span>
                        </div>
                        <h4 className="font-bold text-base text-[#13141B]">{hk.title}</h4>
                        <p className="text-xs text-[#7B57FF] font-semibold">{hk.host}</p>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {hk.tags.map((t, idx) => (
                            <span key={idx} className="text-[10px] bg-[#F4F6FB] border border-[#E8ECF2] px-2 py-0.5 rounded-full font-bold text-[#5E6573]">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="pt-2 border-t border-[#E8ECF2] flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-600">{hk.teamStatus}</span>
                        <Link href="/networking" className="text-xs font-bold text-[#13141B] hover:text-[#7B57FF]">
                          Find Teammates &rarr;
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: PEER RESUME REVIEW */}
            {collegeTab === "peer_review" && (
              <div className="card-quixel rounded-3xl p-6 sm:p-8 border border-[#E8ECF2] bg-white space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-[#7B57FF] bg-[#EDE8FD] px-2.5 py-1 rounded-full border border-[#DDD4FC] inline-block">
                      Verified Networking Circle
                    </span>
                    <h2 className="text-xl font-black font-display text-[#13141B]">Peer Resume Reviews</h2>
                  </div>
                  <Link href="/resumes" className="px-4 py-2 rounded-xl bg-[#13141B] text-white text-xs font-bold">
                    Submit New Resume for Review
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {peerReviews.map(pr => (
                    <div key={pr.id} className="p-5 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#13141B]">{pr.resumeName}</span>
                        <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-mono">{pr.score}</span>
                      </div>
                      <p className="text-xs text-[#5E6573] italic">"{pr.verdict}"</p>
                      <div className="text-[10px] text-[#8F9CAE] font-bold">Reviewed by {pr.reviewer}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: SKILL MICRO-CERTIFICATIONS */}
            {collegeTab === "micro_certs" && (
              <div className="space-y-4">
                <h3 className="text-lg font-black text-[#13141B]">Project Studio Verifiable Micro-Certificates</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {microCerts.map(cert => (
                    <div key={cert.id} className="card-quixel rounded-3xl p-6 border border-[#E8ECF2] bg-white space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">{cert.badge}</span>
                        <span className="text-xs font-mono text-[#8F9CAE]">{cert.verifyId}</span>
                      </div>
                      <h4 className="font-bold text-base text-[#13141B]">{cert.name}</h4>
                      <p className="text-xs text-[#5E6573]">Issued by {cert.authority} &bull; {cert.date}</p>
                      <div className="pt-2 flex items-center gap-2">
                        <button onClick={() => alert(`Certificate ${cert.verifyId} verified on Supabase cryptographic ledger.`)} className="px-4 py-2 rounded-xl bg-[#13141B] text-white text-xs font-bold">
                          Verify Credential
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 6: PROBLEM -> SOLUTION STUDIO */}
            {collegeTab === "problem_board" && (
              <div className="card-quixel rounded-3xl p-6 sm:p-8 border border-[#E8ECF2] bg-white space-y-4">
                <span className="text-[10px] font-black uppercase text-[#7B57FF] bg-[#EDE8FD] px-2.5 py-1 rounded-full border border-[#DDD4FC] inline-block">
                  Direct Integration into Project Studio
                </span>
                <h2 className="text-xl font-black font-display text-[#13141B]">Open Engineering Problem Board</h2>
                <p className="text-xs text-[#5E6573]">Select industry-standard open problem challenges and scaffold complete fullstack repositories with calibrated rubric scoring.</p>
                <Link href="/problems" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#13141B] text-white text-xs font-bold">
                  <Compass className="w-4 h-4 text-[#D7FC51]" />
                  <span>Launch Problem Studio</span>
                </Link>
              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. WORKING PROFESSIONAL SECTOR (22+) */}
        {/* ========================================================================= */}
        {selectedTrack === "professional" && (
          <div className="space-y-6">
            
            {/* Professional Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto touch-scroll-x pb-2 scrollbar-none">
              {[
                { id: "career_switch", label: "Career Switch & Skill Gap" },
                { id: "job_pipeline", label: "Job Search Kanban Tracker" },
                { id: "referrals", label: "Referral Request Generator" },
                { id: "salary_intel", label: "Salary & Compensation Intel" },
                { id: "self_appraisal", label: "Performance Appraisal Assistant" },
                { id: "cert_tracker", label: "Ongoing Certifications" },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setProTab(tab.id as any)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                    proTab === tab.id
                      ? "bg-[#13141B] text-white shadow-sm"
                      : "bg-white border border-[#E8ECF2] text-[#5E6573] hover:text-[#13141B] hover:bg-slate-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB 1: CAREER SWITCH & SKILL GAP */}
            {proTab === "career_switch" && (
              <div className="card-quixel rounded-3xl p-6 sm:p-8 border border-[#E8ECF2] bg-white space-y-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-[#7B57FF] bg-[#EDE8FD] px-2.5 py-1 rounded-full border border-[#DDD4FC] inline-block">
                    Target Role Gap Analysis
                  </span>
                  <h2 className="text-xl font-black font-display text-[#13141B]">Career Transition Matrix</h2>
                  <p className="text-xs text-[#5E6573]">Map your current experience against target seniority levels to identify highest-ROI bridge skills.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[#13141B]">Current Role</label>
                    <input
                      type="text"
                      value={currentRole}
                      onChange={e => setCurrentRole(e.target.value)}
                      className="w-full text-xs p-2.5 mt-1 rounded-xl border border-[#E8ECF2] bg-[#F4F6FB] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#13141B]">Target Switch Role</label>
                    <input
                      type="text"
                      value={targetRole}
                      onChange={e => setTargetRole(e.target.value)}
                      className="w-full text-xs p-2.5 mt-1 rounded-xl border border-[#E8ECF2] bg-[#F4F6FB] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-emerald-800 uppercase">Transferable Foundation</span>
                      <span className="text-xs font-mono font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-full">{gapAnalysis.matchScore}% Match</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-emerald-900 font-medium">
                      {gapAnalysis.transferableSkills.map((s: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
                    <span className="text-xs font-black text-amber-800 uppercase">Priority Skill Gaps</span>
                    <ul className="space-y-1.5 text-xs text-amber-900 font-medium">
                      {gapAnalysis.missingSkills.map((s: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-2">
                          <Target className="w-3.5 h-3.5 text-amber-600" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <Link href="/projects" className="px-5 py-2.5 rounded-xl bg-[#13141B] text-white text-xs font-bold">
                    Build Bridge Project in Studio &rarr;
                  </Link>
                  <Link href="/interviews" className="px-5 py-2.5 rounded-xl bg-[#F4F6FB] border border-[#E8ECF2] text-[#13141B] text-xs font-bold">
                    Practice Target Mock Interview
                  </Link>
                </div>
              </div>
            )}

            {/* TAB 2: JOB SEARCH PIPELINE KANBAN */}
            {proTab === "job_pipeline" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-[#13141B]">Interactive Application Kanban Tracker</h3>
                  <span className="text-xs font-bold text-[#7B57FF]">4 Active Opportunities</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {["Applied", "Tech Screen", "System Design", "Offer"].map(stage => {
                    const stageApps = kanbanApps.filter(a => a.stage === stage);
                    return (
                      <div key={stage} className="p-4 rounded-3xl bg-white border border-[#E8ECF2] space-y-3">
                        <div className="flex items-center justify-between border-b border-[#E8ECF2] pb-2">
                          <span className="text-xs font-black text-[#13141B]">{stage}</span>
                          <span className="text-xs font-mono font-bold bg-[#F4F6FB] px-2 py-0.5 rounded-full">{stageApps.length}</span>
                        </div>
                        <div className="space-y-3">
                          {stageApps.map(app => (
                            <div key={app.id} className="p-3 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] space-y-1">
                              <h5 className="font-bold text-xs text-[#13141B]">{app.company}</h5>
                              <p className="text-[11px] text-[#5E6573]">{app.role}</p>
                              <span className="text-[9px] font-mono text-[#8F9CAE]">Updated {app.date}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: REFERRAL REQUEST GENERATOR */}
            {proTab === "referrals" && (
              <div className="card-quixel rounded-3xl p-6 sm:p-8 border border-[#E8ECF2] bg-white space-y-4">
                <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200 inline-block">
                  High-Conversion Outreach
                </span>
                <h2 className="text-xl font-black font-display text-[#13141B]">Employee Referral Request Pitch Generator</h2>
                <p className="text-xs text-[#5E6573]">Generate concise, recruiter-endorsed outreach messages for mutual LinkedIn and Edworld connections.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[#13141B]">Target Company</label>
                    <input
                      type="text"
                      value={refCompany}
                      onChange={e => setRefCompany(e.target.value)}
                      className="w-full text-xs p-2.5 mt-1 rounded-xl border border-[#E8ECF2] bg-[#F4F6FB] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#13141B]">Target Role</label>
                    <input
                      type="text"
                      value={refRole}
                      onChange={e => setRefRole(e.target.value)}
                      className="w-full text-xs p-2.5 mt-1 rounded-xl border border-[#E8ECF2] bg-[#F4F6FB] focus:outline-none"
                    />
                  </div>
                </div>

                <button onClick={handleGenerateReferralNote} className="px-5 py-2.5 rounded-xl bg-[#13141B] text-white text-xs font-bold">
                  Generate Referral Pitch
                </button>

                {refNote && (
                  <div className="p-4 rounded-2xl bg-[#EDE8FD] border border-[#DDD4FC] space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between text-xs font-bold text-[#7B57FF]">
                      <span>Generated Outreach Note</span>
                      <button onClick={() => { navigator.clipboard.writeText(refNote); alert("Copied to clipboard!"); }} className="text-xs font-bold underline">
                        Copy to Clipboard
                      </button>
                    </div>
                    <pre className="text-xs font-mono text-[#13141B] whitespace-pre-wrap">{refNote}</pre>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: SALARY & COMPENSATION INTEL */}
            {proTab === "salary_intel" && (
              <div className="card-quixel rounded-3xl p-6 sm:p-8 border border-[#E8ECF2] bg-white space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 inline-block">
                      Aggregated Market Data &bull; Not Financial Advice
                    </span>
                    <h2 className="text-xl font-black font-display text-[#13141B]">Tech Compensation Benchmarks</h2>
                  </div>
                  <span className="text-xs text-[#8F9CAE]">Updated Q3 2026</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  {[
                    { role: "Senior Backend Engineer (4–7 YOE)", range: "₹28L – ₹42L Base", equity: "+ ₹10L–20L RSU/yr", city: "Bengaluru / Remote" },
                    { role: "Staff / Principal SDE (8+ YOE)", range: "₹55L – ₹85L Base", equity: "+ ₹30L–60L RSU/yr", city: "Hyderabad / Pune" },
                    { role: "Lead Product Manager (5–9 YOE)", range: "₹34L – ₹50L Base", equity: "+ ₹12L–25L RSU/yr", city: "Delhi NCR / Remote" }
                  ].map((s, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] space-y-2">
                      <h4 className="text-xs font-bold text-[#13141B]">{s.role}</h4>
                      <div className="text-base font-black text-emerald-700">{s.range}</div>
                      <div className="text-[11px] text-[#5E6573]">{s.equity}</div>
                      <div className="text-[10px] text-[#8F9CAE] font-bold">{s.city}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: PERFORMANCE APPRAISAL ASSISTANT */}
            {proTab === "self_appraisal" && (
              <div className="card-quixel rounded-3xl p-6 sm:p-8 border border-[#E8ECF2] bg-white space-y-4">
                <span className="text-[10px] font-black uppercase text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200 inline-block">
                  STAR Method &bull; Quantified Impact
                </span>
                <h2 className="text-xl font-black font-display text-[#13141B]">Annual Appraisal &amp; Review Assistant</h2>
                <p className="text-xs text-[#5E6573]">Paste raw accomplishments or Jira tickets from your cycle to generate executive-ready performance summary bullets.</p>

                <form onSubmit={handleGenerateAppraisalBullets} className="space-y-3">
                  <textarea
                    rows={4}
                    value={appraisalRaw}
                    onChange={e => setAppraisalRaw(e.target.value)}
                    placeholder="e.g. Worked on Redis caching for checkout API, migrated auth service to OAuth2, helped 4 juniors with reviews..."
                    className="w-full text-xs p-3 rounded-xl border border-[#E8ECF2] bg-[#F4F6FB] focus:outline-none"
                  />
                  <button type="submit" className="px-5 py-2.5 rounded-xl bg-[#13141B] text-white text-xs font-bold">
                    Synthesize Appraisal Bullets
                  </button>
                </form>

                {appraisalGenerated.length > 0 && (
                  <div className="p-5 rounded-2xl bg-[#EDE8FD] border border-[#DDD4FC] space-y-3 animate-in fade-in">
                    <span className="text-xs font-black text-[#7B57FF]">Executive Summary Bullets</span>
                    <ul className="space-y-2 text-xs text-[#13141B] font-medium list-disc pl-4">
                      {appraisalGenerated.map((b, idx) => <li key={idx}>{b}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* TAB 6: ONGOING CERTIFICATION TRACKER */}
            {proTab === "cert_tracker" && (
              <div className="space-y-4">
                <h3 className="text-lg font-black text-[#13141B]">Ongoing Professional Certifications &amp; Milestones</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {[
                    { name: "AWS Certified Solutions Architect — Professional", progress: 75, target: "Nov 2026", status: "Practice Exams In-Progress" },
                    { name: "Certified Kubernetes Administrator (CKA)", progress: 40, target: "Jan 2027", status: "Cluster Labs In-Progress" },
                    { name: "System Design & Distributed Patterns", progress: 100, target: "Completed", status: "Verified Credential Active" }
                  ].map((c, idx) => (
                    <div key={idx} className="card-quixel rounded-3xl p-6 border border-[#E8ECF2] bg-white space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#7B57FF]">{c.target}</span>
                        <span className="font-mono font-black text-emerald-700">{c.progress}%</span>
                      </div>
                      <h4 className="font-black text-sm text-[#13141B]">{c.name}</h4>
                      <div className="w-full h-2 bg-[#E8ECF2] rounded-full overflow-hidden">
                        <div className="h-full bg-[#D7FC51]" style={{ width: `${c.progress}%` }} />
                      </div>
                      <p className="text-[11px] text-[#5E6573]">{c.status}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>

      <ClaudeAnalysisModal
        isOpen={isClaudeModalOpen}
        onClose={() => setIsClaudeModalOpen(false)}
        defaultType={claudeAnalysisType}
        initialContent={claudeInitialContent}
      />
    </div>
  );
}
