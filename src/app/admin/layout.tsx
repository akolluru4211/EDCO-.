"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthGuard from "@/components/auth/AuthGuard";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import EdworldLogo from "@/components/ui/EdworldLogo";
import { useAuth } from "@/lib/auth-context";
import { 
  Users, 
  Briefcase, 
  Award, 
  Mail, 
  ArrowLeft, 
  ShieldCheck, 
  Menu, 
  X,
  ExternalLink,
  Activity
} from "lucide-react";

const ADMIN_NAV_LINKS = [
  {
    href: "/admin/users",
    label: "Users & Onboarding",
    icon: Users,
    desc: "All signups, tech tracks, goals, and onboarding dossier"
  },
  {
    href: "/admin/jobs",
    label: "Jobs & Internships",
    icon: Briefcase,
    desc: "Add and delete job & internship roles"
  },
  {
    href: "/admin/ambassadors",
    label: "Campus Ambassadors",
    icon: Award,
    desc: "Student requests, accepted leaders & 1-click mailer"
  },
  {
    href: "/admin/bulk-mail",
    label: "Bulk Mail Sender",
    icon: Mail,
    desc: "Broadcast emails to all students via Resend"
  },
  {
    href: "/admin/security",
    label: "Security Office",
    icon: ShieldCheck,
    desc: "Live database, RLS audit, auth security & compliance console"
  },
  {
    href: "/admin/system-health",
    label: "System Health & Uptime",
    icon: Activity,
    desc: "Real-time telemetry, microservices health, and probe latency"
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, role } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <AuthGuard allowedRoles={["ADMIN", "SUPER_ADMIN", "FOUNDER"]}>
      <ErrorBoundary moduleName="Admin Operations Portal" fallbackTitle="Admin Hub Notice">
        <div className="min-h-screen bg-white text-black flex flex-col font-sans selection:bg-black selection:text-white">
          
          {/* Top Admin Architectural Navigation Header */}
          <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200">
            <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                
                {/* Brand & Admin Shield */}
                <div className="flex items-center gap-4">
                  <EdworldLogo size="md" href="/admin" />
                  
                  <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-neutral-200">
                    <span className="text-[10px] font-black tracking-widest uppercase bg-black text-white px-2 py-0.5 rounded">
                      ADMIN OS
                    </span>
                    <span className="text-xs font-semibold text-neutral-500 font-mono">
                      Hyderabad HQ
                    </span>
                  </div>
                </div>

                {/* Desktop Navigation Tabs */}
                <nav className="hidden md:flex items-center gap-1">
                  {ADMIN_NAV_LINKS.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || (pathname === "/admin" && item.href === "/admin/users");
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                          isActive
                            ? "bg-black text-white shadow-xs font-black"
                            : "text-neutral-600 hover:text-black hover:bg-neutral-100"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>

                {/* Right Actions: Return to App & Mobile Trigger */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <Link
                    href="/dashboard"
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-neutral-600 hover:text-black border border-neutral-200 rounded-lg hover:border-neutral-400 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Return to App</span>
                  </Link>

                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden p-2 rounded-lg text-neutral-600 hover:text-black hover:bg-neutral-100"
                    aria-label="Toggle admin navigation"
                  >
                    {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </button>
                </div>

              </div>
            </div>

            {/* Mobile Navigation Drawer */}
            {mobileMenuOpen && (
              <div className="md:hidden border-t border-neutral-200 bg-white px-4 py-3 space-y-1">
                {ADMIN_NAV_LINKS.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                        isActive
                          ? "bg-black text-white"
                          : "text-neutral-700 hover:bg-neutral-100"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <div>
                        <div>{item.label}</div>
                        <div className={`text-[10px] font-normal ${isActive ? "text-neutral-300" : "text-neutral-500"}`}>
                          {item.desc}
                        </div>
                      </div>
                    </Link>
                  );
                })}
                <div className="pt-2 border-t border-neutral-200">
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-neutral-600 hover:text-black"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Exit Admin to User Dashboard</span>
                  </Link>
                </div>
              </div>
            )}
          </header>

          {/* Main Admin Workspace Container */}
          <main className="flex-1 max-w-[1536px] w-full mx-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>

        </div>
      </ErrorBoundary>
    </AuthGuard>
  );
}
