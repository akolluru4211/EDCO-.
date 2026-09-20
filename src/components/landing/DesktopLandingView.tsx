import React from "react";
import Link from "next/link";
import { 
  GraduationCap, 
  Briefcase, 
  Compass, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Award,
  Sparkles
} from "lucide-react";
import EdworldLogo from "@/components/ui/EdworldLogo";
import Interactive3DCard from "@/components/ui/Interactive3DCard";
import SpotlightCard from "@/components/ui/SpotlightCard";
import BorderBeam from "@/components/ui/BorderBeam";
import ShimmerBadge from "@/components/ui/ShimmerBadge";
import AmbientMeshBackground from "@/components/ui/AmbientMeshBackground";

type StageKey = "student" | "pro";

interface DesktopStageInfo {
  key: StageKey;
  badge: string;
  badgeColor: string;
  accentColor: string;
  title: string;
  subtitle: string;
  description: string;
  humanQuote: string;
  humanAuthor: string;
  stats: { label: string; value: string }[];
  features: string[];
  ctaUrl: string;
  loginUrl: string;
  icon: React.ComponentType<{ className?: string }>;
}

const DESKTOP_STAGES: Record<StageKey, DesktopStageInfo> = {
  student: {
    key: "student",
    badge: "AGES 16–18 • COLLEGE & CAMPUS",
    badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
    accentColor: "#00D2B4",
    title: "Student & Campus Enterprise",
    subtitle: "Projects, Coding Portfolios & Campus Placements",
    description: "Connect coursework to tangible career readiness. Benchmark problem solving in our live simulator, assemble verified GitHub projects, and step confidently into placements.",
    humanQuote: "“Benchmark problem solving with real compilers, assemble verified GitHub projects, and step confidently into placements.”",
    humanAuthor: "Student & College Pathway",
    stats: [
      { label: "Skill Tracks", value: "Role-Aligned" },
      { label: "Coding Drills", value: "Live IDE" },
      { label: "Skill Benchmark", value: "Level 0–3" },
    ],
    features: [
      "Guided micro-project studio with verified GitHub sync",
      "Adaptive technical coding interview simulator with feedback",
      "Single-column ATS resume creator calibrated for freshers",
      "Verified public project showcase profile",
    ],
    ctaUrl: "/auth/signup?track=student&stage=student",
    loginUrl: "/auth/login?track=student",
    icon: GraduationCap,
  },
  pro: {
    key: "pro",
    badge: "AGES 18+ • CAREER ACCELERATION",
    badgeColor: "bg-amber-50 text-amber-900 border-amber-200",
    accentColor: "#D7FC51",
    title: "Working Professional Acceleration",
    subtitle: "ATS Optimization, STAR Drills & Salary Growth",
    description: "Designed for engineers and high-growth professionals. Pass strict corporate screening filters with keyword-calibrated resumes, master live AI mock interviews, and command top compensation.",
    humanQuote: "“Pass strict corporate screening filters with keyword-calibrated single-column resumes and realistic STAR drills.”",
    humanAuthor: "Working Professional Pathway",
    stats: [
      { label: "ATS Architecture", value: "Single-Column" },
      { label: "STAR Evaluation", value: "Audio + Code" },
      { label: "Peer Network", value: "1:1 Verified" },
    ],
    features: [
      "Single-column ATS resume builder with real-time scoring",
      "Multimodal STAR mock interview studio with audio/video feedback",
      "Verified public portfolio at edworld.co/u/yourname",
      "Curated high-growth tech jobs and salary benchmarks",
    ],
    ctaUrl: "/auth/signup?track=pro&stage=professional",
    loginUrl: "/auth/login?track=pro",
    icon: Briefcase,
  },
};

export default function DesktopLandingView() {
  return (
    <div className="hidden lg:block w-full bg-[#FAFAF8] text-[#13141B] min-h-screen selection:bg-[#D7FC51] selection:text-[#13141B]">
      
      {/* 1. Top Enterprise Desktop Navigation */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3 group">
              <EdworldLogo size="md" showText={false} />
              <div>
                <span className="font-black text-xl tracking-tight text-slate-900 flex items-center gap-1.5">
                  Edworld <span className="text-[#00D2B4]">Co.</span>
                </span>
                <span className="block text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400 group-hover:text-slate-600 transition-colors">
                  SKILLS &amp; CAREER OS
                </span>
              </div>
            </Link>

            <nav className="hidden xl:flex items-center gap-2 pl-6 border-l border-slate-200">
              <a
                href="#student-campus"
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
              >
                Student &amp; College
              </a>
              <a
                href="#pro-acceleration"
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
              >
                Working Professional
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/pricing"
              className="text-xs font-bold text-slate-600 hover:text-slate-950 transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/colleges"
              className="text-xs font-bold text-slate-600 hover:text-slate-950 transition-colors"
            >
              For Colleges & Placements
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            <Link
              href="/auth/login"
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-100 border border-slate-200 transition-all hover:scale-105 active:scale-95"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="btn-shine px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-slate-950 hover:bg-black text-[#D7FC51] shadow-md transition-all hover:scale-105 active:scale-95"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Full-Screen Cinematic Hero Section with Animated Mesh & Micro-Interactions */}
      <section className="relative overflow-hidden pt-20 pb-28 border-b border-slate-200/80">
        
        {/* Dynamic GPU-accelerated Ambient Mesh Orbs */}
        <AmbientMeshBackground intensity="subtle" />

        <div className="max-w-6xl mx-auto px-8 text-center space-y-8 relative z-10">
          
          {/* Top Pill with Shimmer Sweep */}
          <div className="inline-flex">
            <ShimmerBadge variant="slate" icon={<Sparkles className="w-3.5 h-3.5 text-emerald-600" />}>
              HUMAN-FIRST SKILLS &amp; CAREER OPERATING SYSTEM
            </ShimmerBadge>
          </div>

          {/* Screen-Filling Giant Heading */}
          <h1 className="text-6xl sm:text-7xl lg:text-8xl xl:text-[92px] font-black font-display text-slate-950 tracking-[-0.035em] leading-[0.98] mx-auto animate-fade-in-up">
            Real adaptability <br />
            <span className="text-slate-900 bg-gradient-to-r from-slate-950 via-slate-800 to-slate-700 bg-clip-text">
              for every career stage.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg lg:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium">
            Edworld Co. meets you exactly where you are today. Whether stepping from campus into engineering placements or accelerating as an experienced professional, practice with calibrated interview simulators, ATS-matched resumes, and verified project proofs.
          </p>

          {/* Primary Action Row */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <Link
              href="/auth/signup"
              className="btn-shine px-8 py-4 rounded-2xl bg-slate-950 hover:bg-black text-[#D7FC51] text-sm font-black uppercase tracking-wider flex items-center gap-3 shadow-xl hover:shadow-2xl transition-all hover:scale-105 active:scale-95"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/auth/login"
              className="px-8 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 text-sm font-bold border border-slate-200/90 shadow-xs transition-all hover:border-slate-300 hover:scale-105 active:scale-95"
            >
              Sign In to Workspace
            </Link>
          </div>

          {/* Trust & Compliance Bar */}
          <div className="flex items-center justify-center gap-8 text-xs font-mono text-slate-500 pt-6">
            <div className="flex items-center gap-2 transition-transform duration-200 hover:scale-105">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>DPDP Act Minor Protection</span>
            </div>
            <div className="flex items-center gap-2 transition-transform duration-200 hover:scale-105">
              <CheckCircle2 className="w-4 h-4 text-[#00D2B4]" />
              <span>Real ATS Calibration</span>
            </div>
            <div className="flex items-center gap-2 transition-transform duration-200 hover:scale-105">
              <Award className="w-4 h-4 text-amber-500" />
              <span>STAR Interview Metrics</span>
            </div>
          </div>

        </div>
      </section>

      {/* 3. Two-Pillar Architecture Section with Interactive Spotlight 3D Depth Cards */}
      <section className="py-24 max-w-7xl mx-auto px-8 space-y-16">
        
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <ShimmerBadge variant="emerald">
            PURPOSE-BUILT FOR STUDENTS &amp; PROFESSIONALS
          </ShimmerBadge>
          <h2 className="text-4xl lg:text-5xl font-black font-display text-slate-950 tracking-tight">
            One platform. Two unified career operating systems.
          </h2>
          <p className="text-base text-slate-600 leading-relaxed font-medium">
            Edworld strictly segments user experiences to ensure calibrated rigor, real portfolio evidence, and lifelong career progression.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Pillar 1: Student */}
          <div id="student-campus" className="scroll-mt-24">
            <Interactive3DCard maxTilt={6} depth={14} className="h-full">
              <SpotlightCard
                spotlightColor="rgba(0, 210, 180, 0.16)"
                spotlightSize={340}
                className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm hover:shadow-xl flex flex-col justify-between h-full space-y-6 card-lift-glow"
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-xs">
                      <GraduationCap className="w-6 h-6 animate-float-gentle" />
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Ages 16–18 • College &amp; Campus
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-900">Student &amp; Campus Enterprise</h3>
                    <p className="text-xs text-slate-500 font-semibold">{DESKTOP_STAGES.student.subtitle}</p>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium pt-1">
                      {DESKTOP_STAGES.student.description}
                    </p>
                  </div>

                  {/* Learner Quote */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                    <p className="text-xs text-slate-700 italic leading-relaxed">
                      {DESKTOP_STAGES.student.humanQuote}
                    </p>
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
                      — {DESKTOP_STAGES.student.humanAuthor}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {DESKTOP_STAGES.student.stats.map((s, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-center transition-transform duration-200 hover:scale-105">
                        <span className="block text-[9px] font-mono font-bold uppercase text-slate-400">
                          {s.label}
                        </span>
                        <strong className="text-xs font-black text-slate-900">
                          {s.value}
                        </strong>
                      </div>
                    ))}
                  </div>

                  {/* Feature Checklist */}
                  <ul className="space-y-2 text-xs text-slate-800 font-medium pt-2 border-t border-slate-100">
                    {DESKTOP_STAGES.student.features.map((f, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="leading-tight">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <Link
                    href={DESKTOP_STAGES.student.ctaUrl}
                    className="btn-shine w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider text-center transition-all shadow-md flex items-center justify-center gap-2 hover:scale-102 active:scale-98"
                  >
                    <span>Launch Student Track</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href={DESKTOP_STAGES.student.loginUrl}
                    className="w-full py-2.5 rounded-xl text-center text-xs font-bold text-slate-600 hover:text-slate-900 block transition-colors"
                  >
                    Sign In to Student Track
                  </Link>
                </div>
              </SpotlightCard>
            </Interactive3DCard>
          </div>

          {/* Pillar 3: Professional */}
          <div id="pro-acceleration" className="scroll-mt-24">
            <Interactive3DCard maxTilt={6} depth={14} className="h-full">
              <SpotlightCard
                spotlightColor="rgba(215, 252, 81, 0.22)"
                spotlightSize={360}
                className="relative bg-slate-950 text-white rounded-3xl p-8 border border-slate-800 shadow-xl hover:shadow-2xl flex flex-col justify-between h-full space-y-6 card-lift-glow overflow-hidden"
              >
                {/* Border Beam Animation around featured Pro Card */}
                <BorderBeam size={220} duration={10} colorFrom="#D7FC51" colorTo="#00D2B4" />

                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 text-[#D7FC51] flex items-center justify-center shadow-xs">
                      <Briefcase className="w-6 h-6 animate-float-gentle" />
                    </div>
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-400/20 text-[#D7FC51] border border-amber-400/30">
                      Ages 18+ • Career OS
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-white">Working Professional Acceleration</h3>
                    <p className="text-xs text-[#D7FC51] font-semibold">{DESKTOP_STAGES.pro.subtitle}</p>
                    <p className="text-xs text-slate-300 leading-relaxed font-medium pt-1">
                      {DESKTOP_STAGES.pro.description}
                    </p>
                  </div>

                  {/* Learner Quote */}
                  <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                    <p className="text-xs text-slate-300 italic leading-relaxed">
                      {DESKTOP_STAGES.pro.humanQuote}
                    </p>
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
                      — {DESKTOP_STAGES.pro.humanAuthor}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {DESKTOP_STAGES.pro.stats.map((s, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center transition-transform duration-200 hover:scale-105">
                        <span className="block text-[9px] font-mono font-bold uppercase text-slate-400">
                          {s.label}
                        </span>
                        <strong className="text-xs font-black text-[#D7FC51]">
                          {s.value}
                        </strong>
                      </div>
                    ))}
                  </div>

                  {/* Feature Checklist */}
                  <ul className="space-y-2 text-xs text-slate-200 font-medium pt-2 border-t border-white/10">
                    {DESKTOP_STAGES.pro.features.map((f, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#00D2B4] shrink-0" />
                        <span className="leading-tight">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-slate-800 space-y-2">
                  <Link
                    href={DESKTOP_STAGES.pro.ctaUrl}
                    className="btn-shine w-full py-3.5 rounded-2xl bg-[#D7FC51] hover:bg-[#E9FFA4] text-slate-950 text-xs font-black uppercase tracking-wider text-center transition-all shadow-md flex items-center justify-center gap-2 hover:scale-102 active:scale-98"
                  >
                    <span>Start Professional OS</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href={DESKTOP_STAGES.pro.loginUrl}
                    className="w-full py-2.5 rounded-xl text-center text-xs font-bold text-slate-400 hover:text-white block transition-colors"
                  >
                    Sign In to Pro Track
                  </Link>
                </div>
              </SpotlightCard>
            </Interactive3DCard>
          </div>

        </div>
      </section>

      {/* 4. Desktop Enterprise Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-12 text-slate-500">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs">
          <div className="flex items-center gap-3">
            <EdworldLogo size="sm" showText={false} />
            <span className="font-bold text-slate-900">Edworld Co.</span>
            <span>&bull;</span>
            <span>&copy; {new Date().getFullYear()} Edworld Co. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6 font-medium">
            <Link href="/pricing" className="hover:text-slate-950 transition-colors">Pricing</Link>
            <Link href="/colleges" className="hover:text-slate-950 transition-colors">For Colleges & Placements</Link>
            <Link href="/privacy" className="hover:text-slate-950 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-950 transition-colors">Terms of Service</Link>
            <Link href="/contact" className="hover:text-slate-950 transition-colors">Contact Support</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
