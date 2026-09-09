export type AgeBand = "13-15" | "16-18" | "18+";
export type SkillLevel = 0 | 1 | 2; // 0: Foundational, 1: Intermediate, 2: Advanced

export interface UserInterest {
  id: string;
  name: string;
  category: string;
  selfLevel: SkillLevel;      // Baseline declared during onboarding
  effectiveLevel: SkillLevel; // System-calibrated level learned from performance
}

export interface AppUser {
  uid: string;
  name: string;
  email: string;
  ageBand: AgeBand;
  gradeLevel?: string;
  createdAt: string;
  isEmployer?: boolean;
  isAdmin?: boolean;
}

export interface UserProfile {
  username?: string;
  headline?: string;
  bio?: string;
  gradeLevel?: string;
  interests: UserInterest[];
  primaryGoal?: string;
  isPublic: boolean;
  isMentor: boolean;
  mentorTags?: string[];
  targetRole?: string;
}

export interface DailyTask {
  id: string;
  title: string;
  category: string;
  estimatedMinutes: number;
  completed: boolean;
  type: "interview" | "quiz" | "project_milestone" | "reading";
  levelTarget: SkillLevel;
}

export interface SyncedAccountStats {
  githubConnected: boolean;
  githubReposCount?: number;
  githubStarsCount?: number;
  leetcodeConnected: boolean;
  leetcodeProblemsSolved?: number;
  linkedinConnected: boolean;
}

export interface MobileInterviewQuestion {
  id: string;
  category: string;
  text: string;
  difficultyLevel: SkillLevel;
  suggestedDurationSeconds: number;
}
