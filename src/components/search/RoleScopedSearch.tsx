"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { 
  Search, 
  X, 
  FileText, 
  Video, 
  Briefcase, 
  Layers, 
  Users, 
  Building2, 
  CheckSquare, 
  Calendar, 
  TrendingUp, 
  ShieldCheck,
  GraduationCap
} from "lucide-react";

export interface SearchItem {
  id: string;
  title: string;
  category: string;
  href: string;
  icon: any;
  allowedRoles: string[];
}

export default function RoleScopedSearch({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { user, role, isEmployee, isHR, isFounder, isCollegeAdmin, isAdmin, isSuperAdmin } = useAuth();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Master index of searchable entities with strict role tagging
  const ALL_SEARCH_ITEMS: SearchItem[] = [
    // --- STUDENT / PUBLIC DOMAIN ---
    { id: "s-1", title: "My ATS Resumes", category: "Resume", href: "/resumes", icon: FileText, allowedRoles: ["STUDENT", "CLIENT", "ADMIN", "SUPER_ADMIN"] },
    { id: "s-2", title: "AI Mock Interviews", category: "Practice", href: "/interviews", icon: Video, allowedRoles: ["STUDENT", "CLIENT", "ADMIN", "SUPER_ADMIN"] },
    { id: "s-3", title: "Verified Job Board", category: "Careers", href: "/jobs", icon: Briefcase, allowedRoles: ["STUDENT", "CLIENT", "ADMIN", "SUPER_ADMIN"] },
    { id: "s-4", title: "Active Applications", category: "Careers", href: "/jobs/applications", icon: CheckSquare, allowedRoles: ["STUDENT", "CLIENT", "ADMIN", "SUPER_ADMIN"] },
    { id: "s-5", title: "Project Studio", category: "Portfolio", href: "/projects", icon: Layers, allowedRoles: ["STUDENT", "CLIENT", "ADMIN", "SUPER_ADMIN"] },
    { id: "s-6", title: "Professional Mentorship Network", category: "Network", href: "/networking", icon: Users, allowedRoles: ["STUDENT", "CLIENT", "ADMIN", "SUPER_ADMIN"] },

    // --- EMPLOYEE DOMAIN (Strictly hidden from Students) ---
    { id: "e-1", title: "Daily Check-In & Standup", category: "Employee Operations", href: "/employee", icon: CheckSquare, allowedRoles: ["EMPLOYEE", "HR", "FOUNDER", "ADMIN", "SUPER_ADMIN"] },
    { id: "e-2", title: "Quarterly OKRs & Goals", category: "Employee Operations", href: "/employee", icon: TrendingUp, allowedRoles: ["EMPLOYEE", "HR", "FOUNDER", "ADMIN", "SUPER_ADMIN"] },
    { id: "e-3", title: "Leave Requests & PTO Balance", category: "Employee Operations", href: "/employee", icon: Calendar, allowedRoles: ["EMPLOYEE", "HR", "FOUNDER", "ADMIN", "SUPER_ADMIN"] },
    { id: "e-4", title: "Appraisal & Performance Reviews", category: "Employee Operations", href: "/employee/performance", icon: FileText, allowedRoles: ["EMPLOYEE", "HR", "FOUNDER", "ADMIN", "SUPER_ADMIN"] },

    // --- HR DOMAIN (Strictly hidden from Students & Normal Employees) ---
    { id: "h-1", title: "Candidate Hiring Pipeline", category: "HR Command", href: "/hr", icon: Users, allowedRoles: ["HR", "FOUNDER", "ADMIN", "SUPER_ADMIN"] },
    { id: "h-2", title: "Employee Directory & Provisioning", category: "HR Command", href: "/hr", icon: Briefcase, allowedRoles: ["HR", "FOUNDER", "ADMIN", "SUPER_ADMIN"] },
    { id: "h-3", title: "Company Attendance & Leave Approvals", category: "HR Command", href: "/hr", icon: Calendar, allowedRoles: ["HR", "FOUNDER", "ADMIN", "SUPER_ADMIN"] },

    // --- FOUNDER DOMAIN (Strictly confidential) ---
    { id: "f-1", title: "Financials, ARR & Burn Rate", category: "Founder Executive", href: "/founder", icon: Building2, allowedRoles: ["FOUNDER", "ADMIN", "SUPER_ADMIN"] },
    { id: "f-2", title: "Growth & Unit Economics", category: "Founder Executive", href: "/founder", icon: TrendingUp, allowedRoles: ["FOUNDER", "ADMIN", "SUPER_ADMIN"] },
    { id: "f-3", title: "Strategic Roadmap & Cap Table", category: "Founder Executive", href: "/founder", icon: Building2, allowedRoles: ["FOUNDER", "ADMIN", "SUPER_ADMIN"] },

    // --- COLLEGE PLACEMENT DOMAIN ---
    { id: "c-1", title: "Campus Placement Drives & CRM", category: "College Placements", href: "/colleges", icon: GraduationCap, allowedRoles: ["COLLEGE_ADMIN", "PLACEMENT_OFFICER", "ADMIN", "SUPER_ADMIN"] },

    // --- ADMIN DOMAIN ---
    { id: "a-1", title: "User Access & Role Assignments", category: "System Administration", href: "/admin/users", icon: ShieldCheck, allowedRoles: ["ADMIN", "SUPER_ADMIN"] },
    { id: "a-2", title: "Security Audit Logs & RBAC Compliance", category: "System Administration", href: "/admin/audit-logs", icon: ShieldCheck, allowedRoles: ["ADMIN", "SUPER_ADMIN"] }
  ];

  // Resolve user role
  const effectiveRole = role || (isSuperAdmin ? "SUPER_ADMIN" : isAdmin ? "ADMIN" : isFounder ? "FOUNDER" : isHR ? "HR" : isEmployee ? "EMPLOYEE" : isCollegeAdmin ? "COLLEGE_ADMIN" : "STUDENT");

  // Filter items matching user permissions
  const permittedItems = ALL_SEARCH_ITEMS.filter((item) =>
    item.allowedRoles.includes(effectiveRole)
  );

  const filteredItems = query.trim()
    ? permittedItems.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase())
      )
    : permittedItems;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 px-4">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search..."
            className="flex-1 text-sm bg-transparent border-none outline-none placeholder:text-slate-400 text-slate-800"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No matching tools or pages found for your role.
            </div>
          ) : (
            filteredItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-indigo-50 text-slate-500 group-hover:text-indigo-600 flex items-center justify-center transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                        {item.title}
                      </p>
                      <p className="text-[10px] text-slate-400">{item.category}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-300 font-mono group-hover:text-slate-500">
                    Enter
                  </span>
                </Link>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Active Role: <strong className="text-slate-700 font-mono">{effectiveRole}</strong></span>
          <span>Navigation is role-scoped</span>
        </div>
      </div>
    </div>
  );
}
