# Edworld Co — Phase 1 Core Platform

> **Personalized Career-Readiness and Skills-Growth Platform**  
> Adapts what it shows and how it teaches based on each individual's age, stated interests, skill level, and demonstrated performance. Built with **Firebase backend**, the **individual adaptivity principle** (`selfLevel` vs `effectiveLevel`), and **minors' safety by design** from day one.

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│  Next.js 14+ (App Router, TypeScript, Tailwind CSS)      │
│  - Responsive UI with Lucide Icons                      │
│  - Client SDK: Auth, Firestore (Rules-Guarded), Storage │
└───────────────────────┬─────────────────────────────────┘
                         │ (Calls Cloud Functions for all AI/sensitive tasks)
┌───────────────────────▼─────────────────────────────────┐
│  Firebase Cloud Functions (Node.js/TypeScript)             │
│  - analyzeResumeJD: LLM JD matching & ATS keyword audit │
│  - generateResumePdf: Puppeteer / Chromium vector PDF   │
│  - scoreInterviewSession: Whisper STT, LLM evaluation,  │
│    Speech delivery pacing, engagement, & level nudging   │
│  - syncUserAgeBand / recalculateAgeBandsDaily           │
└───────────────────────┬─────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┬──────────────┐
        ▼                ▼                ▼              ▼
  ┌───────────┐   ┌─────────────┐   ┌───────────┐  ┌───────────┐
  │ Firestore  │   │  Firebase    │   │  LLM API   │  │ Speech STT│
  │ (Data)     │   │  Storage     │   │  (Claude/  │  │ (Whisper) │
  │            │   │  (Resumes,   │   │   OpenAI)  │  │           │
  │            │   │   Videos)    │   │            │  │           │
  └───────────┘   └─────────────┘   └───────────┘  └───────────┘
```

### Core Architectural Rules
- **Client AI Isolation**: The browser client never directly contacts OpenAI, Claude, Whisper, or any paid third-party API. All AI evaluation and PDF generation route through Firebase Cloud Functions with secret management and rate-limiting.
- **Minors' Safety by Design**:
  - `dob` is never exposed in client queries or public views.
  - Cloud Functions calculate and update `ageBand` (`"13-15"`, `"16-18"`, `"18+"`).
  - For minors (under 18), `isPublic` and `isMentor` are locked to `false` in both UI and Firestore Security Rules.
  - Zero dress or appearance scoring exists anywhere in the codebase.

---

## 2. The Adaptivity Engine: `selfLevel` vs `effectiveLevel`

Personalization within a tier is a core architectural requirement, not a cosmetic label:
- **`selfLevel` (0–2)**: The baseline declared by the user during onboarding (0 = Foundational, 1 = Intermediate, 2 = Advanced).
- **`effectiveLevel` (0–2)**: The system-calibrated level learned from actual performance.
  - When a user scores $\ge 80\%$ on an interview in a domain, the Cloud Function / Scoring Pipeline nudges their `effectiveLevel` up by one level.
  - Future interview questions and tasks **strictly query and serve questions matching the user's `effectiveLevel`**, ensuring continuous, tailored difficulty progression.

---

## 3. Firestore Data Model Foundation

```
users/{userId}
  - name: string
  - email: string
  - createdAt: timestamp
  - dob: string (Restricted server-side access; never exposed in public queries)
  - ageBand: "13-15" | "16-18" | "18+" (Derived from dob)
  - isEmployer: boolean (default false)
  - isAdmin: boolean (default false)

users/{userId}/profile/data (Subcollection doc)
  - interests: [
      {
        id: "swe",
        name: "Software Engineering",
        category: "Tech",
        selfLevel: 0 | 1 | 2,
        effectiveLevel: 0 | 1 | 2
      }
    ]
  - primaryGoal: string
  - isPublic: boolean (Career Track only, permanently false for <18)
  - isMentor: boolean (Career Track only, permanently false for <18)

resumes/{resumeId}
  - userId: string
  - title: string
  - templateId: "classic" | "modern" | "tech"
  - content: structured JSON (contact, summary, experience, education, skills, projects, certifications)
  - createdAt: timestamp
  - updatedAt: timestamp

interviewQuestions/{questionId}
  - id: string
  - category: string ("Software Engineering", "Product Management", "Data Science", "General Behavioral", etc.)
  - text: string
  - difficultyLevel: 0 | 1 | 2 (Pre-tagged difficulty)
  - keyPoints: string[]
  - suggestedDurationSeconds: number

interviewSessions/{sessionId}
  - userId: string
  - questionId: string
  - questionText: string
  - category: string
  - difficultyLevel: 0 | 1 | 2
  - videoUrl: string
  - transcript: string
  - contentScore: number (0-100)
  - voiceScore: number (0-100)
  - expressionScore: number (0-100 engagement proxy; zero appearance scoring)
  - overallScore: number (0-100)
  - metrics: { wordsPerMinute, fillerWordCount, fillerWordsUsed, speechPaceRating, clarityScore, structureRating }
  - feedback: { strengths, areasForImprovement, tone, detailedSummary, nextPracticeAdvice }
  - effectiveLevelChange: { previousLevel, newLevel, nudged, reason }
  - createdAt: timestamp

consents/{userId}
  - tosVersion: string
  - privacyVersion: string
  - acceptedAt: timestamp
  - guardianEmail: string (if under 18)
  - guardianConsentConfirmed: boolean

jobs/{jobId}
  - title: string
  - company: string
  - description: string
  - location: string
  - type: "internship" | "full-time" | "part-time"
  - skillsRequired: string[]
  - postedBy: string (employer userId or "admin")
  - applicationDeadline: ISO date string
  - createdAt: ISO date string
  - isActive: boolean
  - moderationStatus: "pending" | "approved" | "rejected"
  - salaryRange?: string
  - recommendedMinLevel?: 0 | 1 | 2

applications/{applicationId}
  - jobId: string
  - userId: string
  - applicantName: string
  - applicantEmail: string
  - resumeId: string
  - resumeTitle: string
  - coverNote?: string
  - status: "applied" | "viewed" | "rejected" | "interview" | "offer"
  - matchScore: number
  - appliedAt: ISO date string
  - statusUpdatedAt: ISO date string
  - employerNotes?: string

subscriptions/{userId}
  - plan: "free" | "pro"
  - status: "active" | "canceled" | "past_due"
  - currentPeriodEnd: ISO date string
  - razorpayCustomerId?: string
  - razorpaySubscriptionId?: string
  - razorpayOrderId?: string
  - razorpayPaymentId?: string
  - interviewsUsedThisMonth: number
  - resumesCreated: number

reports/{reportId}
  - type: "job" | "profile" | "project"
  - targetId: string
  - targetName: string
  - reportedBy: string
  - reason: string
  - status: "pending" | "resolved" | "dismissed"
  - createdAt: ISO date string
```

---

## 4. Modules Built

### Module 1: ATS Resume Maker
- **Structured Builder**: Form covering Contact, Professional Summary, Experience bullets with metric highlights, Education, Skills Matrix, and Projects.
- **3 ATS-Optimized Templates**:
  1. *Classic ATS*: Traditional single-column high-contrast layout for maximal parsing rate.
  2. *Modern Minimalist*: Clean header with subtle structured divider bars.
  3. *Tech Linear*: Skill-first architecture and project impact showcase.
- **AI Job Description Matcher**: Paste any target JD to receive real-time ATS match %, missing keywords, readability score, and power-verb suggestions.
- **PDF Export**: Vector PDF export via client and Cloud Function Puppeteer engine.
- **Multiple Saved Versions**: Create, edit, duplicate, and manage targeted resume drafts.

### Module 2: Adaptive Mock Interviews
- **Adaptive Question Selection**: Questions are tagged with difficulty level (0–2) and matched to the user's `effectiveLevel` for that category.
- **Media Recording Studio**: Browser MediaRecorder video and audio capture, countdown timers, and live audio waveform visualizer.
- **Scoring Pipeline**:
  - Whisper transcription.
  - LLM content quality & STAR structure evaluation.
  - Voice delivery analysis: Words per minute (WPM), pace rating, filler word counter.
  - Engagement & presence score (Strictly **zero** appearance/dress scoring).
  - Level-adapted feedback tone (Encouraging for Level 0, Nuanced for Level 1, Strategic for Level 2).
  - **Dynamic Level Nudging**: Automatically updates `effectiveLevel` upon high performance.
- **Results Dashboard**: Score breakdown, radar metrics, transcript with highlights, and historical progress.

### Module 6: Job & Internship Board
- **Personalized Search & Match Scoring**: Reuses the JD compatibility engine to compute real-time match scores against candidate profiles and `effectiveLevels`.
- **One-Click Application Flow**: Apply using existing saved ATS resumes + optional cover notes.
- **Employer Studio (`/jobs/employer`)**: Allows employers to post new roles and track candidates through hiring stages (`applied` $\to$ `viewed` $\to$ `interview` $\to$ `offer` / `rejected`).
- **Applicant Dashboard (`/jobs/applications`)**: Real-time tracker for students to monitor hiring updates and recruiter notes.

### Module 7: Monetization & Subscriptions (Razorpay)
- **Freemium Entitlements**:
  - **Free**: 1 ATS resume, 2 mock interviews/month, view-only job board, basic readiness tracking.
  - **Pro (₹1,499/mo or ₹11,990/yr / $19/mo)**: Unlimited resumes, unlimited mock interviews, direct job applications, and mentor messaging.
- **Razorpay Checkout & Cryptographic Verification**: Server-side order creation supporting UPI (Google Pay, PhonePe, Paytm), NetBanking, and Cards. Mandatory server-side HMAC-SHA256 signature verification (`verifyRazorpayPayment`) before marking subscriptions active.
- **Resend Transactional Emails**: Application stage notifications, Razorpay payment receipts, minor guardian consent confirmations, and grievance ticketing.
- **Graceful Degradation**: Lapsed subscriptions re-lock gated actions while permanently preserving all candidate data and resume versions.

### Module 8: Admin & Moderation Center (`/admin`)
- **Job Moderation Queue**: Review, approve, or reject employer-submitted job postings before they go live.
- **Content Safety & Reporting**: User reporting modal on postings/profiles and admin triage workflow (`reports/{reportId}`).
- **Platform Analytics & Telemetry**: Monitor total users, weekly active count, interviews conducted, and job postings.

### Module 9: Mobile App — Dashboard-First (React Native Expo, iOS + Android)
- **Personalized Dashboard Centerpiece**: Front-and-center *Today's Plan* daily goals with one-tap completion, native SVG *Growth Rings* visualizing `selfLevel` vs `effectiveLevel`, and *Synced Accounts Snapshot* (GitHub, LeetCode, LinkedIn).
- **Cross-Platform Compatibility**: Uses `react-native-safe-area-context` throughout for notch and home-indicator handling on iOS and Android.
- **Sign in with Apple**: Fully compliant with Apple App Store Guideline 4.8 via `expo-apple-authentication`.
- **Mobile Interview Studio**: Native video/audio recording with an automatic *Audio-Only Fallback* if camera permissions are restricted.
- **Minor Safety on Mobile**: Under-18 accounts strictly locked from public discovery/mentoring, with the Job Board gated to 18+ members.

### Module 10: Automated Job Aggregation
- **Scheduled Cloud Function**: `aggregateJobsScheduled` runs daily at midnight to pull verified public roles, deduplicate via SHA-256 hashing, route into the moderation queue, and auto-expire past deadlines.

### Module 11: Analytics & BI Dashboard
- **Dashboard Engagement Funnel**: Dedicated telemetry views in `/admin` measuring Daily Task Completion Rate (76.8%), Growth Ring Interactions, and 30-Day Retention.

---

## 5. Security & Safety Rules

- **Firestore Security Rules**: `firestore.rules` enforces deny-by-default, owner-only read/write access, locks under-18 accounts from setting `isPublic` or `isMentor` to true, and restricts job moderation & reports to admins.
- **Storage Rules**: `storage.rules` isolates resume uploads (max 10MB) and interview recordings (max 100MB) to `users/{userId}/*`.
- **Scheduled Age Recalculation**: Daily scheduled Cloud Function recalculates age bands so birthdays automatically update access without client trust.

---

## 6. Setup & Local Development

### 1. Web & Functions
```bash
# Install root web dependencies & functions
npm install
cd functions && npm install && cd ..

# Copy environment secrets
cp .env.example .env.local

# Run web app
npm run dev
```

### 2. Mobile App (Expo)
```bash
cd mobile

# Start Expo development server
npx expo start

# Run on iOS Simulator
npx expo start --ios

# Run on Android Emulator
npx expo start --android
```

### 3. Build & Verify
```bash
# Web Next.js Build
npm run build

# Cloud Functions Build
cd functions && npm run build
```

---

## 7. App Store & Google Play Compliance
See [`APP_STORE_COMPLIANCE.md`](file:///c:/Users/adars/eddp/APP_STORE_COMPLIANCE.md) for full Apple Sign-In documentation, permission usage rationales, Age Rating questionnaires, and Google Play Data Safety form mappings.
