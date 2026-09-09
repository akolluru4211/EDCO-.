# Edworld Co — Incident Response Plan & Data Breach Playbook

**Document Version:** 2.0 (Production Release)  
**Last Updated:** August 2026  
**Applicability:** Production Platform (`app.edworld.co`), Staging, and Database Infrastructure  

---

## 1. Incident Severity Classification Matrix

| Severity Level | Definition | Response SLA | Escalation Target |
| :--- | :--- | :--- | :--- |
| **SEV-1 (CRITICAL)** | Cross-user data exposure, unauthorized PII leak (e.g. DOB/Journal), payment verification compromise, total service outage. | **< 15 Minutes** | Incident Commander, Lead Security Engineer, Grievance Officer |
| **SEV-2 (HIGH)** | Significant feature degradation (e.g. mock interview scoring offline, webhook processing delay > 1hr). | **< 1 Hour** | Backend On-Call Engineer |
| **SEV-3 (MEDIUM)** | Minor UI inconsistency or non-blocking edge case. | **< 4 Hours** | Engineering Team |

---

## 2. Dedicated Scenario Playbook: Cross-User Data Exposure

Given that youth and minors utilize Edworld Co alongside adult career seekers, any cross-user session or data exposure is classified as an immediate **SEV-1 Critical Incident**.

### **Phase 1: Immediate Containment (< 15 mins)**
1. **Activate Circuit Breaker / Feature Flags**:
   - Disable affected endpoints via `public.feature_flags` or deploy maintenance mode overlay.
2. **Session Invalidation**:
   - Invalidate all active Supabase JWT user sessions to terminate any stale or poisoned browser tokens.
3. **Database Read Isolation**:
   - Check and enforce strict Row-Level Security (RLS) policies. Verify that `security_invoker = true` is set on all views.

### **Phase 2: Technical Investigation & Forensic Scoping (< 2 hours)**
1. **Inspect Audit Trail**:
   - Query `public.audit_logs` for `action = 'teacher.roster_accessed'`, `action = 'account.suspended'`, or anomalous tenant lookups.
2. **Identify Affected Cohort**:
   - Determine whether exposure was client-cached in local state or queried directly from PostgreSQL.
   - List exact user IDs whose profile, progress, or communication data may have been visible.

### **Phase 3: Legal, Regulatory & Grievance Officer Escalation (< 24 hours)**
1. **Grievance Officer Briefing**:
   - Formal briefing to Edworld Co's designated Grievance Officer.
2. **Regulatory Notifications (DPDP Act 2023 / GDPR / COPPA)**:
   - File mandatory data breach notification to the Data Protection Board of India / relevant supervisory authorities within **72 hours** of confirmation.
3. **Transparent User & Guardian Communication**:
   - Transparently email affected users and guardians of minor students detailing:
     - The nature of the isolated event
     - What specific non-sensitive or sensitive data was involved
     - Immediate containment steps executed
     - Direct contact information for the Grievance Officer

### **Phase 4: Remediation & Post-Mortem (< 48 hours)**
1. Write reproducible regression test in `scripts/verify_rls_allow_deny_matrix.js` replicating the exploit path and verifying the fix.
2. Publish an internal blameless Post-Mortem documenting root cause, timeline, and permanent preventive guardrails.

---

## 3. Contact & Escalation Roster

- **Incident Commander:** Lead Systems Engineer
- **Grievance Officer:** `grievance-officer@edworld.co`
- **Data Protection Office:** `privacy@edworld.co`
- **Ops / PagerDuty Alert Channel:** `#edworld-ops-alerts`
