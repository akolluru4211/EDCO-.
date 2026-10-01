"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PublicUserProfile } from "@/lib/types";
import EdIdBadge from "@/components/ui/EdIdBadge";
import {
  X,
  MapPin,
  Building2,
  GraduationCap,
  Calendar,
  Briefcase,
  Github,
  Linkedin,
  Code2,
  Globe,
  Award,
  BookOpen,
  Clock,
  Send,
  UserPlus,
  Check,
  ShieldCheck,
  ExternalLink,
  Sparkles,
  Layers,
  FolderGit2
} from "lucide-react";

interface UserProfileDetailModalProps {
  user: PublicUserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onConnect?: (userId: string) => void;
  onOpenMessage?: (user: PublicUserProfile) => void;
  isConnecting?: boolean;
}

export default function UserProfileDetailModal({
  user,
  isOpen,
  onClose,
  onConnect,
  onOpenMessage,
  isConnecting = false,
}: UserProfileDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "projects" | "certifications" | "schedule" | "education">("overview");

  if (!isOpen || !user) return null;

  const initials = (user.name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isConnected = user.connectionStatus === "accepted";
  const isPending = user.connectionStatus === "pending_sent";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto font-sans">
      {/* Dimmed Backdrop */}
      <div
        className="fixed inset-0 bg-[#13141B]/50 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-3 sm:p-4 text-center">
        <div className="w-full max-w-2xl transform overflow-hidden rounded-3xl bg-[#FCFCFB] text-left align-middle shadow-2xl border border-[#E8ECF2] transition-all flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
          
          {/* Top Banner & Header */}
          <div className="relative bg-[#13141B] p-6 sm:p-7 text-white border-b border-white/10">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close profile modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="relative">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover border-2 border-[#00D2B4] shadow-md"
                    />
                  ) : (
                    <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-tr from-[#00D2B4] to-emerald-400 text-[#13141B] flex items-center justify-center font-black text-xl shadow-md">
                      {initials}
                    </div>
                  )}
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-[#13141B] rounded-full"></span>
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-black text-white truncate">
                      {user.name}
                    </h2>
                    {user.edId && (
                      <EdIdBadge userId={user.userId} customId={user.edId} size="sm" variant="pill" />
                    )}
                  </div>
                  <p className="text-xs text-gray-300 font-medium mt-1 leading-snug">
                    {user.headline || (user.userType === "STUDENT" ? "Student & Developer" : "Industry Professional")}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-gray-400 font-medium">
                    {user.college && (
                      <span className="flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5 text-[#00D2B4]" />
                        {user.college}
                      </span>
                    )}
                    {user.company && (
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-[#00D2B4]" />
                        {user.company}
                      </span>
                    )}
                    {user.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {user.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-stretch sm:self-center shrink-0">
                {onOpenMessage && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenMessage(user);
                    }}
                    className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-white/15"
                  >
                    <Send className="w-3.5 h-3.5 text-[#00D2B4]" />
                    <span>Message (🔒 DM)</span>
                  </button>
                )}

                {onConnect && (
                  <button
                    onClick={() => onConnect(user.userId)}
                    disabled={isConnected || isPending || isConnecting}
                    className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                      isConnected
                        ? "bg-emerald-600 text-white cursor-default"
                        : isPending
                        ? "bg-amber-600/90 text-white cursor-default"
                        : "bg-[#00D2B4] hover:bg-[#00BF9F] text-[#13141B]"
                    }`}
                  >
                    {isConnected ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Connected</span>
                      </>
                    ) : isPending ? (
                      <>
                        <Clock className="w-3.5 h-3.5" />
                        <span>Pending</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Connect</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Social & Portfolio Links Bar */}
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-white/10 text-xs">
              {user.githubUrl && (
                <a
                  href={user.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-gray-200 flex items-center gap-1.5 transition-colors"
                >
                  <Github className="w-3 h-3 text-white" />
                  <span>GitHub</span>
                </a>
              )}
              {user.linkedinUrl && (
                <a
                  href={user.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-gray-200 flex items-center gap-1.5 transition-colors"
                >
                  <Linkedin className="w-3 h-3 text-blue-400" />
                  <span>LinkedIn</span>
                </a>
              )}
              {user.leetcodeUrl && (
                <a
                  href={user.leetcodeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-gray-200 flex items-center gap-1.5 transition-colors"
                >
                  <Code2 className="w-3 h-3 text-amber-400" />
                  <span>LeetCode</span>
                </a>
              )}
              {user.portfolioUrl && (
                <a
                  href={user.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-gray-200 flex items-center gap-1.5 transition-colors"
                >
                  <Globe className="w-3 h-3 text-emerald-400" />
                  <span>Portfolio</span>
                </a>
              )}
            </div>
          </div>

          {/* Navigation Tab Bar */}
          <div className="flex items-center gap-1 px-6 border-b border-[#EBECEF] bg-white overflow-x-auto no-scrollbar">
            {[
              { id: "overview", label: "Overview & Bio", icon: Sparkles },
              { id: "projects", label: `Projects (${user.projects?.length || 0})`, icon: FolderGit2 },
              { id: "certifications", label: `Certifications (${user.certifications?.length || 0})`, icon: Award },
              { id: "schedule", label: "Study Timetable", icon: Clock },
              { id: "education", label: "Education & Courses", icon: GraduationCap },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-3.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                    isActive
                      ? "border-[#13141B] text-[#13141B]"
                      : "border-transparent text-gray-500 hover:text-[#13141B]"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#00D2B4]" : "text-gray-400"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Modal Tab Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* 1. OVERVIEW & BIO */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">About & Professional Bio</h3>
                  <p className="text-xs text-[#13141B] leading-relaxed mt-2 bg-white p-4 rounded-2xl border border-[#EBECEF]">
                    {user.bio || "This member hasn't added a detailed bio yet. Connect or send a direct message to learn more about their work!"}
                  </p>
                </div>

                {user.skills && user.skills.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2.5">
                      Verified Skills &amp; Competencies
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {user.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-[#EBECEF] text-gray-800 shadow-2xs"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white border border-[#EBECEF]">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Career Stage</span>
                    <p className="text-xs font-bold text-[#13141B] mt-1 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-[#00D2B4]" />
                      {user.userType === "STUDENT" ? "Undergraduate / Campus Student" : "Working Tech Professional"}
                    </p>
                  </div>

                  {user.cgpa && (
                    <div className="p-4 rounded-2xl bg-white border border-[#EBECEF]">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Academic Metric</span>
                      <p className="text-xs font-bold text-[#13141B] mt-1 flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-[#00D2B4]" />
                        CGPA: {user.cgpa} / 10
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. PROJECTS */}
            {activeTab === "projects" && (
              <div className="space-y-4">
                {user.projects && user.projects.length > 0 ? (
                  user.projects.map((proj, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-white border border-[#EBECEF] shadow-2xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-[#13141B]">{proj.title}</h4>
                        <div className="flex items-center gap-2">
                          {proj.githubRepo && (
                            <a
                              href={proj.githubRepo}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-bold text-gray-600 hover:text-[#13141B] flex items-center gap-1"
                            >
                              <Github className="w-3.5 h-3.5" />
                              <span>Code</span>
                            </a>
                          )}
                          {proj.demoUrl && (
                            <a
                              href={proj.demoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Demo</span>
                            </a>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{proj.description}</p>
                      {proj.technologies && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {proj.technologies.map((t, tIdx) => (
                            <span key={tIdx} className="text-[10px] px-2 py-0.5 rounded-md bg-[#F4F6FB] text-gray-700 font-medium">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 bg-white rounded-2xl border border-[#EBECEF] text-gray-500 text-xs">
                    <FolderGit2 className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                    <p>No public portfolio projects listed yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* 3. CERTIFICATIONS */}
            {activeTab === "certifications" && (
              <div className="space-y-3">
                {user.certifications && user.certifications.length > 0 ? (
                  user.certifications.map((cert, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-white border border-[#EBECEF] flex items-center justify-between gap-3 shadow-2xs">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
                          <Award className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-[#13141B]">{cert.name}</h4>
                          <p className="text-[11px] text-gray-500 mt-0.5">{cert.issuer} • Issued {cert.issueDate}</p>
                        </div>
                      </div>
                      {cert.url && (
                        <a
                          href={cert.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 rounded-lg bg-[#F4F6FB] hover:bg-slate-100 text-xs font-bold text-gray-700 transition-colors flex items-center gap-1"
                        >
                          <span>Verify</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 bg-white rounded-2xl border border-[#EBECEF] text-gray-500 text-xs">
                    <Award className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                    <p>No verified professional certifications listed yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* 4. TIMETABLE & SCHEDULE */}
            {activeTab === "schedule" && (
              <div className="space-y-3">
                <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-xs text-emerald-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>This study schedule reflects {user.name}'s active learning routine and availability for peer collaboration.</span>
                </div>

                {user.timetable && user.timetable.length > 0 ? (
                  user.timetable.map((slot, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-white border border-[#EBECEF] flex items-center justify-between gap-3 shadow-2xs">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#F4F6FB] text-gray-700 flex items-center justify-center shrink-0 font-mono text-xs font-bold">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{slot.timeOfDay}</div>
                          <h4 className="text-xs font-bold text-[#13141B] mt-0.5">{slot.focus}</h4>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#F4F6FB] text-gray-700 border border-[#E8ECF2]">
                        {slot.duration}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 bg-white rounded-2xl border border-[#EBECEF] text-gray-500 text-xs">
                    <Clock className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                    <p>No custom timetable set.</p>
                  </div>
                )}
              </div>
            )}

            {/* 5. EDUCATION & COURSES */}
            {activeTab === "education" && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white border border-[#EBECEF] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#13141B]">
                    <GraduationCap className="w-4 h-4 text-[#00D2B4]" />
                    <span>Academic Institution</span>
                  </div>
                  <div className="pl-6 text-xs text-gray-700 space-y-1">
                    <p className="font-bold text-[#13141B]">{user.college || "University Partner"}</p>
                    <p className="text-gray-500">{user.degree || "Bachelor of Technology"} • {user.branch || "Computer Science"}</p>
                    <p className="text-gray-400 text-[11px]">Class of {user.graduationYear || "2026"}</p>
                  </div>
                </div>

                {user.courses && user.courses.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Completed Coursework</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {user.courses.map((c, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-white border border-[#EBECEF] text-xs">
                          <p className="font-bold text-[#13141B]">{c.title}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">{c.institution || "Online Academy"} {c.grade ? `• Grade: ${c.grade}` : ""}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Modal Footer */}
          <div className="p-4 bg-white border-t border-[#EBECEF] flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified Edworld Co. Student Profile</span>
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#13141B] text-white font-bold hover:bg-black transition-colors"
            >
              Close
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
