export type CareerStage = "JUNIOR" | "STUDENT" | "PROFESSIONAL";

export type AgeBand = "13-15" | "16-18" | "18+";

export type SkillLevel = 0 | 1 | 2; // 0: Foundational/Beginner, 1: Intermediate, 2: Advanced

export interface UserInterest {
  id: string;
  name: string;
  category: string;
  selfLevel: SkillLevel;       // Level declared by user at onboarding
  effectiveLevel: SkillLevel;  // System-adjusted level based on demonstrated performance
}

export type VisualMode = "career" | "maximalist";

export const CURRENT_TOS_VERSION = "2026.1";
export const CURRENT_PRIVACY_VERSION = "2026.1";

export interface UserProfile {
  name?: string;
  dob?: string;                // Date of Birth (actively collected in onboarding, never inferred)
  phone?: string;              // Contact Phone Number (collected without OTP requirement)
  ageBand?: AgeBand;           // Computed age band ("13-15" | "16-18" | "18+")
  username?: string;           // Networking username (Career Track display)
  headline?: string;           // Networking headline (e.g. "Full Stack Developer | Class 12 CS")
  bio?: string;
  gradeLevel?: string;         // Secondary content-targeting field (e.g. "Class 9", "Class 10", "Class 11", "Class 12/Inter", "College", "Working Professional")
  interests: UserInterest[];   // Canonical interest skill matrix
  primaryGoal: string;
  isPublic: boolean;           // Always false for minors (under-18 accounts, enforced server-side)
  isMentor: boolean;           // Always false for minors (under-18 accounts, enforced server-side)
  mentorTags: string[];        // Career Track only, empty for minors
  targetRole?: string;
  careerStage?: CareerStage | "college" | "working_professional";
  onboarding_completed?: boolean;
  institution?: string;
  degree?: string;
  field_of_study?: string;
  graduation_year?: string;
  experience_level?: string;
  current_company?: string;
  github_url?: string;
  linkedin_url?: string;
  leetcode_url?: string;
  isTeacher?: boolean;         // Educator role
  isSchoolAdmin?: boolean;
  certifications?: Array<{ id: string; name: string; issuer: string; issueDate: string; url?: string }>;     // Institutional Admin role
  updatedAt?: string;
}

export interface GuardianConsent {
  guardianName: string;
  guardianEmail: string;
  relationship: "parent" | "legal_guardian";
  status: "not_required" | "pending" | "verified" | "revoked";
  token?: string;
  sentAt?: string;
  verifiedAt?: string;
  revokedAt?: string;
}

export interface UserConsent {
  userId: string;
  tosVersion: string;
  privacyVersion: string;
  acceptedAt: string;
  guardianConsent?: GuardianConsent;
  marketingConsent?: boolean;
  marketingConsentAt?: string;
}

export interface AppUser {
  uid: string;
  name: string;
  email: string;
  phone?: string;              // Optional phone number without OTP requirement
  createdAt: string;
  dob?: string;                // Restricted: server-side only in production; not exposed to public
  ageBand: AgeBand;            // Primary gate derived from dob by Cloud Function ("13-15" | "16-18" | "18+")
  gradeLevel?: string;         // Secondary content-targeting field ("Class 9", "Class 10", "Class 11", "Class 12/Inter", "College", "Working Professional")
  grade?: string;              // Normalized grade field
  visualMode?: VisualMode;     // "career" for 18+, "maximalist" for 13-17
  careerStage?: CareerStage;   // "JUNIOR" | "STUDENT" | "PROFESSIONAL"
  isEmployer: boolean;         // Default false
  isAdmin: boolean;            // Default false
  isTeacher?: boolean;         // Educator role
  isSchoolAdmin?: boolean;     // Institutional Admin role
  role?: UserRole;             // Phase 19/22 RBAC system role
  status?: string;             // Account status (ACTIVE, SUSPENDED, etc.)
  guardianConsent?: GuardianConsent;
  tosVersion?: string;
  privacyVersion?: string;
}

export interface ResumeContact {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

export interface ResumeExperience {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

export interface ResumeEducation {
  id: string;
  school: string;
  degree: string;
  fieldOfStudy: string;
  graduationDate: string;
  gpa?: string;
  coursework?: string[];
}

export interface ResumeProject {
  id: string;
  title: string;
  description: string;
  link?: string;
  technologies: string[];
  bullets: string[];
  projectStudioId?: string;
  importedAt?: string;
}

export interface ProjectItem {
  id: string;
  userId: string;
  title: string;
  description: string;
  skills: string[];
  githubUrl?: string;
  liveUrl?: string;
  images: string[];
  isVerified: boolean;
  source: "github" | "manual" | "starter-kit";
  isPublic: boolean;
  readmeHtml?: string;
  primaryLanguage?: string;
  stars?: number;
  lastSyncedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StarterKitProject {
  id: string;
  title: string;
  category: string;
  difficulty: "Beginner" | "Intermediate";
  estimatedHours: number;
  description: string;
  skillsLearned: string[];
  milestones: Array<{
    id: string;
    title: string;
    description: string;
    starterCodeSnippet?: string;
  }>;
}

export interface ResumeCertification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  url?: string;
}

export interface ResumeContent {
  contact: ResumeContact;
  summary: string;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: {
    technical: string[];
    soft: string[];
    tools: string[];
  };
  projects: ResumeProject[];
  certifications: ResumeCertification[];
}

export const DEFAULT_RESUME_CONTENT: ResumeContent = {
  contact: {
    fullName: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    portfolio: "",
  },
  summary: "",
  experience: [],
  education: [],
  skills: {
    technical: [],
    soft: [],
    tools: [],
  },
  projects: [],
  certifications: [],
};

export type ResumeTemplateId = "classic" | "modern" | "tech";

export interface Resume {
  id: string;
  userId: string;
  title: string;
  templateId: ResumeTemplateId;
  content: ResumeContent;
  createdAt: string;
  updatedAt: string;
}

export interface JDAnalysisResult {
  matchScore: number;          // 0 - 100
  atsReadabilityScore: number; // 0 - 100
  presentKeywords: string[];
  missingKeywords: string[];
  strengths: string[];
  improvementSuggestions: string[];
  actionVerbRecommendations: string[];
  jobTitleMatch: boolean;
}

export interface InterviewQuestion {
  id: string;
  category: string;
  text: string;
  difficultyLevel: SkillLevel; // 0: Foundational, 1: Intermediate, 2: Advanced
  keyPoints?: string[];
  suggestedDurationSeconds?: number;
}

export interface InterviewMetrics {
  wordsPerMinute: number;
  fillerWordCount: number;
  fillerWordsUsed: string[];
  speechPaceRating: "too slow" | "ideal" | "too fast";
  clarityScore: number;
  structureRating: "Needs Improvement" | "Good" | "Excellent (STAR structure)";
  engagementScore: number; // Facial & eye engagement proxy (STRICTLY NO APPEARANCE/DRESS SCORING)
}

export interface InterviewFeedback {
  strengths: string[];
  areasForImprovement: string[];
  tone: "encouraging" | "nuanced" | "strategic"; // Adapts to effectiveLevel
  detailedSummary: string;
  nextPracticeAdvice: string;
}

export interface EffectiveLevelNudge {
  previousLevel: SkillLevel;
  newLevel: SkillLevel;
  nudged: boolean;
  reason: string;
}

export type PipelineStepStatus = "completed" | "failed" | "pending" | "unavailable";

export interface InterviewPipelineStatus {
  transcription: PipelineStepStatus;
  contentScoring: PipelineStepStatus;
  voiceDelivery: PipelineStepStatus;
  facialEngagement: PipelineStepStatus;
}

export interface InterviewSession {
  id: string;
  userId: string;
  questionId: string;
  questionText: string;
  category: string;
  difficultyLevel: SkillLevel;
  videoUrl?: string;
  audioUrl?: string;
  isAudioOnly?: boolean;
  transcript: string;
  contentScore: number;        // 0 - 100
  voiceScore: number;          // 0 - 100
  expressionScore: number;     // 0 - 100 (Engagement proxy)
  overallScore: number;        // 0 - 100
  pipelineStatus?: InterviewPipelineStatus;
  metrics: InterviewMetrics;
  feedback: InterviewFeedback;
  effectiveLevelChange?: EffectiveLevelNudge;
  createdAt: string;
}

export interface DailyTask {
  id: string;
  title: string;
  category: string;
  difficultyLevel: SkillLevel;
  estimatedMinutes: number;
  actionUrl: string;
  completed: boolean;
  completedAt?: string;
  skipped?: boolean;
  points: number;
  reason: string; // Explainability tag
}

export interface DailyPlan {
  date: string; // YYYY-MM-DD
  userId: string;
  tasks: DailyTask[];
  streakDays: number;
  pointsEarnedToday: number;
  totalPoints: number;
}

export interface RecommendedStep {
  id: string;
  title: string;
  description: string;
  actionUrl: string;
  actionLabel: string;
  explainabilityTag: string;
  category: string;
  priority: "high" | "medium" | "low";
}

export interface SyncedAccounts {
  github?: {
    connected: boolean;
    username: string;
    contributionsThisYear: number;
    recentRepos: Array<{ name: string; stars: number; language: string }>;
    lastSyncedAt: string;
  };
  linkedin?: {
    connected: boolean;
    profileUrl: string;
    verified: boolean;
  };
  leetcode?: {
    connected: boolean;
    username: string;
    problemsSolved: { easy: number; medium: number; hard: number; total: number };
    isSelfReported: boolean;
    lastUpdatedAt: string;
  };
}

// ==============================================================================
// Phase 26: Developer & Social Profile Integration Types (GitHub, LinkedIn, LeetCode)
// ==============================================================================

export type SocialProvider = "GITHUB" | "LINKEDIN" | "LEETCODE";
export type SyncStatus = "NOT_CONNECTED" | "SYNCING" | "SYNCED" | "FAILED";

export interface GitHubRepositoryItem {
  id?: number;
  name: string;
  fullName?: string;
  description: string | null;
  language: string | null;
  languages?: string[];
  stars: number;
  forks: number;
  isPrivate?: boolean;
  htmlUrl: string;
  updatedAt: string;
  topics?: string[];
}

export interface GitHubProfileData {
  username: string;
  name: string | null;
  avatarUrl: string | null;
  bio: string | null;
  company: string | null;
  location: string | null;
  publicRepos: number;
  followers: number;
  following: number;
  topLanguages: string[];
  repositories: GitHubRepositoryItem[];
  totalStars: number;
}

export interface LeetCodeProfileData {
  username: string;
  profileUrl: string;
  ranking: number | null;
  reputation: number | null;
  contestRating: number | null;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  acceptanceRate: string | null;
  badges: string[];
  topLanguages: string[];
}

export interface LinkedInProfileData {
  username?: string;
  profileUrl: string;
  name?: string;
  headline?: string;
  location?: string;
  verified: boolean;
  lastVerifiedAt?: string;
  experienceYears?: number;
  skills?: string[];
}

export interface ConnectedAccount {
  id: string;
  userId: string;
  provider: SocialProvider;
  providerUserId?: string;
  username: string;
  profileUrl: string;
  status: "CONNECTED" | "DISCONNECTED" | "VERIFIED" | "PENDING";
  scopes?: string[];
  lastSyncedAt?: string;
  syncStatus: SyncStatus;
  syncError?: string;
  data?: {
    github?: GitHubProfileData;
    linkedin?: LinkedInProfileData;
    leetcode?: LeetCodeProfileData;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DeveloperEvidenceCategory {
  category: string;
  score: number;
  confidence: "Low" | "Medium" | "High";
  evidence: string[];
  lastUpdated: string;
}

export interface DeveloperEvidenceProfile {
  userId: string;
  githubSummary?: {
    username: string;
    totalRepos: number;
    totalStars: number;
    topLanguages: string[];
    verifiedProjectsCount: number;
    lastSyncedAt?: string;
  };
  leetcodeSummary?: {
    username: string;
    ranking: number | null;
    totalSolved: number;
    easySolved: number;
    mediumSolved: number;
    hardSolved: number;
    contestRating: number | null;
    acceptanceRate: string | null;
    lastSyncedAt?: string;
  };
  linkedinSummary?: {
    profileUrl: string;
    headline: string | null;
    experienceYears: number;
    verifiedSkillsCount: number;
    lastVerifiedAt?: string;
  };
  abilityScores: DeveloperEvidenceCategory[];
  overallAbilityScore: number;
  lastSynthesizedAt: string;
}

export interface WeeklyScheduleDay {
  dayName: string; // Mon, Tue, etc.
  date: string;    // YYYY-MM-DD
  isToday: boolean;
  isCompleted: boolean;
  taskCount: number;
  completedTaskCount: number;
}

// ==============================================================================
// Phase 3 Data Models: Job Board, Monetization, and Moderation
// ==============================================================================

export type JobType = "internship" | "full-time" | "part-time" | "freelance";

export interface InterviewExperience {
  id: string;
  userId: string;
  company: string;
  role: string;
  rounds: Array<{
    roundName: string;
    format: string;
    questionsAsked: string[];
  }>;
  overallNotes: string;
  difficultyRating?: number;
  isAnonymous: boolean;
  moderationStatus: "pending" | "approved" | "rejected";
  createdAt: string;
  authorName?: string;
}

export interface CompanyResearch {
  id: string;
  companyName: string;
  cultureNotes?: string;
  interviewProcessNotes?: string;
  commonQuestionThemes?: string[];
  compensationInsights?: string;
  sourceUrl?: string;
  lastVerifiedAt: string;
}

export interface JobOfferItem {
  id: string;
  company: string;
  role: string;
  baseComp: string;
  bonus?: string;
  equity?: string;
  location: string;
  workMode: "Remote" | "Hybrid" | "On-site";
  benefits?: string;
  pros?: string;
  cons?: string;
}

export type ModerationStatus = "pending" | "approved" | "rejected";
export type ApplicationStatus = "applied" | "viewed" | "rejected" | "interview" | "offer";

export interface JobListing {
  id: string;
  title: string;
  company: string;
  description: string;
  location: string;
  type: JobType;
  skillsRequired: string[];
  postedBy: string;             // Employer userId or "admin" for curated/seeded listings
  postedByName?: string;
  applicationDeadline: string;
  createdAt: string;
  isActive: boolean;
  moderationStatus: ModerationStatus;
  moderationNotes?: string;
  salaryRange?: string;
  recommendedMinLevel?: SkillLevel; // Suggested effective level
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle?: string;
  companyName?: string;
  userId: string;
  applicantName: string;
  applicantEmail: string;
  resumeId: string;
  resumeTitle: string;
  resumeSnapshot?: ResumeContent;
  coverNote?: string;
  status: ApplicationStatus;
  appliedAt: string;
  statusUpdatedAt: string;
  matchScore?: number;
  employerNotes?: string;
}

export type SubscriptionPlanId = "free" | "pro";

export interface UserSubscription {
  userId: string;
  plan: SubscriptionPlanId;
  status: "active" | "canceled" | "past_due" | "trialing";
  currentPeriodEnd?: string;
  razorpayCustomerId?: string;
  razorpaySubscriptionId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  interviewsUsedThisMonth: number;
  resumesCreated: number;
}

export interface RazorpayOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface RazorpayVerificationPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  plan: SubscriptionPlanId;
}

export type ReportType = "job" | "profile" | "project";
export type ReportStatus = "pending" | "resolved" | "dismissed";

export interface ContentReport {
  id: string;
  type: ReportType;
  targetId: string;
  targetName: string;
  reportedBy: string;
  reportedByName?: string;
  reason: string;
  status: ReportStatus;
  adminNotes?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface PlatformStats {
  totalUsers: number;
  activeThisWeek: number;
  interviewsRun: number;
  jobsPosted: number;
  applicationsSubmitted: number;
  proSubscribers: number;
}

// ==============================================================================
// Phase 3 Data Models: Networking, Mentorship, and Messaging
// ==============================================================================

export interface MentorProfile {
  id: string;
  userId: string;
  name: string;
  headline: string;
  bio: string;
  company: string;
  role: string;
  domains: string[]; // e.g. ["Software Engineering", "System Design"]
  hourlyRate: number; // 0 for pro bono / free
  isVerifiedMentor: boolean;
  rating: number;
  reviewCount: number;
  avatarUrl?: string;
  availabilitySlots: string[]; // e.g. ["Mon 6:00 PM IST", "Sat 11:00 AM IST"]
  linkedInUrl?: string;
  githubUrl?: string;
  totalMenteesHelped: number;
  createdAt: string;
}

export type MentorshipRequestStatus = "pending" | "accepted" | "declined" | "completed";

export interface MentorshipRequest {
  id: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  senderAgeBand: AgeBand;
  receiverId: string;
  mentorId: string;
  mentorName: string;
  topic: string;
  goal: string;
  message: string;
  preferredTime: string;
  status: MentorshipRequestStatus;
  meetingLink?: string;
  declineReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
  readBy: string[];
}

export interface MessageThread {
  id: string;
  participants: string[];
  participantDetails: Record<
    string,
    {
      name: string;
      avatarUrl?: string;
      isMentor?: boolean;
      ageBand?: AgeBand;
    }
  >;
  lastMessage: string;
  lastMessageAt: string;
  unreadCounts: Record<string, number>;
  isSupervisedCohort?: boolean;
}

export interface PeerStudyCircle {
  id: string;
  name: string;
  domain: string;
  difficultyLevel: SkillLevel;
  memberCount: number;
  maxMembers: number;
  description: string;
  nextSessionAt: string;
  tags: string[];
  leadName: string;
}

export type ConnectionStatus = "pending" | "accepted" | "declined";
export type ConnectionRequestType = "connection" | "mentorship";

export interface Connection {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterUsername?: string;
  requesterHeadline?: string;
  requesterAvatarUrl?: string;
  recipientId: string;
  recipientName: string;
  recipientUsername?: string;
  recipientHeadline?: string;
  recipientAvatarUrl?: string;
  status: ConnectionStatus;
  requestType: ConnectionRequestType;
  message?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  participantDetails: Record<
    string,
    {
      name: string;
      username?: string;
      headline?: string;
      avatarUrl?: string;
    }
  >;
  lastMessageText: string;
  lastMessageAt: string;
  lastSenderId?: string;
  unreadCounts?: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

export interface DirectMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
}

export interface UserBlock {
  id: string;
  blockerId: string;
  blockedId: string;
  createdAt: string;
}

export type UserReportType = "profile" | "message" | "connection";
export type UserReportStatus = "pending" | "reviewed" | "resolved" | "dismissed";

export interface UserReport {
  id: string;
  type: UserReportType;
  targetId: string;
  targetName?: string;
  reportedBy: string;
  reporterName?: string;
  reason: string;
  status: UserReportStatus;
  adminNotes?: string;
  createdAt: string;
}

export interface PublicUserProfile {
  userId: string;
  username: string;
  name: string;
  avatarUrl?: string;
  headline?: string;
  bio?: string;
  role?: string;
  userType?: "STUDENT" | "WORKING_PROFESSIONAL" | "student" | "professional";
  college?: string;
  degree?: string;
  branch?: string;
  graduationYear?: string;
  currentRole?: string;
  company?: string;
  industry?: string;
  experienceYears?: number | string;
  location?: string;
  isLocationVisible?: boolean;
  skills?: string[];
  projects?: Array<{
    id: string;
    title: string;
    description: string;
    technologies: string[];
    githubRepo?: string;
    demoUrl?: string;
    verificationStatus?: string;
  }>;
  githubUrl?: string;
  linkedinUrl?: string;
  leetcodeUrl?: string;
  portfolioUrl?: string;
  isPublic: boolean;
  visibility?: "PUBLIC" | "EDWORLD_USERS_ONLY" | "PRIVATE" | string;
  showInNetwork?: boolean;
  isMentor?: boolean;
  mentorTags?: string[];
  ageBand: AgeBand;
  showResume?: boolean;
  publicResumeId?: string;
  mutualConnectionsCount?: number;
  connectionStatus?: "none" | "pending_sent" | "pending_received" | "accepted" | "declined" | "blocked";
  connectionId?: string;
}

// ============================================================
// PHASE 19: INTERNAL ORGANIZATION OPERATING SYSTEM TYPES
// ============================================================

export type UserRole =
  | "STUDENT"
  | "CLIENT"
  | "EMPLOYEE"
  | "HR"
  | "TEACHER"
  | "SCHOOL_ADMIN"
  | "COLLEGE_ADMIN"
  | "PLACEMENT_OFFICER"
  | "FOUNDER"
  | "EXECUTIVE"
  | "ADMIN"
  | "SUPER_ADMIN";

// --- EMPLOYEE WORKSPACE ---
export type CheckInStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export interface EmployeeCheckIn {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  priorities: string[];
  yesterdayProgress: string;
  blockers: string;
  mood: "Great" | "Good" | "Okay" | "Stressed" | "Blocked";
  hoursWorked: number;
  status: CheckInStatus;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = "TODO" | "IN_PROGRESS" | "BLOCKED" | "IN_REVIEW" | "COMPLETED";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface TaskComment {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: string;
}

export interface EmployeeTask {
  id: string;
  title: string;
  description: string;
  project: string;
  priority: TaskPriority;
  assigneeId: string;
  assigneeName: string;
  assigneeEmail: string;
  assignedById: string;
  dueDate: string;
  status: TaskStatus;
  comments: TaskComment[];
  attachments?: Array<{ name: string; url: string; size: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface KeyResult {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  progressPercentage: number;
}

export interface EmployeeOKR {
  id: string;
  objective: string;
  keyResults: KeyResult[];
  overallProgress: number;
  ownerId: string;
  ownerName: string;
  quarter: string; // e.g., "Q1 2026"
  deadline: string;
  managerNotes?: string;
  status: "ON_TRACK" | "AT_RISK" | "BEHIND" | "COMPLETED";
  createdAt: string;
  updatedAt: string;
}

export interface EmployeePerformanceRecord {
  id: string;
  employeeId: string;
  period: string;
  okrProgressAvg: number;
  tasksCompleted: number;
  tasksOverdue: number;
  attendanceRate: number;
  projectContributions: string[];
  managerFeedback: Array<{
    managerId: string;
    managerName: string;
    feedback: string;
    date: string;
    rating: number; // 1-5
  }>;
  reviewHistory: Array<{
    cycle: string;
    evaluation: string;
    strengths: string[];
    growthAreas: string[];
    date: string;
  }>;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  profilePhoto?: string;
  department: string;
  designation: string;
  managerName?: string;
  workEmail: string;
  availabilityStatus: "AVAILABLE" | "IN_A_MEETING" | "FOCUS_MODE" | "ON_LEAVE" | "OFFLINE";
  location?: string;
  joiningDate?: string;
}

export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
export type LeaveType = "CASUAL" | "SICK" | "PAID_VACATION" | "UNPAID" | "COMPENSATORY";

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  department: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  status: LeaveStatus;
  reviewedBy?: string;
  reviewerNotes?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface LeaveBalance {
  casualLeave: number;
  sickLeave: number;
  paidVacation: number;
  totalTaken: number;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  designation: string;
  department: string;
  payPeriod: string; // "March 2026"
  paymentStatus: "PAID" | "PENDING" | "PROCESSING" | "HOLD";
  baseSalary: number;
  allowances: {
    hra: number;
    special: number;
    transport: number;
  };
  deductions: {
    pf: number;
    tax: number;
    other: number;
  };
  netPay: number;
  disbursedAt?: string;
  bankAccountMasked?: string;
  payslipUrl?: string;
}

export interface EmployeeDocument {
  id: string;
  ownerId: string;
  ownerName: string;
  title: string;
  documentType: "EMPLOYMENT_CONTRACT" | "OFFER_LETTER" | "ID_PROOF" | "PAYSLIP" | "POLICY" | "OTHER";
  fileUrl: string;
  fileSize: string;
  visibility: "PRIVATE" | "HR_ONLY" | "COMPANY_WIDE";
  createdAt: string;
}

// --- HR COMMAND CENTER & PROVISIONING ---
export type CandidateStage =
  | "Applied"
  | "Screening"
  | "Interview"
  | "Selected"
  | "Offer"
  | "Onboarding"
  | "Rejected";

export interface Candidate {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  appliedRole: string;
  department: string;
  experienceYears: number;
  resumeUrl?: string;
  currentStage: CandidateStage;
  interviewDate?: string;
  interviewer?: string;
  notes: Array<{ author: string; text: string; date: string }>;
  rating?: number;
  offerDetails?: {
    offeredRole: string;
    offeredCtc: string;
    joiningDate: string;
    status: "DRAFT" | "SENT" | "ACCEPTED" | "DECLINED";
  };
  createdAt: string;
  updatedAt: string;
}

export type StaffAccountStatus =
  | "PROVISIONED"
  | "INVITATION_SENT"
  | "ACCOUNT_ACTIVATED"
  | "PASSWORD_SET"
  | "PROFILE_COMPLETED"
  | "ACTIVE";

export interface OnboardingChecklist {
  personalDetails: boolean;
  documents: boolean;
  offer: boolean;
  contract: boolean;
  bankDetails: boolean;
  departmentAssigned: boolean;
  managerAssigned: boolean;
  equipmentDispatched: boolean;
  emailAccountCreated: boolean;
  accessPermissionsSet: boolean;
  orientationCompleted: boolean;
  completionPercentage: number;
}

export interface OnboardingRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  corporateEmail: string;
  department: string;
  designation: string;
  joiningDate: string;
  managerName: string;
  checklist: OnboardingChecklist;
  status: StaffAccountStatus;
  activationToken?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PayrollBatch {
  id: string;
  period: string; // "March 2026"
  totalEmployees: number;
  totalGross: number;
  totalNet: number;
  exceptionsCount: number;
  status: "DRAFT" | "CALCULATED" | "REVIEWED" | "APPROVED" | "PROCESSED";
  approvedBy?: string;
  processedAt?: string;
  createdAt: string;
}

// --- FOUNDER & EXECUTIVE STUDIO ---
export interface ExecutiveKPI {
  revenue: number;
  mrr: number;
  expenses: number;
  monthlyBurn: number;
  runwayMonths: number;
  cashPosition: number;
  activeClients: number;
  employeeCount: number;
  projectCount: number;
  schoolPartnerships: number;
  collegePartnerships: number;
  pipelineValue: number;
  updatedAt: string;
}

export interface FinancialRecord {
  id: string;
  month: string; // "2026-03"
  revenue: number;
  expenses: number;
  payrollExpense: number;
  operatingCosts: number;
  outstandingPayments: number;
  netCashFlow: number;
  closingCash: number;
}

export interface ValuationScenario {
  id: string;
  scenarioName: string;
  annualRecurringRevenue: number;
  projectedGrowthRate: number;
  assumedArrMultiple: number;
  estimatedValuation: number;
  comparableCompanies: string[];
  notes: string;
  isScenario: true;
  createdAt: string;
}

export interface InvestorUpdate {
  id: string;
  title: string;
  quarter: string; // "Q1 2026"
  highlights: string[];
  kpis: {
    revenue: string;
    growth: string;
    burnRate: string;
    runway: string;
  };
  productProgress: string;
  partnerships: string;
  teamUpdates: string;
  challenges: string;
  nextQuarterGoals: string[];
  fundingRequirements?: string;
  status: "DRAFT" | "PREVIEW" | "READY_FOR_EXPORT";
  createdAt: string;
  updatedAt: string;
}

export type InitiativeStatus = "PLANNED" | "ACTIVE" | "AT_RISK" | "COMPLETED" | "CANCELLED";

export interface StrategicInitiative {
  id: string;
  title: string;
  owner: string;
  priority: "HIGH" | "CRITICAL" | "MEDIUM";
  deadline: string;
  status: InitiativeStatus;
  budget: number;
  expectedOutcome: string;
  progressPercentage: number;
  createdAt: string;
}

export interface FounderAlert {
  id: string;
  title: string;
  description: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  source: "FINANCE" | "PROJECT" | "HR" | "PARTNERSHIP" | "SYSTEM";
  date: string;
  resolved: boolean;
}

// --- SCHOOL TEACHER STUDIO ---
export interface TeacherClass {
  id: string;
  name: string; // e.g. "Grade 10 - Section A"
  subject: string;
  totalStudents: number;
  scheduleTime: string;
  room: string;
}

export interface StudentRecord {
  id: string;
  rollNumber: string;
  name: string;
  classId: string;
  className: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  attendancePercentage: number;
  overallGrade: string;
  recentRemarks?: string;
}

export interface AttendanceEntry {
  studentId: string;
  studentName: string;
  status: "PRESENT" | "ABSENT" | "LATE";
  remarks?: string;
}

export interface ClassAttendanceLog {
  id: string;
  classId: string;
  date: string;
  records: AttendanceEntry[];
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  createdAt: string;
}

export interface GradeRecord {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  assessmentTitle: string;
  marksObtained: number;
  maxMarks: number;
  grade: string; // "A+", "A", "B", etc.
  remarks: string;
  date: string;
}

export type LessonPlanStatus = "PLANNED" | "IN_PROGRESS" | "COMPLETED";

export interface LessonPlan {
  id: string;
  teacherId: string;
  subject: string;
  gradeLevel: string;
  topic: string;
  date: string;
  objectives: string[];
  activities: string[];
  resources: string[];
  homework: string;
  status: LessonPlanStatus;
  createdAt: string;
}

export interface ParentMessage {
  id: string;
  teacherId: string;
  teacherName: string;
  studentId: string;
  studentName: string;
  parentName: string;
  parentEmail: string;
  subject: string;
  message: string;
  sentAt: string;
  replies?: Array<{
    sender: "TEACHER" | "PARENT";
    text: string;
    timestamp: string;
  }>;
}

// --- COLLEGE & PLACEMENT HUB ---
export type PlacementDriveStatus = "PLANNED" | "OPEN" | "ONGOING" | "COMPLETED" | "CANCELLED";

export interface PlacementDrive {
  id: string;
  companyName: string;
  logoUrl?: string;
  role: string;
  packageLpa: number;
  eligibilityCriteria: {
    minCgpa: number;
    allowedBranches: string[];
    maxBacklogs: number;
  };
  driveDate: string;
  location: string; // "On-Campus (Auditorium)" | "Virtual"
  applicationDeadline: string;
  rounds: string[]; // ["Aptitude Test", "Technical Interview", "HR Interview"]
  coordinatorName: string;
  status: PlacementDriveStatus;
  registeredCount: number;
  shortlistedCount: number;
  placedCount: number;
  createdAt: string;
}

export type PlacementStage =
  | "ELIGIBLE"
  | "APPLIED"
  | "SHORTLISTED"
  | "ROUND_1"
  | "ROUND_2"
  | "SELECTED"
  | "PLACED";

export interface PlacementStudent {
  id: string;
  rollNo: string;
  fullName: string;
  branch: string;
  cgpa: number;
  activeBacklogs: number;
  appliedDrivesCount: number;
  offersCount: number;
  currentStage: PlacementStage;
  placedCompany?: string;
  packageOfferedLpa?: number;
}

export interface SyllabusMapping {
  id: string;
  academicProgram: string;
  subjectCode: string;
  subjectName: string;
  targetSkill: string;
  industryRequirement: string;
  matchingPlacementRole: string;
  alignmentScore: number; // 0-100%
  updatedAt: string;
}

export interface CompanyPartner {
  id: string;
  companyName: string;
  industry: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  drivesConducted: number;
  totalHired: number;
  avgPackageLpa: number;
  tier: "Tier-1" | "Tier-2" | "Tier-3";
  relationshipNotes: string;
}

export interface PlacementAnalytics {
  totalEligibleStudents: number;
  totalApplicants: number;
  totalShortlisted: number;
  totalInterviews: number;
  totalOffers: number;
  totalPlaced: number;
  placementPercentage: number;
  avgPackageLpa: number;
  highestPackageLpa: number;
}

// --- SYSTEM NOTIFICATIONS & AUDIT LOGS ---
export interface SystemNotification {
  id: string;
  recipientId: string;
  recipientRole?: UserRole;
  title: string;
  message: string;
  type: "TASK" | "LEAVE" | "PAYROLL" | "INTERVIEW" | "ANNOUNCEMENT" | "SYSTEM" | "ACADEMIC";
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface SystemAuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole | string;
  action: string;
  resource: string;
  resourceId?: string;
  result: "SUCCESS" | "FAILURE" | "DENIED";
  metadata?: Record<string, any>;
  ipAddress?: string;
  timestamp: string;
}

// --- FEATURE 17 COMPLETE EXPANSION TYPES ---
export type CareerEvidenceType = 
  | 'project' 
  | 'certification' 
  | 'award' 
  | 'hackathon' 
  | 'publication' 
  | 'internship' 
  | 'work_achievement' 
  | 'leadership' 
  | 'open_source' 
  | 'competition';

export interface CareerEvidenceItem {
  id: string;
  user_id: string;
  type: CareerEvidenceType;
  title: string;
  description?: string;
  date?: string;
  evidence_url?: string;
  skills: string[];
  visibility: 'private' | 'portfolio' | 'resume';
  created_at?: string;
  updated_at?: string;
}

export interface CareerDocumentItem {
  id: string;
  user_id: string;
  name: string;
  document_type: 'resume' | 'cover_letter' | 'certificate' | 'experience_letter' | 'offer_letter' | 'portfolio_doc' | 'other';
  file_url: string;
  file_size?: number;
  file_type?: string;
  created_at?: string;
  updated_at?: string;
}

export interface InterviewReflectionItem {
  id: string;
  user_id: string;
  company: string;
  role: string;
  interview_date: string;
  went_well?: string;
  difficult_aspects?: string;
  difficult_questions: string[];
  improvement_areas?: string;
  personal_notes?: string;
  ai_summary?: string;
  created_at?: string;
}

export interface NetworkingGoalItem {
  id: string;
  user_id: string;
  goals: string[];
  target_industries: string[];
  target_roles: string[];
  study_focus?: string;
  created_at?: string;
}

export interface ReferralRequestItem {
  id: string;
  requester_id: string;
  referrer_id: string;
  job_id?: string;
  company: string;
  role: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  message?: string;
  resume_url?: string;
  created_at?: string;
}

