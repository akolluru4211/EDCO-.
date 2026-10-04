"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  Menu,
  X,
  LayoutDashboard,
  Video,
  Target,
  Code2,
  FileText,
  Users,
  Briefcase,
  User,
  LogOut,
  Building2,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Search,
  ChevronRight,
  ExternalLink,
  Layers,
  Award
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  description: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
  roleRequired?: "admin" | "hr" | "founder" | "employee";
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export default function FloatingNav() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    user,
    profile,
    isAdmin,
    isSuperAdmin,
    isHR,
    isFounder,
    isEmployee,
    logout
  } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Close drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Close drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    try {
      await logout();
      setIsOpen(false);
      router.push("/login");
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const navSections: NavSection[] = [
    {
      title: "Core Learning & Drills",
      items: [
        {
          href: "/dashboard",
          label: "Dashboard",
          description: "Smart overview, study timetable & streak telemetry",
          icon: LayoutDashboard,
        },
        {
          href: "/interviews",
          label: "Mock Interviews",
          description: "Live AI video & voice simulation with rubric score",
          icon: Video,
          badge: "AI Powered",
          badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
        },
        {
          href: "/interviews/star-method",
          label: "STAR Behavioral Drills",
          description: "Situation-Task-Action-Result structural drills",
          icon: Target,
        },
        {
          href: "/practice",
          label: "Practice & Aptitude",
          description: "Quantitative, logical, and coding problem sprints",
          icon: Code2,
        },
        {
          href: "/interviews/system-design",
          label: "System Design",
          description: "Scalability, microservices & architecture studio",
          icon: Layers,
        },
      ],
    },
    {
      title: "Career & Placement Suite",
      items: [
        {
          href: "/resumes",
          label: "Resume Studio & ATS",
          description: "Live ATS scoring, keyword optimization & LaTeX export",
          icon: FileText,
          badge: "ATS Scorer",
          badgeColor: "bg-blue-50 text-blue-800 border-blue-200",
        },
        {
          href: "/networking",
          label: "Verified Networking",
          description: "Direct messaging with peers, alumni & mentors",
          icon: Users,
        },
        {
          href: "/jobs",
          label: "Opportunities & Jobs",
          description: "Verified tech openings and direct campus drives",
          icon: Briefcase,
        },
        {
          href: (profile as any)?.username ? `/u/${(profile as any).username}` : user?.name ? `/u/${user.name.toLowerCase().replace(/\s+/g, "_")}` : "/profile",
          label: "Public Portfolio",
          description: "Shareable verified digital identity & skills badge",
          icon: ShieldCheck,
        },
      ],
    },
  ];

  // Filter dynamic role-specific portals
  const portalItems: NavItem[] = [];
  if (isFounder || isSuperAdmin || isAdmin) {
    portalItems.push({
      href: "/founder",
      label: "Founder Portal",
      description: "Platform growth, revenue & enterprise management",
      icon: Sparkles,
      badge: "Executive",
      badgeColor: "bg-purple-50 text-purple-800 border-purple-200",
    });
  }
  if (isHR || isSuperAdmin || isAdmin) {
    portalItems.push({
      href: "/hr",
      label: "HR Workspace",
      description: "Talent pipeline, candidate scoring & hiring drives",
      icon: Building2,
      badge: "Recruitment",
      badgeColor: "bg-indigo-50 text-indigo-800 border-indigo-200",
    });
  }
  if (isEmployee || isSuperAdmin || isAdmin) {
    portalItems.push({
      href: "/employee",
      label: "Employee Terminal",
      description: "Internal operations, workflow tasks & performance",
      icon: Award,
      badge: "Internal",
      badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
    });
  }

  if (portalItems.length > 0) {
    navSections.push({
      title: "Enterprise Portals",
      items: portalItems,
    });
  }

  // Filter items by search query if any
  const filteredSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) =>
          item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((section) => section.items.length > 0);

  const homeHref = user ? "/dashboard" : "/";
  const userInitials = (user?.name || profile?.name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      {/* 1. FLOATING TOP-LEFT BRAND PILL */}
      <div className="fixed top-4 sm:top-5 left-4 sm:left-5 z-40 font-sans">
        <Link
          href={homeHref}
          className="flex items-center gap-2.5 px-3.5 py-2 bg-white/95 hover:bg-white backdrop-blur-md border border-zinc-200 hover:border-zinc-300 rounded-2xl shadow-xs hover:shadow-md transition-all group"
          aria-label="Edworld Co. Home"
        >
          {/* Logo Mark */}
          <div className="w-7 h-7 rounded-xl bg-zinc-950 p-1 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform overflow-hidden shrink-0 border border-zinc-800">
            <Image
              src="/images/edworld-logo.png"
              alt="Edworld Logo"
              width={22}
              height={22}
              className="object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black text-zinc-950 tracking-tight leading-none">
              Edworld <span className="text-[#00B49B]">Co.</span>
            </span>
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider leading-none mt-0.5">
              Career &amp; Learning OS
            </span>
          </div>
        </Link>
      </div>

      {/* 2. FLOATING TOP-RIGHT ACTIONS (Ask Myra & Menu) */}
      <div className="fixed top-4 sm:top-5 right-4 sm:right-5 z-40 font-sans flex items-center gap-2">
        {/* Ask Myra Pill Button (Career Track Only) */}
        {user && user.ageBand !== "13-15" && user.ageBand !== "16-18" && (
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("open-myra-copilot"));
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/95 hover:bg-white backdrop-blur-md border border-neutral-200 hover:border-black rounded-2xl shadow-xs hover:shadow-md transition-all text-xs font-bold text-black group cursor-pointer"
            aria-label="Ask Myra AI Copilot"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#00B49B] group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">Ask Myra</span>
          </button>
        )}

        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-3.5 py-2 bg-white/95 hover:bg-white backdrop-blur-md border border-neutral-200 hover:border-black rounded-2xl shadow-xs hover:shadow-md transition-all group focus:outline-none focus:ring-2 focus:ring-black/20"
          aria-label="Open Navigation Menu"
        >
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#13141B]">
            <Menu className="w-4 h-4 text-[#13141B] group-hover:rotate-90 transition-transform duration-200" />
            <span className="hidden sm:inline">Menu</span>
          </div>

          {user && (
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#13141B] to-slate-700 text-[#00D2B4] flex items-center justify-center font-bold text-[10px] shadow-xs">
              {userInitials}
            </div>
          )}
        </button>
      </div>

      {/* 3. SLIDE-OVER NAVIGATION DRAWER */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden font-sans">
          
          {/* Dimmed Backdrop */}
          <div
            className="absolute inset-0 bg-[#13141B]/40 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-[#FCFCFB] shadow-2xl border-l border-[#E8ECF2] flex flex-col animate-in slide-in-from-right duration-300">
              
              {/* Drawer Header */}
              <div className="p-5 sm:p-6 bg-white border-b border-[#EBECEF] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-zinc-950 p-1.5 flex items-center justify-center shadow-xs overflow-hidden shrink-0 border border-zinc-800">
                    <Image
                      src="/images/edworld-logo.png"
                      alt="Edworld Logo"
                      width={24}
                      height={24}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h2 className="text-sm font-extrabold text-zinc-950 leading-none">
                      Navigation &amp; Tools
                    </h2>
                    <p className="text-xs text-zinc-500 mt-1 leading-none">
                      Edworld Co. Platform Ecosystem
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl text-gray-400 hover:text-[#13141B] hover:bg-[#F4F6FB] transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Profile Card (if authenticated) */}
              {user && (
                <div className="p-4 mx-5 mt-4 rounded-2xl bg-white border border-[#EBECEF] shadow-2xs flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#13141B] to-slate-800 text-[#00D2B4] flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                      {userInitials}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#13141B] truncate">
                        {user.name || profile?.name || "Student"}
                      </div>
                      <div className="text-[11px] text-gray-500 truncate">
                        {profile?.targetRole || user.email}
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/profile"
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-xl bg-[#F4F6FB] hover:bg-slate-100 text-gray-700 text-xs font-bold transition-colors"
                    title="Edit Profile"
                  >
                    <User className="w-4 h-4" />
                  </Link>
                </div>
              )}

              {/* Quick Filter Search */}
              <div className="px-5 pt-4 pb-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tools & features..."
                    className="w-full pl-9 pr-3.5 py-2 text-xs bg-white border border-[#E8ECF2] rounded-xl text-[#13141B] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00D2B4]/40 transition-all"
                  />
                </div>
              </div>

              {/* Navigation Sections */}
              <div className="flex-1 overflow-y-auto px-5 py-3 space-y-6">
                {filteredSections.map((section, idx) => (
                  <div key={idx} className="space-y-2">
                    <h3 className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider px-1">
                      {section.title}
                    </h3>

                    <div className="space-y-1.5">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                              isActive
                                ? "bg-white border-emerald-300 shadow-xs text-emerald-900"
                                : "bg-white/70 hover:bg-white border-[#EBECEF] hover:border-[#D1D5DC] text-[#13141B] hover:shadow-2xs"
                            }`}
                          >
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                                isActive
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-[#F4F6FB] text-gray-700"
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1.5">
                                <span className="text-xs font-bold leading-none truncate">
                                  {item.label}
                                </span>
                                {item.badge && (
                                  <span
                                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border leading-none ${
                                      item.badgeColor || "bg-gray-100 text-gray-700 border-gray-200"
                                    }`}
                                  >
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-gray-500 mt-1 leading-snug truncate">
                                {item.description}
                              </p>
                            </div>

                            <ChevronRight className="w-3.5 h-3.5 text-gray-300 self-center shrink-0" />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Drawer Footer / Account Controls */}
              <div className="p-5 bg-white border-t border-[#EBECEF] space-y-3">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <Link
                    href="/billing"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-1.5 hover:text-[#13141B] font-semibold"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-gray-500" />
                    <span>Billing &amp; Pro</span>
                  </Link>

                  <Link
                    href="/privacy"
                    onClick={() => setIsOpen(false)}
                    className="hover:text-[#13141B] text-gray-500 text-[11px]"
                  >
                    Privacy
                  </Link>
                  <Link
                    href="/terms"
                    onClick={() => setIsOpen(false)}
                    className="hover:text-[#13141B] text-gray-500 text-[11px]"
                  >
                    Terms
                  </Link>
                </div>

                {user ? (
                  <button
                    onClick={handleSignOut}
                    className="w-full py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="w-full py-2 px-3 rounded-xl bg-[#13141B] hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs"
                  >
                    <span>Sign In to Edworld Co.</span>
                  </Link>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
