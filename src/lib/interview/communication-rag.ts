/**
 * Communication RAG Knowledge Base & Role Guidelines
 * Provides targeted communication rubrics and translation guidelines for different career paths.
 */

export interface RoleCommunicationProfile {
  roleId: string;
  roleTitle: string;
  keyCompetencies: string[];
  vocabularySuggestions: string[];
  commonPitfalls: string[];
  sampleStarFramework: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
}

export const ROLE_COMMUNICATION_GUIDELINES: Record<string, RoleCommunicationProfile> = {
  software_engineer: {
    roleId: "software_engineer",
    roleTitle: "Software Engineer",
    keyCompetencies: [
      "Precise technical terminology (latency, throughput, concurrency, scalability)",
      "Structured problem breakdown (Root cause → Tradeoffs → Solution)",
      "Clear explanation of architecture decisions without excessive jargon",
      "Quantified impact metrics (latency reduced by X%, queries optimized)",
    ],
    vocabularySuggestions: [
      "orchestrated", "architected", "refactored", "mitigated", "profiling", "asynchronous", "benchmarked", "decoupled"
    ],
    commonPitfalls: [
      "Explaining what the team did rather than specific personal contribution",
      "Over-explaining code syntax instead of system design intent",
      "Using ambiguous fillers ('stuff like that', 'basically done')",
    ],
    sampleStarFramework: {
      situation: "Under peak morning load, our user search endpoint was experiencing 3-second P99 latencies.",
      task: "I needed to decouple synchronous database scans and optimize response times below 200ms.",
      action: "I implemented Redis caching for hot queries and transitioned background indexing to asynchronous queues.",
      result: "This reduced P99 query latency by 85% and eliminated 504 gateway timeout errors entirely.",
    }
  },
  cybersecurity: {
    roleId: "cybersecurity",
    roleTitle: "Cybersecurity Specialist",
    keyCompetencies: [
      "Risk assessment clarity (vulnerability severity, blast radius, mitigation)",
      "Incident communication bridging technical forensics to business impact",
      "Compliance and zero-trust framing",
    ],
    vocabularySuggestions: [
      "remediated", "quarantined", "audit trail", "threat vector", "least privilege", "cryptographic", "posture"
    ],
    commonPitfalls: [
      "Alarmist phrasing without actionable remediation steps",
      "Failing to communicate financial/compliance impact to leadership",
    ],
    sampleStarFramework: {
      situation: "An unauthorized token scan alert triggered in our authentication log aggregator.",
      task: "I was tasked with identifying the breach vector and containing active sessions.",
      action: "I revoked exposed API tokens, isolated the affected subnets, and deployed strict rate limiting.",
      result: "Zero customer PII was compromised, and we closed the credential gap within 18 minutes.",
    }
  },
  hr_recruiter: {
    roleId: "hr_recruiter",
    roleTitle: "HR & People Operations",
    keyCompetencies: [
      "Empathetic, clear, and inclusive interpersonal phrasing",
      "Conflict de-escalation and policy alignment",
      "Structured stakeholder communication",
    ],
    vocabularySuggestions: [
      "facilitated", "retained", "onboarded", "mentored", "aligned", "streamlined", "talent acquisition"
    ],
    commonPitfalls: [
      "Vague generalities without concrete talent metrics or retention outcomes",
      "Defensive tone during scenario questions",
    ],
    sampleStarFramework: {
      situation: "Engineering department was facing 28% annualized attrition during high-growth scaling.",
      task: "I designed a structured mentorship and career progression ladder to improve retention.",
      action: "I organized weekly 1:1 check-ins, standardized leveling rubrics, and instituted transparent appraisal bands.",
      result: "Attrition dropped to 9% within six months, and employee Net Promoter Score rose from +18 to +64.",
    }
  },
  product_manager: {
    roleId: "product_manager",
    roleTitle: "Product & Project Manager",
    keyCompetencies: [
      "Strategic conciseness and prioritization justification",
      "Customer problem statement framing (Who → Pain → Hypothesis → Metric)",
      "Cross-functional stakeholder alignment",
    ],
    vocabularySuggestions: [
      "prioritized", "validated", "iterated", "hypothesis", "adoption rate", "funnel", "conversion", "retention"
    ],
    commonPitfalls: [
      "Focusing solely on features instead of user outcomes and business metrics",
      "Using passive language instead of ownership ('it got decided')",
    ],
    sampleStarFramework: {
      situation: "User onboarding drop-off was 42% on the third step of our registration flow.",
      task: "I led an experiment to simplify KYC verification and reduce time-to-value.",
      action: "I prioritized progressive profiling and introduced instant OTP validation with clear microcopy.",
      result: "Onboarding completion increased by 31%, yielding an incremental 4,200 active weekly users.",
    }
  }
};

export const COMMON_GRAMMAR_AND_PHRASING_FIXES = [
  {
    pattern: /i am having (\d+|years|experience)/i,
    replacement: "I have $1",
    explanation: "In professional English, express possession and experience with 'I have' rather than the continuous form 'I am having'."
  },
  {
    pattern: /myself ([a-z]+)/i,
    replacement: "I am $1 / My name is $1",
    explanation: "'Myself' is a reflexive pronoun. For self-introductions, use 'I am' or 'My name is'."
  },
  {
    pattern: /did not (went|built|made|wrote|saw)/i,
    replacement: "did not go/build/make/write/see",
    explanation: "After the auxiliary 'did not', always use the base form of the verb."
  },
  {
    pattern: /revert back/i,
    replacement: "reply / respond / get back to you",
    explanation: "'Revert' already means to return to a previous state; 'back' is redundant. Use 'reply' or 'respond'."
  },
  {
    pattern: /passed out from/i,
    replacement: "graduated from",
    explanation: "For completing college or university degree, 'graduated from' is standard international professional terminology."
  },
  {
    pattern: /more better/i,
    replacement: "better / significantly improved",
    explanation: "'Better' is already a comparative adjective; double comparatives should be avoided."
  }
];

export function getRoleGuideline(category: string): RoleCommunicationProfile {
  const norm = category.toLowerCase().replace(/[^a-z0-9]/g, "_");
  if (norm.includes("cyber") || norm.includes("security")) return ROLE_COMMUNICATION_GUIDELINES.cybersecurity;
  if (norm.includes("hr") || norm.includes("people") || norm.includes("recruit")) return ROLE_COMMUNICATION_GUIDELINES.hr_recruiter;
  if (norm.includes("product") || norm.includes("project") || norm.includes("manager")) return ROLE_COMMUNICATION_GUIDELINES.product_manager;
  return ROLE_COMMUNICATION_GUIDELINES.software_engineer;
}
