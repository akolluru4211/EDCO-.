import { AppUser, UserProfile, DailyTask, SyncedAccountStats, MobileInterviewQuestion } from "../types";

export const INITIAL_USER_ADULT: AppUser = {
  uid: "demo-adult-user-123",
  name: "Alex Rivera",
  email: "alex.rivera@example.com",
  ageBand: "18+",
  gradeLevel: "Working Professional",
  createdAt: new Date().toISOString(),
  isEmployer: false,
  isAdmin: false,
};

export const INITIAL_PROFILE_ADULT: UserProfile = {
  username: "alexrivera",
  headline: "Full-Stack Software Engineer & Distributed Systems Enthusiast",
  bio: "Passionate about building scalable backend microservices and TypeScript applications.",
  gradeLevel: "Working Professional",
  interests: [
    { id: "swe", name: "Software Engineering", category: "Tech", selfLevel: 1, effectiveLevel: 1 },
    { id: "pm", name: "Product Management", category: "Product", selfLevel: 0, effectiveLevel: 0 },
    { id: "behavioral", name: "General Behavioral & Leadership", category: "Career", selfLevel: 1, effectiveLevel: 1 },
  ],
  primaryGoal: "Land first full-time Software Engineer role at a top technology company.",
  isPublic: true,
  isMentor: false,
  mentorTags: ["React", "TypeScript", "Node.js"],
  targetRole: "Full-Stack Software Engineer",
};

export const INITIAL_USER_MINOR: AppUser = {
  uid: "demo-minor-user-456",
  name: "Maya Chen (Class 10)",
  email: "maya.chen@example.edu",
  ageBand: "13-15",
  gradeLevel: "Class 9-10",
  createdAt: new Date().toISOString(),
  isEmployer: false,
  isAdmin: false,
};

export const INITIAL_PROFILE_MINOR: UserProfile = {
  username: "mayachen",
  headline: "Junior Learner | Exploring STEM & CS Basics",
  bio: "Class 10 student eager to learn coding fundamentals and build creative web projects.",
  gradeLevel: "Class 9-10",
  interests: [
    { id: "swe", name: "Software Engineering", category: "Tech", selfLevel: 0, effectiveLevel: 0 },
    { id: "behavioral", name: "General Behavioral & Leadership", category: "Career", selfLevel: 0, effectiveLevel: 0 },
  ],
  primaryGoal: "Learn foundational computer science and prepare for high school hackathons.",
  isPublic: false,
  isMentor: false,
  mentorTags: [],
  targetRole: "High School Tech Fellow",
};

export const INITIAL_DAILY_TASKS: DailyTask[] = [
  {
    id: "task-1",
    title: "Explain Async vs Sync Execution (Level 1 Video Practice)",
    category: "Software Engineering",
    estimatedMinutes: 5,
    completed: false,
    type: "interview",
    levelTarget: 1,
  },
  {
    id: "task-2",
    title: "Review STAR Method Conflict Story with Mentor Feedback",
    category: "General Behavioral",
    estimatedMinutes: 4,
    completed: true,
    type: "reading",
    levelTarget: 1,
  },
  {
    id: "task-3",
    title: "Inspect Stripe JD Skill Gaps on ATS Resume",
    category: "Career Prep",
    estimatedMinutes: 3,
    completed: false,
    type: "project_milestone",
    levelTarget: 1,
  },
];

export const INITIAL_SYNCED_ACCOUNTS: SyncedAccountStats = {
  githubConnected: true,
  githubReposCount: 14,
  githubStarsCount: 28,
  leetcodeConnected: true,
  leetcodeProblemsSolved: 94,
  linkedinConnected: true,
};

export const MOBILE_QUESTIONS: MobileInterviewQuestion[] = [
  {
    id: "swe-0-1",
    category: "Software Engineering",
    text: "Can you explain the difference between synchronous and asynchronous programming?",
    difficultyLevel: 0,
    suggestedDurationSeconds: 120,
  },
  {
    id: "swe-1-1",
    category: "Software Engineering",
    text: "Walk me through how you optimize a web app experiencing slow load times and heavy CPU usage.",
    difficultyLevel: 1,
    suggestedDurationSeconds: 180,
  },
  {
    id: "behavioral-1-1",
    category: "General Behavioral",
    text: "Describe a time when you had a technical disagreement with a team member. How did you resolve it?",
    difficultyLevel: 1,
    suggestedDurationSeconds: 180,
  },
];
