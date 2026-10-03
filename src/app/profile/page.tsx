"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, useMemo } from "react";
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
  Phone,
  GraduationCap,
  MapPin,
  CheckCircle2,
  Target,
  Layers,
  Globe
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { recordAuditLog } from "@/lib/audit-logger";
import AuthGuard from "@/components/auth/AuthGuard";
import SyncedAccountsCard from "@/components/dashboard/SyncedAccountsCard";
import EdworldDigitalIdCard from "@/components/ui/EdworldDigitalIdCard";
import { SyncedAccounts, UserDomainItem, UserDomainPriority, SkillLevel } from "@/lib/types";
import { DOMAIN_CATALOG } from "@/lib/services/career-learning-os";

export default function ProfilePage() {
  const { user, profile, role, updateUserProfile } = useAuth();

  // Basic Profile State
  const [name, setName] = useState(profile?.name || user?.name || "");
  const [headline, setHeadline] = useState(profile?.headline || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [location, setLocation] = useState((profile as any)?.location || "");
  const [college, setCollege] = useState(profile?.institution || (profile as any)?.college || "");
  const [company, setCompany] = useState(profile?.current_company || (profile as any)?.company || "");
  const [isPublic, setIsPublic] = useState<boolean>(profile?.isPublic !== false);
  const [showBirthdayToConnections, setShowBirthdayToConnections] = useState<boolean>(Boolean((profile as any)?.show_birthday_to_connections));
  const [saveState, setSaveState] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);

  // Sync state with auth context on initial load
  useEffect(() => {
    if (profile) {
      if (profile.name) setName(profile.name);
      if (profile.headline) setHeadline(profile.headline);
      if (profile.bio) setBio(profile.bio);
      if (profile.phone) setPhone(profile.phone);
      if ((profile as any).location) setLocation((profile as any).location);
      if (profile.institution || (profile as any).college) setCollege(profile.institution || (profile as any).college);
      if (profile.current_company || (profile as any).company) setCompany(profile.current_company || (profile as any).company);
      if (profile.isPublic !== undefined) setIsPublic(profile.isPublic);
      if ((profile as any).show_birthday_to_connections !== undefined) setShowBirthdayToConnections(Boolean((profile as any).show_birthday_to_connections));
    } else if (user) {
      if (user.name) setName(user.name);
    }
  }, [profile, user]);

  // Career Goals State
  const [careerDomains, setCareerDomains] = useState<UserDomainItem[]>([]);
  const [careerTargetRole, setCareerTargetRole] = useState(profile?.targetRole || "Full Stack Software Engineer");
  const [careerDailyHours, setCareerDailyHours] = useState<number>(2);
  const [careerTimeframe, setCareerTimeframe] = useState<number>(6);
  const [loadingCareerOS, setLoadingCareerOS] = useState(false);
  const [careerOSStatus, setCareerOSStatus] = useState<string | null>(null);

  // Certifications State
  const [certs, setCerts] = useState<any[]>([]);
  const [showAddCert, setShowAddCert] = useState(false);
  const [newCertName, setNewCertName] = useState("");
  const [newCertIssuer, setNewCertIssuer] = useState("");
  const [newCertDate, setNewCertDate] = useState("");
  const [newCertUrl, setNewCertUrl] = useState("");

  // Synced Accounts State
  const [syncedAccounts, setSyncedAccounts] = useState<SyncedAccounts>({});

  // Password Update State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Notifications State
  const [notifyTasks, setNotifyTasks] = useState(true);
  const [notifyLeaves, setNotifyLeaves] = useState(true);
  const [notifyPayroll, setNotifyPayroll] = useState(true);

  // 1. Fetch Career OS Data
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

  // 2. Fetch Certifications
  useEffect(() => {
    if (!user?.uid) return;
    const fetchCerts = async () => {
      try {
        const { data } = await supabase
          .from("certifications")
          .select("*")
          .eq("user_id", user.uid)
          .order("created_at", { ascending: false });
        if (data) setCerts(data);
      } catch (e) {
        console.warn("Certs fetch note:", e);
      }
    };
    fetchCerts();
  }, [user?.uid]);

  // 3. Fetch Synced Accounts
  useEffect(() => {
    if (!user?.uid) return;
    const loadSyncedAccounts = async () => {
      try {
        const cached = localStorage.getItem(`edworld_${user.uid}_synced_accounts`);
        if (cached) {
          setSyncedAccounts(JSON.parse(cached));
        }

        const res = await fetch(`/api/integrations/connected-accounts?userId=${user.uid}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            const mapped: SyncedAccounts = {};
            json.data.forEach((acc: any) => {
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

  // Deterministic Profile Strength Calculation
  const profileStrength = useMemo(() => {
    let score = 20; // base for authenticated account
    if (name && name.trim().length > 2) score += 20;
    if (headline && headline.trim().length > 3) score += 15;
    if (bio && bio.trim().length > 10) score += 15;
    if (careerTargetRole) score += 10;
    if (phone) score += 10;
    if (certs.length > 0) score += 10;
    return Math.min(score, 100);
  }, [name, headline, bio, careerTargetRole, phone, certs]);

  // Handle Save Profile
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveState("saving");
    setSaveErrorMessage(null);

    try {
      await updateUserProfile({
        name,
        phone,
        headline,
        bio,
      });

      // Also persist additional fields via authoritative API
      await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          headline,
          bio,
          isPublic,
          showBirthdayToConnections
        })
      });

      await recordAuditLog({
        actorId: user?.uid || "usr_profile",
        actorName: name || "Member",
        actorRole: role || "MEMBER",
        action: "profile.updated",
        resource: "user_profile",
        result: "SUCCESS",
      });

      setSaveState("success");
      setTimeout(() => setSaveState("idle"), 4000);
    } catch (err: any) {
      setSaveState("error");
      setSaveErrorMessage(err.message || "Failed to update profile. Please try again.");
    }
  };

  // Handle Update Career OS
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
        setCareerOSStatus("Career goals and study plan updated successfully.");
        setTimeout(() => setCareerOSStatus(null), 4000);
      }
    } catch (err: any) {
      setCareerOSStatus("Failed to update career goals: " + err.message);
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
    setCareerDomains(prev =>
      prev.map(d => (d.domain_id === domainId ? { ...d, priority } : d))
    );
  };

  // Add Certification Handler
  const handleAddCert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCertName.trim() || !newCertIssuer.trim() || !user?.uid) return;

    try {
      const newCert = {
        user_id: user.uid,
        name: newCertName.trim(),
        issuer: newCertIssuer.trim(),
        issue_date: newCertDate.trim(),
        url: newCertUrl.trim()
      };

      const { data, error } = await supabase
        .from("certifications")
        .insert(newCert)
        .select()
        .single();

      if (!error && data) {
        setCerts([data, ...certs]);
        setNewCertName("");
        setNewCertIssuer("");
        setNewCertDate("");
        setNewCertUrl("");
        setShowAddCert(false);
      }
    } catch (err) {
      console.error("Add cert error:", err);
    }
  };

  const handleDeleteCert = async (certId: string) => {
    try {
      await supabase.from("certifications").delete().eq("id", certId);
      setCerts(certs.filter(c => c.id !== certId));
    } catch (e) {
      console.error("Delete cert error:", e);
    }
  };

  const handleUpdateAccounts = async (updated: SyncedAccounts) => {
    setSyncedAccounts(updated);
    if (user?.uid) {
      localStorage.setItem(`edworld_${user.uid}_synced_accounts`, JSON.stringify(updated));
    }
  };

  // Handle Password Change
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
      const { error: updateErr } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateErr) {
        throw updateErr;
      }

      await recordAuditLog({
        actorId: user?.uid || "usr_profile",
        actorName: name || "Member",
        actorRole: role || "MEMBER",
        action: "auth.password_changed",
        resource: "user_credential",
        result: "SUCCESS",
      });

      setPasswordStatus("Your password was updated successfully.");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordStatus(null), 5000);
    } catch (err: any) {
      setPasswordError(err?.message || "Failed to update password.");
    } finally {
      setIsChangingPass(false);
    }
  };

  const displayName = name.trim() || profile?.name || user?.name || "Edworld Member";
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#FAF8F5] text-stone-900 p-4 sm:p-6 lg:p-8 xl:p-10 font-sans selection:bg-emerald-100 selection:text-emerald-900">
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
          
          {/* ========================================================================= */}
          {/* 1. PAGE HEADER: Human Profile Overview */}
          {/* ========================================================================= */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4 sm:gap-5">
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-tr from-emerald-700 to-teal-600 text-white font-serif font-bold text-2xl flex items-center justify-center shadow-sm shrink-0">
                {userInitial}
              </div>

              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight leading-tight">
                    {displayName}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200/80 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Member
                  </span>
                </div>

                <p className="text-xs sm:text-sm font-medium text-stone-600">
                  {headline || "Software Engineer & Platform Builder"}
                </p>

                <div className="flex items-center gap-3 text-xs text-stone-500 font-mono pt-0.5 flex-wrap">
                  <span>{user?.email}</span>
                  <span>&bull;</span>
                  <span className="text-emerald-800 font-semibold">{profile?.careerStage || "Career Track"}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 self-start md:self-auto shrink-0">
              {/* Profile Strength Indicator */}
              <div className="px-4 py-2 rounded-2xl bg-stone-50 border border-stone-200 text-left">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                  Profile Strength
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="w-20 bg-stone-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${profileStrength}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-stone-800 font-mono">{profileStrength}%</span>
                </div>
              </div>

              <Link
                href={`/u/${profile?.username || user?.uid}`}
                target="_blank"
                className="px-4 py-2.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Public Profile</span>
              </Link>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 2. EDWORLD DIGITAL IDENTITY CARD */}
          {/* ========================================================================= */}
          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div>
                <h2 className="text-base font-serif font-bold text-stone-900">
                  Edworld Digital Identity Card
                </h2>
                <p className="text-xs text-stone-500">
                  Your persistent, verifiable digital credential on the Edworld network.
                </p>
              </div>
            </div>

            <EdworldDigitalIdCard
              userId={user?.uid}
              name={displayName}
              headline={headline || "Software Engineer & Builder"}
              email={user?.email}
              username={profile?.username || user?.uid}
              college={college}
              organization={company}
              location={location}
              role={role}
              careerStage={profile?.careerStage}
              isPublic={isPublic}
            />
          </section>

          {/* Main Grid: Form & Integrations */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left 2 Columns: Identity & Goals */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* 3. PROFESSIONAL IDENTITY FORM */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200/80 shadow-xs space-y-6">
                <div className="border-b border-stone-100 pb-4">
                  <h2 className="text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-emerald-700" />
                    <span>Personal &amp; Professional Identity</span>
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">
                    Manage your public identity, display name, headline, and bio.
                  </p>
                </div>

                {saveState === "success" && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Profile information saved successfully.</span>
                  </div>
                )}

                {saveState === "error" && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{saveErrorMessage || "Failed to update profile. Please try again."}</span>
                  </div>
                )}

                <form onSubmit={handleSave} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Full Name</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Adarsh Kolluru"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Phone Number</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +91 98765 43210"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Professional Headline</label>
                    <input
                      type="text"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      placeholder="e.g. Full Stack Software Engineer & Distributed Systems Builder"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Professional Bio</label>
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Briefly describe your career focus, engineering background, and key accomplishments..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                    />
                  </div>

                  {/* Public Portfolio Visibility Toggle */}
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-stone-900 block">Public Portfolio Visibility</span>
                      <span className="text-[11px] text-stone-500">Allow employers and peers to view your public profile at /u/{profile?.username || "username"}</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600" />
                    </label>
                  </div>

                  {/* Connection Birthday Visibility Toggle */}
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-stone-900 block">Show Birthday to Accepted Connections</span>
                      <span className="text-[11px] text-stone-500">
                        Displays an upcoming birthday reminder (Month &amp; Day only) within 7 days to your connections. Your birth year and age are never shared.
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showBirthdayToConnections}
                        onChange={(e) => setShowBirthdayToConnections(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600" />
                    </label>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={saveState === "saving"}
                      className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>{saveState === "saving" ? "Saving..." : "Save Changes"}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* 4. CAREER DIRECTION & LEARNING GOALS */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200/80 shadow-xs space-y-6">
                <div className="border-b border-stone-100 pb-4">
                  <h2 className="text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
                    <Target className="w-5 h-5 text-emerald-700" />
                    <span>Career Direction &amp; Goals</span>
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">
                    Calibrate your target role and available learning hours for personalized AI drill recommendations.
                  </p>
                </div>

                {careerOSStatus && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>{careerOSStatus}</span>
                  </div>
                )}

                <form onSubmit={handleUpdateCareerOS} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Career Goal</label>
                      <input
                        type="text"
                        value={careerTargetRole}
                        onChange={(e) => setCareerTargetRole(e.target.value)}
                        placeholder="e.g. Full Stack Software Engineer"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Target Timeframe</label>
                      <select
                        value={careerTimeframe}
                        onChange={(e) => setCareerTimeframe(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                      >
                        <option value={3}>3 Months (Fast-Track)</option>
                        <option value={6}>6 Months (Standard)</option>
                        <option value={12}>12 Months (Comprehensive)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Time for Learning</label>
                      <select
                        value={careerDailyHours}
                        onChange={(e) => setCareerDailyHours(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                      >
                        <option value={1}>1 Hour / day</option>
                        <option value={2}>2 Hours / day</option>
                        <option value={3}>3 Hours / day</option>
                        <option value={4}>4+ Hours / day</option>
                      </select>
                    </div>
                  </div>

                  {/* Domain Focus Selector */}
                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                      Target Domains ({careerDomains.length} Selected)
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {DOMAIN_CATALOG.map((cat) => {
                        const isSelected = careerDomains.some(d => d.domain_id === cat.id);
                        return (
                          <div
                            key={cat.id}
                            onClick={() => handleToggleProfileDomain(cat.id, cat.name)}
                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? "bg-emerald-50 border-emerald-300 text-emerald-950 font-bold"
                                : "bg-stone-50 border-stone-200/80 text-stone-700 hover:border-stone-300"
                            }`}
                          >
                            <span className="text-xs">{cat.name}</span>
                            <div className={`w-4 h-4 rounded flex items-center justify-center text-xs ${
                              isSelected ? "bg-emerald-700 text-white" : "border border-stone-300"
                            }`}>
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={loadingCareerOS}
                      className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {loadingCareerOS ? "Saving Goals..." : "Save Career Goals"}
                    </button>
                  </div>
                </form>
              </div>

              {/* 5. CERTIFICATIONS & LICENSES */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200/80 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                  <div>
                    <h2 className="text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
                      <Award className="w-5 h-5 text-emerald-700" />
                      <span>Certifications &amp; Credentials</span>
                    </h2>
                    <p className="text-xs text-stone-500 mt-1">Verified licenses and technical credentials.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddCert(!showAddCert)}
                    className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Certificate</span>
                  </button>
                </div>

                {showAddCert && (
                  <form onSubmit={handleAddCert} className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Certificate Title *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. AWS Solutions Architect"
                          value={newCertName}
                          onChange={(e) => setNewCertName(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-stone-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Issuing Organization *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Amazon Web Services"
                          value={newCertIssuer}
                          onChange={(e) => setNewCertIssuer(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-stone-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Issue Date</label>
                        <input
                          type="text"
                          placeholder="e.g. May 2026"
                          value={newCertDate}
                          onChange={(e) => setNewCertDate(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-stone-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Verification URL</label>
                        <input
                          type="url"
                          placeholder="https://credly.com/..."
                          value={newCertUrl}
                          onChange={(e) => setNewCertUrl(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-stone-900"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAddCert(false)}
                        className="px-4 py-2 rounded-xl bg-stone-200 text-stone-700 text-xs font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold"
                      >
                        Save Credential
                      </button>
                    </div>
                  </form>
                )}

                {certs.length === 0 ? (
                  <p className="text-xs text-stone-500 italic">No certifications added yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {certs.map((c) => (
                      <div key={c.id} className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50 flex items-center justify-between gap-3">
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-stone-900">{c.name}</h4>
                          <p className="text-[11px] text-stone-500">{c.issuer} {c.issue_date ? `• ${c.issue_date}` : ""}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {c.url && (
                            <a href={c.url} target="_blank" rel="noreferrer" className="p-1.5 text-stone-400 hover:text-stone-700">
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

              {/* 6. CONNECTED ACCOUNTS */}
              <SyncedAccountsCard
                syncedAccounts={syncedAccounts}
                onUpdateAccounts={handleUpdateAccounts}
                userId={user?.uid}
              />

            </div>

            {/* Right 1 Column: Security & Preferences */}
            <div className="space-y-8">
              
              {/* 7. ACCOUNT & SECURITY SETTINGS */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200/80 shadow-xs space-y-6">
                <div className="border-b border-stone-100 pb-4">
                  <h3 className="text-base font-serif font-bold text-stone-900 flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-emerald-700" />
                    <span>Account &amp; Security</span>
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">Manage your sign-in credentials and security.</p>
                </div>

                {/* Email Verification Status */}
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase text-stone-500 block">Primary Email</span>
                    <span className="text-xs font-mono text-stone-900 truncate block">{user?.email}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200 flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Verified</span>
                  </span>
                </div>

                {/* Password Update Form */}
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold text-stone-900 block">Update Password</span>
                  
                  {passwordStatus && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{passwordStatus}</span>
                    </div>
                  )}

                  {passwordError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>{passwordError}</span>
                    </div>
                  )}

                  <form onSubmit={handleChangePassword} className="space-y-3">
                    <div className="relative">
                      <input
                        type={showNewPass ? "text" : "password"}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New Password (min 8 chars)"
                        className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-stone-300 text-xs text-stone-900 focus:ring-2 focus:ring-stone-900"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                      >
                        {showNewPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm New Password"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:ring-2 focus:ring-stone-900"
                    />

                    <button
                      type="submit"
                      disabled={isChangingPass}
                      className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                    >
                      {isChangingPass ? "Updating..." : "Update Password"}
                    </button>
                  </form>
                </div>
              </div>

              {/* 8. WORKSPACE NOTIFICATIONS */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200/80 shadow-xs space-y-4">
                <h3 className="text-base font-serif font-bold text-stone-900 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-emerald-700" />
                  <span>Notification Preferences</span>
                </h3>

                <div className="space-y-2.5">
                  <label className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200/60 cursor-pointer text-xs">
                    <span className="font-medium text-stone-800">Interview &amp; Feedback Alerts</span>
                    <input
                      type="checkbox"
                      checked={notifyTasks}
                      onChange={(e) => setNotifyTasks(e.target.checked)}
                      className="accent-emerald-600 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200/60 cursor-pointer text-xs">
                    <span className="font-medium text-stone-800">Mentor &amp; Peer Messages</span>
                    <input
                      type="checkbox"
                      checked={notifyLeaves}
                      onChange={(e) => setNotifyLeaves(e.target.checked)}
                      className="accent-emerald-600 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200/60 cursor-pointer text-xs">
                    <span className="font-medium text-stone-800">Job Match &amp; Application Updates</span>
                    <input
                      type="checkbox"
                      checked={notifyPayroll}
                      onChange={(e) => setNotifyPayroll(e.target.checked)}
                      className="accent-emerald-600 rounded"
                    />
                  </label>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </AuthGuard>
  );
}
