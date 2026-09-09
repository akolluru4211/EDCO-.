# Edworld Co — App Store & Google Play Compliance Guide

> **Official Review & Compliance Audit Document for Mobile App Submission**  
> Covers Apple App Store Review Guidelines (iOS) and Google Play Developer Policies (Android), including **Sign in with Apple**, **Minor Safety Protections**, **Age Ratings**, and the **Google Play Data Safety Form**.

---

## 1. Apple App Store Compliance (iOS)

### 1.1 Sign in with Apple (Guideline 4.8)
- **Status:** **Fully Implemented** via `expo-apple-authentication`.
- **Rationale:** Because the Edworld Co mobile app provides third-party social login (Google Sign-In), Apple Guideline 4.8 mandates offering **Sign in with Apple** with equivalent prominence.
- **Location:** [`mobile/src/screens/AuthScreen.tsx`](file:///c:/Users/adars/eddp/mobile/src/screens/AuthScreen.tsx#L40-L45)

### 1.2 Privacy Permission Descriptions (`Info.plist`)
The following usage descriptions are configured in [`mobile/app.json`](file:///c:/Users/adars/eddp/mobile/app.json):
- **`NSCameraUsageDescription`**:  
  *"Edworld Co uses your camera to record mock interview practice answers for AI speech and presentation feedback."*
- **`NSMicrophoneUsageDescription`**:  
  *"Edworld Co uses your microphone to transcribe your interview answers and analyze speech pace and delivery metrics."*

### 1.3 Apple Age Rating Questionnaire
- **Recommended Age Rating:** **12+**
- **Questionnaire Disclosures:**
  - *Infrequent/Mild Medical/Curated Advice:* None.
  - *Unrestricted Web Access:* No (External browser links only open curated professional profiles).
  - *Gambling/Contests:* None.
  - *User-Generated Content:* Yes (Mock interview answers and ATS resumes, secured to private user accounts).
  - *Safety Lockouts for Minors:* Accounts under 18 have public networking, mentor listings, and job boards strictly disabled.

---

## 2. Google Play Store Compliance (Android)

### 2.1 Runtime Permissions & Graceful Fallback
- **Permissions Declared in Manifest:** `CAMERA`, `RECORD_AUDIO`, `POST_NOTIFICATIONS`.
- **Graceful Fallback:** If camera permission is denied on Android, the app does not crash or block progress; it provides an **Audio-Only Practice Fallback** in [`mobile/src/screens/InterviewScreen.tsx`](file:///c:/Users/adars/eddp/mobile/src/screens/InterviewScreen.tsx#L85-L100).

### 2.2 Google Play Data Safety Form Disclosures
The following data points are submitted on the Google Play Console:

| Data Type | Collected | Shared with 3rd Party | Ephemeral / Stored | Purpose |
|---|---|---|---|---|
| **Personal Info (Name, Email)** | Yes | Processed by Resend | Stored (Encrypted in Firebase Auth) & Resend (Transactional alerts) | App Functionality & Transactional Email |
| **Date of Birth (DOB)** | Yes | No | Stored Server-Side Only | Age-Band Derivation & Minor Safety Gating |
| **Voice / Audio Recordings** | Yes | No | Ephemeral / Cloud Function Whisper STT | AI Speech Pacing & STAR Feedback |
| **Video Recordings** | Optional | No | Ephemeral / Client-Side | Mock Interview Simulation (Zero appearance scoring) |
| **User Activity (Tasks, Streaks)** | Yes | No | Stored | Adaptive Learning & Level Progression |
| **Payment Info** | Yes | Processed by Razorpay | Handled via Razorpay Checkout (PCI-DSS Level 1 & DPDP Act compliant) | Pro Subscription Processing (UPI, Cards, NetBanking) |

### 2.3 Minors & Families Policy
- **Parental/Guardian Consent:** Users reporting a Date of Birth indicating they are under 18 are required to provide a parent/guardian email before accessing the platform.
- **Restricted Features for Minors:**
  - `isPublic: false` (Cannot be searched or viewed publicly).
  - `isMentor: false` (Cannot offer mentor services to third parties).
  - Job Board restricted to $18+$ Career Track members.
  - Zero behavioral advertising or third-party ad SDKs.

---

## 3. Store Submission Verification Checklist

- [x] Apple Sign-In button tested and verified.
- [x] Safe area handling on notched devices (`react-native-safe-area-context`).
- [x] Permission pre-prompts for Camera & Microphone with audio fallback.
- [x] Under-18 test account flows cleanly through guardian consent without crashing.
- [x] Google Play Data Safety form mapped directly to security audit.
