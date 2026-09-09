"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedInterviewQuestions = exports.FULL_QUESTION_BANK = void 0;
const admin = __importStar(require("firebase-admin"));
const https_1 = require("firebase-functions/v2/https");
exports.FULL_QUESTION_BANK = [
    // 1. Software Engineering (Levels 0, 1, 2)
    {
        id: "swe-0-1",
        category: "Software Engineering",
        text: "Can you explain the difference between synchronous and asynchronous programming, and give a real-world example of when you would use each?",
        difficultyLevel: 0,
        keyPoints: ["Blocking vs non-blocking I/O", "UI responsiveness", "API network requests", "Real-world web or app scenario"],
        suggestedDurationSeconds: 120,
    },
    {
        id: "swe-0-2",
        category: "Software Engineering",
        text: "What is the Document Object Model (DOM) in web development, and how does React's Virtual DOM improve rendering performance?",
        difficultyLevel: 0,
        keyPoints: ["Tree representation of HTML", "Expensive browser reflows", "Reconciliation algorithm", "Batched DOM updates"],
        suggestedDurationSeconds: 120,
    },
    {
        id: "swe-0-3",
        category: "Software Engineering",
        text: "Explain what an API is, and walk through what happens under the hood when a user clicks 'Submit' on a form to send data to a backend server.",
        difficultyLevel: 0,
        keyPoints: ["Client-server architecture", "HTTP request methods (POST)", "Headers and payload", "Server response codes (200, 400, 500)"],
        suggestedDurationSeconds: 120,
    },
    {
        id: "swe-1-1",
        category: "Software Engineering",
        text: "Walk me through how you would optimize a web application that is experiencing slow initial page load times and heavy main-thread CPU usage.",
        difficultyLevel: 1,
        keyPoints: ["Profiling & network waterfalls", "Asset bundling & dynamic code splitting", "Database query indexing & caching", "Client-side re-render optimization (useMemo, React.memo)"],
        suggestedDurationSeconds: 180,
    },
    {
        id: "swe-1-2",
        category: "Software Engineering",
        text: "How do you handle database concurrency and race conditions when multiple users attempt to purchase the last available seat on a flight simultaneously?",
        difficultyLevel: 1,
        keyPoints: ["Pessimistic vs optimistic locking", "Database transactions (ACID properties)", "Distributed locks with Redis", "Idempotency keys"],
        suggestedDurationSeconds: 180,
    },
    {
        id: "swe-1-3",
        category: "Software Engineering",
        text: "Explain how you would design and implement automated integration and unit testing pipelines for a microservices-based web platform.",
        difficultyLevel: 1,
        keyPoints: ["Testing pyramid (unit, integration, e2e)", "Mocking third-party APIs", "CI/CD pipeline triggers with GitHub Actions", "Code coverage metrics & branch protection rules"],
        suggestedDurationSeconds: 180,
    },
    {
        id: "swe-2-1",
        category: "Software Engineering",
        text: "Design a globally distributed rate limiter that handles 100,000 requests per second with strict sub-millisecond latency constraints and high availability across multi-region deployments.",
        difficultyLevel: 2,
        keyPoints: ["Token bucket / sliding window counter algorithms", "Redis cluster vs local memory sync with gossip protocol", "Handling network partitions (CAP theorem trade-offs)", "Edge gateway rate limiting vs central authorization"],
        suggestedDurationSeconds: 240,
    },
    {
        id: "swe-2-2",
        category: "Software Engineering",
        text: "How would you architect an event-driven data streaming pipeline capable of ingesting 10 million telemetry events per minute, guaranteeing at-least-once delivery, and providing real-time aggregation?",
        difficultyLevel: 2,
        keyPoints: ["Apache Kafka / AWS Kinesis partitioning strategy", "Consumer group rebalancing & backpressure handling", "Dead-letter queues for malformed events", "Stateful stream processing (Apache Flink / Spark Streaming)"],
        suggestedDurationSeconds: 240,
    },
    {
        id: "swe-2-3",
        category: "Software Engineering",
        text: "Describe how you would decompose a monolithic application with high database coupling into modular microservices without downtime.",
        difficultyLevel: 2,
        keyPoints: ["Strangler Fig pattern", "Dual-writing with event-driven data synchronization", "Domain-Driven Design (Bounded Contexts)", "Automated canary deployments & rollback strategies"],
        suggestedDurationSeconds: 240,
    },
    // 2. General Behavioral & Leadership (Levels 0, 1, 2)
    {
        id: "beh-0-1",
        category: "General Behavioral & Leadership",
        text: "Tell me about a time you had to learn a new tool, programming language, or technology quickly to complete a task or project. What steps did you take?",
        difficultyLevel: 0,
        keyPoints: ["Clear situation context", "Structured self-learning strategy (documentation, sandbox testing)", "Overcoming roadblocks with guidance", "Positive project outcome and key takeaways"],
        suggestedDurationSeconds: 120,
    },
    {
        id: "beh-0-2",
        category: "General Behavioral & Leadership",
        text: "Describe a project where you worked closely with a team member who had a different working style or opinion than you. How did you ensure smooth collaboration?",
        difficultyLevel: 0,
        keyPoints: ["Active listening and empathy", "Setting clear expectations and communication norms", "Focusing on shared project goals", "Constructive compromise and successful delivery"],
        suggestedDurationSeconds: 120,
    },
    {
        id: "beh-0-3",
        category: "General Behavioral & Leadership",
        text: "Can you share an example of a mistake you made on a school or work project? How did you take ownership and what did you learn from it?",
        difficultyLevel: 0,
        keyPoints: ["Honest admission of error", "Immediate proactive steps to rectify the issue", "Post-incident reflection and process improvement", "Demonstrated growth mindset"],
        suggestedDurationSeconds: 120,
    },
    {
        id: "beh-1-1",
        category: "General Behavioral & Leadership",
        text: "Describe a situation where you had a strong technical or strategic disagreement with a senior engineer or product manager. How did you navigate the discussion to reach alignment?",
        difficultyLevel: 1,
        keyPoints: ["Using objective data and benchmarks rather than emotion", "Understanding stakeholder priorities and business constraints", "Presenting trade-offs with structured alternatives", "Disagreeing and committing when a final decision was made"],
        suggestedDurationSeconds: 180,
    },
    {
        id: "beh-1-2",
        category: "General Behavioral & Leadership",
        text: "Tell me about a time when project requirements changed abruptly close to a deadline. How did you reprioritize deliverables and manage team communication?",
        difficultyLevel: 1,
        keyPoints: ["Rapid scope triage (identifying non-negotiables)", "Transparent communication with stakeholders regarding timeline impact", "Shielding team morale during high-stress pivots", "Delivering a high-quality minimum viable release on schedule"],
        suggestedDurationSeconds: 180,
    },
    {
        id: "beh-1-3",
        category: "General Behavioral & Leadership",
        text: "Give an example of a time you mentored a junior peer or teammate who was struggling with a technical concept or deliverable.",
        difficultyLevel: 1,
        keyPoints: ["Diagnosing the root cause of the struggle (conceptual vs process)", "Pair programming and providing scaffolded exercises", "Encouraging independence and building confidence", "Measurable improvement in teammate's velocity and autonomous output"],
        suggestedDurationSeconds: 180,
    },
    {
        id: "beh-2-1",
        category: "General Behavioral & Leadership",
        text: "Tell me about a high-stakes production crisis or project failure where you were the technical or operational lead. How did you triage the emergency, communicate with executive leadership, and implement systemic prevention afterwards?",
        difficultyLevel: 2,
        keyPoints: ["Decisive incident command and blast-radius containment", "Calm and transparent executive stakeholder updates", "Blameless root-cause analysis (5 Whys)", "Engineering cultural and systemic safeguards implemented to prevent recurrence"],
        suggestedDurationSeconds: 240,
    },
    {
        id: "beh-2-2",
        category: "General Behavioral & Leadership",
        text: "How have you advocated for and driven an unpopular or expensive engineering modernization initiative (e.g. paying down significant technical debt or migrating architectures) to executive business leaders?",
        difficultyLevel: 2,
        keyPoints: ["Translating technical debt into business risk and lost revenue metrics", "Building cross-functional consensus with product and finance leaders", "Proposing an incremental phased migration plan rather than a total rewrite", "Demonstrating measurable ROI in developer velocity and reliability"],
        suggestedDurationSeconds: 240,
    },
    // 3. Product Management (Levels 0, 1, 2)
    {
        id: "pm-0-1",
        category: "Product Management",
        text: "What is your favorite mobile application and how would you redesign its user onboarding flow to increase day-7 user retention?",
        difficultyLevel: 0,
        keyPoints: ["Clear target persona definition", "Identifying core friction and 'aha' moments", "Hypothesis-driven redesign proposal", "Metrics to measure onboarding success (D1/D7 retention, activation rate)"],
        suggestedDurationSeconds: 120,
    },
    {
        id: "pm-0-2",
        category: "Product Management",
        text: "How do you define a Minimum Viable Product (MVP), and how would you determine what features make the cut for an MVP of a food delivery app for college campuses?",
        difficultyLevel: 0,
        keyPoints: ["Differentiating core value proposition from nice-to-haves", "Customer pain point prioritization (affordability, speed)", "Lean experimentation and feedback loops"],
        suggestedDurationSeconds: 120,
    },
    {
        id: "pm-1-1",
        category: "Product Management",
        text: "Imagine daily active users (DAU) for our platform's core collaboration feature dropped by 15% over the past 7 days. Walk me through your step-by-step diagnostic framework.",
        difficultyLevel: 1,
        keyPoints: ["Data validation & telemetry integrity check", "Segmentation by platform, geography, user cohort, and app version", "External factors (holidays, competitor launches, outage) vs internal releases", "Formulating prioritized hypotheses and coordinating remediation"],
        suggestedDurationSeconds: 180,
    },
    {
        id: "pm-1-2",
        category: "Product Management",
        text: "You have limited engineering bandwidth for the quarter and must choose between building an enterprise compliance export feature (demanded by sales) vs improving user onboarding conversion (demanded by growth). How do you decide?",
        difficultyLevel: 1,
        keyPoints: ["Quantifying expected value (ARR unlocked vs lifetime user value)", "Evaluating strategic alignment with company OKRs", "Exploring phased or lower-effort interim solutions", "Transparent stakeholder management and rationalization"],
        suggestedDurationSeconds: 180,
    },
    {
        id: "pm-2-1",
        category: "Product Management",
        text: "Our B2B SaaS platform is expanding from serving small businesses to closing Fortune 500 enterprise clients. How would you architect the multi-year product strategy, governance roadmap, and pricing tiers?",
        difficultyLevel: 2,
        keyPoints: ["Enterprise capabilities (SSO/SAML, RBAC, audit logging, data residency, SOC2)", "Product-led growth vs sales-assisted procurement dynamics", "Tiered value-based pricing and SLA guarantees", "Managing customized client commitments without fragmenting the core product line"],
        suggestedDurationSeconds: 240,
    },
    // 4. Data Science & AI (Levels 0, 1, 2)
    {
        id: "ds-0-1",
        category: "Data Science & AI",
        text: "How do you explain the difference between correlation and causation to a non-technical executive, and why does this distinction matter for business decision-making?",
        difficultyLevel: 0,
        keyPoints: ["Intuitive real-life analogy (e.g. ice cream sales and sunburns)", "Role of confounding variables", "Why randomized controlled trials (A/B testing) are required for causal inference"],
        suggestedDurationSeconds: 120,
    },
    {
        id: "ds-0-2",
        category: "Data Science & AI",
        text: "Explain the difference between supervised learning and unsupervised learning, providing one practical business application of each.",
        difficultyLevel: 0,
        keyPoints: ["Labeled ground truth vs discovering intrinsic structure", "Supervised example: credit fraud classification", "Unsupervised example: customer segmentation clustering", "Evaluating model outcomes"],
        suggestedDurationSeconds: 120,
    },
    {
        id: "ds-1-1",
        category: "Data Science & AI",
        text: "How do you detect, monitor, and mitigate data drift and concept drift in a production machine learning system that scores loan applications?",
        difficultyLevel: 1,
        keyPoints: ["Statistical distance metrics (PSI, KL divergence, Wasserstein distance)", "Distinguishing data distribution shift from target variable shift", "Automated shadow model evaluation and retraining triggers", "Ensuring fairness and guarding against algorithmic bias"],
        suggestedDurationSeconds: 180,
    },
    {
        id: "ds-1-2",
        category: "Data Science & AI",
        text: "When evaluating a binary classification model for rare cancer detection where only 0.1% of patients are positive, why is accuracy a misleading metric, and what metrics would you optimize instead?",
        difficultyLevel: 1,
        keyPoints: ["Class imbalance trap", "Recall / Sensitivity vs Precision trade-offs", "F1 score, PR-AUC, and ROC-AUC curve analysis", "Cost matrix weighting false negatives over false positives"],
        suggestedDurationSeconds: 180,
    },
    {
        id: "ds-2-1",
        category: "Data Science & AI",
        text: "How would you design a real-time recommendation system combining two-tower vector embeddings, ANN similarity search, and real-time contextual re-ranking under a strict 30ms latency SLA?",
        difficultyLevel: 2,
        keyPoints: ["Two-stage architecture: Candidate retrieval (Milvus/Pinecone HNSW) + Heavy ranker (GBDT/DeepFM)", "Handling cold-start exploration with multi-armed bandits (Thompson sampling)", "Feature store latency (Feast/Redis) and offline-to-online parity", "Real-time engagement telemetry loop and continuous learning"],
        suggestedDurationSeconds: 240,
    },
    // 5. System Design & Cloud Infrastructure (Levels 0, 1, 2)
    {
        id: "sys-0-1",
        category: "System Design & Cloud Infrastructure",
        text: "What is the difference between vertical scaling and horizontal scaling, and what are the primary trade-offs of each approach?",
        difficultyLevel: 0,
        keyPoints: ["Adding hardware resources to a single node vs adding multiple distributed nodes", "Hardware cost ceilings and single points of failure", "Need for load balancers and stateless services in horizontal scaling"],
        suggestedDurationSeconds: 120,
    },
    {
        id: "sys-0-2",
        category: "System Design & Cloud Infrastructure",
        text: "What is a Content Delivery Network (CDN), and how does it reduce latency for users across different geographic locations?",
        difficultyLevel: 0,
        keyPoints: ["Edge server caching of static assets (images, CSS, JS)", "Origin server offloading", "DNS routing to nearest geographical point of presence (PoP)"],
        suggestedDurationSeconds: 120,
    },
    {
        id: "sys-1-1",
        category: "System Design & Cloud Infrastructure",
        text: "Design a URL shortening service (like Bitly) capable of generating unique shortened aliases, redirecting at low latency, and handling 500 million URLs created per month.",
        difficultyLevel: 1,
        keyPoints: ["Base62 encoding of distributed unique IDs (Snowflake/Ticket servers)", "Cache-aside caching strategy with Redis for top 20% viral URLs", "Database schema choice (NoSQL Key-Value vs Relational) and indexing", "Handling 301 permanent vs 302 temporary redirects for analytics"],
        suggestedDurationSeconds: 180,
    },
    {
        id: "sys-2-1",
        category: "System Design & Cloud Infrastructure",
        text: "Design a distributed, highly available notification platform capable of fan-out dispatching 100 million push notifications, SMS messages, and emails per day with priority queues and rate limiting.",
        difficultyLevel: 2,
        keyPoints: ["Decoupled microservice architecture with message brokers (RabbitMQ/Kafka)", "Priority queues for transactional (2FA) vs bulk marketing alerts", "Per-user preference and throttling logic with Redis sliding windows", "Idempotent downstream provider integrations (APNs, FCM, Twilio, SendGrid) with circuit breakers"],
        suggestedDurationSeconds: 240,
    },
];
exports.seedInterviewQuestions = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "Authentication required.");
    }
    const db = admin.firestore();
    const batch = db.batch();
    for (const q of exports.FULL_QUESTION_BANK) {
        const docRef = db.collection("interviewQuestions").doc(q.id);
        batch.set(docRef, q, { merge: true });
    }
    await batch.commit();
    return { success: true, count: exports.FULL_QUESTION_BANK.length };
});
//# sourceMappingURL=seedQuestions.js.map