"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
  Award,
  CreditCard,
  Search,
  ChevronRight,
  Compass,
  Layers,
  ArrowRight
} from "lucide-react";
import EdworldLogo from "@/components/ui/EdworldLogo";

interface NavItem {
  href: string;
  label: string;
  description: string;
  icon: React.ElementType;
  badge?: string;
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
    isFounder,
    isHR,
    isEmployee,
    logout
  } = useAuth();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Close drawer on route change
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [pathname]);

  // Close drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isDrawerOpen]);

  const handleSignOut = async () => {
    try {
      await logout();
      setIsDrawerOpen(false);
      router.push("/login");
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const userInitials = (user?.name || profile?.name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const homeHref = user ? "/dashboard" : "/";

  // Desktop quick links in central island
  const desktopQuickLinks = [
    { label: "Practice", href: "/interviews" },
    { label: "ATS Resumes", href: "/resumes" },
    { label: "Career OS", href: "/career/copilot" },
    { label: "Jobs", href: "/jobs" },
    { label: "Pricing", href: "/pricing" },
  ];

  // Comprehensive drawer sections
  const sections: NavSection[] = [
    {
      title: "Core Career Tools",
      items: [
        { href: "/dashboard", label: "Dashboard", description: "Personalized metrics & daily goals", icon: LayoutDashboard },
        { href: "/interviews", label: "Mock Interview Studio", description: "AI video/audio technical rounds", icon: Video, badge: "AI Powered" },
        { href: "/resumes", label: "ATS Resume Maker", description: "Keyword-calibrated single-column builder", icon: FileText },
        { href: "/problems", label: "Coding Sandbox", description: "Algorithm drills with live test runners", icon: Code2 },
        { href: "/jobs", label: "Jobs & Opportunities", description: "Curated internships & full-time roles", icon: Briefcase },
        { href: "/network", label: "Peer Network", description: "Connect with verified colleagues", icon: Users },
      ],
    },
    {
      title: "Specialized Portals & Solutions",
      items: [
        { href: "/ambassador", label: "Campus Ambassador Program", description: "Apply to represent EdWorld on your campus", icon: Award, badge: "Apply Now" },
        { href: "/colleges", label: "For Colleges & Universities", description: "Campus placement telemetry", icon: GraduationCap },
        { href: "/for-professionals", label: "For Working Professionals", description: "Senior engineering acceleration", icon: Target },
        ...(isFounder || isAdmin ? [{ href: "/admin", label: "Admin Operations Portal", description: "Users, jobs, ambassadors & bulk mailer", icon: ShieldCheck }] : []),
        ...(isFounder || isAdmin ? [{ href: "/founder", label: "Founder Portal", description: "Executive KPI telemetry", icon: Building2 }] : []),
        ...(isHR || isAdmin ? [{ href: "/hr", label: "HR Portal", description: "Workforce & candidate management", icon: Users }] : []),
        ...(isEmployee ? [{ href: "/employee", label: "Employee Portal", description: "Internal self-service", icon: Briefcase }] : []),
      ],
    },
  ];

  // Search filtered sections
  const filteredSections = sections
    .map((sec) => ({
      ...sec,
      items: sec.items.filter(
        (it) =>
          it.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          it.description.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((sec) => sec.items.length > 0);

  return (
    <>
      {/* 1. MASTER FLOATING ISLAND HEADER BAR */}
      <header className="fixed top-0 inset-x-0 z-40 pointer-events-none pt-3 sm:pt-4 px-4 sm:px-6 font-sans">
        <div className="max-w-7xl mx-auto w-full pointer-events-auto bg-white/92 backdrop-blur-md border border-neutral-200/90 rounded-2xl shadow-xs py-2 px-3.5 sm:px-5 flex items-center justify-between transition-all">
          
          {/* Left: Brand Identity with New Bespoke Icon */}
          <div className="flex items-center gap-6">
            <EdworldLogo size="md" href={homeHref} />
          </div>

          {/* Center: Desktop / Laptop Quick Links (Hidden on mobile/small tablets) */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold text-neutral-600">
            {desktopQuickLinks.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    isActive
                      ? "bg-black text-white font-bold shadow-2xs"
                      : "hover:bg-neutral-100 hover:text-black"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-2">
            
            {/* Ask Myra AI Quick Trigger */}
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("open-myra-copilot"));
                }
              }}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 hover:border-black text-xs font-bold text-black transition-all cursor-pointer shadow-2xs"
              title="Open Myra AI Copilot"
            >
              <Sparkles className="w-3.5 h-3.5 text-black" />
              <span>Ask Myra</span>
            </button>

            {/* Auth State Button */}
            {user ? (
              <Link
                href="/profile"
                className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-black text-xs font-bold transition-all"
                title="Your Profile"
              >
                <div className="w-6 h-6 rounded-lg bg-black text-white flex items-center justify-center font-bold text-[10px]">
                  {userInitials}
                </div>
                <span className="hidden md:inline max-w-[100px] truncate">
                  {user.name?.split(" ")[0] || "Profile"}
                </span>
              </Link>
            ) : (
              <Link
                href="/auth/login"
                className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-neutral-50 border border-neutral-200 hover:border-black text-black text-xs font-bold transition-all shadow-2xs"
              >
                Sign In
              </Link>
            )}

            {/* Menu Trigger Button */}
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              aria-label="Open Navigation Drawer"
            >
              <Menu className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Menu</span>
            </button>

          </div>

        </div>
      </header>

      {/* 2. REFINED SLIDE-OUT NAVIGATION DRAWER */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden font-sans">
          
          {/* Dimmed Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
            onClick={() => setIsDrawerOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl border-l border-neutral-200 flex flex-col animate-in slide-in-from-right duration-300">
              
              {/* Drawer Header */}
              <div className="p-5 sm:p-6 border-b border-neutral-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <EdworldLogo size="sm" showText={false} />
                  <div>
                    <h2 className="text-sm font-extrabold text-black leading-none">
                      Navigation &amp; Directory
                    </h2>
                    <p className="text-xs text-neutral-500 mt-1 leading-none">
                      EdWorld Co. Ecosystem
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 rounded-xl text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Profile Card (if authenticated) */}
              {user && (
                <div className="p-4 mx-5 mt-4 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {userInitials}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-black truncate">
                        {user.name || profile?.name || "Student"}
                      </div>
                      <div className="text-[11px] text-neutral-500 truncate">
                        {user.email}
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/profile"
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-2 rounded-xl bg-white border border-neutral-200 hover:border-black text-black text-xs font-bold transition-all"
                    title="Account Settings"
                  >
                    <User className="w-4 h-4" />
                  </Link>
                </div>
              )}

              {/* Instant Search Bar */}
              <div className="px-5 pt-4 pb-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tools & features..."
                    className="w-full pl-9 pr-3.5 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl text-black placeholder-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                  />
                </div>
              </div>

              {/* Navigation Items List */}
              <div className="flex-1 overflow-y-auto px-5 py-3 space-y-6">
                {filteredSections.map((section, idx) => (
                  <div key={idx} className="space-y-2">
                    <h3 className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider px-1">
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
                            onClick={() => setIsDrawerOpen(false)}
                            className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                              isActive
                                ? "bg-black border-black text-white shadow-xs"
                                : "bg-white hover:bg-neutral-50 border-neutral-200 hover:border-black text-black"
                            }`}
                          >
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                                isActive
                                  ? "bg-neutral-900 text-white"
                                  : "bg-neutral-100 text-black"
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1.5">
                                <span className="text-xs font-bold leading-none truncate">
                                  {item.label}
                                </span>
                                {item.badge && (
                                  <span
                                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md leading-none ${
                                      isActive
                                        ? "bg-neutral-800 text-white"
                                        : "bg-neutral-100 text-black border border-neutral-300"
                                    }`}
                                  >
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              <p className={`text-[11px] mt-1 leading-snug truncate ${isActive ? "text-neutral-300" : "text-neutral-500"}`}>
                                {item.description}
                              </p>
                            </div>

                            <ChevronRight className={`w-3.5 h-3.5 self-center shrink-0 ${isActive ? "text-neutral-400" : "text-neutral-300"}`} />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-5 bg-white border-t border-neutral-200 space-y-3">
                <div className="flex items-center justify-between text-xs text-neutral-600 font-medium">
                  <Link
                    href="/pricing"
                    onClick={() => setIsDrawerOpen(false)}
                    className="hover:text-black flex items-center gap-1.5"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Pricing Plans</span>
                  </Link>

                  <div className="flex items-center gap-3 text-[11px] text-neutral-500">
                    <Link href="/privacy" onClick={() => setIsDrawerOpen(false)} className="hover:text-black">Privacy</Link>
                    <span>&bull;</span>
                    <Link href="/terms" onClick={() => setIsDrawerOpen(false)} className="hover:text-black">Terms</Link>
                    <span>&bull;</span>
                    <Link href="/refund" onClick={() => setIsDrawerOpen(false)} className="hover:text-black">Refunds</Link>
                  </div>
                </div>

                {user ? (
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full py-2.5 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-black text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                ) : (
                  <Link
                    href="/auth/login"
                    onClick={() => setIsDrawerOpen(false)}
                    className="w-full py-2.5 px-3 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
                  >
                    <span>Sign In</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
