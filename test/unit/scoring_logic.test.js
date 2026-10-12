const assert = require("assert");

// Test 1: JD Match Keyword Overlap & Missing Skills
function extractTokens(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9#+.\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1);
}

function calculateJobMatch(job, resumeContent, profile) {
  const jdText = `${job.title} ${job.description || ""} ${job.skillsRequired.join(" ")}`.toLowerCase();
  
  const resumeTextParts = [];
  const candidateSkills = new Set();

  if (resumeContent) {
    if (resumeContent.summary) resumeTextParts.push(resumeContent.summary);
    if (resumeContent.skills) {
      if (Array.isArray(resumeContent.skills.technical)) {
        resumeContent.skills.technical.forEach((s) => {
          resumeTextParts.push(s);
          candidateSkills.add(s.toLowerCase().trim());
        });
      }
      if (Array.isArray(resumeContent.skills.tools)) {
        resumeContent.skills.tools.forEach((s) => {
          resumeTextParts.push(s);
          candidateSkills.add(s.toLowerCase().trim());
        });
      }
    }
    if (Array.isArray(resumeContent.experience)) {
      resumeContent.experience.forEach((exp) => {
        if (exp.role) resumeTextParts.push(exp.role);
        if (exp.company) resumeTextParts.push(exp.company);
        if (Array.isArray(exp.bullets)) resumeTextParts.push(...exp.bullets);
      });
    }
  }

  if (profile?.interests && Array.isArray(profile.interests)) {
    profile.interests.forEach((item) => {
      const name = typeof item === "string" ? item : item.name;
      if (name) {
        resumeTextParts.push(name);
        candidateSkills.add(name.toLowerCase().trim());
      }
    });
  }

  const fullCandidateText = resumeTextParts.join(" ").toLowerCase();

  const requiredSkills = job.skillsRequired && job.skillsRequired.length > 0 
    ? job.skillsRequired 
    : ["General Engineering"];
  
  const matchedSkills = [];
  const missingSkills = [];

  requiredSkills.forEach((skill) => {
    const sLower = skill.toLowerCase().trim();
    const isDirectMatch = candidateSkills.has(sLower);
    const isTextMatch = fullCandidateText.includes(sLower);
    
    if (isDirectMatch || isTextMatch) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });

  const skillMatchRatio = requiredSkills.length > 0 
    ? matchedSkills.length / requiredSkills.length 
    : 0.5;
  const skillPoints = Math.round(skillMatchRatio * 60);

  let personalizationBonus = 0;
  const candidateTargetRole = (profile?.dreamJob || profile?.targetRole || "").toLowerCase();
  const jobTitleLower = job.title.toLowerCase();

  if (candidateTargetRole) {
    if (jobTitleLower.includes(candidateTargetRole) || candidateTargetRole.includes(jobTitleLower)) {
      personalizationBonus += 12;
    } else {
      const roleTokens = extractTokens(candidateTargetRole);
      const titleTokens = extractTokens(jobTitleLower);
      if (roleTokens.some((t) => titleTokens.includes(t))) personalizationBonus += 8;
    }
  } else {
    personalizationBonus += 5;
  }

  const candidateLevel = profile?.interests?.[0]?.effectiveLevel ?? 1;
  const reqLevel = (job.experienceLevel || "mid").toLowerCase();

  if (reqLevel.includes("entry") || reqLevel.includes("junior")) {
    personalizationBonus += candidateLevel <= 1 ? 8 : 5;
  } else if (reqLevel.includes("senior") || reqLevel.includes("lead")) {
    personalizationBonus += candidateLevel >= 2 ? 8 : 3;
  } else {
    personalizationBonus += 7;
  }

  let foundationPoints = 10;
  if (resumeContent?.experience?.length > 0) foundationPoints += 3;

  const rawScore = skillPoints + personalizationBonus + foundationPoints;
  const score = Math.min(98, Math.max(25, rawScore));
  const tier = score >= 80 ? "strong" : score >= 60 ? "moderate" : "low";

  return { score, matchedSkills, missingSkills, personalizationBonus, tier };
}

// Test 2: Interview Response Scoring Heuristic
function scoreInterviewResponse(transcript, targetRole, requiredKeywords) {
  const tLower = (transcript || "").toLowerCase();
  const words = tLower.split(/\s+/).filter(Boolean);
  
  if (words.length < 10) {
    return { score: 35, tier: "needs_improvement", feedback: "Response is too brief." };
  }

  const FILLERS = ["um", "uh", "like", "you know", "basically", "actually"];
  let fillerCount = 0;
  FILLERS.forEach((f) => {
    const matches = tLower.match(new RegExp(`\\b${f}\\b`, "g"));
    if (matches) fillerCount += matches.length;
  });

  const fillerRatio = fillerCount / words.length;
  const clarityDeduction = fillerRatio > 0.05 ? 15 : fillerRatio > 0.02 ? 8 : 0;

  let keywordHits = 0;
  (requiredKeywords || []).forEach((kw) => {
    if (tLower.includes(kw.toLowerCase())) keywordHits++;
  });

  const keywordRatio = requiredKeywords.length > 0 ? keywordHits / requiredKeywords.length : 0.5;
  const contentScore = Math.round(keywordRatio * 60);
  const structureScore = words.length >= 40 ? 30 : 20;

  const finalScore = Math.max(20, Math.min(95, contentScore + structureScore - clarityDeduction));
  return {
    score: finalScore,
    tier: finalScore >= 75 ? "proficient" : finalScore >= 55 ? "adequate" : "developing",
    fillerRatio: Number(fillerRatio.toFixed(3)),
    keywordHits
  };
}

console.log("=== RUNNING SCORING LOGIC UNIT TESTS ===");

// 1. Assert JD match accurately flags high match and extracts missing skills
const highJob = {
  title: "Frontend Engineer",
  skillsRequired: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
  experienceLevel: "Mid-Level"
};
const candidateResume = {
  summary: "Frontend developer specialized in React and TypeScript.",
  skills: { technical: ["React", "TypeScript", "Tailwind CSS"] },
  experience: [{ role: "Developer", company: "Web Co", bullets: ["Built Next.js apps"] }]
};
const candidateProfile = {
  targetRole: "Frontend Engineer",
  interests: [{ name: "React", effectiveLevel: 1 }]
};

const matchRes = calculateJobMatch(highJob, candidateResume, candidateProfile);
assert.strictEqual(matchRes.tier, "strong", "Expected strong tier for aligned frontend candidate");
assert.ok(matchRes.score >= 80, `Expected score >= 80, got ${matchRes.score}`);
assert.strictEqual(matchRes.missingSkills.length, 0, "All skills should be detected");
console.log("[PASS] JD-match high alignment test passed");

// 2. Assert low alignment when skills diverge
const dataJob = {
  title: "Data Engineer",
  skillsRequired: ["Apache Spark", "Scala", "Snowflake", "dbt"],
  experienceLevel: "Senior"
};
const divergentRes = calculateJobMatch(dataJob, candidateResume, candidateProfile);
assert.strictEqual(divergentRes.tier, "low", "Expected low tier for divergent skills");
assert.ok(divergentRes.score < 60, `Expected score < 60, got ${divergentRes.score}`);
assert.strictEqual(divergentRes.missingSkills.length, 4, "All 4 data skills should be flagged as missing");
console.log("[PASS] JD-match divergent alignment test passed");

// 3. Assert interview scoring flags excessive filler words
const fluentTranscript = "In my previous project, we architected a microservices pipeline using React and TypeScript. We reduced bundle size by 35% through code splitting and memoization.";
const fluentScore = scoreInterviewResponse(fluentTranscript, "Frontend Engineer", ["React", "TypeScript", "microservices"]);
assert.ok(fluentScore.score >= 75, `Expected proficient score for clear answer, got ${fluentScore.score}`);
assert.strictEqual(fluentScore.fillerRatio, 0, "Expected zero filler words");

const fillerTranscript = "Um, so basically, like, you know, we used, um, React and like, sort of did some coding, actually, you know.";
const fillerScore = scoreInterviewResponse(fillerTranscript, "Frontend Engineer", ["React"]);
assert.ok(fillerScore.score < fluentScore.score, `Expected penalized score compared to fluent (${fluentScore.score}), got ${fillerScore.score}`);
assert.ok(fillerScore.fillerRatio > 0.05, "Expected high filler ratio detected");
console.log("[PASS] Interview response scoring heuristics unit test passed");

console.log("ALL SCORING LOGIC UNIT TESTS PASSED SUCCESSFULLY!\n");
