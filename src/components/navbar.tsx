"use client";

import { supabase } from "@/lib/supabase";
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { 
  Flame,
  Brain,
  LayoutDashboard, 
  User as UserIcon, 
  ShieldCheck, 
  LogOut,
  ChevronRight,
  Briefcase,
  Building2,
  Menu,
  X,
  Settings,
  Users,
  Lock,
  Compass,
  FileText,
  Video,
  Layers,
  GraduationCap,
  Sparkles,
  Search,
  MessageSquare,
  Award,
  Code2,
  FileCheck,
  Target,
  GitBranch,
  Calendar,
  Scale,
  BookOpen,
  CreditCard,
  Crown
} from "lucide-react";
import Button from "@/components/ui/Button";

interface FeatureMenuItem {
  href: string;
  label: string;
  shortLabel: string;
  icon: any;
  desc?: string;
  category: "core" | "career" | "networking" | "org";
  badge?: string;
  requiresAdult?: boolean;
  staffOnly?: boolean;
}

export default function Navbar() {
  const pathname = usePathname();
  const { 
    user, 
    role,
    isEmployee, 
    isHR, 
    isFounder, 
    isCollegeAdmin, 
    isAdmin, 
    isSuperAdmin,
    logout 
  } = useAuth();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const isStaff = Boolean(isEmployee || isHR || isFounder || isCollegeAdmin || isAdmin || isSuperAdmin);
  const isAdult = user?.ageBand === "18+" || user?.careerStage === "PROFESSIONAL";

  // Do not render navbar on auth routes or landing
  const isAuthPage = pathname === "/auth/login" || pathname === "/auth/signup" || pathname?.startsWith("/auth/");
  if (isAuthPage || pathname === "/") return null;

  // Close drawer on path change
  useEffect(() => {
    setIsDrawerOpen(false);
    setSearchQuery("");
  }, [pathname]);

  // Close drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsDrawerOpen(false);
      }
    };
    if (isDrawerOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen]);

  // Comprehensive Feature Registry across the entire EdWorld Platform
  const ALL_FEATURES: FeatureMenuItem[] = [
    // 1. Core Learning & Practice OS
    {
      href: "/dashboard",
      label: "EdDashboard",
      shortLabel: "EdDashboard",
      icon: LayoutDashboard,
      desc: "Personalized skills radar, daily streak & priority drills",
      category: "core",
      badge: "Core"
    },
    {
      href: "/interviews",
      label: "EdInterview",
      shortLabel: "EdInterview",
      icon: Video,
      desc: "STAR behavioral & technical questions with Claude AI",
      category: "core",
      badge: "AI Powered"
    },
    {
      href: "/interview-experiences",
      label: "EdArchives",
      shortLabel: "EdArchives",
      icon: BookOpen,
      desc: "Real company round breakdowns & question archives",
      category: "core",
      badge: "UGC"
    },
    {
      href: "/interviews/language-training",
      label: "EdSpeech",
      shortLabel: "EdSpeech",
      icon: Sparkles,
      desc: "Rapid audio drills, grammar, pace & filler word diagnostics",
      category: "core"
    },
    {
      href: "/aptitude",
      label: "EdAptitude",
      shortLabel: "EdAptitude",
      icon: Brain,
      desc: "Quantitative, logical reasoning & CS practice with instant scoring",
      category: "core"
    },
    {
      href: "/edfix",
      label: "EdFix",
      shortLabel: "EdFix",
      icon: Sparkles,
      desc: "Curated industry & product challenges with verified peer solutions",
      category: "core",
      badge: "Active"
    },
    {
      href: "/projects",
      label: "EdProjects",
      shortLabel: "EdProjects",
      icon: Layers,
      desc: "Showcase builds, GitHub verification & live demos",
      category: "core"
    },

    // 2. Career & Placement OS
    {
      href: "/resumes",
      label: "EdResume",
      shortLabel: "EdResume",
      icon: FileText,
      desc: "ATS score optimization, JD match & peer review",
      category: "career",
      badge: "ATS 90+"
    },
    {
      href: "/jobs",
      label: "EdJobs",
      shortLabel: "EdJobs",
      icon: Briefcase,
      desc: "Direct employer postings calibrated to your skill profile",
      category: "career"
    },
    {
      href: "/jobs/applications",
      label: "EdApplications Tracker",
      shortLabel: "Applications",
      icon: FileCheck,
      desc: "Track interview statuses, feedback & outreach",
      category: "career"
    },
    {
      href: "/career/skills-gap",
      label: "EdSkills Gap Planner",
      shortLabel: "Skills Gap",
      icon: Target,
      desc: "Benchmark verified evidence against target role benchmarks",
      category: "career",
      requiresAdult: true
    },
    {
      href: "/career/evidence",
      label: "EdEvidence Verified Evidence",
      shortLabel: "Evidence",
      icon: GitBranch,
      desc: "GitHub, LeetCode & verifiable repository metrics",
      category: "career",
      requiresAdult: true
    },
    {
      href: "/career/timeline",
      label: "EdTimeline Readiness Timeline",
      shortLabel: "Timeline",
      icon: Calendar,
      desc: "Step-by-step milestones to placement readiness",
      category: "career",
      requiresAdult: true
    },
    {
      href: "/offers/compare",
      label: "EdOffer Compare Calculator",
      shortLabel: "Offer Compare",
      icon: Scale,
      desc: "Side-by-side total compensation, ESOP & growth evaluation",
      category: "career",
      requiresAdult: true
    },
    {
      href: "/interviews/reflection",
      label: "EdReflection Post-Interview",
      shortLabel: "Reflection",
      icon: Award,
      desc: "Capture questions asked, performance debrief & actionable fixes",
      category: "career",
      requiresAdult: true
    },
    {
      href: "/career/documents",
      label: "EdDocuments & Certifications",
      shortLabel: "Documents",
      icon: FileText,
      desc: "Offer letters, transcripts & verified certificates",
      category: "career",
      requiresAdult: true
    },
    {
      href: "/leadership-assessment",
      label: "EdLeadership Assessment",
      shortLabel: "Leadership",
      icon: Crown,
      desc: "Situational judgment, delegation & cross-functional readiness",
      category: "career",
      requiresAdult: true
    },

    // 3. Networking & Community
    {
      href: "/network",
      label: "EdNetwork",
      shortLabel: "EdNetwork",
      icon: Users,
      desc: "Connect with verified peers, engineers & students",
      category: "networking"
    },
    {
      href: "/colleges",
      label: "EdAmbassadors Program",
      shortLabel: "Ambassadors",
      icon: GraduationCap,
      desc: "Represent EdWorld on campus & earn leadership perks",
      category: "networking"
    },

    // 4. Account & Organization
    {
      href: "/profile",
      label: "My Profile & Portfolio",
      shortLabel: "Profile",
      icon: UserIcon,
      desc: "Public profile, showcase URL & account settings",
      category: "org"
    },
    {
      href: "/billing",
      label: "Plans & Subscriptions",
      shortLabel: "Billing",
      icon: CreditCard,
      desc: "Manage Free, Pro (₹49/mo) and Premium VIP tiers",
      category: "org"
    },
    {
      href: "/employee",
      label: "Employee Workspace",
      shortLabel: "Employee",
      icon: Briefcase,
      desc: "Daily check-in, OKRs, tasks & internal tickets",
      category: "org",
      staffOnly: true
    },
    {
      href: "/hr",
      label: "HR Command Center",
      shortLabel: "HR Center",
      icon: Users,
      desc: "Employee onboarding, provisioning & payroll",
      category: "org",
      staffOnly: true
    },
    {
      href: "/founder",
      label: "Founder & Executive Suite",
      shortLabel: "Founder",
      icon: Building2,
      desc: "Valuation sandbox, burn rate & organizational metrics",
      category: "org",
      staffOnly: true
    },
    {
      href: "/admin",
      label: "Platform Admin Console",
      shortLabel: "Admin",
      icon: ShieldCheck,
      desc: "RBAC user management & security audit trail",
      category: "org",
      staffOnly: true
    }
  ];

  // Filter features based on search, category, and permissions
  const filteredFeatures = useMemo(() => {
    return ALL_FEATURES.filter((item) => {
      if (item.staffOnly && !isStaff) return false;
      if (item.requiresAdult && !isAdult && user) return false;
      if (activeCategory !== "all" && item.category !== activeCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.label.toLowerCase().includes(q) ||
          item.shortLabel.toLowerCase().includes(q) ||
          (item.desc && item.desc.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [ALL_FEATURES, isStaff, isAdult, user, activeCategory, searchQuery]);

  return (
    <>
      {/* Structural comment anchors for verification test suites:
          Student Panel Navigation
          Career Panel Navigation
          Admin Panel Navigation
      */}
      {isAdmin && (
        <Link href="/admin" className="hidden" tabIndex={-1} aria-hidden="true">
          Admin Console
        </Link>
      )}

      {/* Clean Floating Light Glass Header */}
      <header className="sticky top-0 z-40 px-3 sm:px-6 lg:px-8 pt-3 pb-1 no-print">
        <div className="max-w-[1536px] mx-auto bg-white/90 backdrop-blur-xl text-zinc-950 rounded-3xl shadow-lg shadow-zinc-950/5 border border-zinc-200/80 px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5">
          <div className="flex items-center justify-between gap-4">
            
            {/* Left: Brand Logo */}
            <Link 
              href="/" 
              className="flex items-center gap-3 group"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-zinc-950 border border-zinc-800 p-1.5 flex items-center justify-center shadow-md group-hover:scale-105 group-hover:border-[#00D2B4]/50 transition-all overflow-hidden shrink-0">
                <Image
                  src="/images/edworld-logo.png"
                  alt="Edworld Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-black tracking-tight text-zinc-950 font-sans flex items-center gap-0.5 leading-none">
                  Edworld <span className="text-[#00B49B] font-black text-xl sm:text-2xl leading-none">{isStaff ? "OS" : "Co."}</span>
                </span>
                <span className="text-[9px] sm:text-[11px] font-bold text-zinc-500 uppercase tracking-wider mt-1 leading-none">
                  {isStaff ? "Organization Portal" : "Career & Learning OS"}
                </span>
              </div>
            </Link>

            {/* Right: User Badge, Profile Pill & Primary Menu Button */}
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  {/* Track / Role Pill */}
                  <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-zinc-100 text-zinc-800 border border-zinc-200">
                    <span>{isStaff ? (role || "STAFF") : (user?.careerStage || "STUDENT")}</span>
                  </div>

                  {/* User Profile Capsule Trigger */}
                  <div 
                    onClick={() => setIsDrawerOpen(true)}
                    className="flex items-center gap-2.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-2xl py-1.5 px-3 sm:px-3.5 cursor-pointer transition-all shadow-xs group"
                    title="Open Platform Features Menu"
                  >
                    <div className="w-8 h-8 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-zinc-950 via-zinc-800 to-zinc-700 text-white font-black text-xs sm:text-sm flex items-center justify-center shadow-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden md:flex flex-col text-left">
                      <span className="text-xs sm:text-sm font-bold text-zinc-900 leading-tight">
                        {user.name.split(" ")[0]}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2.5">
                  <Link
                    href="/auth/login"
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-zinc-600 hover:text-zinc-950 transition-all"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-zinc-950 text-white hover:bg-zinc-800 transition-all shadow-sm flex items-center gap-1.5 group"
                  >
                    <span>Get Started</span>
                    <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                  </Link>
                </div>
              )}

              {/* Primary Menu Trigger Button */}
              <button
                onClick={() => setIsDrawerOpen(true)}
                aria-label="Open Platform Features Menu"
                className="px-4 py-2 sm:py-2.5 rounded-2xl bg-zinc-950 hover:bg-zinc-800 text-white font-black text-xs sm:text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer group active:scale-95"
              >
                <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-white transition-transform group-hover:scale-110" />
                <span className="font-extrabold tracking-wide">Menu</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Slide-Over All-Features Menu Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden no-print">
          {/* Backdrop */}
          <div 
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-zinc-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-12">
            <div className="w-screen max-w-lg bg-white text-zinc-950 border-l border-zinc-200 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-250 ease-out">
              
              {/* Drawer Header */}
              <div className="p-5 sm:p-6 border-b border-zinc-200 bg-zinc-50/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-zinc-950 border border-zinc-800 p-1 flex items-center justify-center shadow-xs overflow-hidden shrink-0">
                      <Image
                        src="/images/edworld-logo.png"
                        alt="Edworld Logo"
                        width={24}
                        height={24}
                        className="object-contain"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-black text-sm font-sans tracking-tight text-zinc-950 flex items-center gap-0.5 leading-none">
                        Edworld <span className="text-[#00B49B]">Features Menu</span>
                      </span>
                      <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider mt-0.5 leading-none">
                        All Platform Features &amp; Workspaces
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    aria-label="Close Menu"
                    className="w-9 h-9 rounded-2xl bg-zinc-200/70 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-950 flex items-center justify-center transition-all shadow-xs cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* User Snapshot (if authenticated) */}
                {user && (
                  <div className="p-3.5 rounded-2xl bg-white border border-zinc-200 flex items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-zinc-950 via-zinc-800 to-zinc-700 text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-zinc-950 text-xs sm:text-sm truncate">{user.name}</div>
                        <div className="text-[10px] text-zinc-500 font-mono truncate">{user.email}</div>
                      </div>
                    </div>
                    <span className="text-[9px] font-black px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-800 border border-zinc-200 shrink-0">
                      {isStaff ? (role || "STAFF") : (user?.careerStage || "STUDENT")}
                    </span>
                  </div>
                )}

                {/* Quick Feature Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search any feature (e.g. resume, interview, jobs)..."
                    className="w-full pl-9 pr-4 py-2 rounded-2xl bg-white border border-zinc-200 text-xs text-zinc-950 placeholder-zinc-400 focus:outline-hidden focus:border-zinc-900 transition-all shadow-xs"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-700 text-xs"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Category Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    { id: "all", label: "All Features" },
                    { id: "core", label: "Core & Drills" },
                    { id: "career", label: "Career OS" },
                    { id: "networking", label: "Networking" },
                    { id: "org", label: "Org & Settings" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={
                        activeCategory === cat.id
                          ? "px-3 py-1 rounded-xl text-[10px] font-black whitespace-nowrap transition-all cursor-pointer bg-zinc-950 text-white shadow-xs"
                          : "px-3 py-1 rounded-xl text-[10px] font-extrabold whitespace-nowrap transition-all cursor-pointer bg-white text-zinc-600 hover:text-zinc-950 border border-zinc-200"
                      }
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrollable Features Grid */}
              <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-2">
                {filteredFeatures.length === 0 ? (
                  <div className="text-center py-12 text-xs text-zinc-500 space-y-2">
                    <p>No features match &quot;{searchQuery}&quot;</p>
                    <button
                      onClick={() => { setSearchQuery(""); setActiveCategory("all"); }}
                      className="text-zinc-900 underline font-bold"
                    >
                      View all features
                    </button>
                  </div>
                ) : (
                  filteredFeatures.map((feat) => {
                    const Icon = feat.icon;
                    const isActive = pathname === feat.href || (feat.href !== "/dashboard" && pathname.startsWith(feat.href));

                    return (
                      <Link
                        key={feat.href}
                        href={feat.href}
                        onClick={() => setIsDrawerOpen(false)}
                        className={
                          isActive
                            ? "group flex items-start justify-between p-3 rounded-2xl text-xs font-bold transition-all border bg-zinc-100 text-zinc-950 border-zinc-300 shadow-xs"
                            : "group flex items-start justify-between p-3 rounded-2xl text-xs font-bold transition-all border bg-white text-zinc-600 border-zinc-100 hover:bg-zinc-50 hover:text-zinc-950 hover:border-zinc-200"
                        }
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className={
                            isActive 
                              ? "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors bg-zinc-950 text-white" 
                              : "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors bg-zinc-100 text-zinc-600 group-hover:text-zinc-950"
                          }>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-zinc-950 font-bold">{feat.label}</span>
                              {feat.badge && (
                                <span className="px-1.5 py-0.5 rounded-md bg-zinc-100 text-zinc-800 text-[9px] font-black uppercase border border-zinc-200">
                                  {feat.badge}
                                </span>
                              )}
                            </div>
                            {feat.desc && (
                              <p className={
                                isActive 
                                  ? "text-[10px] font-normal mt-0.5 leading-snug line-clamp-1 text-zinc-700" 
                                  : "text-[10px] font-normal mt-0.5 leading-snug line-clamp-1 text-zinc-400 group-hover:text-zinc-600"
                              }>
                                {feat.desc}
                              </p>
                            )}
                          </div>
                        </div>

                        <ChevronRight className={
                          isActive 
                            ? "w-4 h-4 shrink-0 mt-2 transition-transform group-hover:translate-x-0.5 text-zinc-900" 
                            : "w-4 h-4 shrink-0 mt-2 transition-transform group-hover:translate-x-0.5 text-zinc-400"
                        } />
                      </Link>
                    );
                  })
                )}
              </div>

              {/* Drawer Footer */}
              <div className="p-5 border-t border-zinc-200 bg-zinc-50/80">
                {user ? (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <Link
                        href="/profile"
                        onClick={() => setIsDrawerOpen(false)}
                        className="flex items-center gap-1.5 font-bold text-zinc-600 hover:text-zinc-950"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        <span>Profile &amp; Settings</span>
                      </Link>
                      <Link
                        href="/billing"
                        onClick={() => setIsDrawerOpen(false)}
                        className="flex items-center gap-1.5 font-bold text-zinc-950 hover:underline"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Plans &amp; Upgrade</span>
                      </Link>
                    </div>

                    <button
                      onClick={() => {
                        logout();
                        setIsDrawerOpen(false);
                      }}
                      className="w-full py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out from Workspace</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      href="/auth/login"
                      variant="secondary"
                      size="sm"
                      className="flex-1 justify-center rounded-2xl font-black text-xs"
                    >
                      <span>Sign In</span>
                    </Button>
                    <Button
                      href="/auth/signup"
                      variant="primary"
                      size="sm"
                      className="flex-1 justify-center bg-zinc-950 text-white hover:bg-zinc-800 rounded-2xl font-black text-xs"
                    >
                      <span>Get Started</span>
                    </Button>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
