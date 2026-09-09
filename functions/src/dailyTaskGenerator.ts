import * as admin from "firebase-admin";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { SkillLevel } from "./types";

interface GenerateDailyPlanRequest {
  date?: string; // YYYY-MM-DD
  interests?: Array<{ id: string; name: string; effectiveLevel: SkillLevel }>;
  primaryGoal?: string;
  skipHistory?: Record<string, number>;
}

export const getOrGenerateDailyPlan = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated.");
  }

  const userId = request.auth.uid;
  const data = request.data as GenerateDailyPlanRequest;
  const today = data.date || new Date().toISOString().split("T")[0];

  const db = admin.firestore();
  const planRef = db.collection("users").doc(userId).collection("dailyPlans").doc(today);

  // 1. Idempotency Check: Return existing plan if already generated today
  const existingSnap = await planRef.get();
  if (existingSnap.exists) {
    return {
      success: true,
      plan: existingSnap.data(),
    };
  }

  // 2. Fetch User Profile & Interests
  let interests = data.interests;
  let primaryGoal = data.primaryGoal || "Advance career readiness and practice interview skills";

  if (!interests || interests.length === 0) {
    try {
      const profileSnap = await db.collection("users").doc(userId).collection("profile").doc("main").get();
      if (profileSnap.exists) {
        const pData = profileSnap.data();
        interests = pData?.interests || [];
        primaryGoal = pData?.primaryGoal || primaryGoal;
      }
    } catch (e) {
      console.warn("[Daily Task Generator Profile Fetch Warning]:", e);
    }
  }

  const topInterest = interests && interests.length > 0
    ? interests[0]
    : { id: "swe", name: "Software Engineering", effectiveLevel: 0 as SkillLevel };

  const effectiveLevel = topInterest.effectiveLevel ?? 0;
  const skipHistory = data.skipHistory || {};

  // 3. Adaptive Task Selection
  const tasks = [];

  // Task 1: Interview Practice (Level-matched)
  const interviewSkipCount = skipHistory["interview"] || 0;
  if (interviewSkipCount < 3) {
    const interviewTitle =
      effectiveLevel === 0
        ? `Foundational STAR Practice: ${topInterest.name}`
        : effectiveLevel === 1
        ? `Technical Architecture Mock: ${topInterest.name}`
        : `Executive Scalability Assessment: ${topInterest.name}`;

    tasks.push({
      id: `task-interview-${Date.now()}-1`,
      title: interviewTitle,
      category: "interview",
      difficultyLevel: effectiveLevel,
      estimatedMinutes: effectiveLevel === 0 ? 5 : 8,
      actionUrl: `/interviews/${topInterest.id || "swe"}`,
      completed: false,
      points: effectiveLevel === 0 ? 25 : effectiveLevel === 1 ? 40 : 60,
      reason: `Calibrated to your Level ${effectiveLevel} mastery in ${topInterest.name}`,
    });
  }

  // Task 2: Project Studio Milestones
  const projectSkipCount = skipHistory["project"] || 0;
  if (projectSkipCount < 3) {
    tasks.push({
      id: `task-project-${Date.now()}-2`,
      title: `Update Project Architecture & Verification`,
      category: "project",
      difficultyLevel: effectiveLevel,
      estimatedMinutes: 10,
      actionUrl: `/projects`,
      completed: false,
      points: 30,
      reason: `Showcase practical implementation for your goal: "${primaryGoal.slice(0, 45)}..."`,
    });
  }

  // Task 3: Resume ATS Matcher / Refinement
  tasks.push({
    id: `task-resume-${Date.now()}-3`,
    title: `Run JD-Match Calibration on your ATS Resume`,
    category: "resume",
    difficultyLevel: effectiveLevel,
    estimatedMinutes: 5,
    actionUrl: `/resumes`,
    completed: false,
    points: 20,
    reason: `Keeps your resume synchronized with your latest ${topInterest.name} projects`,
  });

  // Task 4: Opportunity Application (if Career goal)
  if (primaryGoal.toLowerCase().includes("job") || primaryGoal.toLowerCase().includes("career") || primaryGoal.toLowerCase().includes("internship")) {
    tasks.push({
      id: `task-jobs-${Date.now()}-4`,
      title: `Review Recommended Verified Roles in ${topInterest.name}`,
      category: "jobs",
      difficultyLevel: effectiveLevel,
      estimatedMinutes: 5,
      actionUrl: `/jobs`,
      completed: false,
      points: 15,
      reason: `Directly targets your primary goal of landing verified roles`,
    });
  }

  // Calculate streak & points
  let currentStreak = 1;
  let totalUserPoints = 120;

  try {
    const gamificationSnap = await db.collection("users").doc(userId).collection("gamification").doc("status").get();
    if (gamificationSnap.exists) {
      const gData = gamificationSnap.data();
      currentStreak = gData?.streakDays || 1;
      totalUserPoints = gData?.totalPoints || 120;
    }
  } catch (e) {}

  const dailyPlan = {
    date: today,
    userId,
    tasks,
    streakDays: currentStreak,
    pointsEarnedToday: 0,
    totalPoints: totalUserPoints,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await planRef.set(dailyPlan);

  return {
    success: true,
    plan: {
      ...dailyPlan,
      createdAt: new Date().toISOString(),
    },
  };
});

export const completeDailyTask = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be signed in.");
  }

  const userId = request.auth.uid;
  const { date, taskId } = request.data as { date: string; taskId: string };

  if (!date || !taskId) {
    throw new HttpsError("invalid-argument", "Date and taskId are required.");
  }

  const db = admin.firestore();
  const planRef = db.collection("users").doc(userId).collection("dailyPlans").doc(date);
  const planSnap = await planRef.get();

  if (!planSnap.exists) {
    throw new HttpsError("not-found", "Daily plan not found for specified date.");
  }

  const planData = planSnap.data();
  let taskPoints = 0;
  let taskFound = false;

  const updatedTasks = (planData?.tasks || []).map((t: any) => {
    if (t.id === taskId) {
      taskFound = true;
      taskPoints = t.points || 20;
      return {
        ...t,
        completed: true,
        completedAt: new Date().toISOString(),
      };
    }
    return t;
  });

  if (!taskFound) {
    throw new HttpsError("not-found", "Task ID not found in daily plan.");
  }

  const newPointsEarnedToday = (planData?.pointsEarnedToday || 0) + taskPoints;
  const newTotalPoints = (planData?.totalPoints || 0) + taskPoints;

  await planRef.update({
    tasks: updatedTasks,
    pointsEarnedToday: newPointsEarnedToday,
    totalPoints: newTotalPoints,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Update canonical gamification record
  try {
    const gamificationRef = db.collection("users").doc(userId).collection("gamification").doc("status");
    await gamificationRef.set(
      {
        userId,
        totalPoints: newTotalPoints,
        lastActivityDate: date,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn("[Gamification sync error in Cloud Function]:", err);
  }

  return {
    success: true,
    taskId,
    pointsAwarded: taskPoints,
    newPointsEarnedToday,
    newTotalPoints,
  };
});
