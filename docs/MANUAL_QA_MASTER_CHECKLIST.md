# Edworld Co — Master Manual QA & Definition of Done Checklist

This consolidated checklist covers all core verification criteria across Features 1 through 13. It must be validated before promoting any deployment from Staging to Production.

---

### **1. Authentication & Youth Age-Gating (Feature 1 & Bypass Re-Verification)**
- [ ] Email/Password authentication enforced (8+ characters, letters & numbers).
- [ ] Zero Google OAuth sign-in buttons or dependencies.
- [ ] Date of Birth actively collected at onboarding; DOB stored exclusively in `public.user_dob_records` with zero client SELECT policies.
- [ ] Age band correctly assigned (`13-15`, `16-18`, `18+`). Minor accounts require verified guardian consent before adult features unlock.
- [ ] Minors cannot access Adult 18+ Career routes (Resume Maker, Job Board, Monetization, open Networking).

---

### **2. Resume Maker & ATS Analysis (Feature 2)**
- [ ] ATS-friendly PDF generation and instant real-time resume score preview.
- [ ] JD keyword match highlights missing skills and suggests quantified improvements.
- [ ] Multiple resume versions supported up to plan entitlement limits.

---

### **3. Voice-Driven Mock Interview Studio (Feature 3 & Extension)**
- [ ] Universal opening warm-up: *"Tell me about yourself"*.
- [ ] Questions read aloud via TTS with replay control and 5-second prep countdown.
- [ ] Fullscreen Integrity Mode auto-pauses timer on exit with neutral session logging.
- [ ] Interactive speech transcript with inline mistake annotations (filler words, pacing, concrete metric suggestions).
- [ ] Encouraging camera engagement scoring (never harsh pass/fail).

---

### **4. Personalization & Explainable Telemetry (Feature 4)**
- [ ] `effectiveLevel` dynamically updates based on calibrated performance (score $\ge 80\%$).
- [ ] Dashboard recommendations include clear explainability tags (*"Because your primary goal is..."*).

---

### **5. Project Studio & Verifiable Portfolio (Feature 5)**
- [ ] GitHub repository import and architecture README analysis.
- [ ] Generated non-accreditation disclaimer on micro-project completion certificates.

---

### **6. Safe Networking & Mentorship (Feature 6)**
- [ ] Restricted strictly to `18+` Career Track members.
- [ ] Strict block/report capabilities; zero minor profile discovery.

---

### **7. Job Board & Transparent Applications (Feature 7)**
- [ ] Direct job applications with attached resume snapshot.
- [ ] Salary transparency disclosures and employer moderation queue.

---

### **8. School Track: Junior (13-15) & Explorer (16-18) (Feature 8)**
- [ ] Maximalist visual theme with playful, bold UI elements.
- [ ] Mandatory AI Ethics module required before prompting sandbox unlocks.
- [ ] Low-pressure Private Growth Journal (owner-only visibility).
- [ ] Scholarship Finder with freshness verification tracking.

---

### **9. Centralized Gamification (Feature 9)**
- [ ] Single source of truth: points and badges awarded server-side only via `awardPoints()`.
- [ ] Double-award prevention enforced via `(user_id, source_feature, source_id)`.
- [ ] Adult Track weekly leaderboard connection-scoped only.

---

### **10. Monetization & Razorpay Subscriptions (Feature 10)**
- [ ] Server-side age gating: Order creation rejects non-18+ users with 403 Forbidden.
- [ ] Strict HMAC-SHA256 signature verification for checkout & webhook events.
- [ ] 3-day grace period applied on payment failures before subscription downgrades.
- [ ] Pro entitlement checks strictly enforced across resumes, interviews, and messaging.

---

### **11. Institutional, Teacher & Admin Panels (Feature 11)**
- [ ] Teachers query `teacher_visible_student_progress` view exclusively (`security_invoker = true`).
- [ ] Teacher view strictly excludes student email, DOB, age band, resumes, videos, private messages, and journals.
- [ ] Audit logs record every roster inspection event (`teacher.roster_accessed`).
- [ ] Student "What My Teacher Can See" transparency panel confirms exact visibility boundaries.

---

### **12. Stage-Specific Expansion (Feature 12)**
- [ ] `career_stage` correctly splits `18+` users into College vs Working Professional.
- [ ] College stage includes Campus Placement Drives tracker, Hackathon Finder, and Peer Resume Reviews.
- [ ] Working Professional stage includes Career-Switch recommendations (with no-guarantee disclaimer), Job Search Kanban, and Salary Reference Benchmarks.
- [ ] SOP and Self-Appraisal writing assistants enforce anti-ghostwriting guards (rejecting < 20-25 words).

---

### **13. DevOps, Testing & Launch Readiness (Feature 13)**
- [ ] All 10 automated test suites passing with 100% pass rate.
- [ ] Zero lint or TypeScript compilation errors across all App Router routes.
- [ ] Log-scrubbing verified: Zero sensitive PII (DOB, passwords, journals) in logs.
- [ ] Incident Response Plan and Disaster Recovery scratch restore drill documented and verified.
