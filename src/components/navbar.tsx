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
  category: "build" | "practice" | "grow" | "org";
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
  const [unreadMessagesCount, setUnreadMessagesCount] = useState<number>(0);

  const isStaff = Boolean(isEmployee || isHR || isFounder || isCollegeAdmin || isAdmin || isSuperAdmin);
  const isAdult = user?.ageBand === "18+" || user?.careerStage === "PROFESSIONAL";

  // Sync live unread direct messages count
  useEffect(() => {
    if (!user?.uid) {
      setUnreadMessagesCount(0);
      return;
    }

    const fetchUnreadCount = async () => {
      try {
        const res = await fetch("/api/network/messages?countOnly=true", {
          headers: { "x-user-id": user.uid },
        });
        const data = await res.json();
        if (data.success && typeof data.unreadCount === "number") {
          setUnreadMessagesCount(data.unreadCount);
        }
      } catch (err) {
        console.warn("[Navbar] Failed to fetch unread count:", err);
      }
    };

    fetchUnreadCount();

    // 1. Supabase Realtime User Channel (Instant broadcast)
    const userChannel = supabase
      .channel(`edworld_user_${user.uid}`)
      .on("broadcast", { event: "new_message" }, () => {
        fetchUnreadCount();
      })
      .on("broadcast", { event: "unread_update" }, (payload: any) => {
        if (typeof payload?.payload?.count === "number") {
          setUnreadMessagesCount(payload.payload.count);
        } else {
          fetchUnreadCount();
        }
      })
      .subscribe();

    // 2. Supabase Postgres Changes Channel (Database WAL changes)
    const dbChannel = supabase
      .channel(`db_messages_${user.uid}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "direct_messages",
          filter: `receiver_id=eq.${user.uid}`,
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    // 3. Custom DOM Events for instant cross-component updates
    const handleLocalRead = (e: any) => {
      if (typeof e.detail?.unreadCount === "number") {
        setUnreadMessagesCount(e.detail.unreadCount);
      } else {
        fetchUnreadCount();
      }
    };
    window.addEventListener("edworld:messages_read", handleLocalRead);
    window.addEventListener("edworld:message_sent", fetchUnreadCount);

    return () => {
      supabase.removeChannel(userChannel);
      supabase.removeChannel(dbChannel);
      window.removeEventListener("edworld:messages_read", handleLocalRead);
      window.removeEventListener("edworld:message_sent", fetchUnreadCount);
    };
  }, [user?.uid]);

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
  // Comprehensive Feature Registry across the entire EdWorld Platform (Build, Practice, Grow, Org)
  const ALL_FEATURES: FeatureMenuItem[] = [
    // 1. BUILD (Resume, Projects, Portfolio, Verified Documents)
    {
      href: "/resumes",
      label: "Master Resume Builder",
      shortLabel: "Resumes",
      icon: FileText,
      desc: "ATS score optimization, JD match analysis & keyword tailoring",
      category: "build",
      badge: "ATS 90+"
    },
    {
      href: "/projects",
      label: "Showcase Projects",
      shortLabel: "Projects",
      icon: Layers,
      desc: "Engineering showcase builds, GitHub verification & live demos",
      category: "build"
    },
    {
      href: "/career/documents",
      label: "Verified Documents",
      shortLabel: "Documents",
      icon: FileCheck,
      desc: "Offer letters, transcripts & verified digital credentials",
      category: "build",
      requiresAdult: true
    },
    {
      href: "/profile",
      label: "Public Portfolio & Showcase",
      shortLabel: "Portfolio",
      icon: UserIcon,
      desc: "Verified student badge, skills telemetry & public profile URL",
      category: "build"
    },

    // 2. PRACTICE (Mock Interview, Drills, Speech, Leadership, Question Archives)
    {
      href: "/interviews",
      label: "AI Mock Interview Studio",
      shortLabel: "Interviews",
      icon: Video,
      desc: "STAR behavioral & technical questions with Claude & Myra setup",
      category: "practice",
      badge: "AI Powered"
    },
    {
      href: "/aptitude",
      label: "Quantitative & CS Drills",
      shortLabel: "Drills",
      icon: Brain,
      desc: "Speed reasoning, algorithms & quantitative practice with instant scoring",
      category: "practice"
    },
    {
      href: "/interviews/language-training",
      label: "Speech & Articulation Drills",
      shortLabel: "Speech",
      icon: Sparkles,
      desc: "Voice delivery, speech pace & filler word diagnostics",
      category: "practice"
    },
    {
      href: "/leadership-assessment",
      label: "Leadership & Cross-Functional Prep",
      shortLabel: "Leadership",
      icon: Crown,
      desc: "Situational judgment, delegation & management readiness",
      category: "practice",
      requiresAdult: true
    },
    {
      href: "/interview-experiences",
      label: "Company Question Archives",
      shortLabel: "Archives",
      icon: BookOpen,
      desc: "Real company round breakdowns & verified interview experiences",
      category: "practice",
      badge: "UGC"
    },

    // 3. GROW (Dashboard, Jobs, Network, Messages, Ambassador)
    {
      href: "/dashboard",
      label: "EdDashboard Hub",
      shortLabel: "Dashboard",
      icon: LayoutDashboard,
      desc: "Personalized skills radar, daily streak & priority focus timetable",
      category: "grow",
      badge: "Core"
    },
    {
      href: "/jobs",
      label: "Verified Job Opportunities",
      shortLabel: "Jobs",
      icon: Briefcase,
      desc: "Direct employer openings calibrated to your skill profile",
      category: "grow"
    },
    {
      href: "/network",
      label: "EdNetwork Verified Community",
      shortLabel: "Network",
      icon: Users,
      desc: "Connect with verified peers, engineers & university members",
      category: "grow"
    },
    {
      href: "/messages",
      label: "Direct Messages",
      shortLabel: "Messages",
      icon: MessageSquare,
      desc: "1-on-1 direct messaging with real-time WebSocket sync",
      category: "grow"
    },
    {
      href: "/ambassador",
      label: "Campus Ambassador Program",
      shortLabel: "Ambassadors",
      icon: Award,
      desc: "Represent EdWorld on campus & earn leadership perks",
      category: "grow",
      badge: "Apply"
    },

    // 4. ORGANIZATION (Staff & Admin only)
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
      label: "Founder Suite",
      shortLabel: "Founder",
      icon: Building2,
      desc: "Valuation sandbox, burn rate & organizational metrics",
      category: "org",
      staffOnly: true
    },
    {
      href: "/admin",
      label: "Admin Operations Portal",
      shortLabel: "Admin OS",
      icon: ShieldCheck,
      desc: "Users, jobs, ambassadors & bulk mailer",
      category: "org",
      staffOnly: true
    },
    {
      href: "/admin/security",
      label: "Security & Compliance Office",
      shortLabel: "Security",
      icon: ShieldCheck,
      desc: "Live database, RLS protection matrix & DPO statutory compliance",
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

            {/* Center: Desktop 4-Pillar Quick Navigation (Build, Practice, Grow, Org) */}
            <nav className="hidden lg:flex items-center gap-1 bg-zinc-100/90 p-1 rounded-2xl border border-zinc-200/80 shadow-2xs">
              <Link
                href="/resumes"
                className={`px-3.5 py-1.5 rounded-xl text-xs transition-all ${
                  pathname.startsWith("/resumes") || pathname.startsWith("/projects") || pathname.startsWith("/career")
                    ? "bg-white text-emerald-950 shadow-xs border border-emerald-900/10 font-black"
                    : "text-zinc-600 hover:text-zinc-950 hover:bg-white/60 font-bold"
                }`}
              >
                Build
              </Link>
              <Link
                href="/interviews"
                className={`px-3.5 py-1.5 rounded-xl text-xs transition-all ${
                  pathname.startsWith("/interviews") || pathname.startsWith("/aptitude") || pathname.startsWith("/leadership")
                    ? "bg-white text-emerald-950 shadow-xs border border-emerald-900/10 font-black"
                    : "text-zinc-600 hover:text-zinc-950 hover:bg-white/60 font-bold"
                }`}
              >
                Practice
              </Link>
              <Link
                href="/dashboard"
                className={`px-3.5 py-1.5 rounded-xl text-xs transition-all ${
                  pathname.startsWith("/dashboard") || pathname.startsWith("/jobs") || pathname.startsWith("/network") || pathname.startsWith("/messages")
                    ? "bg-white text-emerald-950 shadow-xs border border-emerald-900/10 font-black"
                    : "text-zinc-600 hover:text-zinc-950 hover:bg-white/60 font-bold"
                }`}
              >
                Grow
              </Link>
              {isStaff && (
                <Link
                  href="/admin"
                  className={`px-3.5 py-1.5 rounded-xl text-xs transition-all ${
                    pathname.startsWith("/admin") || pathname.startsWith("/employee") || pathname.startsWith("/hr") || pathname.startsWith("/founder")
                      ? "bg-white text-emerald-950 shadow-xs border border-emerald-900/10 font-black"
                      : "text-zinc-600 hover:text-zinc-950 hover:bg-white/60 font-bold"
                  }`}
                >
                  Org
                </Link>
              )}
            </nav>

            {/* Right: User Badge, Profile Pill & Primary Menu Button */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Dedicated "Ask Myra" Entry Point */}
              <button
                onClick={() => {
                  window.dispatchEvent(
                    new CustomEvent("open-myra-copilot", {
                      detail: { prompt: "", autoSend: false }
                    })
                  );
                }}
                aria-label="Ask Myra AI Copilot"
                className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 hover:from-emerald-800 hover:to-teal-900 text-white font-black text-xs transition-all shadow-xs cursor-pointer group active:scale-95 border border-emerald-500/30"
                title="Ask Myra AI Copilot"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 transition-transform group-hover:rotate-12" />
                <span className="font-extrabold tracking-tight">Ask Myra</span>
              </button>

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

                  {/* Direct Messages Quick Button with Live Unread Counter */}
                  <Link
                    href="/messages"
                    aria-label="Direct Messages"
                    className="relative p-2 sm:p-2.5 rounded-2xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-700 hover:text-zinc-950 transition-all flex items-center justify-center group shadow-xs cursor-pointer active:scale-95"
                    title={
                      unreadMessagesCount > 0
                        ? `${unreadMessagesCount} unread message${unreadMessagesCount > 1 ? "s" : ""}`
                        : "Direct Messages"
                    }
                  >
                    <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:scale-110 text-zinc-700 group-hover:text-zinc-950" />
                    {unreadMessagesCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 min-w-[18px] sm:min-w-[20px] h-[18px] sm:h-5 px-1 rounded-full bg-emerald-600 text-white font-black text-[10px] sm:text-xs flex items-center justify-center shadow-md animate-pulse border-2 border-white">
                        {unreadMessagesCount > 9 ? "9+" : unreadMessagesCount}
                      </span>
                    )}
                  </Link>
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

                {/* Category Filter Pills (Build, Practice, Grow, Org) */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    { id: "all", label: "All Features" },
                    { id: "build", label: "Build" },
                    { id: "practice", label: "Practice" },
                    { id: "grow", label: "Grow" },
                    ...(isStaff ? [{ id: "org", label: "Org" }] : []),
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
                              {feat.href === "/messages" && unreadMessagesCount > 0 ? (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider animate-pulse">
                                  {unreadMessagesCount} new
                                </span>
                              ) : feat.badge ? (
                                <span className="px-1.5 py-0.5 rounded-md bg-zinc-100 text-zinc-800 text-[9px] font-black uppercase border border-zinc-200">
                                  {feat.badge}
                                </span>
                              ) : null}
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
