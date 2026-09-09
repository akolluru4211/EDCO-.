import { InterviewQuestion, ResumeContent } from "./types";
export { DEFAULT_RESUME_CONTENT } from "./types";

export const AVAILABLE_CATEGORIES = [
  { id: "swe", name: "Software Engineering", desc: "System design, algorithmic thinking, frontend/backend architecture" },
  { id: "behavioral", name: "General Behavioral & Leadership", desc: "STAR stories, conflict resolution, ownership, team collaboration" },
  { id: "pm", name: "Product Management", desc: "Product sense, prioritization, metrics, user empathy & roadmap" },
  { id: "ds", name: "Data Science & AI", desc: "Statistical modeling, ML drift, vector retrieval, causal inference" },
  { id: "sys", name: "System Design & Cloud Infrastructure", desc: "Distributed caching, rate limiters, notification pipelines & CDNs" },
];

export const SEED_INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  // 1. Software Engineering
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
    id: "swe-1-1",
    category: "Software Engineering",
    text: "Walk me through how you would optimize a web application that is experiencing slow initial page load times and heavy main-thread CPU usage.",
    difficultyLevel: 1,
    keyPoints: ["Profiling & network waterfalls", "Asset bundling & dynamic code splitting", "Database query indexing & caching", "Client-side re-render optimization"],
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
    id: "swe-2-1",
    category: "Software Engineering",
    text: "Design a globally distributed rate limiter that handles 100,000 requests per second with strict sub-millisecond latency constraints and high availability.",
    difficultyLevel: 2,
    keyPoints: ["Token bucket / sliding window algorithms", "Redis cluster vs local memory caching", "CAP theorem trade-offs", "Edge gateway rate limiting"],
    suggestedDurationSeconds: 240,
  },

  // 2. General Behavioral & Leadership
  {
    id: "beh-0-1",
    category: "General Behavioral & Leadership",
    text: "Tell me about a time you had to learn a new tool, programming language, or technology quickly to complete a task or project. What steps did you take?",
    difficultyLevel: 0,
    keyPoints: ["Clear situation context", "Structured self-learning strategy", "Overcoming roadblocks", "Positive project outcome"],
    suggestedDurationSeconds: 120,
  },
  {
    id: "beh-1-1",
    category: "General Behavioral & Leadership",
    text: "Describe a high-pressure situation where a production incident occurred or a critical deadline was at risk. How did you prioritize actions and communicate with stakeholders?",
    difficultyLevel: 1,
    keyPoints: ["Triage and root cause analysis", "Blameless post-mortem", "Stakeholder updates", "Long-term preventative fixes"],
    suggestedDurationSeconds: 180,
  },
  {
    id: "beh-2-1",
    category: "General Behavioral & Leadership",
    text: "How do you navigate a strategic disagreement between engineering feasibility and aggressive product timelines when executive leadership is pushing for launch?",
    difficultyLevel: 2,
    keyPoints: ["Quantifying technical debt & operational risk", "Phased MVP negotiation", "Executive communication with data", "Alignment on success metrics"],
    suggestedDurationSeconds: 240,
  },
];
