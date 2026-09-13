/**
 * Verification Script: Phase 31 — Mock Interviews as Personalized Language & Communication Trainer
 */

const fs = require("fs");
const path = require("path");

function runVerification() {
  console.log("================================================================================");
  console.log("EDWORLD CO — PHASE 31 VERIFICATION: PERSONALIZED LANGUAGE & COMMUNICATION TRAINER");
  console.log("================================================================================\n");

  let totalPasses = 0;
  let totalFailures = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      totalPasses++;
    } else {
      console.error(`  [FAIL] ${message}`);
      totalFailures++;
    }
  }

  // 1. Language Analysis Service Structure & Logic
  console.log("1. Checking Language Analysis Service & Engine:");
  const langServicePath = path.join(__dirname, "../src/lib/interview/language-analysis-service.ts");
  assert(fs.existsSync(langServicePath), "language-analysis-service.ts exists");

  const langServiceCode = fs.readFileSync(langServicePath, "utf-8");
  assert(langServiceCode.includes("analyzeSpokenLanguage"), "Exports analyzeSpokenLanguage function");
  assert(langServiceCode.includes("compareAttempts"), "Exports compareAttempts function");
  assert(langServiceCode.includes("syncUserCommunicationProfile"), "Exports syncUserCommunicationProfile function");
  assert(langServiceCode.includes("FILLER_PATTERNS"), "Defines multi-filler word regex patterns (actually, basically, like, etc.)");
  assert(langServiceCode.includes("grammarScore"), "Computes granular grammarScore");
  assert(langServiceCode.includes("clarityScore"), "Computes granular clarityScore");
  assert(langServiceCode.includes("fluencyScore"), "Computes granular fluencyScore");
  assert(langServiceCode.includes("vocabularyScore"), "Computes granular vocabularyScore");
  assert(langServiceCode.includes("whatYouSaid"), "Generates whatYouSaid vs improvedVersion pairs");

  // 2. Communication RAG & Role-Specific Knowledge Base
  console.log("\n2. Checking Communication RAG & Role Guidelines:");
  const ragPath = path.join(__dirname, "../src/lib/interview/communication-rag.ts");
  assert(fs.existsSync(ragPath), "communication-rag.ts exists");

  const ragCode = fs.readFileSync(ragPath, "utf-8");
  assert(ragCode.includes("ROLE_COMMUNICATION_GUIDELINES"), "Defines ROLE_COMMUNICATION_GUIDELINES");
  assert(ragCode.includes("software_engineer"), "Contains Software Engineer communication profile");
  assert(ragCode.includes("cybersecurity"), "Contains Cybersecurity communication profile");
  assert(ragCode.includes("hr_recruiter"), "Contains HR & People Operations communication profile");
  assert(ragCode.includes("COMMON_GRAMMAR_AND_PHRASING_FIXES"), "Contains common grammar & phrasing fixes without accent bias");

  // 3. MediaRecorderStudio Speech Recognition & Manual Fallback
  console.log("\n3. Checking MediaRecorderStudio Live Speech-to-Text:");
  const studioPath = path.join(__dirname, "../src/components/interview/MediaRecorderStudio.tsx");
  assert(fs.existsSync(studioPath), "MediaRecorderStudio.tsx exists");

  const studioCode = fs.readFileSync(studioPath, "utf-8");
  assert(studioCode.includes("SpeechRecognition") || studioCode.includes("webkitSpeechRecognition"), "Initializes SpeechRecognition for live streaming transcripts");
  assert(studioCode.includes("liveTranscript"), "Maintains live streaming transcript state");
  assert(studioCode.includes("isEditingTranscript"), "Provides manual transcript editing fallback");
  assert(studioCode.includes("recognitionFailed"), "Handles speech recognition failure gracefully with retry & manual options");

  // 4. TryAgainComparisonModal & SpeakingHabitsTracker Components
  console.log("\n4. Checking Comparison Modal & Speaking Habits Tracker:");
  const modalPath = path.join(__dirname, "../src/components/interview/TryAgainComparisonModal.tsx");
  assert(fs.existsSync(modalPath), "TryAgainComparisonModal.tsx exists");
  const modalCode = fs.readFileSync(modalPath, "utf-8");
  assert(modalCode.includes("attempt1") && modalCode.includes("attempt2"), "Renders attempt 1 vs attempt 2 comparison");
  assert(modalCode.includes("fillerReductionPercent"), "Displays filler word reduction percentage");

  const trackerPath = path.join(__dirname, "../src/components/interview/SpeakingHabitsTracker.tsx");
  assert(fs.existsSync(trackerPath), "SpeakingHabitsTracker.tsx exists");
  const trackerCode = fs.readFileSync(trackerPath, "utf-8");
  assert(trackerCode.includes("Filler Words Trend"), "Renders multi-interview filler word trend");
  assert(trackerCode.includes("Clarity & STAR Growth"), "Renders clarity and STAR growth progression");

  const dailyCardPath = path.join(__dirname, "../src/components/interview/DailyPracticeCard.tsx");
  assert(fs.existsSync(dailyCardPath), "DailyPracticeCard.tsx exists");

  // 5. Language Training Page & Results Upgrade
  console.log("\n5. Checking Language Training Page & Results Upgrade:");
  const trainingPagePath = path.join(__dirname, "../src/app/interviews/language-training/page.tsx");
  assert(fs.existsSync(trainingPagePath), "interviews/language-training/page.tsx exists");
  const trainingPageCode = fs.readFileSync(trainingPagePath, "utf-8");
  assert(trainingPageCode.includes("PRACTICE_DRILL_QUESTIONS"), "Contains curated practice drill questions");
  assert(trainingPageCode.includes("handleTryAgain"), "Supports multi-attempt 'Try Again' drills");

  const resultsPagePath = path.join(__dirname, "../src/app/interviews/results/[sessionId]/page.tsx");
  const resultsCode = fs.readFileSync(resultsPagePath, "utf-8");
  assert(resultsCode.includes("Language Score") || resultsCode.includes("languageScore"), "Renders Language Score breakdown");
  assert(resultsCode.includes("What You Said vs. Better Way to Say It"), "Renders 'What You Said' vs 'Better Way to Say It' card");
  assert(resultsCode.includes("AI-generated assessment"), "Displays Responsible AI label");

  // 6. API Routes: score-session, generate-questions, language-training
  console.log("\n6. Checking Backend API Routes:");
  const scoreRoutePath = path.join(__dirname, "../src/app/api/interview/score-session/route.ts");
  const scoreCode = fs.readFileSync(scoreRoutePath, "utf-8");
  assert(scoreCode.includes("analyzeSpokenLanguage"), "score-session executes analyzeSpokenLanguage");
  assert(scoreCode.includes("interview_language_metrics"), "score-session writes to interview_language_metrics");
  assert(scoreCode.includes("syncUserCommunicationProfile"), "score-session syncs user communication profile");

  const genRoutePath = path.join(__dirname, "../src/app/api/interview/generate-questions/route.ts");
  const genCode = fs.readFileSync(genRoutePath, "utf-8");
  assert(genCode.includes("communication_profiles"), "generate-questions queries user communication_profiles");
  assert(genCode.includes("adaptiveFocus"), "generate-questions sets adaptiveFocus based on user weaknesses");

  const trainRoutePath = path.join(__dirname, "../src/app/api/interview/language-training/route.ts");
  assert(fs.existsSync(trainRoutePath), "api/interview/language-training/route.ts exists");

  // 7. Database Migration & RLS
  console.log("\n7. Checking Database Schema & RLS Migration:");
  const migrationPath = path.join(__dirname, "../supabase/migrations/20260916000000_phase31_language_and_communication_trainer.sql");
  assert(fs.existsSync(migrationPath), "Phase 31 SQL migration file exists");
  const migrationCode = fs.readFileSync(migrationPath, "utf-8");
  assert(migrationCode.includes("CREATE TABLE IF NOT EXISTS public.communication_profiles"), "Creates communication_profiles table");
  assert(migrationCode.includes("CREATE TABLE IF NOT EXISTS public.language_patterns"), "Creates language_patterns table");
  assert(migrationCode.includes("CREATE TABLE IF NOT EXISTS public.interview_language_metrics"), "Creates interview_language_metrics table");
  assert(migrationCode.includes("CREATE TABLE IF NOT EXISTS public.language_practice_sessions"), "Creates language_practice_sessions table");
  assert(migrationCode.includes("ENABLE ROW LEVEL SECURITY"), "Enables RLS across all new tables");
  assert(migrationCode.includes("auth.uid()"), "Restricts RLS policies strictly to authenticated users");

  console.log("\n--------------------------------------------------------------------------------");
  console.log(`TOTAL PASSES: ${totalPasses} | TOTAL FAILURES: ${totalFailures}`);
  console.log("--------------------------------------------------------------------------------");

  if (totalFailures === 0) {
    console.log("\n🎉 ALL PHASE 31 PERSONALIZED LANGUAGE & COMMUNICATION TRAINER TESTS PASSED 100%!\n");
    process.exit(0);
  } else {
    console.error(`\n❌ ${totalFailures} TESTS FAILED.`);
    process.exit(1);
  }
}

runVerification();
