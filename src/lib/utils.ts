import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateAgeBandFromDob(dobString: string): "13-15" | "16-18" | "18+" {
  if (!dobString) return "18+";
  const dob = new Date(dobString);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) {
    age--;
  }

  if (age < 16) {
    return "13-15";
  } else if (age < 18) {
    return "16-18";
  } else {
    return "18+";
  }
}

export function getDifficultyLabel(level: 0 | 1 | 2): string {
  switch (level) {
    case 0:
      return "Foundational (Level 0)";
    case 1:
      return "Intermediate (Level 1)";
    case 2:
      return "Advanced (Level 2)";
    default:
      return "Level " + level;
  }
}

export function getDifficultyBadgeColor(level: 0 | 1 | 2): string {
  switch (level) {
    case 0:
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case 1:
      return "bg-amber-50 text-amber-700 border-amber-200";
    case 2:
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
}

export function getVisualModeFromAgeBand(ageBand: "13-15" | "16-18" | "18+"): "junior" | "explorer" | "career" {
  switch (ageBand) {
    case "13-15":
      return "junior";
    case "16-18":
      return "explorer";
    case "18+":
    default:
      return "career";
  }
}

export function getVisualModeBadge(mode: "junior" | "explorer" | "career"): { label: string; color: string; desc: string } {
  switch (mode) {
    case "junior":
      return {
        label: "Junior Mode (Class 9-10)",
        color: "bg-amber-50 text-amber-800 border-amber-200",
        desc: "Foundational learning & STEM exploration. Minor safety active.",
      };
    case "explorer":
      return {
        label: "Explorer Mode (Class 11-12)",
        color: "bg-cyan-50 text-cyan-800 border-cyan-200",
        desc: "College prep & early hackathons. Minor safety active.",
      };
    case "career":
      return {
        label: "Career Track (18+)",
        color: "bg-indigo-50 text-indigo-800 border-indigo-200",
        desc: "Industry readiness, ATS resumes, and full-time hiring.",
      };
  }
}

export function calculateScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-600";
  if (score >= 60) return "text-amber-600";
  return "text-rose-600";
}

