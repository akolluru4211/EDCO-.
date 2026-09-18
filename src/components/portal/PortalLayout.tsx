"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { 
  Menu, 
  X, 
  LogOut, 
  User, 
  ChevronRight, 
  ShieldCheck,
  Building2,
  Briefcase,
  Users,
  GraduationCap,
  School,
  LayoutDashboard,
  FileText,
  Video,
  Layers,
  FolderKanban,
  Target,
  CheckSquare,
  Calendar,
  Clock,
  CreditCard,
  TrendingUp,
  FileCheck,
  Award,
  AlertTriangle,
  Settings,
  Bell,
  Search
} from "lucide-react";
import RoleScopedSearch from "@/components/search/RoleScopedSearch";
import RoleScopedNotifications from "@/components/notifications/RoleScopedNotifications";

export interface PortalNavItem {
  label: string;
  href: string;
  icon: any;
  badge?: string;
}

export interface PortalLayoutProps {
  portalName: string;
  portalRole: string;
  navItems: PortalNavItem[];
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export default function PortalLayout({
  portalName,
  portalRole,
  navItems,
  children,
  actions
}: PortalLayoutProps) {
  const pathname = usePathname();
  const { user, profile, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row text-slate-900 font-sans antialiased">
      {/* Search Modal */}
      {isSearchOpen && <RoleScopedSearch onClose={() => setIsSearchOpen(false)} />}

      {/* Mobile Top Header */}
      <header className="md:hidden bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-200 hover:text-white"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              <span>Edworld</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                {portalRole}
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            aria-label="Search portal"
          >
            <Search className="w-4 h-4" />
          </button>
          <RoleScopedNotifications />
        </div>
      </header>

      {/* Desktop Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 z-20 h-screen w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 shrink-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Sidebar Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-sm shadow-sm group-hover:bg-indigo-600 transition-colors">
                E
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-900 tracking-tight leading-none">
                  Edworld Co.
                </span>
                <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider mt-1 leading-none">
                  {portalName}
                </span>
              </div>
            </Link>
          </div>

          {/* Quick Search Trigger */}
          <div className="px-4 pt-4 pb-2">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-500 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl transition-all"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <span>Search {portalName}...</span>
              </div>
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-400">
                Ctrl K
              </kbd>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/dashboard" && item.href !== "/employee" && item.href !== "/hr" && item.href !== "/founder" && item.href !== "/colleges"  && item.href !== "/admin" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? "text-indigo-300" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        isActive
                          ? "bg-indigo-500/30 text-indigo-200"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Sign Out Footer */}
          <div className="p-3 border-t border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/80 shadow-xs mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                  {profile?.name ? profile.name[0].toUpperCase() : user?.name ? user.name[0].toUpperCase() : "U"}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">
                    {profile?.name || user?.name || user?.email?.split("@")[0] || "User"}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => logout()}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-xl transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Top Header Bar */}
        <header className="hidden md:flex bg-white border-b border-slate-200/80 px-8 py-3.5 items-center justify-between sticky top-0 z-10 shadow-xs">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Edworld Co.</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-800">{portalName}</span>
          </div>

          <div className="flex items-center gap-3">
            <RoleScopedNotifications />
            {actions}
          </div>
        </header>

        {/* Dynamic Page Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Backdrop for Mobile Drawer */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/40 z-10 md:hidden backdrop-blur-xs"
        />
      )}
    </div>
  );
}
