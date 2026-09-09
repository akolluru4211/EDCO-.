# Edworld Co — Backend Architecture: Cloud Functions vs. Kubernetes Containers

## Executive Summary
Edworld Co employs a **hybrid backend compute topology**:
1. **Firebase Cloud Functions (Serverless)**: For event-driven, low-latency, stateless operations (Auth lifecycle triggers, JD-match LLM calls, daily task generation, profile sync, guardian consent, and Razorpay payment webhooks).
2. **Docker + Google Kubernetes Engine (GKE)**: For compute-heavy, memory-intensive, or long-running workloads (Puppeteer Chromium PDF rendering and asynchronous multi-step interview pipeline orchestration).

---

## 1. Workload Distribution Matrix

| Workload | Platform | Rationale | Scaling Model | Auth & Access |
|---|---|---|---|---|
| **Resume PDF Generation** | **Kubernetes (GKE)** | Puppeteer & Chromium require high memory (up to 1.5GB) and native Debian C-libraries. Cold starts on serverless cause timeout drops. | HPA (CPU $\ge 70\%$, min 2, max 10 replicas) | Internal `X-Internal-Secret` / Bearer ID Token |
| **Interview Pipeline Orchestrator** | **Kubernetes (GKE)** | Multi-step pipeline (Whisper retry &rarr; STAR LLM &rarr; speech pacing &rarr; profile nudge) benefits from controllable execution and decoupled job queues. | HPA (CPU $\ge 75\%$, min 2, max 8 replicas) | Internal `X-Internal-Secret` / Bearer ID Token |
| **JD-Match AI Scoring** | **Cloud Functions** | Single LLM completion request ($\le 3$ seconds). Serverless pay-per-invocation is optimal. | Automatic serverless concurrency | Firebase Auth context (`request.auth.uid`) |
| **Daily Task Generation** | **Cloud Functions** | Fast idempotent Firestore read/write executed on first daily visit. | Serverless invocation | Firebase Auth context |
| **Guardian Consent & Verify** | **Cloud Functions** | Event-driven token verification & COPPA audit logging. | Serverless invocation | Public secure token validation |
| **Razorpay Payments & Webhooks**| **Cloud Functions** | Webhook verification with cryptographic signature. Zero idle cost. | Serverless invocation | HMAC SHA-256 signature verification |

---

## 2. Infrastructure Architecture & Network Topology

```
                               ┌──────────────────────────────────────────────┐
                               │           Next.js Client / Edge App          │
                               └──────────────────────┬───────────────────────┘
                                                      │
                       ┌──────────────────────────────┴──────────────────────────────┐
                       │                                                             │
                       ▼ (Client / Browser Invocations)                               ▼ (Internal / Heavy Compute)
        ┌─────────────────────────────┐                               ┌─────────────────────────────┐
        │   Firebase Cloud Functions  │                               │    Google Kubernetes Engine │
        │   - Auth Triggers           │                               │   (ClusterIP Internal Svcs) │
        │   - JD-Match LLM            │                               │                             │
        │   - Daily Task Generator    │                               │   ┌───────────────────────┐ │
        │   - Payment Webhooks        │                               │   │   PDF Service (8080)  │ │
        │   - Guardian Consent Flow   │                               │   │   Puppeteer + Chromium│ │
        └──────────────┬──────────────┘                               │   └───────────────────────┘ │
                       │                                              │   ┌───────────────────────┐ │
                       │                                              │   │Interview Orchestrator │ │
                       │                                              │   │(Port 8081)            │ │
                       │                                              │   └───────────────────────┘ │
                       │                                              └──────────────┬──────────────┘
                       │                                                             │
                       └──────────────────────────────┬──────────────────────────────┘
                                                      ▼
                               ┌──────────────────────────────────────────────┐
                               │  Google Cloud Firestore / Storage / Auth DB  │
                               └──────────────────────────────────────────────┘
```

---

## 3. Kubernetes Operational Standards

### A. Environment & Namespace Isolation
- `edworld-dev`: Development and preview clusters.
- `edworld-staging`: Mirror of production for pre-release validation.
- `edworld-prod`: High-availability multi-zone production cluster.

### B. Health Probes & Auto-Recovery
Both containerized services implement standard Kubernetes probes:
- **Liveness Probe (`/healthz`)**: Verifies HTTP server event loop responsiveness. If failed 3 consecutive times, Kubernetes restarts the pod.
- **Readiness Probe (`/readyz`)**: Verifies dependency readiness (Chromium browser pool initialized in PDF service; Firestore client ready in Orchestrator). Unready pods are excluded from routing.

### C. Resource Boundaries & Noisy Neighbor Prevention
- **PDF Service**: Requests `250m CPU / 512Mi Memory`; Limits `1000m CPU / 1536Mi Memory`.
- **Interview Orchestrator**: Requests `200m CPU / 384Mi Memory`; Limits `800m CPU / 1024Mi Memory`.

### D. Security Context & Non-Root Execution
All containers run with non-root user security contexts:
```yaml
securityContext:
  runAsNonRoot: true
  runAsUser: 1000
  fsGroup: 1000
```
API keys and internal secrets are mounted from `SecretKeyRef` via Google Secret Manager.

### E. Structured Logging & Monitoring
Logs are emitted in standard JSON format to `stdout`, automatically indexed by Google Cloud Logging and filtered by `app: pdf-service` and `app: interview-orchestrator`.
