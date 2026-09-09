# Edworld Co — Cookie & Local Storage Policy

> [!WARNING]
> **DRAFT — PENDING LEGAL COUNSEL REVIEW. NOT YET FINAL FOR PUBLIC LAUNCH.**
> This document is a structured legal framework prepared for review by licensed legal counsel in India and relevant operating jurisdictions before commercial deployment.

**Last Updated:** August 30, 2026  
**Effective Date:** Upon Official Commercial Launch

---

## 1. Introduction
This Cookie & Local Storage Policy explains how Edworld Co uses cookies, browser local storage, and similar web technologies to provide, protect, and improve our services.

---

## 2. Categories of Technologies Used

### A. Strictly Necessary Cookies & Storage (Essential)
These tokens and storage items are required for the platform to function properly. They cannot be disabled.
- **Firebase Auth Session (`__session`, IndexedDB):** Manages secure user authentication, session renewal, and JWT token rotation.
- **Age-Band Gating Tokens:** Validates access control boundaries between Student Panel (Minors) and Career Panel (18+).
- **CSRF & App Check Security Tokens (`X-Firebase-AppCheck`):** Protects APIs against bot traffic and unauthorized backend invocations.

### B. Functional & Preference Storage
- **UI Visual Mode Preferences:** Stores your preferred visual mode (Maximalist vs Minimalist Career Mode).
- **Draft State:** Temporarily caches resume drafts and mock interview answers in local storage to prevent data loss during network interruptions.

### C. Analytics (18+ Adult Users Only)
- Aggregated performance telemetry and funnel tracking.
- **Zero Third-Party Advertising Cookies:** Edworld Co does not utilize third-party ad retargeting cookies.

---

## 3. Minors & Youth Safety Guarantee
In accordance with our DPDP youth safety charter:
- **No Tracking Cookies:** No tracking, profiling, or cross-site behavioral cookies are ever loaded on accounts belonging to learners under eighteen (18) years of age.
