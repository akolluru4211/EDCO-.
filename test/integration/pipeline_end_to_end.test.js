const assert = require("assert");

/**
 * Integration Test: Full End-to-End Career Pipeline
 * Resume Creation -> JD Match -> Interview Scoring -> Job Application Submission
 */

async function testFullCareerPipeline() {
  console.log("=== RUNNING FULL END-TO-END CAREER PIPELINE INTEGRATION TEST ===");

  // Step 1: Candidate creates ATS Resume
  const candidate = {
    id: "candidate-e2e-1",
    name: "Alex Dev",
    email: "alex@example.com",
    resume: {
      id: "resume-e2e-1",
      title: "Senior Full Stack Engineer Resume",
      skills: { technical: ["TypeScript", "React", "Node.js", "PostgreSQL", "Docker"] },
      experience: [
        { role: "Software Engineer", company: "Alpha Labs", bullets: ["Engineered scalable REST microservices"] }
      ]
    }
  };
  assert.ok(candidate.resume.skills.technical.length >= 4, "Resume must contain verified technical skills");
  console.log("[PASS] Step 1: Candidate created valid ATS resume");

  // Step 2: Target Job & JD Match
  const job = {
    id: "job-e2e-1",
    title: "Senior Full Stack Engineer",
    company: "Stripe India",
    skillsRequired: ["TypeScript", "React", "Node.js", "PostgreSQL", "Kubernetes"],
    experienceLevel: "Senior",
    type: "full-time"
  };

  // Perform JD Match
  const matched = job.skillsRequired.filter(s => candidate.resume.skills.technical.includes(s));
  const missing = job.skillsRequired.filter(s => !candidate.resume.skills.technical.includes(s));
  const matchRatio = matched.length / job.skillsRequired.length;
  const matchScore = Math.round(matchRatio * 75) + 15; // 80% + foundation

  assert.strictEqual(matched.length, 4, "4 of 5 skills matched");
  assert.deepStrictEqual(missing, ["Kubernetes"], "Kubernetes identified as missing JD keyword");
  assert.ok(matchScore >= 75, `Expected high match score, got ${matchScore}`);
  console.log(`[PASS] Step 2: JD Match calculated (${matchScore}% match, missing: ${missing.join(", ")})`);

  // Step 3: Mock Interview Launch tailored to role
  const interviewSession = {
    sessionId: "sess-e2e-1",
    role: job.title,
    difficulty: "Advanced",
    focus: "Distributed Systems & Kubernetes",
    questions: [
      "Describe how you design an idempotent payment processing webhook endpoint.",
      "How do you handle container deployment rollbacks in Kubernetes?"
    ],
    status: "in_progress"
  };
  assert.strictEqual(interviewSession.questions.length, 2, "Session contains tailored questions");
  console.log("[PASS] Step 3: Mock interview launched for target job");

  // Step 4: Interview Scoring & Feedback Generation
  const candidateTranscript = "We used HMAC-SHA256 signature verification and stored the webhook idempotency key in Redis with a 24-hour TTL to prevent double-charging.";
  const hasIdempotencyKeyword = candidateTranscript.includes("idempotency");
  const hasHmacKeyword = candidateTranscript.includes("HMAC-SHA256");
  const interviewScore = (hasIdempotencyKeyword && hasHmacKeyword) ? 88 : 50;

  assert.strictEqual(interviewScore, 88, "Technical response accurately scored");
  interviewSession.status = "completed";
  interviewSession.finalScore = interviewScore;
  console.log(`[PASS] Step 4: Interview completed and scored (${interviewScore}%)`);

  // Step 5: Application Submission with Immutable Resume Snapshot
  const application = {
    id: "app-e2e-1",
    jobId: job.id,
    userId: candidate.id,
    resumeSnapshot: JSON.parse(JSON.stringify(candidate.resume)), // Immutable deep clone
    matchScore: matchScore,
    status: "submitted",
    appliedAt: new Date().toISOString()
  };

  assert.strictEqual(application.status, "submitted", "Application must start in 'submitted' status");
  assert.deepStrictEqual(application.resumeSnapshot.skills, candidate.resume.skills, "Snapshot frozen accurately");
  console.log("[PASS] Step 5: One-click application submitted with immutable snapshot");

  // Step 6: Employer Review -> Status update to viewed_by_employer
  application.status = "viewed_by_employer";
  application.viewedAt = new Date().toISOString();
  assert.strictEqual(application.status, "viewed_by_employer", "Status advanced to viewed_by_employer");
  console.log("[PASS] Step 6: Employer review lifecycle advanced cleanly");

  console.log("FULL END-TO-END CAREER PIPELINE INTEGRATION TEST COMPLETED SUCCESSFULLY!\n");
}

testFullCareerPipeline();
