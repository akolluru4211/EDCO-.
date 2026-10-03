/**
 * Myra AI Behavioral Learning & Cognitive Memory Engine
 * Learns dynamically from student queries, doubts, web searches, mock interviews,
 * and resume activity to continuously adapt Myra's tutoring and career coaching.
 */

import { supabase } from "@/lib/supabase";

export interface LearnedTopicItem {
  topic: string;
  queryCount: number;
  lastAsked: string;
  estimatedMastery: "beginner" | "intermediate" | "advanced";
}

export interface SearchedTechItem {
  tech: string;
  searchCount: number;
  lastSearched: string;
}

export interface StrugglePointItem {
  concept: string;
  severity: "low" | "moderate" | "high";
  source: "doubt" | "interview" | "search";
  advice: string;
  timestamp: string;
}

export interface MyraCognitiveMemory {
  userId: string;
  totalInteractions: number;
  frequentTopics: LearnedTopicItem[];
  searchedTechnologies: SearchedTechItem[];
  strugglePoints: StrugglePointItem[];
  learningStylePreference: "concise_bulleted" | "deep_architectural" | "analogy_driven" | "code_heavy";
  lastInteractionAt: string;
}

// Common tech keywords & concepts taxonomy for rapid client/server detection
const KNOWN_TECH_KEYWORDS = [
  "react", "next.js", "typescript", "javascript", "python", "node.js", "go", "golang",
  "rust", "java", "c++", "docker", "kubernetes", "aws", "gcp", "azure", "redis",
  "postgresql", "mongodb", "kafka", "graphql", "tailwind", "fastapi", "django",
  "pytorch", "tensorflow", "vector search", "system design", "microservices",
  "concurrency", "distributed systems", "ci/cd", "rest api", "websockets",
  "dynamic programming", "graph algorithms", "binary trees", "star method", "cache invalidation",
  "agent-reach", "ats resume", "quant aptitude", "binary search", "sql", "prisma", "zustand",
  "load balancing", "rate limiting", "cap theorem", "sharding", "two pointers", "sliding window"
];

/**
 * Extracts learning signals, searched technologies, and difficulty cues from user interactions.
 */
export function extractLearningSignals(
  query: string,
  reply: string,
  isWebSearch: boolean = false
): {
  detectedTopics: string[];
  detectedTechs: string[];
  isStruggle: boolean;
  struggleConcept?: string;
  intent: "doubt" | "search" | "interview" | "general";
} {
  const lowerQuery = query.toLowerCase();
  const detectedTechs: string[] = [];
  const detectedTopics: string[] = [];

  // Match known technologies
  KNOWN_TECH_KEYWORDS.forEach((kw) => {
    if (lowerQuery.includes(kw)) {
      detectedTechs.push(kw.charAt(0).toUpperCase() + kw.slice(1));
    }
  });

  // Extract conceptual phrases
  if (lowerQuery.includes("how to") || lowerQuery.includes("explain") || lowerQuery.includes("why does") || lowerQuery.includes("what is")) {
    const clean = query.replace(/^(how to|explain|why does|what is|can you explain)\s+/i, "").replace(/[?.,!]+$/, "").trim();
    if (clean.length > 3 && clean.length < 50) {
      detectedTopics.push(clean);
    }
  }

  // Detect struggle indicators
  const struggleKeywords = ["i don't understand", "confused", "why is my code failing", "error", "trouble with", "struggling with", "help me fix", "stuck on"];
  const isStruggle = struggleKeywords.some((sk) => lowerQuery.includes(sk));
  let struggleConcept: string | undefined = undefined;

  if (isStruggle) {
    struggleConcept = detectedTechs[0] || detectedTopics[0] || query.slice(0, 40);
  }

  // Determine intent
  let intent: "doubt" | "search" | "interview" | "general" = "doubt";
  if (isWebSearch || lowerQuery.startsWith("search") || lowerQuery.startsWith("lookup") || lowerQuery.includes("latest") || lowerQuery.includes("salary")) {
    intent = "search";
  } else if (lowerQuery.includes("interview") || lowerQuery.includes("star method") || lowerQuery.includes("behavioral")) {
    intent = "interview";
  }

  return {
    detectedTopics: Array.from(new Set(detectedTopics)),
    detectedTechs: Array.from(new Set(detectedTechs)),
    isStruggle,
    struggleConcept,
    intent,
  };
}

/**
 * Persists and merges new learning signals into the student's cognitive memory profile.
 */
export async function syncUserLearningProfile(
  userId: string,
  query: string,
  reply: string,
  isWebSearch: boolean = false
): Promise<MyraCognitiveMemory> {
  const signals = extractLearningSignals(query, reply, isWebSearch);
  const now = new Date().toISOString();

  // 1. Fetch existing profile from Supabase
  let currentMemory: MyraCognitiveMemory = {
    userId,
    totalInteractions: 0,
    frequentTopics: [],
    searchedTechnologies: [],
    strugglePoints: [],
    learningStylePreference: "deep_architectural",
    lastInteractionAt: now,
  };

  try {
    const { data } = await supabase
      .from("user_ai_learning_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (data && data.cognitive_memory) {
      currentMemory = data.cognitive_memory;
    }
  } catch (e) {
    // Graceful fallback to memory instance
  }

  // 2. Merge interaction counter
  currentMemory.totalInteractions = (currentMemory.totalInteractions || 0) + 1;
  currentMemory.lastInteractionAt = now;

  // 3. Merge Detected Topics
  signals.detectedTopics.forEach((top) => {
    const existingIndex = currentMemory.frequentTopics.findIndex(
      (t) => t.topic.toLowerCase() === top.toLowerCase()
    );
    if (existingIndex >= 0) {
      currentMemory.frequentTopics[existingIndex].queryCount += 1;
      currentMemory.frequentTopics[existingIndex].lastAsked = now;
      if (currentMemory.frequentTopics[existingIndex].queryCount > 3) {
        currentMemory.frequentTopics[existingIndex].estimatedMastery = "intermediate";
      }
    } else {
      currentMemory.frequentTopics.push({
        topic: top,
        queryCount: 1,
        lastAsked: now,
        estimatedMastery: "beginner",
      });
    }
  });

  // Limit frequent topics to top 15
  currentMemory.frequentTopics.sort((a, b) => b.queryCount - a.queryCount);
  currentMemory.frequentTopics = currentMemory.frequentTopics.slice(0, 15);

  // 4. Merge Searched Technologies
  signals.detectedTechs.forEach((tech) => {
    const existingIndex = currentMemory.searchedTechnologies.findIndex(
      (t) => t.tech.toLowerCase() === tech.toLowerCase()
    );
    if (existingIndex >= 0) {
      currentMemory.searchedTechnologies[existingIndex].searchCount += 1;
      currentMemory.searchedTechnologies[existingIndex].lastSearched = now;
    } else {
      currentMemory.searchedTechnologies.push({
        tech,
        searchCount: 1,
        lastSearched: now,
      });
    }
  });

  currentMemory.searchedTechnologies.sort((a, b) => b.searchCount - a.searchCount);
  currentMemory.searchedTechnologies = currentMemory.searchedTechnologies.slice(0, 15);

  // 5. Merge Struggle Points
  if (signals.isStruggle && signals.struggleConcept) {
    const existingStruggle = currentMemory.strugglePoints.find(
      (s) => s.concept.toLowerCase() === signals.struggleConcept!.toLowerCase()
    );
    if (!existingStruggle) {
      currentMemory.strugglePoints.push({
        concept: signals.struggleConcept,
        severity: "moderate",
        source: signals.intent === "search" ? "search" : signals.intent === "interview" ? "interview" : "doubt",
        advice: `Review core mental models for ${signals.struggleConcept} and practice step-by-step implementation.`,
        timestamp: now,
      });
    }
  }

  currentMemory.strugglePoints = currentMemory.strugglePoints.slice(-10);

  // 6. Save back to Supabase
  try {
    await supabase.from("user_ai_learning_profiles").upsert(
      {
        user_id: userId,
        cognitive_memory: currentMemory,
        total_interactions: currentMemory.totalInteractions,
        top_topics: currentMemory.frequentTopics.slice(0, 5).map((t) => t.topic),
        top_technologies: currentMemory.searchedTechnologies.slice(0, 5).map((t) => t.tech),
        updated_at: now,
      },
      { onConflict: "user_id" }
    );
  } catch (err) {
    console.warn("[Myra Learning Sync Note]:", err);
  }

  return currentMemory;
}

/**
 * Retrieves the student's cognitive learning profile.
 */
export async function getUserLearningProfile(userId: string): Promise<MyraCognitiveMemory | null> {
  if (!userId) return null;

  try {
    const { data } = await supabase
      .from("user_ai_learning_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (data && data.cognitive_memory) {
      return data.cognitive_memory;
    }
  } catch (e) {
    console.warn("Failed to fetch user learning profile:", e);
  }

  return null;
}

/**
 * Resets the student's learned AI memory.
 */
export async function resetUserLearningProfile(userId: string): Promise<boolean> {
  if (!userId) return false;

  try {
    await supabase
      .from("user_ai_learning_profiles")
      .delete()
      .eq("user_id", userId);
    return true;
  } catch (e) {
    console.warn("Failed to reset learning profile:", e);
    return false;
  }
}
