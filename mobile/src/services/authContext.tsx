import React, { createContext, useContext, useState } from "react";
import { AppUser, UserProfile, DailyTask, SyncedAccountStats, SkillLevel } from "../types";
import {
  INITIAL_USER_ADULT,
  INITIAL_PROFILE_ADULT,
  INITIAL_USER_MINOR,
  INITIAL_PROFILE_MINOR,
  INITIAL_DAILY_TASKS,
  INITIAL_SYNCED_ACCOUNTS,
} from "./mockData";

interface AuthContextType {
  user: AppUser;
  profile: UserProfile;
  dailyTasks: DailyTask[];
  syncedAccounts: SyncedAccountStats;
  streakDays: number;
  isMinor: boolean;
  isLoggedIn: boolean;
  loginWithApple: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string) => Promise<void>;
  signupWithGuardianConsent: (name: string, email: string, dob: string, guardianEmail?: string) => Promise<void>;
  switchPersona: (role: "adult" | "minor") => void;
  toggleTask: (taskId: string) => void;
  updateEffectiveLevel: (interestId: string, level: SkillLevel) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser>(INITIAL_USER_ADULT);
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE_ADULT);
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>(INITIAL_DAILY_TASKS);
  const [syncedAccounts] = useState<SyncedAccountStats>(INITIAL_SYNCED_ACCOUNTS);
  const [streakDays, setStreakDays] = useState<number>(4);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);

  const isMinor = user.ageBand !== "18+";

  const loginWithApple = async () => {
    // In production builds, invokes AppleAuthentication.signInAsync()
    setUser(INITIAL_USER_ADULT);
    setProfile(INITIAL_PROFILE_ADULT);
    setIsLoggedIn(true);
  };

  const loginWithGoogle = async () => {
    setUser(INITIAL_USER_ADULT);
    setProfile(INITIAL_PROFILE_ADULT);
    setIsLoggedIn(true);
  };

  const loginWithEmail = async (email: string) => {
    setUser({ ...INITIAL_USER_ADULT, email, name: email.split("@")[0] });
    setIsLoggedIn(true);
  };

  const signupWithGuardianConsent = async (
    name: string,
    email: string,
    dob: string,
    guardianEmail?: string
  ) => {
    // Under-18 DOB creates minor profile with safety rules locked
    const isUnder18 = dob > "2008-01-01";
    if (isUnder18) {
      setUser({
        uid: "user-minor-" + Date.now(),
        name,
        email,
        ageBand: "13-15",
        gradeLevel: "Class 9-10",
        createdAt: new Date().toISOString(),
      });
      setProfile(INITIAL_PROFILE_MINOR);
    } else {
      setUser({
        uid: "user-adult-" + Date.now(),
        name,
        email,
        ageBand: "18+",
        gradeLevel: "Working Professional",
        createdAt: new Date().toISOString(),
      });
      setProfile(INITIAL_PROFILE_ADULT);
    }
    setIsLoggedIn(true);
  };

  const switchPersona = (role: "adult" | "minor") => {
    if (role === "minor") {
      setUser(INITIAL_USER_MINOR);
      setProfile(INITIAL_PROFILE_MINOR);
    } else {
      setUser(INITIAL_USER_ADULT);
      setProfile(INITIAL_PROFILE_ADULT);
    }
  };

  const toggleTask = (taskId: string) => {
    setDailyTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextCompleted = !t.completed;
          if (nextCompleted) {
            setStreakDays((s) => s + 1);
          }
          return { ...t, completed: nextCompleted };
        }
        return t;
      })
    );
  };

  const updateEffectiveLevel = (interestId: string, level: SkillLevel) => {
    setProfile((prev) => ({
      ...prev,
      interests: prev.interests.map((i) => (i.id === interestId ? { ...i, effectiveLevel: level } : i)),
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        dailyTasks,
        syncedAccounts,
        streakDays,
        isMinor,
        isLoggedIn,
        loginWithApple,
        loginWithGoogle,
        loginWithEmail,
        signupWithGuardianConsent,
        switchPersona,
        toggleTask,
        updateEffectiveLevel,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useMobileAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useMobileAuth must be used within an AuthProvider");
  }
  return context;
}
