"use client";

import React from "react";
import { useAuth } from "@/lib/auth-context";
import { formatUserGreeting, normalizeDisplayName } from "@/lib/services/user-profile";

export interface UserGreetingProps {
  context?: "dashboard" | "resume" | "interview" | "portfolio" | "general";
  subtitle?: string;
  className?: string;
  showBadge?: boolean;
  badgeText?: string;
}

export const UserGreeting: React.FC<UserGreetingProps> = ({
  context = "general",
  subtitle,
  className = "",
  showBadge = false,
  badgeText,
}) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className={`space-y-1 animate-pulse ${className}`}>
        <div className="h-7 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        {subtitle && <div className="h-4 w-72 bg-slate-100 dark:bg-slate-900 rounded-md" />}
      </div>
    );
  }

  const { displayName, firstName } = normalizeDisplayName(undefined, undefined, profile?.name || user?.name);
  const greetingText = formatUserGreeting(displayName || firstName, context);

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-center gap-2">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-ink">
          {greetingText}
        </h1>
        {showBadge && (
          <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-forest/10 text-forest border border-forest/20">
            {badgeText || user?.careerStage || "VERIFIED"}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="text-xs sm:text-sm font-medium text-ink-soft">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default UserGreeting;
