"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  CheckCircle2, 
  Clock, 
  ArrowLeft, 
  X, 
  ChevronRight, 
  Mail, 
  Phone, 
  GraduationCap, 
  Briefcase, 
  Sparkles, 
  Target, 
  Code2, 
  Layers, 
  ShieldCheck,
  Building2,
  RefreshCw
} from "lucide-react";
import { downloadUsersAsExcel, downloadUsersAsCsv } from "@/lib/excel-export";

interface AdminUserDossier {
  id: string;
  name: string;
  email: string;
  phone?: string;
  institution?: string;
  age_band?: string;
  grade?: string;
  career_stage: string;
  primary_goal: string;
  onboarding_completed: boolean;
  interests?: Array<{
    id: string;
    name: string;
    category?: string;
    selfLevel?: number;
    effectiveLevel?: number;
  }>;
  is_admin: boolean;
  is_employer: boolean;
  is_suspended: boolean;
  created_at: string;
  points?: number;
  current_streak?: number;
  interviews_count?: number;
  avg_interview_score?: number;
  resumes_count?: number;
}

export default function AdminUsersDirectoryPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUserDossier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [onboardingFilter, setOnboardingFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<AdminUserDossier | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch = 
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.phone && u.phone.includes(searchQuery)) ||
        (u.primary_goal && u.primary_goal.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStage = 
        stageFilter === "all" || 
        u.career_stage?.toUpperCase() === stageFilter.toUpperCase();

      const matchesOnboarding = 
        onboardingFilter === "all" || 
        (onboardingFilter === "completed" && u.onboarding_completed) ||
        (onboardingFilter === "pending" && !u.onboarding_completed);

      return matchesSearch && matchesStage && matchesOnboarding;
    });
  }, [users, searchQuery, stageFilter, onboardingFilter]);

  const handleExport = (type: "excel" | "csv") => {
    if (type === "excel") {
      downloadUsersAsExcel(filteredUsers as any);
    } else {
      downloadUsersAsCsv(filteredUsers as any);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Page Header */}
      <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">
              <Users className="w-3.5 h-3.5 text-black" />
              <span>User Intelligence Directory</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
              Registered Users &amp; Onboarding Data
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600">
              Audit all user registrations, career targets, onboarding submissions, and selected technical tracks.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl border border-neutral-200 hover:border-black text-black text-xs font-bold transition-all flex items-center gap-1.5 bg-white"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => handleExport("excel")}
              className="px-3.5 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Excel</span>
            </button>
            <button
              onClick={() => handleExport("csv")}
              className="px-3.5 py-2 rounded-xl border border-neutral-200 hover:border-black text-black text-xs font-bold transition-all flex items-center gap-1.5 bg-white"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mt-6 pt-6 border-t border-neutral-100">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, phone, or goal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-black text-xs font-medium text-black placeholder:text-neutral-400 bg-white"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-black text-xs font-bold text-black bg-white cursor-pointer"
            >
              <option value="all">All Career Stages</option>
              <option value="STUDENT">Students Only</option>
              <option value="PROFESSIONAL">Professionals Only</option>
              <option value="EMPLOYER">Employers</option>
              <option value="ADMIN">Administrators</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={onboardingFilter}
              onChange={(e) => setOnboardingFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-black text-xs font-bold text-black bg-white cursor-pointer"
            >
              <option value="all">All Onboarding Statuses</option>
              <option value="completed">Onboarding Completed</option>
              <option value="pending">Onboarding Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Count Summary */}
      <div className="flex items-center justify-between text-xs text-neutral-500 font-mono px-2">
        <span>Showing {filteredUsers.length} of {users.length} registered users</span>
        <span>Operating HQ: Hyderabad, Telangana</span>
      </div>

      {/* Users Table / List */}
      <div className="bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="text-center py-24 space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin text-black mx-auto" />
            <p className="text-xs font-mono text-neutral-500">Loading user records from database...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-24 space-y-3">
            <Users className="w-10 h-10 text-neutral-300 mx-auto" />
            <p className="text-sm font-bold text-black">No users matched your search criteria.</p>
            <p className="text-xs text-neutral-500">Try adjusting your search terms or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/70 text-neutral-600 font-mono text-[11px] uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-bold">User Identity</th>
                  <th className="py-3.5 px-4 font-bold">Stage &amp; Role</th>
                  <th className="py-3.5 px-4 font-bold">Onboarding Status</th>
                  <th className="py-3.5 px-4 font-bold">Primary Goal</th>
                  <th className="py-3.5 px-4 font-bold">Tech Tracks</th>
                  <th className="py-3.5 px-4 font-bold">Signed Up</th>
                  <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredUsers.map((u) => {
                  const initials = (u.name || "U")
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase();

                  return (
                    <tr 
                      key={u.id}
                      className="hover:bg-neutral-50/80 transition-colors group cursor-pointer"
                      onClick={() => setSelectedUser(u)}
                    >
                      {/* Name & Email */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-black text-white font-black text-xs flex items-center justify-center shrink-0">
                            {initials}
                          </div>
                          <div>
                            <div className="font-extrabold text-black text-sm group-hover:underline">
                              {u.name}
                            </div>
                            <div className="text-neutral-500 text-[11px] font-mono flex items-center gap-1">
                              <Mail className="w-3 h-3 text-neutral-400" />
                              <span>{u.email}</span>
                            </div>
                            {u.phone && (
                              <div className="text-neutral-500 text-[10px] font-mono flex items-center gap-1 mt-0.5">
                                <Phone className="w-2.5 h-2.5 text-neutral-400" />
                                <span>{u.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Career Stage & Role */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-neutral-100 border border-neutral-200 text-black">
                            {u.career_stage || "STUDENT"}
                          </span>
                          {u.institution && (
                            <div className="text-[10px] text-neutral-500 truncate max-w-[140px]" title={u.institution}>
                              {u.institution}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Onboarding Status */}
                      <td className="py-3.5 px-4">
                        {u.onboarding_completed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Completed</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Pending</span>
                          </span>
                        )}
                      </td>

                      {/* Primary Goal */}
                      <td className="py-3.5 px-4 max-w-[220px]">
                        <span className="font-medium text-neutral-800 line-clamp-2 text-xs" title={u.primary_goal}>
                          {u.primary_goal || "Campus Placements & Technical Mastery"}
                        </span>
                      </td>

                      {/* Tech Tracks */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {u.interests && u.interests.length > 0 ? (
                            u.interests.slice(0, 2).map((item, idx) => (
                              <span 
                                key={idx}
                                className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-neutral-100 text-neutral-700 border border-neutral-200"
                              >
                                {item.name || item.id}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-neutral-400 font-mono">None specified</span>
                          )}
                          {u.interests && u.interests.length > 2 && (
                            <span className="text-[10px] text-neutral-400 font-mono">
                              +{u.interests.length - 2} more
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Signed Up */}
                      <td className="py-3.5 px-4 text-neutral-500 font-mono text-[11px] whitespace-nowrap">
                        {new Date(u.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUser(u);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-black hover:text-white text-black font-bold text-xs transition-colors inline-flex items-center gap-1"
                        >
                          <span>Dossier</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Interactive User Onboarding Dossier Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="bg-white border border-neutral-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-neutral-200 pb-5">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-black text-white font-black text-base flex items-center justify-center shrink-0">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-black">{selectedUser.name}</h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-neutral-100 border border-neutral-200 text-black">
                      {selectedUser.career_stage}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 font-mono">{selectedUser.email}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 rounded-xl text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dossier Body */}
            <div className="space-y-5 text-xs">
              
              {/* Onboarding Status Badge Card */}
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
                    Onboarding Verification
                  </span>
                  <div className="text-sm font-extrabold text-black mt-0.5">
                    {selectedUser.onboarding_completed ? "Fully Completed" : "Pending Onboarding Setup"}
                  </div>
                </div>
                {selectedUser.onboarding_completed ? (
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Verified</span>
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-700" />
                    <span>Action Required</span>
                  </span>
                )}
              </div>

              {/* Primary Goal */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-black" />
                  <span>Primary Career Target</span>
                </span>
                <div className="p-3.5 rounded-xl bg-white border border-neutral-200 text-black font-semibold text-sm leading-relaxed">
                  {selectedUser.primary_goal || "No specific goal selected during signup."}
                </div>
              </div>

              {/* Selected Tech Tracks & Skill Self-Assessment */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-black" />
                  <span>Enrolled Tech Tracks &amp; Skill Levels</span>
                </span>
                
                {selectedUser.interests && selectedUser.interests.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {selectedUser.interests.map((track, idx) => (
                      <div key={idx} className="p-3 rounded-xl border border-neutral-200 bg-neutral-50 space-y-1">
                        <div className="flex items-center justify-between font-bold text-black text-xs">
                          <span>{track.name || track.id}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-white border border-neutral-300 rounded">
                            Level {track.selfLevel || 1} / 5
                          </span>
                        </div>
                        <div className="text-[10px] text-neutral-500">{track.category || "Engineering Focus"}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-500 font-mono text-[11px]">
                    No custom technical tracks selected yet.
                  </div>
                )}
              </div>

              {/* User Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl border border-neutral-200 bg-white">
                  <span className="text-[10px] text-neutral-500 font-bold uppercase block">Phone Contact</span>
                  <span className="text-xs font-mono font-bold text-black">{selectedUser.phone || "Not provided"}</span>
                </div>
                <div className="p-3 rounded-xl border border-neutral-200 bg-white">
                  <span className="text-[10px] text-neutral-500 font-bold uppercase block">Age Band Consent</span>
                  <span className="text-xs font-mono font-bold text-black">{selectedUser.age_band || "18+"}</span>
                </div>
                <div className="p-3 rounded-xl border border-neutral-200 bg-white">
                  <span className="text-[10px] text-neutral-500 font-bold uppercase block">Campus / College</span>
                  <span className="text-xs font-medium text-black truncate block">{selectedUser.institution || "Independent"}</span>
                </div>
              </div>

              {/* Account Standing */}
              <div className="pt-2 text-[11px] text-neutral-500 font-mono flex items-center justify-between">
                <span>Account ID: {selectedUser.id}</span>
                <span>Registered: {new Date(selectedUser.created_at).toLocaleString()}</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-4 border-t border-neutral-200">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-5 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold text-xs"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
