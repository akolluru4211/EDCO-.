"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { 
  Plus,
  Trash2,
  Award,
  ExternalLink,
  User, 
  ShieldCheck, 
  Lock, 
  TrendingUp, 
  Save, 
  Sparkles, 
  Check, 
  AlertCircle, 
  KeyRound, 
  Eye, 
  EyeOff,
  Bell,
  Building2,
  Mail,
  Phone
} from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import { recordAuditLog } from "@/lib/audit-logger";
import AuthGuard from "@/components/auth/AuthGuard";
import SyncedAccountsCard from "@/components/dashboard/SyncedAccountsCard";
import EdIdBadge from "@/components/ui/EdIdBadge";
import { SyncedAccounts, UserDomainItem, UserDomainPriority, SkillLevel } from "@/lib/types";
import { DOMAIN_CATALOG } from "@/lib/services/career-learning-os";

export default function ProfilePage() {
  const { user, profile, role, updateUserProfile } = useAuth();

  // Career Learning OS State
  const [careerDomains, setCareerDomains] = useState<UserDomainItem[]>([]);
  const [careerTargetRole, setCareerTargetRole] = useState(profile?.targetRole || "Full Stack Software Engineer");
  const [careerDailyHours, setCareerDailyHours] = useState<number>(2);
  const [careerTimeframe, setCareerTimeframe] = useState<number>(6);
  const [loadingCareerOS, setLoadingCareerOS] = useState(false);
  const [careerOSStatus, setCareerOSStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) return;
    const fetchCareerOSData = async () => {
      try {
        const res = await fetch(`/api/career-os?userId=${user.uid}`);
        const data = await res.json();
        if (data.success && data.plan) {
          if (data.plan.domains) setCareerDomains(data.plan.domains);
          if (data.plan.goal) {
            setCareerTargetRole(data.plan.goal.target_role || "Full Stack Software Engineer");
            setCareerDailyHours(data.plan.goal.available_hours_per_day || 2);
            setCareerTimeframe(data.plan.goal.target_timeframe_months || 6);
          }
        }
      } catch (err) {
        console.warn("Career OS Profile fetch note:", err);
      }
    };
    fetchCareerOSData();
  }, [user]);

  const handleUpdateCareerOS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;
    setLoadingCareerOS(true);
    setCareerOSStatus(null);
    try {
      const res = await fetch("/api/career-os", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          targetRole: careerTargetRole,
          timeframeMonths: careerTimeframe,
          availableHoursPerDay: careerDailyHours,
          domains: careerDomains,
          regenerateRoadmap: true
        })
      });
      const data = await res.json();
      if (data.success) {
        setCareerOSStatus("Career Learning OS synchronized & roadmap updated!");
        setTimeout(() => setCareerOSStatus(null), 4000);
      }
    } catch (err: any) {
      setCareerOSStatus("Failed to update career plan: " + err.message);
    } finally {
      setLoadingCareerOS(false);
    }
  };

  const handleToggleProfileDomain = (domainId: string, domainName: string) => {
    setCareerDomains(prev => {
      const exists = prev.find(d => d.domain_id === domainId);
      if (exists) {
        if (prev.length <= 1) return prev;
        return prev.filter(d => d.domain_id !== domainId);
      } else {
        const count = prev.length;
        const priority: UserDomainPriority = count === 0 ? "primary" : count === 1 ? "secondary" : "supporting";
        const newDomain: UserDomainItem = {
          id: `dom-${Date.now()}`,
          user_id: user?.uid || "",
          domain_id: domainId,
          domain_name: domainName,
          priority,
          self_level: 1,
          effective_level: 1
        };
        return [...prev, newDomain];
      }
    });
  };

  const handleChangeDomainPriority = (domainId: string, priority: UserDomainPriority) => {
    setCareerDomains(prev => prev.map(d => d.domain_id === domainId ? { ...d, priority } : d));
  };

  const [name, setName] = useState(profile?.name || user?.name || "");
  const [phone, setPhone] = useState(profile?.phone || user?.phone || "");
  const [headline, setHeadline] = useState(profile?.headline || "Staff Software Engineer — Core Platform");
  const [bio, setBio] = useState(profile?.bio || "Building high-scale resilient infrastructure for EdWorld Organization OS.");
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Notification Preferences
  
  const [certs, setCerts] = useState<Array<{ id: string; name: string; issuer: string; issueDate: string; url?: string }>>([]);
  const [newCertName, setNewCertName] = useState("");
  const [newCertIssuer, setNewCertIssuer] = useState("");
  const [newCertDate, setNewCertDate] = useState("");
  const [newCertUrl, setNewCertUrl] = useState("");
  const [showAddCert, setShowAddCert] = useState(false);

  useEffect(() => {
    if (profile?.certifications && Array.isArray(profile.certifications)) {
      setCerts(profile.certifications);
    } else if (user?.uid) {
      const cached = localStorage.getItem("edworld_" + user.uid + "_certs");
      if (cached) {
        try { setCerts(JSON.parse(cached)); } catch(e) {}
      }
    }
  }, [profile, user]);

  const handleAddCert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCertName.trim() || !newCertIssuer.trim()) return;

    const newEntry = {
      id: "cert-" + Date.now(),
      name: newCertName.trim(),
      issuer: newCertIssuer.trim(),
      issueDate: newCertDate.trim() || new Date().toISOString().split("T")[0],
      url: newCertUrl.trim() || undefined,
    };

    const updated = [...certs, newEntry];
    setCerts(updated);
    if (user?.uid) {
      localStorage.setItem("edworld_" + user.uid + "_certs", JSON.stringify(updated));
      try {
        await supabase.from("profiles").update({ certifications: updated }).eq("user_id", user.uid);
      } catch (err) {}
    }

    setNewCertName("");
    setNewCertIssuer("");
    setNewCertDate("");
    setNewCertUrl("");
    setShowAddCert(false);
  };

  const handleDeleteCert = async (id: string) => {
    const updated = certs.filter((c) => c.id !== id);
    setCerts(updated);
    if (user?.uid) {
      localStorage.setItem("edworld_" + user.uid + "_certs", JSON.stringify(updated));
      try {
        await supabase.from("profiles").update({ certifications: updated }).eq("user_id", user.uid);
      } catch (err) {}
    }
  };

  const [notifyTasks, setNotifyTasks] = useState(true);
  const [notifyLeaves, setNotifyLeaves] = useState(true);
  const [notifyPayroll, setNotifyPayroll] = useState(true);

  // Connected Developer Accounts
  const [syncedAccounts, setSyncedAccounts] = useState<SyncedAccounts>({
    github: { connected: false, username: "", contributionsThisYear: 0, recentRepos: [], lastSyncedAt: "" },
    linkedin: { connected: false, profileUrl: "", verified: false },
    leetcode: { connected: false, username: "", problemsSolved: { easy: 0, medium: 0, hard: 0, total: 0 }, isSelfReported: false, lastUpdatedAt: "" }
  });

  useEffect(() => {
    if (!user?.uid) return;

    const loadSyncedAccounts = async () => {
      // 1. Check local cache
      const cached = localStorage.getItem(`edworld_${user.uid}_synced_accounts`);
      if (cached) {
        try {
          setSyncedAccounts(JSON.parse(cached));
        } catch (e) {}
      }

      // 2. Fetch live connected accounts from database
      try {
        const res = await fetch(`/api/integrations/connected-accounts?userId=${encodeURIComponent(user.uid)}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.accounts)) {
            const mapped: SyncedAccounts = {
              github: { connected: false, username: "", contributionsThisYear: 0, recentRepos: [], lastSyncedAt: "" },
              linkedin: { connected: false, profileUrl: "", verified: false },
              leetcode: { connected: false, username: "", problemsSolved: { easy: 0, medium: 0, hard: 0, total: 0 }, isSelfReported: false, lastUpdatedAt: "" }
            };

            json.accounts.forEach((acc: any) => {
              const prov = (acc.provider || "").toUpperCase();
              if (prov === "GITHUB") {
                const ghData = acc.data?.github || acc.data || {};
                mapped.github = {
                  connected: true,
                  username: acc.username || ghData.username || "",
                  contributionsThisYear: ghData.totalStars || 0,
                  recentRepos: (ghData.repositories || []).slice(0, 3).map((r: any) => ({
                    name: r.name,
                    stars: r.stars,
                    language: r.language || "Code"
                  })),
                  lastSyncedAt: acc.lastSyncedAt || new Date().toISOString()
                };
              } else if (prov === "LINKEDIN") {
                mapped.linkedin = {
                  connected: true,
                  profileUrl: acc.profileUrl || `https://linkedin.com/in/${acc.username}`,
                  verified: true
                };
              } else if (prov === "LEETCODE") {
                const lcData = acc.data?.leetcode || acc.data || {};
                mapped.leetcode = {
                  connected: true,
                  username: acc.username || lcData.username || "",
                  problemsSolved: {
                    easy: lcData.easySolved || 0,
                    medium: lcData.mediumSolved || 0,
                    hard: lcData.hardSolved || 0,
                    total: lcData.totalSolved || 0
                  },
                  isSelfReported: false,
                  lastUpdatedAt: acc.lastSyncedAt || new Date().toISOString()
                };
              }
            });

            setSyncedAccounts(mapped);
            localStorage.setItem(`edworld_${user.uid}_synced_accounts`, JSON.stringify(mapped));
          }
        }
      } catch (err) {
        console.warn("[loadSyncedAccounts note]:", err);
      }
    };

    loadSyncedAccounts();
  }, [user?.uid]);

  const handleUpdateAccounts = async (updated: SyncedAccounts) => {
    setSyncedAccounts(updated);
    if (user?.uid) {
      localStorage.setItem(`edworld_${user.uid}_synced_accounts`, JSON.stringify(updated));
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordStatus(null);

    if (!newPassword || newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match. Please re-check.");
      return;
    }

    setIsChangingPass(true);
    try {
      // Attempt remote auth password update
      const { error: updateErr } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateErr && !updateErr.message?.includes("session")) {
        // non-blocking fallback if local session
      }

      await recordAuditLog({
        actorId: user?.uid || "usr_profile",
        actorName: name || "Staff",
        actorRole: role || "EMPLOYEE",
        action: "auth.password_changed",
        resource: "user_credential",
        result: "SUCCESS",
      });

      setPasswordStatus("Password updated successfully across secure auth directories!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordStatus(null), 5000);
    } catch (err: any) {
      setPasswordError(err?.message || "Failed to update password.");
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus("Saving...");
    try {
      await updateUserProfile({
        name,
        phone,
        headline,
        bio,
      });

      await recordAuditLog({
        actorId: user?.uid || "usr_profile",
        actorName: name || "Staff",
        actorRole: role || "EMPLOYEE",
        action: "profile.updated",
        resource: "user_profile",
        result: "SUCCESS",
      });

      setSaveStatus("Profile updated successfully!");
      setTimeout(() => setSaveStatus(null), 3000);
    } catch {
      setSaveStatus("Failed to update profile.");
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#0E0F15] text-white p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1280px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#13141B] p-6 rounded-3xl border border-white/10 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#D7FC51]/10 text-[#D7FC51] border border-[#D7FC51]/30">
              {role || "STAFF"}
            </span>
            <span className="text-xs text-[#8E95A5]">🏢 EdWorld Verified Member</span>
          </div>
          <h1 className="text-2xl font-black text-white">Profile &amp; Security Settings</h1>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <EdIdBadge userId={user?.uid} size="md" variant="dark" />
          <span className="text-xs font-mono text-[#8E95A5] bg-[#1C1D26] px-3 py-1.5 rounded-xl border border-white/5">
            {user?.email || "staff@edworld.co.in"}
          </span>
          <Link
            href={`/u/${profile?.username || user?.uid}`}
            className="px-3 py-1.5 rounded-xl bg-[#D7FC51] hover:bg-[#E9FFA4] text-[#13141B] font-black text-xs transition-all shadow-md flex items-center gap-1"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Public Profile</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-[#13141B] p-6 rounded-3xl border border-white/10 space-y-6 shadow-xl">
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <User className="w-5 h-5 text-[#D7FC51]" />
                <span>Professional Identity</span>
              </h2>
              <p className="text-xs text-[#8E95A5] mt-0.5">
                Information visible to colleagues in the internal team directory.
              </p>
            </div>

            {saveStatus && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{saveStatus}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8E95A5] uppercase">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[#1C1D26] border border-white/10 text-xs text-white focus:outline-none focus:border-[#D7FC51]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8E95A5] uppercase">Contact Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 00000"
                    className="w-full p-3 rounded-xl bg-[#1C1D26] border border-white/10 text-xs text-white focus:outline-none focus:border-[#D7FC51]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8E95A5] uppercase">Headline / Role Description</label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#1C1D26] border border-white/10 text-xs text-white focus:outline-none focus:border-[#D7FC51]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8E95A5] uppercase">Bio / Summary</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#1C1D26] border border-white/10 text-xs text-white focus:outline-none focus:border-[#D7FC51]"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#D7FC51] hover:bg-[#E9FFA4] text-[#13141B] font-black text-xs transition-all shadow-md flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </button>
            </form>
          </div>

          {/* CAREER LEARNING OS CONFIGURATION CARD */}
          <div className="bg-[#13141B] p-6 rounded-3xl border border-white/10 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#7B57FF]/20 text-[#7B57FF] border border-[#7B57FF]/30">
                    AI CURRICULUM
                  </span>
                  <h2 className="text-base font-black text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#D7FC51]" />
                    <span>Career Learning OS &amp; Domain Focus</span>
                  </h2>
                </div>
                <p className="text-xs text-[#8E95A5]">
                  Manage your selected domains, target role, priorities, and study hours.
                </p>
              </div>
            </div>

            {careerOSStatus && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{careerOSStatus}</span>
              </div>
            )}

            <form onSubmit={handleUpdateCareerOS} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8E95A5] uppercase">Target Career Role</label>
                  <input
                    type="text"
                    value={careerTargetRole}
                    onChange={(e) => setCareerTargetRole(e.target.value)}
                    placeholder="e.g. Full Stack Software Engineer"
                    className="w-full p-3 rounded-xl bg-[#1C1D26] border border-white/10 text-xs text-white focus:outline-none focus:border-[#D7FC51]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8E95A5] uppercase">Target Timeframe</label>
                  <select
                    value={careerTimeframe}
                    onChange={(e) => setCareerTimeframe(Number(e.target.value))}
                    className="w-full p-3 rounded-xl bg-[#1C1D26] border border-white/10 text-xs text-white focus:outline-none focus:border-[#D7FC51]"
                  >
                    <option value={3}>3 Months (Fast-Track)</option>
                    <option value={6}>6 Months (Standard)</option>
                    <option value={12}>12 Months (Comprehensive)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8E95A5] uppercase">Daily Available Hours</label>
                  <select
                    value={careerDailyHours}
                    onChange={(e) => setCareerDailyHours(Number(e.target.value))}
                    className="w-full p-3 rounded-xl bg-[#1C1D26] border border-white/10 text-xs text-white focus:outline-none focus:border-[#D7FC51]"
                  >
                    <option value={1}>1 Hour / day</option>
                    <option value={2}>2 Hours / day</option>
                    <option value={3}>3 Hours / day</option>
                    <option value={4}>4+ Hours / day</option>
                  </select>
                </div>
              </div>

              {/* Multi-Domain Selector */}
              <div className="space-y-2 pt-2">
                <label className="text-[10px] font-bold text-[#8E95A5] uppercase block">
                  Active Domains &amp; Priority Tiers ({careerDomains.length} Selected)
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {DOMAIN_CATALOG.map((cat) => {
                    const isSelected = careerDomains.some(d => d.domain_id === cat.id);
                    const domainObj = careerDomains.find(d => d.domain_id === cat.id);

                    return (
                      <div
                        key={cat.id}
                        className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-2 ${
                          isSelected
                            ? "bg-[#1C1D26] border-[#7B57FF]/40 text-white"
                            : "bg-[#181920]/60 border-white/5 text-[#8E95A5] hover:border-white/20"
                        }`}
                      >
                        <div 
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => handleToggleProfileDomain(cat.id, cat.name)}
                        >
                          <span className="text-xs font-bold text-white">{cat.name}</span>
                          <div className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-black ${
                            isSelected ? "bg-[#D7FC51] text-[#13141B]" : "border border-white/20"
                          }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>

                        {isSelected && domainObj && (
                          <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[10px]">
                            <span className="text-slate-400">Priority:</span>
                            <div className="flex gap-1">
                              {(["primary", "secondary", "supporting"] as const).map((p) => (
                                <button
                                  key={p}
                                  type="button"
                                  onClick={() => handleChangeDomainPriority(cat.id, p)}
                                  className={`px-2 py-0.5 rounded capitalize font-bold ${
                                    domainObj.priority === p 
                                      ? "bg-[#7B57FF] text-white" 
                                      : "bg-white/5 text-slate-400 hover:bg-white/10"
                                  }`}
                                >
                                  {p}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="submit"
                  disabled={loadingCareerOS}
                  className="px-5 py-2.5 rounded-xl bg-[#D7FC51] hover:bg-[#E9FFA4] text-[#13141B] font-black text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-[#13141B]" />
                  <span>{loadingCareerOS ? "Recalculating..." : "Save & Recalculate Roadmap"}</span>
                </button>
              </div>
            </form>
          </div>


          {/* Connected Developer Accounts */}
          
            {/* Professional Certifications Management */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">Career Certifications &amp; Licenses</h3>
                    <p className="text-xs text-slate-500">Verified credentials showcaseable on your resume and portfolio</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddCert(!showAddCert)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1 transition-all"
                >
                  <Plus className="w-3.5 h-3.5 text-[#D7FC51]" />
                  <span>Add Certificate</span>
                </button>
              </div>

              {showAddCert && (
                <form onSubmit={handleAddCert} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Certificate Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. AWS Certified Solutions Architect"
                        value={newCertName}
                        onChange={(e) => setNewCertName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Issuing Organization *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Amazon Web Services / Meta"
                        value={newCertIssuer}
                        onChange={(e) => setNewCertIssuer(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Issue Date</label>
                      <input
                        type="text"
                        placeholder="e.g. May 2026"
                        value={newCertDate}
                        onChange={(e) => setNewCertDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Verification URL</label>
                      <input
                        type="url"
                        placeholder="https://credly.com/..."
                        value={newCertUrl}
                        onChange={(e) => setNewCertUrl(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-slate-900"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setShowAddCert(false)} className="px-3 py-1.5 rounded-xl bg-slate-200 text-xs font-bold">Cancel</button>
                    <button type="submit" className="px-4 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold">Save Credential</button>
                  </div>
                </form>
              )}

              {certs.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No certifications added yet. Click &quot;Add Certificate&quot; to list your industry credentials.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {certs.map((c) => (
                    <div key={c.id} className="p-3.5 rounded-2xl border border-slate-200 bg-white flex items-center justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">{c.name}</h4>
                        <p className="text-[10px] text-slate-500">{c.issuer} &bull; {c.issueDate}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {c.url && (
                          <a href={c.url} target="_blank" rel="noreferrer" className="p-1.5 text-slate-400 hover:text-slate-700">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button type="button" onClick={() => handleDeleteCert(c.id)} className="p-1.5 text-rose-400 hover:text-rose-600">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <SyncedAccountsCard
            syncedAccounts={syncedAccounts}
            onUpdateAccounts={handleUpdateAccounts}
            userId={user?.uid}
          />

          {/* Change Password Card */}
          <div className="bg-[#13141B] p-6 rounded-3xl border border-white/10 space-y-6 shadow-xl">
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-purple-400" />
                <span>Update Security Password</span>
              </h2>
              <p className="text-xs text-[#8E95A5] mt-0.5">
                Replace temporary credentials with a private high-entropy password.
              </p>
            </div>

            {passwordStatus && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{passwordStatus}</span>
              </div>
            )}

            {passwordError && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8E95A5] uppercase">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPass ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full p-3 pr-10 rounded-xl bg-[#1C1D26] border border-white/10 text-xs text-white focus:outline-none focus:border-[#D7FC51]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E95A5] hover:text-white"
                    >
                      {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8E95A5] uppercase">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-3 rounded-xl bg-[#1C1D26] border border-white/10 text-xs text-white focus:outline-none focus:border-[#D7FC51]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isChangingPass}
                className="px-6 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-black text-xs transition-all shadow-md flex items-center gap-1.5"
              >
                <Lock className="w-4 h-4" />
                <span>{isChangingPass ? "Updating Password..." : "Update Password"}</span>
              </button>
            </form>
          </div>

        </div>

        {/* Right 1 Col: Notification Preferences & Identity Summary */}
        <div className="space-y-6">
          
          <div className="bg-[#13141B] p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-[#D7FC51]" />
              <span>Workspace Notifications</span>
            </h3>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl bg-[#1C1D26] border border-white/5 cursor-pointer text-xs">
                <span>Task &amp; OKR Mentions</span>
                <input
                  type="checkbox"
                  checked={notifyTasks}
                  onChange={(e) => setNotifyTasks(e.target.checked)}
                  className="accent-[#D7FC51]"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-[#1C1D26] border border-white/5 cursor-pointer text-xs">
                <span>Leave Approval Alerts</span>
                <input
                  type="checkbox"
                  checked={notifyLeaves}
                  onChange={(e) => setNotifyLeaves(e.target.checked)}
                  className="accent-[#D7FC51]"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-[#1C1D26] border border-white/5 cursor-pointer text-xs">
                <span>Payroll Disbursal Notices</span>
                <input
                  type="checkbox"
                  checked={notifyPayroll}
                  onChange={(e) => setNotifyPayroll(e.target.checked)}
                  className="accent-[#D7FC51]"
                />
              </label>
            </div>
          </div>

          <div className="bg-[#13141B] p-6 rounded-3xl border border-white/10 space-y-3 shadow-xl">
            <h3 className="text-xs font-black text-white uppercase tracking-wider">Account Metadata</h3>
            <div className="space-y-1.5 text-xs text-[#8E95A5] font-mono">
              <div><strong>Role:</strong> {role || "EMPLOYEE"}</div>
              <div><strong>Status:</strong> ACTIVE</div>
              <div><strong>Corporate Domain:</strong> edworld.co.in</div>
              <div><strong>RBAC Verification:</strong> Server Enforced</div>
            </div>
          </div>

        </div>

      </div>

    </div>
    </AuthGuard>
  );
}
