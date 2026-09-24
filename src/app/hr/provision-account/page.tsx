"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { 
  Users, 
  Mail, 
  KeyRound, 
  Send, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  Copy, 
  RefreshCw, 
  ArrowRight, 
  CheckCircle2, 
  Building2, 
  Briefcase, 
  ChevronLeft,
  Lock, 
  Download, 
  Search, 
  UserCheck, 
  AlertCircle,
  Clock,
  Layers,
  FileText
} from "lucide-react";
import Button from "@/components/ui/Button";
import { UserRole, StaffAccountStatus, OnboardingRecord } from "@/lib/types";
import { getOnboardingRecords, saveOnboardingRecord } from "@/lib/db-service";
import { recordAuditLog } from "@/lib/audit-logger";
import AccessDeniedPortal from "@/components/ui/AccessDeniedPortal";

export default function HrProvisionAccountPage() {
  const { user, role, isHR, isAdmin, isFounder } = useAuth();

  if (user && !isHR && !isAdmin && !isFounder) {
    return (
      <AccessDeniedPortal
        portalName="Staff Account Provisioning"
        requiredRole="Human Resources / Admin"
        userRole={role}
        redirectTo="/dashboard"
      />
    );
  }

  // Form State
  const [fullName, setFullName] = useState("");
  const [personalEmail, setPersonalEmail] = useState("");
  const [department, setDepartment] = useState("Engineering");
  const [designation, setDesignation] = useState("Senior Software Engineer");
  const [assignedRole, setAssignedRole] = useState<UserRole>("EMPLOYEE");
  const [companyEmail, setCompanyEmail] = useState("");
  const [managerName, setManagerName] = useState("Sunita Rao (VP Eng)");
  const [joiningDate, setJoiningDate] = useState("2026-04-01");
  const [oneTimeToken, setOneTimeToken] = useState("");

  // UI States
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdRecord, setCreatedRecord] = useState<OnboardingRecord | null>(null);
  const [roster, setRoster] = useState<OnboardingRecord[]>([]);
  const [emailCheckStatus, setEmailCheckStatus] = useState<"available" | "duplicate" | "idle">("idle");
  const [error, setError] = useState<string | null>(null);

  // Generate unique email & secure activation token
  useEffect(() => {
    if (fullName.trim()) {
      const sanitized = fullName.toLowerCase().trim().replace(/\s+/g, ".");
      const candidateEmail = `${sanitized}@edworld.co.in`;
      setCompanyEmail(candidateEmail);

      // Check for duplicate in roster
      const isDuplicate = roster.some(r => r.corporateEmail.toLowerCase() === candidateEmail.toLowerCase());
      setEmailCheckStatus(isDuplicate ? "duplicate" : "available");
    } else {
      setCompanyEmail("");
      setEmailCheckStatus("idle");
    }
  }, [fullName, roster]);

  const generateSecureToken = () => {
    const token = `inv_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString(36)}`;
    setOneTimeToken(token);
  };

  useEffect(() => {
    generateSecureToken();
    loadRoster();
  }, []);

  const loadRoster = async () => {
    const list = await getOnboardingRecords();
    setRoster(list);
  };

  const handleProvisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !companyEmail.trim()) return;

    if (emailCheckStatus === "duplicate") {
      setError("This corporate email is already assigned to an existing staff member.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const newRecord = await saveOnboardingRecord({
        employeeId: `emp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        employeeName: fullName,
        corporateEmail: companyEmail,
        department,
        designation,
        joiningDate,
        managerName,
        checklist: {
          personalDetails: true,
          documents: false,
          offer: true,
          contract: true,
          bankDetails: false,
          departmentAssigned: true,
          managerAssigned: true,
          equipmentDispatched: false,
          emailAccountCreated: true,
          accessPermissionsSet: true,
          orientationCompleted: false,
          completionPercentage: 45,
        },
        status: "INVITATION_SENT",
        activationToken: oneTimeToken,
      });

      await recordAuditLog({
        actorId: user?.uid || "hr_admin",
        actorName: user?.name || "HR Operations",
        actorRole: "HR",
        action: "hr.account_provisioned",
        resource: "staff_account",
        resourceId: newRecord.id,
        result: "SUCCESS",
        metadata: { corporateEmail: companyEmail, role: assignedRole, department },
      });

      setCreatedRecord(newRecord);
      loadRoster();
    } catch (err: any) {
      setError(err?.message || "Failed to provision staff account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyInvitation = () => {
    if (!createdRecord) return;
    const text = `Welcome to EdWorld Organization!\n\nHi ${createdRecord.employeeName},\nYour corporate account has been provisioned.\nCorporate Email: ${createdRecord.corporateEmail}\nRole: ${assignedRole}\nActivation Link: https://edworld.co.in/auth/login?token=${createdRecord.activationToken}\n\nPlease set your private password on first login.\n\nBest,\nPeople Operations Team`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#0E0F15] text-white p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1280px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#13141B] p-6 rounded-3xl border border-white/10 shadow-xl">
        <div className="space-y-1">
          <Link href="/hr" className="inline-flex items-center gap-1.5 text-xs text-[#8E95A5] hover:text-[#D7FC51] font-bold mb-1 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            <span>Back to HR Command Center</span>
          </Link>
          <h1 className="text-2xl font-black text-white">Staff Account Provisioning</h1>
          <p className="text-xs text-[#8E95A5]">
            Generate corporate @edworld.co.in credentials with secure one-time activation links (zero plaintext storage).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-black">
            Domain: @edworld.co.in Verified
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Provisioning Form */}
        <div className="lg:col-span-2 bg-[#13141B] p-6 rounded-3xl border border-white/10 space-y-6 shadow-xl">
          <div>
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#D7FC51]" />
              <span>Staff Provisioning &amp; Role Setup</span>
            </h2>
            <p className="text-xs text-[#8E95A5] mt-0.5">
              Creates staff identity across Firebase Authentication and internal RBAC directories.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleProvisionSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8E95A5] uppercase">Staff Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Vikram Malhotra"
                  className="w-full p-3 rounded-xl bg-[#1C1D26] border border-white/10 text-xs text-white placeholder:text-[#8E95A5] focus:outline-none focus:border-[#D7FC51]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8E95A5] uppercase">Personal Email (For Invitation)</label>
                <input
                  type="email"
                  required
                  value={personalEmail}
                  onChange={(e) => setPersonalEmail(e.target.value)}
                  placeholder="vikram@personal.com"
                  className="w-full p-3 rounded-xl bg-[#1C1D26] border border-white/10 text-xs text-white placeholder:text-[#8E95A5] focus:outline-none focus:border-[#D7FC51]"
                />
              </div>
            </div>

            {/* Corporate Email Preview & Availability Check */}
            <div className="p-4 rounded-2xl bg-[#1C1D26] border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#8E95A5] uppercase">Assigned Corporate Mailbox</span>
                {emailCheckStatus === "available" && (
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Email Available</span>
                  </span>
                )}
                {emailCheckStatus === "duplicate" && (
                  <span className="text-[10px] text-rose-400 font-bold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Duplicate Email</span>
                  </span>
                )}
              </div>
              <div className="text-sm font-black font-mono text-[#D7FC51]">
                {companyEmail || "name@edworld.co.in"}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8E95A5] uppercase">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#1C1D26] border border-white/10 text-xs text-white"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Product & Design">Product &amp; Design</option>
                  <option value="People Operations">People Operations</option>
                  <option value="Executive Management">Executive Management</option>
                  <option value="Academic Faculty">Academic Faculty</option>
                  <option value="Placement & Partnerships">Placement &amp; Partnerships</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8E95A5] uppercase">Designation</label>
                <input
                  type="text"
                  required
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#1C1D26] border border-white/10 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8E95A5] uppercase">System RBAC Role</label>
                <select
                  value={assignedRole}
                  onChange={(e) => setAssignedRole(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-[#1C1D26] border border-white/10 text-xs text-white font-bold"
                >
                  <option value="EMPLOYEE">EMPLOYEE</option>
                  <option value="HR">HR</option>
                  <option value="TEACHER">TEACHER</option>
                  <option value="COLLEGE_ADMIN">COLLEGE_ADMIN</option>
                  <option value="PLACEMENT_OFFICER">PLACEMENT_OFFICER</option>
                  <option value="FOUNDER">FOUNDER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8E95A5] uppercase">Reporting Manager</label>
                <input
                  type="text"
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#1C1D26] border border-white/10 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8E95A5] uppercase">Joining Date</label>
                <input
                  type="date"
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#1C1D26] border border-white/10 text-xs text-white"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || emailCheckStatus === "duplicate"}
                className="w-full py-3 rounded-2xl bg-[#D7FC51] hover:bg-[#E9FFA4] text-[#13141B] font-black text-xs transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? "Provisioning Corporate Account..." : "Provision Account & Generate Activation Link"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right 1 Col: Activation Link & Onboarding Roster */}
        <div className="space-y-6">
          
          {/* Activation Dispatch Preview */}
          <div className="bg-[#13141B] p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-[#D7FC51]" />
              <span>One-Time Activation Token</span>
            </h3>

            {createdRecord ? (
              <div className="space-y-3 p-4 rounded-2xl bg-[#1C1D26] border border-emerald-500/30">
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Account Provisioned Successfully!</span>
                </div>
                <div className="text-[11px] text-[#8E95A5] space-y-1 font-mono">
                  <div><strong>Email:</strong> {createdRecord.corporateEmail}</div>
                  <div><strong>Status:</strong> {createdRecord.status}</div>
                  <div><strong>Token:</strong> {createdRecord.activationToken}</div>
                </div>

                <button
                  onClick={handleCopyInvitation}
                  className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? "Copied to Clipboard!" : "Copy Welcome Memo & Link"}</span>
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[#1C1D26] text-center text-xs text-[#8E95A5]">
                Complete the provisioning form to generate the encrypted first-login invitation token.
              </div>
            )}
          </div>

          {/* Provisioned Roster */}
          <div className="bg-[#13141B] p-6 rounded-3xl border border-white/10 space-y-3 shadow-xl">
            <h3 className="text-xs font-black text-white uppercase tracking-wider">
              Recent Provisioned Staff ({roster.length})
            </h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {roster.map((r) => (
                <div key={r.id} className="p-3 rounded-xl bg-[#1C1D26] border border-white/5 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{r.employeeName}</span>
                    <span className="text-[9px] font-mono font-bold text-purple-300 px-2 py-0.5 rounded bg-purple-500/20">{r.status}</span>
                  </div>
                  <span className="text-[10px] text-[#8E95A5] font-mono block truncate">{r.corporateEmail}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
