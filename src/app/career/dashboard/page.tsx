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
  CheckCircle2, 
  Compass, 
  Target, 
  Check, 
  Bot 
} from "lucide-react";
import ClaudeAnalysisModal from "@/components/ai/ClaudeAnalysisModal";
import { ClaudeAnalysisType } from "@/app/api/claude/analyze/route";
import { supabase } from "@/lib/supabase";

export default function CareerDashboardPage() {
  const { user, profile } = useAuth();
  
  // Track Mode: Default based on user profile or toggle between College & Working Professional
  const [selectedTrack, setSelectedTrack] = useState<"college" | "professional">("professional");

  // College Tabs
  const [collegeTab, setCollegeTab] = useState<
    "placements" | "internships" | "hackathons" | "peer_review" | "micro_certs" | "problem_board"
  >("placements");

  // Professional Tabs
  const [proTab, setProTab] = useState<
    "career_switch" | "job_pipeline" | "referrals" | "salary_intel" | "self_appraisal" | "cert_tracker"
  >("career_switch");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlTrack = params.get("track");
      const urlTab = params.get("tab");

      if (urlTrack === "college" || urlTrack === "professional") {
        setSelectedTrack(urlTrack);
      } else if (profile?.careerStage === "college" || profile?.gradeLevel === "College") {
        setSelectedTrack("college");
      } else {
        setSelectedTrack("professional");
      }

      if (urlTab) {
        const validCollegeTabs = ["placements", "internships", "hackathons", "peer_review", "micro_certs", "problem_board"];
        const validProTabs = ["career_switch", "job_pipeline", "referrals", "salary_intel", "self_appraisal", "cert_tracker"];

        if (validCollegeTabs.includes(urlTab)) {
          setCollegeTab(urlTab as any);
          if (!urlTrack) setSelectedTrack("college");
        } else if (validProTabs.includes(urlTab)) {
          setProTab(urlTab as any);
          if (!urlTrack) setSelectedTrack("professional");
        }
      }
    }
  }, [profile, user]);

  // College interactive states
  const [placementDrives] = useState<any[]>([
    { id: "dr-1", company: "Atlassian", tier: "Super Dream", role: "Graduate Software Engineer", testDate: "Oct 14, 2026", ctc: "₹24–32 LPA", status: "OA Scheduled", progress: 50 },
    { id: "dr-2", company: "Razorpay", tier: "Dream", role: "Frontend Platform Engineer", testDate: "Oct 22, 2026", ctc: "₹18–22 LPA", status: "Shortlisted", progress: 25 },
    { id: "dr-3", company: "Flipkart", tier: "Super Dream", role: "SDE-1 (Backend Core)", testDate: "Nov 02, 2026", ctc: "₹22–28 LPA", status: "Applied", progress: 10 }
  ]);

  const [hackathons] = useState<{ id: string; title: string; host: string; prize: string; deadline: string; teamStatus: string; tags: string[] }[]>([
    { id: "hk-1", title: "Smart City AI & Urban Tech Hackathon", host: "GovTech India", prize: "₹5,00,000", deadline: "Oct 18, 2026", teamStatus: "2/4 Members Needed", tags: ["Python", "FastAPI", "IoT"] },
    { id: "hk-2", title: "Web3 & Zero-Knowledge Devcon Sprint", host: "Ethereum Global Track", prize: "$10,000 USD", deadline: "Nov 05, 2026", teamStatus: "1/3 Member Needed", tags: ["Solidity", "Rust", "Next.js"] },
    { id: "hk-3", title: "HealthTech Open Diagnostic Challenge", host: "BioInformatics Hub", prize: "₹3,50,000", deadline: "Oct 30, 2026", teamStatus: "Looking for UI Lead", tags: ["Computer Vision", "PyTorch"] }
  ]);

  const [peerReviews] = useState<any[]>([
    { id: "pr-1", reviewer: "Karan M. (Senior at IITD)", resumeName: "SDE_General_2026.pdf", score: "88/100", verdict: "Strong technical bullet metrics. Add quantifiable API latency reductions." },
    { id: "pr-2", reviewer: "Divya R. (Google SWE)", resumeName: "Fullstack_ATS_Resume.pdf", score: "94/100", verdict: "Excellent STAR format on Distributed Cache section." }
  ]);

  const [microCerts, setMicroCerts] = useState<any[]>([
    { id: "mc-1", name: "High-Throughput API Architecture", authority: "Edworld Project Studio", badge: "Level 2 Certified", date: "Aug 2026", verifyId: "ED-API-9942" },
    { id: "mc-2", name: "Fullstack React & Next.js Scalability", authority: "Edworld Project Studio", badge: "Level 2 Certified", date: "Sep 2026", verifyId: "ED-WEB-8114" }
  ]);

  // Working professional states
  const [currentRole, setCurrentRole] = useState((profile as any)?.title || "Full Stack Developer");
  const [targetRole, setTargetRole] = useState("Senior Backend Systems Architect");
  const [gapAnalysis] = useState<any>({
    matchScore: 80,
    transferableSkills: ["REST APIs", "TypeScript/Node.js", "Relational Database Design", "CI/CD Pipelines"],
    missingSkills: ["Distributed Event Streaming (Kafka)", "High-Throughput Caching (Redis)", "CAP Theorem & Partition Tolerance"],
    suggestedBridgeCourses: ["High-Scale Microservices Track", "System Design & Distributed State Drill"]
  });

  const [kanbanApps, setKanbanApps] = useState<any[]>([]);

  useEffect(() => {
    async function loadCareerData() {
      if (!user) return;
      try {
        const { data: appsData } = await supabase
          .from("job_applications")
          .select("*")
          .eq("user_id", user.uid);

        if (appsData && appsData.length > 0) {
          const list = appsData.map((a: any) => ({
            id: a.id,
            company: a.company || "Hiring Partner",
            role: a.role || a.job_title || "Software Engineer",
            stage: a.stage || (a.status === "interviewing" ? "Tech Screen" : a.status === "offer" ? "Offer" : "Applied"),
            date: new Date(a.applied_at || a.created_at || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric" })
          }));
          setKanbanApps(list);
        } else {
          setKanbanApps([]);
        }

        const { data: bData } = await supabase
          .from("user_badges")
          .select("badges(name, description, code), earned_at")
          .eq("user_id", user.uid);

        if (bData && bData.length > 0) {
          const list = bData.map((b: any, idx: number) => ({
            id: `mc-${idx}`,
            name: b.badges?.name || "Verified Skill Badge",
            authority: "Edworld Project Studio",
            badge: "Level 2 Certified",
            date: new Date(b.earned_at || Date.now()).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
            verifyId: `ED-VERIFY-${b.badges?.code || "CERT"}`
          }));
          setMicroCerts(list);
        }
      } catch (e) {
        console.warn("Career dashboard data load note:", e);
      }
    }
    loadCareerData();
  }, [user]);

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

  const [appraisalRaw, setAppraisalRaw] = useState("");
  const [appraisalGenerated, setAppraisalGenerated] = useState<string[]>([]);

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
    <div className="min-h-[calc(100vh-4rem)] bg-[#FAF8F5] py-8 px-4 sm:px-6 lg:px-8 xl:px-10 text-stone-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <div className="max-w-[1536px] mx-auto space-y-8 animate-in fade-in">
        
        {/* Hub Header & Sector Switcher */}
        <div className="rounded-2xl p-6 sm:p-8 border border-stone-200/80 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white shadow-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider bg-stone-100 text-stone-700">
                {selectedTrack === "college" ? "Higher Ed / College Track (18–22)" : "Working Professional Track (22+)"}
              </span>
              <span className="text-xs text-stone-400 font-mono">Career Acceleration Studio</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-medium text-stone-900 tracking-tight">
              {selectedTrack === "college" ? "Placements, Hackathons & Micro-Certs" : "Career Switches, Pipeline & Performance Appraisal"}
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 max-w-2xl leading-relaxed">
              Calibrated practice, JD-tailored resumes, live mock interviews, and verifiable milestone credentials.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-3 self-start md:self-auto">
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
              className="px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/60 text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer shadow-2xs"
            >
              <Bot className="w-4 h-4 text-amber-600" />
              <span>AI Career Audit</span>
            </button>

            {/* Sector Switcher Pill */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-stone-100 border border-stone-200/80">
              <button
                onClick={() => setSelectedTrack("college")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  selectedTrack === "college" ? "bg-stone-900 text-white shadow-2xs" : "text-stone-600 hover:text-stone-900"
                }`}
              >
                College (18–22)
              </button>
              <button
                onClick={() => setSelectedTrack("professional")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  selectedTrack === "professional" ? "bg-stone-900 text-white shadow-2xs" : "text-stone-600 hover:text-stone-900"
                }`}
              >
                Professional (22+)
              </button>
            </div>
          </div>
        </div>

        {/* Quick Launch Cards */}
        <div className="p-6 sm:p-7 rounded-2xl bg-white border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-800 flex items-center justify-center font-medium">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-serif font-medium text-stone-900">Career Acceleration Quick-Launch</h2>
                <p className="text-xs text-stone-500">Shortcuts to ATS optimization, AI mock screens, and verified jobs.</p>
              </div>
            </div>
            <span className="text-[10px] font-medium uppercase tracking-wider bg-stone-100 text-stone-600 px-2.5 py-1 rounded-md">
              1-Click Velocity
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-1">
            <Link
              href="/resumes"
              className="p-4 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200/60 transition-colors text-left group"
            >
              <FileText className="w-5 h-5 text-emerald-700 mb-2" />
              <div className="text-xs sm:text-sm font-medium text-stone-900">ATS Resume Maker</div>
              <div className="text-xs text-stone-500">Single-column ATS scorer</div>
            </Link>

            <Link
              href="/interviews"
              className="p-4 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200/60 transition-colors text-left group"
            >
              <Video className="w-5 h-5 text-indigo-700 mb-2" />
              <div className="text-xs sm:text-sm font-medium text-stone-900">AI STAR Simulator</div>
              <div className="text-xs text-stone-500">Audio/video mock feedback</div>
            </Link>

            <Link
              href="/jobs"
              className="p-4 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200/60 transition-colors text-left group"
            >
              <Briefcase className="w-5 h-5 text-amber-700 mb-2" />
              <div className="text-xs sm:text-sm font-medium text-stone-900">Tech Job Board</div>
              <div className="text-xs text-stone-500">Curated &amp; verified roles</div>
            </Link>

            <Link
              href="/networking"
              className="p-4 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200/60 transition-colors text-left group"
            >
              <Users className="w-5 h-5 text-stone-700 mb-2" />
              <div className="text-xs sm:text-sm font-medium text-stone-900">Mentorship Hub</div>
              <div className="text-xs text-stone-500">Verified peer referrals</div>
            </Link>
          </div>
        </div>

        {/* 1. COLLEGE SECTOR (18-22) */}
        {selectedTrack === "college" && (
          <div className="space-y-6">
            
            {/* College Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto touch-scroll-x pb-1">
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
                  className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    collegeTab === tab.id
                      ? "bg-stone-900 text-white shadow-2xs"
                      : "bg-white border border-stone-200/80 text-stone-600 hover:text-stone-900 hover:bg-stone-50"
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
                  <h3 className="text-lg font-serif font-medium text-stone-900">On-Campus Placement Drives &amp; Milestones</h3>
                  <span className="text-xs text-stone-500">3 Active Company Drives</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {placementDrives.map(drive => (
                    <div key={drive.id} className="rounded-2xl p-6 border border-stone-200/80 bg-white space-y-4 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-stone-100 text-stone-700 uppercase tracking-wider">
                          {drive.tier}
                        </span>
                        <span className="text-xs font-mono font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">{drive.ctc}</span>
                      </div>
                      <div>
                        <h4 className="font-serif font-medium text-base text-stone-900">{drive.company}</h4>
                        <p className="text-xs text-stone-500">{drive.role}</p>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-stone-500">
                          <span>Status: {drive.status}</span>
                          <span>Test: {drive.testDate}</span>
                        </div>
                        <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                          <div className="h-full bg-stone-900 rounded-full" style={{ width: `${drive.progress}%` }} />
                        </div>
                      </div>
                      <div className="pt-2 flex gap-2">
                        <Link href="/resumes" className="flex-1 py-2 text-center rounded-xl bg-stone-900 text-white text-xs font-medium hover:bg-stone-800 transition-colors">
                          Tailor Resume
                        </Link>
                        <Link href="/interviews" className="flex-1 py-2 text-center rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-xs font-medium hover:bg-stone-100 transition-colors">
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
              <div className="rounded-2xl p-6 sm:p-8 border border-stone-200/80 bg-white space-y-4 shadow-xs">
                <span className="text-[10px] font-medium uppercase text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/60 inline-block">
                  Student-Friendly &bull; High Stipend &bull; Verified
                </span>
                <h2 className="text-xl font-serif font-medium text-stone-900">Curated College Internship Board</h2>
                <p className="text-xs text-stone-500">Filter by Summer/Winter batches, remote/on-site, and verified stipends with single-click applications.</p>
                <Link href="/jobs" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium transition-colors">
                  <Briefcase className="w-4 h-4" />
                  <span>Explore 140+ Curated Internships</span>
                </Link>
              </div>
            )}

            {/* TAB 3: HACKATHONS */}
            {collegeTab === "hackathons" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-serif font-medium text-stone-900">Upcoming Hackathons &amp; Team Matching</h3>
                  <span className="text-xs text-stone-500">National &amp; Global Competitions</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {hackathons.map(hk => (
                    <div key={hk.id} className="rounded-2xl p-6 border border-stone-200/80 bg-white space-y-4 flex flex-col justify-between shadow-xs">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">Prize: {hk.prize}</span>
                          <span className="text-[10px] font-mono text-stone-400">Ends: {hk.deadline}</span>
                        </div>
                        <h4 className="font-serif font-medium text-base text-stone-900">{hk.title}</h4>
                        <p className="text-xs text-stone-600 font-medium">{hk.host}</p>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {hk.tags.map((t, idx) => (
                            <span key={idx} className="text-[10px] bg-stone-50 border border-stone-200/60 px-2 py-0.5 rounded-md text-stone-600">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                        <span className="text-xs font-medium text-emerald-700">{hk.teamStatus}</span>
                        <Link href="/networking" className="text-xs font-medium text-stone-900 hover:underline">
                          Find Teammates →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: PEER RESUME REVIEW */}
            {collegeTab === "peer_review" && (
              <div className="rounded-2xl p-6 sm:p-8 border border-stone-200/80 bg-white space-y-6 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold uppercase text-stone-600 bg-stone-100 px-2.5 py-1 rounded-md inline-block">
                      Verified Networking Circle
                    </span>
                    <h2 className="text-xl font-serif font-medium text-stone-900">Peer Resume Reviews</h2>
                  </div>
                  <Link href="/resumes" className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium transition-colors">
                    Submit Resume for Review
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {peerReviews.map(pr => (
                    <div key={pr.id} className="p-4 rounded-xl bg-stone-50 border border-stone-200/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-stone-900">{pr.resumeName}</span>
                        <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md font-mono">{pr.score}</span>
                      </div>
                      <p className="text-xs text-stone-600 italic">"{pr.verdict}"</p>
                      <div className="text-[10px] text-stone-400">Reviewed by {pr.reviewer}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: SKILL MICRO-CERTIFICATIONS */}
            {collegeTab === "micro_certs" && (
              <div className="space-y-4">
                <h3 className="text-lg font-serif font-medium text-stone-900">Project Studio Verifiable Micro-Certificates</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {microCerts.map(cert => (
                    <div key={cert.id} className="rounded-2xl p-6 border border-stone-200/80 bg-white space-y-3 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-medium uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">{cert.badge}</span>
                        <span className="text-xs font-mono text-stone-400">{cert.verifyId}</span>
                      </div>
                      <h4 className="font-serif font-medium text-base text-stone-900">{cert.name}</h4>
                      <p className="text-xs text-stone-500">Issued by {cert.authority} &bull; {cert.date}</p>
                      <div className="pt-2">
                        <Link href="/profile" className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium inline-block transition-colors">
                          View in Digital ID Card
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 6: PROBLEM -> SOLUTION STUDIO */}
            {collegeTab === "problem_board" && (
              <div className="rounded-2xl p-6 sm:p-8 border border-stone-200/80 bg-white space-y-4 shadow-xs">
                <span className="text-[10px] font-semibold uppercase text-stone-600 bg-stone-100 px-2.5 py-1 rounded-md inline-block">
                  Direct Integration into Project Studio
                </span>
                <h2 className="text-xl font-serif font-medium text-stone-900">Open Engineering Problem Board</h2>
                <p className="text-xs text-stone-500">Select industry-standard open problem challenges and scaffold complete repositories with calibrated rubric scoring.</p>
                <Link href="/problems" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium transition-colors">
                  <Compass className="w-4 h-4" />
                  <span>Launch Problem Studio</span>
                </Link>
              </div>
            )}

          </div>
        )}

        {/* 2. WORKING PROFESSIONAL SECTOR (22+) */}
        {selectedTrack === "professional" && (
          <div className="space-y-6">
            
            {/* Professional Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto touch-scroll-x pb-1">
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
                  className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    proTab === tab.id
                      ? "bg-stone-900 text-white shadow-2xs"
                      : "bg-white border border-stone-200/80 text-stone-600 hover:text-stone-900 hover:bg-stone-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB 1: CAREER SWITCH & SKILL GAP */}
            {proTab === "career_switch" && (
              <div className="rounded-2xl p-6 sm:p-8 border border-stone-200/80 bg-white space-y-6 shadow-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold uppercase text-stone-600 bg-stone-100 px-2.5 py-1 rounded-md inline-block">
                    Target Role Gap Analysis
                  </span>
                  <h2 className="text-xl font-serif font-medium text-stone-900">Career Transition Matrix</h2>
                  <p className="text-xs text-stone-500">Map your current experience against target seniority levels to identify highest-ROI bridge skills.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-stone-700">Current Role</label>
                    <input
                      type="text"
                      value={currentRole}
                      onChange={e => setCurrentRole(e.target.value)}
                      className="w-full text-xs p-2.5 mt-1 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:border-stone-900 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-stone-700">Target Switch Role</label>
                    <input
                      type="text"
                      value={targetRole}
                      onChange={e => setTargetRole(e.target.value)}
                      className="w-full text-xs p-2.5 mt-1 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:border-stone-900 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                  <div className="p-5 rounded-xl bg-emerald-50/80 border border-emerald-200/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-emerald-900 uppercase">Transferable Foundation</span>
                      <span className="text-xs font-mono font-medium text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-emerald-200/40">{gapAnalysis.matchScore}% Match</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-emerald-900">
                      {gapAnalysis.transferableSkills.map((s: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-700" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-5 rounded-xl bg-amber-50/80 border border-amber-200/60 space-y-3">
                    <span className="text-xs font-semibold text-amber-900 uppercase">Priority Skill Gaps</span>
                    <ul className="space-y-1.5 text-xs text-amber-900">
                      {gapAnalysis.missingSkills.map((s: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-2">
                          <Target className="w-3.5 h-3.5 text-amber-700" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap gap-3">
                  <Link href="/projects" className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium transition-colors">
                    Build Bridge Project in Studio →
                  </Link>
                  <Link href="/interviews" className="px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-xs font-medium hover:bg-stone-100 transition-colors">
                    Practice Target Mock Interview
                  </Link>
                </div>
              </div>
            )}

            {/* TAB 2: JOB SEARCH PIPELINE KANBAN */}
            {proTab === "job_pipeline" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-serif font-medium text-stone-900">Interactive Application Kanban Tracker</h3>
                  <span className="text-xs text-stone-500">{kanbanApps.length} Active Opportunities</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {["Applied", "Tech Screen", "System Design", "Offer"].map(stage => {
                    const stageApps = kanbanApps.filter(a => a.stage === stage);
                    return (
                      <div key={stage} className="p-4 rounded-2xl bg-white border border-stone-200/80 space-y-3 shadow-xs">
                        <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                          <span className="text-xs font-medium text-stone-900">{stage}</span>
                          <span className="text-xs font-mono text-stone-500 bg-stone-100 px-2 py-0.5 rounded">{stageApps.length}</span>
                        </div>
                        <div className="space-y-2.5">
                          {stageApps.length > 0 ? (
                            stageApps.map(app => (
                              <div key={app.id} className="p-3 rounded-xl bg-stone-50 border border-stone-200/60 space-y-1">
                                <h5 className="font-medium text-xs text-stone-900">{app.company}</h5>
                                <p className="text-[11px] text-stone-500">{app.role}</p>
                                <span className="text-[9px] font-mono text-stone-400">Updated {app.date}</span>
                              </div>
                            ))
                          ) : (
                            <div className="text-[11px] text-stone-400 italic p-2 bg-stone-50 rounded-lg border border-dashed border-stone-200 text-center">
                              No applications in {stage}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: REFERRAL REQUEST GENERATOR */}
            {proTab === "referrals" && (
              <div className="rounded-2xl p-6 sm:p-8 border border-stone-200/80 bg-white space-y-4 shadow-xs">
                <span className="text-[10px] font-semibold uppercase text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200/60 inline-block">
                  High-Conversion Outreach
                </span>
                <h2 className="text-xl font-serif font-medium text-stone-900">Employee Referral Request Pitch Generator</h2>
                <p className="text-xs text-stone-500">Generate concise, recruiter-endorsed outreach messages for LinkedIn and industry connections.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-stone-700">Target Company</label>
                    <input
                      type="text"
                      value={refCompany}
                      onChange={e => setRefCompany(e.target.value)}
                      className="w-full text-xs p-2.5 mt-1 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:border-stone-900 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-stone-700">Target Role</label>
                    <input
                      type="text"
                      value={refRole}
                      onChange={e => setRefRole(e.target.value)}
                      className="w-full text-xs p-2.5 mt-1 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:border-stone-900 transition-colors"
                    />
                  </div>
                </div>

                <button onClick={handleGenerateReferralNote} className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium transition-colors">
                  Generate Referral Pitch
                </button>

                {refNote && (
                  <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between text-xs font-medium text-stone-900">
                      <span>Generated Outreach Note</span>
                      <button onClick={() => { navigator.clipboard.writeText(refNote); alert("Copied to clipboard!"); }} className="text-xs font-medium text-indigo-700 hover:underline">
                        Copy to Clipboard
                      </button>
                    </div>
                    <pre className="text-xs font-mono text-stone-800 whitespace-pre-wrap">{refNote}</pre>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: SALARY & COMPENSATION INTEL */}
            {proTab === "salary_intel" && (
              <div className="rounded-2xl p-6 sm:p-8 border border-stone-200/80 bg-white space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold uppercase text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/60 inline-block">
                      Aggregated Market Benchmarks
                    </span>
                    <h2 className="text-xl font-serif font-medium text-stone-900">Tech Compensation Benchmarks</h2>
                  </div>
                  <span className="text-xs text-stone-400">Updated Q3 2026</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  {[
                    { role: "Senior Backend Engineer (4–7 YOE)", range: "₹28L – ₹42L Base", equity: "+ ₹10L–20L RSU/yr", city: "Bengaluru / Remote" },
                    { role: "Staff / Principal SDE (8+ YOE)", range: "₹55L – ₹85L Base", equity: "+ ₹30L–60L RSU/yr", city: "Hyderabad / Pune" },
                    { role: "Lead Product Manager (5–9 YOE)", range: "₹34L – ₹50L Base", equity: "+ ₹12L–25L RSU/yr", city: "Delhi NCR / Remote" }
                  ].map((s, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-stone-50 border border-stone-200/60 space-y-1.5">
                      <h4 className="text-xs font-medium text-stone-900">{s.role}</h4>
                      <div className="text-base font-serif font-medium text-emerald-800">{s.range}</div>
                      <div className="text-[11px] text-stone-500">{s.equity}</div>
                      <div className="text-[10px] text-stone-400">{s.city}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: PERFORMANCE APPRAISAL ASSISTANT */}
            {proTab === "self_appraisal" && (
              <div className="rounded-2xl p-6 sm:p-8 border border-stone-200/80 bg-white space-y-4 shadow-xs">
                <span className="text-[10px] font-semibold uppercase text-stone-600 bg-stone-100 px-2.5 py-1 rounded-md inline-block">
                  STAR Method &bull; Quantified Impact
                </span>
                <h2 className="text-xl font-serif font-medium text-stone-900">Annual Appraisal &amp; Review Assistant</h2>
                <p className="text-xs text-stone-500">Paste raw accomplishments or work notes from your cycle to generate executive-ready performance summary bullets.</p>

                <form onSubmit={handleGenerateAppraisalBullets} className="space-y-3">
                  <textarea
                    rows={4}
                    value={appraisalRaw}
                    onChange={e => setAppraisalRaw(e.target.value)}
                    placeholder="e.g. Worked on Redis caching for checkout API, migrated auth service to OAuth2, helped 4 juniors with reviews..."
                    className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:border-stone-900 transition-colors"
                  />
                  <button type="submit" className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium transition-colors">
                    Synthesize Appraisal Bullets
                  </button>
                </form>

                {appraisalGenerated.length > 0 && (
                  <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2.5 animate-in fade-in">
                    <span className="text-xs font-medium text-stone-900">Executive Summary Bullets</span>
                    <ul className="space-y-1.5 text-xs text-stone-700 list-disc pl-4">
                      {appraisalGenerated.map((b, idx) => <li key={idx}>{b}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* TAB 6: ONGOING CERTIFICATION TRACKER */}
            {proTab === "cert_tracker" && (
              <div className="space-y-4">
                <h3 className="text-lg font-serif font-medium text-stone-900">Ongoing Professional Certifications &amp; Milestones</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {[
                    { name: "AWS Certified Solutions Architect — Professional", progress: 75, target: "Nov 2026", status: "Practice Exams In-Progress" },
                    { name: "Certified Kubernetes Administrator (CKA)", progress: 40, target: "Jan 2027", status: "Cluster Labs In-Progress" },
                    { name: "System Design & Distributed Patterns", progress: 100, target: "Completed", status: "Verified Credential Active" }
                  ].map((c, idx) => (
                    <div key={idx} className="rounded-2xl p-6 border border-stone-200/80 bg-white space-y-3 shadow-xs">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-stone-600">{c.target}</span>
                        <span className="font-mono text-emerald-800 font-medium">{c.progress}%</span>
                      </div>
                      <h4 className="font-serif font-medium text-sm text-stone-900">{c.name}</h4>
                      <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                        <div className="h-full bg-stone-900 rounded-full" style={{ width: `${c.progress}%` }} />
                      </div>
                      <p className="text-[11px] text-stone-500">{c.status}</p>
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
