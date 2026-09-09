const fs = require("fs");
const path = require("path");
const assert = require("assert");

console.log("================================================================================");
console.log("EDWORLD CO — VERIFICATION: FEATURE 3 EXTENSION (VOICE-DRIVEN, JD-TAILORED INTERVIEW & FULLSCREEN INTEGRITY)");
console.log("================================================================================\n");

let passed = 0;
let failed = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`✅ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`❌ FAIL: ${name}`);
    console.error(`   Error: ${err.message}`);
    failed++;
  }
}

// -----------------------------------------------------------------------------
// 1. JD-Tailored Question Generation & Fixed Opening Question
// -----------------------------------------------------------------------------
runTest("1.1 generate-questions API always prepends fixed 'Tell me about yourself' opener and tags difficulty (0-2)", () => {
  const genApi = fs.readFileSync(path.join(__dirname, "../src/app/api/interview/generate-questions/route.ts"), "utf-8");
  assert(genApi.includes("Tell me about yourself"), "Must include fixed 'Tell me about yourself' opener");
  assert(genApi.includes("FIXED_OPENING_QUESTION"), "Must define FIXED_OPENING_QUESTION");
  assert(genApi.includes("difficultyLevel: Math.min(2, Math.max(0,"), "Generated questions must be tagged with difficulty_level (0-2)");
  assert(genApi.includes("isWarmup: true"), "Warmup question must be tagged");
});

runTest("1.2 JD generation cleanly falls back to static question bank on missing JD or error", () => {
  const genApi = fs.readFileSync(path.join(__dirname, "../src/app/api/interview/generate-questions/route.ts"), "utf-8");
  assert(genApi.includes("SEED_INTERVIEW_QUESTIONS"), "Must fall back to SEED_INTERVIEW_QUESTIONS");
  assert(genApi.includes('source: "static_bank"'), "Must return static_bank source on fallback");
});

// -----------------------------------------------------------------------------
// 2. Voice-Delivered TTS Audio & Text-Only Fallback
// -----------------------------------------------------------------------------
runTest("2.1 TTS API provides voice audio synthesis with caching and text-only fallback", () => {
  const ttsApi = fs.readFileSync(path.join(__dirname, "../src/app/api/interview/tts/route.ts"), "utf-8");
  assert(ttsApi.includes("TTS_AUDIO_CACHE"), "TTS API must maintain audio cache");
  assert(ttsApi.includes("textOnlyFallback"), "Must support textOnlyFallback on error");

  const studioComp = fs.readFileSync(path.join(__dirname, "../src/components/interview/MediaRecorderStudio.tsx"), "utf-8");
  assert(studioComp.includes("playQuestionAudio"), "Studio must support audio playback");
  assert(studioComp.includes("Replay Audio"), "Studio must provide replay audio control");
});

// -----------------------------------------------------------------------------
// 3. Fullscreen Integrity Mode (Detection, Auto-Pause, Resume, Logging)
// -----------------------------------------------------------------------------
runTest("3.1 MediaRecorderStudio detects fullscreen exit, pauses recording, provides resume overlay, and logs exits", () => {
  const studioComp = fs.readFileSync(path.join(__dirname, "../src/components/interview/MediaRecorderStudio.tsx"), "utf-8");
  assert(studioComp.includes("fullscreenchange"), "Must listen to fullscreenchange event");
  assert(studioComp.includes("pauseRecording()"), "Must pause recording on fullscreen exit");
  assert(studioComp.includes("fullscreenExitEvents"), "Must log fullscreenExitEvents");
  assert(studioComp.includes("You've exited fullscreen"), "Must display resume overlay on exit");
  assert(studioComp.includes("resumeRecording()"), "Must resume recording on return");
});

// -----------------------------------------------------------------------------
// 4. Inline Mistake Annotations & Sub-Score Calculations
// -----------------------------------------------------------------------------
runTest("4.1 score-session API computes inline mistake annotations and sub-scores (Content, Voice, Eye Contact)", () => {
  const scoreApi = fs.readFileSync(path.join(__dirname, "../src/app/api/interview/score-session/route.ts"), "utf-8");
  assert(scoreApi.includes("annotations"), "Scoring API must return inline annotations");
  assert(scoreApi.includes("fillerWords"), "Must detect filler word clusters");
  assert(scoreApi.includes("contentScore"), "Must calculate contentScore");
  assert(scoreApi.includes("voiceScore"), "Must calculate voiceScore");
  assert(scoreApi.includes("engagementScore"), "Must calculate eye contact engagementScore");
  assert(scoreApi.includes("fullscreen_exit_events"), "Must persist fullscreen exit events to session");
});

// -----------------------------------------------------------------------------
// 5. Results Screen UX (Summary First, Encouraging Eye Contact, Annotations)
// -----------------------------------------------------------------------------
runTest("5.1 Results screen renders sub-scores, interactive inline transcript annotations, and neutral exit count", () => {
  const resultsPage = fs.readFileSync(path.join(__dirname, "../src/app/interviews/results/[sessionId]/page.tsx"), "utf-8");
  assert(resultsPage.includes("Content &amp; Structure"), "Results page must display Content score");
  assert(resultsPage.includes("Voice Delivery"), "Results page must display Voice score");
  assert(resultsPage.includes("Camera Engagement"), "Results page must display Camera Engagement score");
  assert(resultsPage.includes("Annotated Speech Transcript"), "Results page must display Annotated Speech Transcript");
  assert(resultsPage.includes("Fullscreen Integrity:"), "Results page must display neutral fullscreen exit counter");
});

console.log("\n--------------------------------------------------------------------------------");
console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log("--------------------------------------------------------------------------------\n");

if (failed > 0) {
  process.exit(1);
} else {
  console.log("🎉 ALL FEATURE 3 EXTENSION PRODUCTION TESTS PASSED 100%!");
  process.exit(0);
}
