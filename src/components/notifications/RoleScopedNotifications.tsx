"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Bell, Check, Info, AlertTriangle, Briefcase, Video, FileText, CheckSquare, X } from "lucide-react";

export interface RoleNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: "info" | "action" | "alert";
  allowedRoles: string[];
}

export default function RoleScopedNotifications() {
  const { role, isEmployee, isHR, isFounder, isTeacher, isCollegeAdmin, isAdmin, isSuperAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Active role
  const effectiveRole = role || (isSuperAdmin ? "SUPER_ADMIN" : isAdmin ? "ADMIN" : isFounder ? "FOUNDER" : isHR ? "HR" : isEmployee ? "EMPLOYEE" : isTeacher ? "TEACHER" : isCollegeAdmin ? "COLLEGE_ADMIN" : "STUDENT");

  // Notifications database with strict role scoping
  const [notifications, setNotifications] = useState<RoleNotification[]>([
    // Student Notifications
    {
      id: "n-s1",
      title: "Interview Scheduled",
      message: "Your AI technical practice interview for Full-Stack Engineering is ready.",
      timestamp: "10m ago",
      read: false,
      type: "action",
      allowedRoles: ["STUDENT", "CLIENT", "ADMIN", "SUPER_ADMIN"]
    },
    {
      id: "n-s2",
      title: "ATS Resume Feedback",
      message: "Your resume scored 88% alignment for Software Engineering roles.",
      timestamp: "1h ago",
      read: false,
      type: "info",
      allowedRoles: ["STUDENT", "CLIENT", "ADMIN", "SUPER_ADMIN"]
    },

    // Employee Notifications
    {
      id: "n-e1",
      title: "Daily Standup Check-in",
      message: "Please submit your daily priorities and blocker updates for today.",
      timestamp: "30m ago",
      read: false,
      type: "action",
      allowedRoles: ["EMPLOYEE", "HR", "FOUNDER", "ADMIN", "SUPER_ADMIN"]
    },

    // HR Notifications
    {
      id: "n-h1",
      title: "New Candidate Application",
      message: "3 new verified applications received for Full-Stack Software Engineer.",
      timestamp: "45m ago",
      read: false,
      type: "info",
      allowedRoles: ["HR", "FOUNDER", "ADMIN", "SUPER_ADMIN"]
    },

    // Founder Notifications
    {
      id: "n-f1",
      title: "Monthly Financial Pulse",
      message: "Gross revenue pacing +18% MoM. Unit economics update available.",
      timestamp: "2h ago",
      read: false,
      type: "info",
      allowedRoles: ["FOUNDER", "ADMIN", "SUPER_ADMIN"]
    }
  ]);

  // Filter for authenticated user's role
  const userNotifications = notifications.filter((n) =>
    n.allowedRoles.includes(effectiveRole)
  );

  const unreadCount = userNotifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    );
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-colors"
        aria-label="View notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white" />
        )}
      </button>

      {isOpen && (
        <>
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-30"
          />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-40 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
            <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-800">Notifications</h4>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
              {userNotifications.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No notifications for your portal right now.
                </div>
              ) : (
                userNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3.5 flex items-start gap-3 transition-colors ${
                      notif.read ? "bg-white" : "bg-indigo-50/30"
                    }`}
                  >
                    <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800">{notif.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{notif.message}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">{notif.timestamp}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
