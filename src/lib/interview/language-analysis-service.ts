import { COMMON_GRAMMAR_AND_PHRASING_FIXES, getRoleGuideline } from "./communication-rag";
import { supabase } from "@/lib/supabase";

export interface LanguageAnalysisResult {
  overallLanguageScore: number;
  grammarScore: number;
  clarityScore: number;
  fluencyScore: number;
  vocabularyScore: number;
  professionalScore: number;
  
  // Real stats
  wordCount: number;
  wordsPerMinute: number;
  sentenceCount: number;
  avgSentenceLength: number;
  longSentenceCount: number;
  
  // Filler words
  fillerWordCount: number;
  fillerBreakdown: Record<string, number>;
  topFiller: string | null;
  
  // Evidence-based Feedback
  strengths: string[];
  areasForImprovement: string[];
  
  // What you said vs Better way to say it
  whatYouSaid: string;
  improvedVersion: string;
  improvementRationale: string[];
  
  // Actionable AI Coach suggestions
  coachSuggestions: string[];
  
  // Detected patterns for cross-interview learning
  detectedPatterns: Array<{
    type: "filler_word" | "grammar_tendency" | "sentence_structure" | "pacing";
    pattern: string;
    severity: "low" | "moderate" | "high";
    example: string;
  }>;
  
  // Recommended practice task
  dailyPracticePrompt: {
    focusArea: string;
    task: string;
    guidelines: string[];
  };
}

export interface AttemptComparison {
  attempt1: {
    languageScore: number;
    grammarScore: number;
    clarityScore: number;
    fillerCount: number;
    wpm: number;
  };
  attempt2: {
    languageScore: number;
    grammarScore: number;
    clarityScore: number;
    fillerCount: number;
    wpm: number;
  };
  deltas: {
    languageScoreDelta: number;
    grammarScoreDelta: number;
    clarityScoreDelta: number;
    fillerReductionPercent: number;
    structureVerdict: string;
  };
  overallVerdict: string;
}

const FILLER_PATTERNS = [
  { term: "actually", regex: /\bactually\b/gi },
  { term: "basically", regex: /\bbasically\b/gi },
  { term: "like", regex: /\blike\b/gi },
  { term: "you know", regex: /\byou know\b/gi },
  { term: "sort of", regex: /\bsort of\b/gi },
  { term: "kind of", regex: /\bkind of\b/gi },
  { term: "literally", regex: /\bliterally\b/gi },
  { term: "um", regex: /\bum\b/gi },
  { term: "uh", regex: /\buh\b/gi },
];

/**
 * Main Language & Communication Analysis Engine
 */
export function analyzeSpokenLanguage(
  transcript: string,
  durationSeconds: number = 60,
  category: string = "Software Engineering",
  pastUserPatterns?: string[]
): LanguageAnalysisResult {
  const cleanText = transcript.trim();
  const words = cleanText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const duration = Math.max(10, durationSeconds);
  const wordsPerMinute = Math.round((wordCount / duration) * 60);

  // 1. Sentences breakdown
  const rawSentences = cleanText.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
  const sentenceCount = Math.max(1, rawSentences.length);
  const avgSentenceLength = Math.round(wordCount / sentenceCount);
  
  const longSentences = rawSentences.filter(s => s.split(/\s+/).length > 28);
  const shortSentences = rawSentences.filter(s => s.split(/\s+/).length < 4);

  // 2. Filler words detection
  const fillerBreakdown: Record<string, number> = {};
  let totalFillers = 0;

  FILLER_PATTERNS.forEach(({ term, regex }) => {
    const matches = cleanText.match(regex);
    if (matches && matches.length > 0) {
      fillerBreakdown[term] = matches.length;
      totalFillers += matches.length;
    }
  });

  const sortedFillers = Object.entries(fillerBreakdown).sort((a, b) => b[1] - a[1]);
  const topFiller = sortedFillers.length > 0 ? sortedFillers[0][0] : null;

  // 3. Grammar & Phrasing Check
  const detectedGrammarIssues: string[] = [];
  COMMON_GRAMMAR_AND_PHRASING_FIXES.forEach(({ pattern, explanation }) => {
    if (pattern.test(cleanText)) {
      detectedGrammarIssues.push(explanation);
    }
  });

  // 4. Role Guideline Analysis
  const roleGuidelines = getRoleGuideline(category);
  const hasStarStructure = /situation|task|action|result|because|implemented|reduced|optimized|built|led/i.test(cleanText);

  // 5. Score Calculations (Strictly Evidence-Based)
  // A) Grammar Score
  let grammarScore = 88;
  grammarScore -= detectedGrammarIssues.length * 6;
  if (shortSentences.length > 2) grammarScore -= 4;
  grammarScore = Math.max(50, Math.min(98, grammarScore));

  // B) Clarity Score
  let clarityScore = 85;
  if (longSentences.length > 1) clarityScore -= 8;
  if (totalFillers > 5) clarityScore -= 12;
  else if (totalFillers > 2) clarityScore -= 6;
  if (hasStarStructure) clarityScore += 6;
  clarityScore = Math.max(50, Math.min(96, clarityScore));

  // C) Fluency Score
  let fluencyScore = 82;
  if (wordsPerMinute >= 110 && wordsPerMinute <= 155) fluencyScore += 8;
  else if (wordsPerMinute < 90) fluencyScore -= 10;
  else if (wordsPerMinute > 175) fluencyScore -= 8;
  fluencyScore -= Math.min(15, totalFillers * 2);
  fluencyScore = Math.max(50, Math.min(96, fluencyScore));

  // D) Vocabulary Score
  let vocabularyScore = 80;
  const vocabMatches = roleGuidelines.vocabularySuggestions.filter(v => 
    new RegExp(`\\b${v}\\b`, "i").test(cleanText)
  );
  vocabularyScore += Math.min(14, vocabMatches.length * 4);
  vocabularyScore = Math.max(55, Math.min(95, vocabularyScore));

  // E) Professional Score
  let professionalScore = 84;
  if (totalFillers > 4) professionalScore -= 8;
  if (hasStarStructure) professionalScore += 6;
  professionalScore = Math.max(55, Math.min(98, professionalScore));

  // Overall Weighted Language Score
  const overallLanguageScore = Math.round(
    grammarScore * 0.25 +
    clarityScore * 0.25 +
    fluencyScore * 0.20 +
    vocabularyScore * 0.15 +
    professionalScore * 0.15
  );

  // 6. Evidence-Based Strengths & Weaknesses
  const strengths: string[] = [];
  const areasForImprovement: string[] = [];

  if (hasStarStructure) strengths.push("Logical structure with clear problem framing and outcome.");
  if (vocabMatches.length > 0) strengths.push(`Strong professional terminology (e.g. "${vocabMatches.slice(0, 2).join('", "')}").`);
  if (wordsPerMinute >= 115 && wordsPerMinute <= 150) strengths.push("Ideal conversational speaking cadence (115–150 WPM).");
  if (totalFillers <= 1) strengths.push("Clean articulation with virtually zero filler words.");
  if (strengths.length === 0) strengths.push("Clear communication of technical concepts with intelligible pacing.");

  if (totalFillers > 2 && topFiller) {
    areasForImprovement.push(`Repeated use of "${topFiller}" (${fillerBreakdown[topFiller]} times). Replacing filler words with a deliberate pause projects greater confidence.`);
  }
  if (longSentences.length > 0) {
    areasForImprovement.push("Sentences are quite long (over 28 words). Breaking complex thoughts into 2–3 shorter sentences enhances listener retention.");
  }
  if (detectedGrammarIssues.length > 0) {
    areasForImprovement.push(detectedGrammarIssues[0]);
  }
  if (!hasStarStructure) {
    areasForImprovement.push("Answer could benefit from a structured framework (Situation → Action → Result).");
  }

  // 7. "What You Said" vs "Better Way to Say It" (Realistic, Preserves Speaking Level)
  let whatYouSaid = cleanText;
  let improvedVersion = cleanText;
  const improvementRationale: string[] = [];

  // Apply subtle natural cleanups
  // 1. Remove filler clusters
  if (/\b(actually|basically)\s+(i am|i was|we did|i have)/i.test(improvedVersion)) {
    improvedVersion = improvedVersion.replace(/\b(actually|basically)\s+/gi, "");
    improvementRationale.push("Removed repetitive conversational fillers ('actually', 'basically').");
  }
  // 2. Fix Indian English colloquialisms without changing natural voice
  if (/i am having (\d+|years|experience)/i.test(improvedVersion)) {
    improvedVersion = improvedVersion.replace(/i am having/gi, "I have");
    improvementRationale.push("Standardized 'I am having experience' to 'I have experience'.");
  }
  if (/myself\s+([A-Za-z]+)/i.test(improvedVersion)) {
    improvedVersion = improvedVersion.replace(/myself\s+([A-Za-z]+)/gi, "I am $1");
    improvementRationale.push("Refactored reflexive 'Myself' to 'I am'.");
  }
  if (/passed out from/i.test(improvedVersion)) {
    improvedVersion = improvedVersion.replace(/passed out from/gi, "graduated from");
    improvementRationale.push("Updated 'passed out from' to international professional term 'graduated from'.");
  }
  if (!improvementRationale.length && totalFillers > 0 && topFiller) {
    improvedVersion = improvedVersion.replace(new RegExp(`\\b${topFiller}\\s*`, "gi"), "");
    improvementRationale.push(`Removed unnecessary '${topFiller}' instances to streamline delivery.`);
  }
  if (!improvementRationale.length) {
    improvementRationale.push("Structured phrasing into clear, professional sentences with active voice.");
  }

  // 8. Actionable AI Coach Suggestions
  const coachSuggestions: string[] = [];
  if (totalFillers > 3) {
    coachSuggestions.push(`You used '${topFiller}' ${fillerBreakdown[topFiller!]} times in this answer. Take a silent breath between ideas instead of vocalizing a filler.`);
  }
  if (avgSentenceLength > 22) {
    coachSuggestions.push("Try using shorter sentences. Aim for 12–18 words per sentence so the interviewer can easily track your architecture.");
  }
  if (!hasStarStructure) {
    coachSuggestions.push("Try explaining your project using the 3-step arc: Context → What I personally built → Metric outcome.");
  } else {
    coachSuggestions.push("Your technical explanation is well-structured. Keep supporting your decisions with quantified benchmarks.");
  }

  // 9. Detected Patterns for persistent database learning
  const detectedPatterns: LanguageAnalysisResult["detectedPatterns"] = [];
  if (topFiller && fillerBreakdown[topFiller] >= 2) {
    detectedPatterns.push({
      type: "filler_word",
      pattern: topFiller,
      severity: fillerBreakdown[topFiller] > 4 ? "high" : "moderate",
      example: `Used '${topFiller}' ${fillerBreakdown[topFiller]} times in single answer.`
    });
  }
  if (longSentences.length > 0) {
    detectedPatterns.push({
      type: "sentence_structure",
      pattern: "run_on_sentence",
      severity: "moderate",
      example: longSentences[0].substring(0, 50) + "..."
    });
  }
  if (detectedGrammarIssues.length > 0) {
    detectedPatterns.push({
      type: "grammar_tendency",
      pattern: "verb_tense_agreement",
      severity: "low",
      example: detectedGrammarIssues[0]
    });
  }

  // 10. Personalized Daily Practice Task
  const primaryFocus = topFiller ? `Reducing "${topFiller}" filler words` : "Mastering STAR conciseness";
  const dailyPracticePrompt = {
    focusArea: primaryFocus,
    task: `Answer in 60 seconds: "Can you describe a key technical project you built and the core challenges you solved?"`,
    guidelines: [
      topFiller ? `Avoid saying "${topFiller}" or "basically"` : "State your role in the first 10 seconds",
      "Explain the exact architectural choice you made",
      "Conclude with 1 measurable result or metric"
    ]
  };

  return {
    overallLanguageScore,
    grammarScore,
    clarityScore,
    fluencyScore,
    vocabularyScore,
    professionalScore,
    wordCount,
    wordsPerMinute,
    sentenceCount,
    avgSentenceLength,
    longSentenceCount: longSentences.length,
    fillerWordCount: totalFillers,
    fillerBreakdown,
    topFiller,
    strengths,
    areasForImprovement,
    whatYouSaid,
    improvedVersion,
    improvementRationale,
    coachSuggestions,
    detectedPatterns,
    dailyPracticePrompt
  };
}

/**
 * Compares First Attempt vs Second Attempt ("Try Again")
 */
export function compareAttempts(
  attempt1Analysis: LanguageAnalysisResult,
  attempt2Analysis: LanguageAnalysisResult
): AttemptComparison {
  const languageScoreDelta = attempt2Analysis.overallLanguageScore - attempt1Analysis.overallLanguageScore;
  const grammarScoreDelta = attempt2Analysis.grammarScore - attempt1Analysis.grammarScore;
  const clarityScoreDelta = attempt2Analysis.clarityScore - attempt1Analysis.clarityScore;
  
  const f1 = Math.max(1, attempt1Analysis.fillerWordCount);
  const f2 = attempt2Analysis.fillerWordCount;
  const fillerReductionPercent = Math.round(((f1 - f2) / f1) * 100);

  let structureVerdict = "Maintained solid structure";
  if (clarityScoreDelta > 5) structureVerdict = "Significantly improved answer structure and pacing";
  else if (clarityScoreDelta < -5) structureVerdict = "Slightly rushed delivery compared to first attempt";

  let overallVerdict = "Great progress! Your second attempt was clearer with fewer distractions.";
  if (languageScoreDelta < 0 && fillerReductionPercent < 0) {
    overallVerdict = "First attempt was more structured. Take your time before speaking to organize your key points.";
  }

  return {
    attempt1: {
      languageScore: attempt1Analysis.overallLanguageScore,
      grammarScore: attempt1Analysis.grammarScore,
      clarityScore: attempt1Analysis.clarityScore,
      fillerCount: attempt1Analysis.fillerWordCount,
      wpm: attempt1Analysis.wordsPerMinute
    },
    attempt2: {
      languageScore: attempt2Analysis.overallLanguageScore,
      grammarScore: attempt2Analysis.grammarScore,
      clarityScore: attempt2Analysis.clarityScore,
      fillerCount: attempt2Analysis.fillerWordCount,
      wpm: attempt2Analysis.wordsPerMinute
    },
    deltas: {
      languageScoreDelta,
      grammarScoreDelta,
      clarityScoreDelta,
      fillerReductionPercent,
      structureVerdict
    },
    overallVerdict
  };
}

/**
 * Updates User Communication Profile & Aggregates Patterns across Interviews
 */
export async function syncUserCommunicationProfile(
  userId: string,
  analysis: LanguageAnalysisResult
): Promise<void> {
  if (!userId) return;

  try {
    // 1. Fetch current profile
    const { data: existingProfile } = await supabase
      .from("communication_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (existingProfile) {
      const totalInterviews = (existingProfile.total_interviews || 0) + 1;
      const weightNew = 1 / totalInterviews;
      const weightOld = 1 - weightNew;

      const newLang = Math.round((existingProfile.language_score * weightOld) + (analysis.overallLanguageScore * weightNew));
      const newGrammar = Math.round((existingProfile.grammar_score * weightOld) + (analysis.grammarScore * weightNew));
      const newClarity = Math.round((existingProfile.clarity_score * weightOld) + (analysis.clarityScore * weightNew));
      const newFluency = Math.round((existingProfile.fluency_score * weightOld) + (analysis.fluencyScore * weightNew));
      const newVocab = Math.round((existingProfile.vocabulary_score * weightOld) + (analysis.vocabularyScore * weightNew));
      const newProf = Math.round((existingProfile.professional_score * weightOld) + (analysis.professionalScore * weightNew));
      const newWpm = Math.round((existingProfile.average_wpm * weightOld) + (analysis.wordsPerMinute * weightNew));

      const updatedFillers = Array.from(new Set([
        ...(existingProfile.top_recurring_fillers || []),
        ...(analysis.topFiller ? [analysis.topFiller] : [])
      ])).slice(0, 5);

      await supabase
        .from("communication_profiles")
        .update({
          language_score: newLang,
          grammar_score: newGrammar,
          clarity_score: newClarity,
          fluency_score: newFluency,
          vocabulary_score: newVocab,
          professional_score: newProf,
          total_interviews: totalInterviews,
          average_wpm: newWpm,
          top_recurring_fillers: updatedFillers,
          primary_weakness: analysis.topFiller ? `filler_${analysis.topFiller}` : "pacing",
          recommended_focus: analysis.coachSuggestions.slice(0, 2),
          updated_at: new Date().toISOString()
        })
        .eq("user_id", userId);
    } else {
      await supabase
        .from("communication_profiles")
        .insert({
          user_id: userId,
          language_score: analysis.overallLanguageScore,
          grammar_score: analysis.grammarScore,
          clarity_score: analysis.clarityScore,
          fluency_score: analysis.fluencyScore,
          vocabulary_score: analysis.vocabularyScore,
          professional_score: analysis.professionalScore,
          total_interviews: 1,
          average_wpm: analysis.wordsPerMinute,
          primary_weakness: analysis.topFiller ? `filler_${analysis.topFiller}` : "structure",
          top_recurring_fillers: analysis.topFiller ? [analysis.topFiller] : ["um"],
          strengths: analysis.strengths,
          recommended_focus: analysis.coachSuggestions.slice(0, 2),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
    }

    // 2. Persist detected patterns
    for (const pat of analysis.detectedPatterns) {
      await supabase
        .from("language_patterns")
        .insert({
          user_id: userId,
          pattern_type: pat.type,
          pattern: pat.pattern,
          severity: pat.severity,
          examples: [pat.example],
          last_detected_at: new Date().toISOString()
        });
    }
  } catch (err) {
    console.warn("[syncUserCommunicationProfile note]:", err);
  }
}
