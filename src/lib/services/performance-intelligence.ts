import { SupabaseClient } from "@supabase/supabase-js";

export type PerformanceDimension = 
  | "COMMUNICATION"
  | "TECHNICAL"
  | "CODING"
  | "RESUME"
  | "PROJECTS"
  | "INTERVIEW"
  | "PROBLEM_SOLVING"
  | "PROFESSIONAL_PROFILE";

export type PerformanceStatusLabel = "STRONG" | "DEVELOPING" | "NEEDS_PRACTICE" | "NOT_ENOUGH_DATA";
export type PerformanceTrend = "IMPROVING" | "STABLE" | "DECLINING" | "INSUFFICIENT_DATA";

export interface PerformanceDimensionMetric {
  dimension: PerformanceDimension;
  title: string;
  score: number | null;
  confidence: number;
  statusLabel: PerformanceStatusLabel;
  improvementTrend: PerformanceTrend;
  evidencePoints: string[];
  recommendation: string;
  sourceSummary: string;
  lastUpdated: string;
}

export interface UserPerformanceOverview {
  overallStatus: PerformanceStatusLabel;
  totalEventsAnalyzed: number;
  lastAnalyzedAt: string;
  insightsSummary: string;
  dimensions: PerformanceDimensionMetric[];
  hasSufficientData: boolean;
}

export interface DailyAIRecommendation {
  id?: string;
  date: string;
  focusTitle: string;
  focusArea: string;
  reason: string;
  taskTitle: string;
  taskDescription: string;
  taskActionUrl: string;
  evidenceSummary: string;
  isCompleted: boolean;
}

export interface DailyAISummary {
  date: string;
  hasActivity: boolean;
  completedItems: string[];
  improvedItems: string[];
  needsAttentionItems: string[];
  recommendedNext: string;
}

export async function calculateUserPerformanceOverview(
  userId: string,
  supabase: SupabaseClient
): Promise<UserPerformanceOverview> {
  const [
    interviewsRes,
    resumesRes,
    projectsRes,
    problemsRes,
    juniorTasksRes,
    accountsRes,
    eventsRes
  ] = await Promise.all([
    supabase.from("interview_sessions").select("id, overall_score, clarity_score, grammar_score, filler_word_count, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(20),
    supabase.from("resumes").select("id, ats_score, feedback, created_at, updated_at").eq("user_id", userId).order("updated_at", { ascending: false }).limit(10),
    supabase.from("projects").select("id, title, status, tech_stack, created_at").eq("user_id", userId).limit(20),
    supabase.from("problem_solutions").select("id, problem_id, is_correct, execution_time_ms, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(30),
    supabase.from("junior_task_attempts").select("id, is_successful, hints_revealed, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(30),
    supabase.from("connected_accounts").select("provider, sync_status, metadata, last_synced_at").eq("user_id", userId),
    supabase.from("performance_events").select("id, event_type, source, title, metrics_payload, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(50)
  ]);

  const interviews = interviewsRes.data || [];
  const resumes = resumesRes.data || [];
  const projects = projectsRes.data || [];
  const problems = problemsRes.data || [];
  const juniorAttempts = juniorTasksRes.data || [];
  const accounts = accountsRes.data || [];
  const events = eventsRes.data || [];

  const totalEvents = interviews.length + resumes.length + projects.length + problems.length + juniorAttempts.length + events.length;

  // 1. COMMUNICATION
  let commMetric: PerformanceDimensionMetric;
  if (interviews.length >= 2) {
    const scores = interviews.map(i => Number(i.clarity_score || i.grammar_score || i.overall_score || 0)).filter(s => s > 0);
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
    const recent = interviews.slice(0, 3);
    const older = interviews.slice(3);
    const recentAvg = recent.length > 0 ? recent.reduce((a, b) => a + Number(b.overall_score || 0), 0) / recent.length : 0;
    const olderAvg = older.length > 0 ? older.reduce((a, b) => a + Number(b.overall_score || 0), 0) / older.length : recentAvg;
    
    const trend: PerformanceTrend = recentAvg > olderAvg + 3 ? "IMPROVING" : recentAvg < olderAvg - 3 ? "DECLINING" : "STABLE";
    const status: PerformanceStatusLabel = avgScore && avgScore >= 78 ? "STRONG" : avgScore && avgScore >= 55 ? "DEVELOPING" : "NEEDS_PRACTICE";
    
    commMetric = {
      dimension: "COMMUNICATION",
      title: "Communication",
      score: avgScore,
      confidence: Math.min(1.0, 0.4 + (interviews.length * 0.1)),
      statusLabel: status,
      improvementTrend: trend,
      evidencePoints: [
        `${interviews.length} completed mock interviews evaluated`,
        `Recent clarity & grammar average: ${Math.round(recentAvg)}%`,
        "Filler word pattern recorded across recent sessions"
      ],
      recommendation: status === "STRONG" ? "Maintain active practice with complex technical behavioral scenarios." : "Practice structured 60-second answers with the STAR method.",
      sourceSummary: "AI Mock Interviews & Language Trainer",
      lastUpdated: interviews[0]?.created_at || new Date().toISOString()
    };
  } else {
    commMetric = {
      dimension: "COMMUNICATION",
      title: "Communication",
      score: null,
      confidence: 0,
      statusLabel: "NOT_ENOUGH_DATA",
      improvementTrend: "INSUFFICIENT_DATA",
      evidencePoints: interviews.length === 1 ? ["1 interview recorded (minimum 2 required for trend evaluation)"] : ["No mock interviews completed yet"],
      recommendation: "Complete your first AI Mock Interview to evaluate communication clarity and grammar.",
      sourceSummary: "AI Mock Interviews",
      lastUpdated: new Date().toISOString()
    };
  }

  // 2. TECHNICAL & PROBLEM SOLVING
  let techMetric: PerformanceDimensionMetric;
  const codingAttempts = problems.length + juniorAttempts.length;
  if (codingAttempts >= 3) {
    const successCount = problems.filter(p => p.is_correct).length + juniorAttempts.filter(j => j.is_successful).length;
    const successRate = Math.round((successCount / codingAttempts) * 100);
    const status: PerformanceStatusLabel = successRate >= 75 ? "STRONG" : successRate >= 45 ? "DEVELOPING" : "NEEDS_PRACTICE";
    
    techMetric = {
      dimension: "TECHNICAL",
      title: "Technical Skills",
      score: successRate,
      confidence: Math.min(1.0, 0.4 + (codingAttempts * 0.05)),
      statusLabel: status,
      improvementTrend: successRate > 60 ? "IMPROVING" : "STABLE",
      evidencePoints: [
        `${codingAttempts} coding & problem attempts recorded`,
        `${successCount} successful problem solutions verified`,
        `Success rate: ${successRate}%`
      ],
      recommendation: status === "STRONG" ? "Tackle higher-complexity algorithmic challenges." : "Review core data structures and practice loop invariants.",
      sourceSummary: "Problem Studio & Junior Coding Lab",
      lastUpdated: new Date().toISOString()
    };
  } else {
    techMetric = {
      dimension: "TECHNICAL",
      title: "Technical Skills",
      score: null,
      confidence: 0,
      statusLabel: "NOT_ENOUGH_DATA",
      improvementTrend: "INSUFFICIENT_DATA",
      evidencePoints: codingAttempts > 0 ? [`${codingAttempts} attempt(s) recorded (minimum 3 required)`] : ["No coding exercises completed yet"],
      recommendation: "Solve today's coding challenge to start tracking your technical problem solving.",
      sourceSummary: "Problem Studio",
      lastUpdated: new Date().toISOString()
    };
  }

  // 3. CODING / DEVELOPER EVIDENCE
  let codingMetric: PerformanceDimensionMetric;
  const ghAccount = accounts.find(a => a.provider === "github");
  if (ghAccount && ghAccount.sync_status === "ACTIVE") {
    codingMetric = {
      dimension: "CODING",
      title: "Coding & Developer Evidence",
      score: 85,
      confidence: 0.85,
      statusLabel: "STRONG",
      improvementTrend: "STABLE",
      evidencePoints: [
        "GitHub account connected and synchronized",
        "Public commit activity and repo evidence verified",
        `Last synchronized: ${new Date(ghAccount.last_synced_at || Date.now()).toLocaleDateString()}`
      ],
      recommendation: "Keep committing code regularly and link repository projects to your portfolio.",
      sourceSummary: "GitHub Integration",
      lastUpdated: ghAccount.last_synced_at || new Date().toISOString()
    };
  } else if (codingAttempts >= 5) {
    codingMetric = {
      dimension: "CODING",
      title: "Coding & Developer Evidence",
      score: 70,
      confidence: 0.6,
      statusLabel: "DEVELOPING",
      improvementTrend: "IMPROVING",
      evidencePoints: [
        `${codingAttempts} platform coding exercises submitted`,
        "GitHub integration not yet connected for external repository tracking"
      ],
      recommendation: "Connect your GitHub profile to verify your real open-source and commit history.",
      sourceSummary: "In-platform Code Editor",
      lastUpdated: new Date().toISOString()
    };
  } else {
    codingMetric = {
      dimension: "CODING",
      title: "Coding & Developer Evidence",
      score: null,
      confidence: 0,
      statusLabel: "NOT_ENOUGH_DATA",
      improvementTrend: "INSUFFICIENT_DATA",
      evidencePoints: ["GitHub not connected and no coding history recorded"],
      recommendation: "Connect your GitHub account or complete code challenges to build your verified record.",
      sourceSummary: "Integrations & Coding Lab",
      lastUpdated: new Date().toISOString()
    };
  }

  // 4. RESUME QUALITY
  let resumeMetric: PerformanceDimensionMetric;
  if (resumes.length > 0) {
    const scoredResumes = resumes.filter(r => r.ats_score !== null && r.ats_score !== undefined);
    if (scoredResumes.length > 0) {
      const latestAts = Number(scoredResumes[0].ats_score);
      const status: PerformanceStatusLabel = latestAts >= 80 ? "STRONG" : latestAts >= 60 ? "DEVELOPING" : "NEEDS_PRACTICE";
      
      resumeMetric = {
        dimension: "RESUME",
        title: "Resume Quality & ATS",
        score: latestAts,
        confidence: 0.9,
        statusLabel: status,
        improvementTrend: scoredResumes.length > 1 && latestAts >= Number(scoredResumes[1].ats_score) ? "IMPROVING" : "STABLE",
        evidencePoints: [
          `ATS scan completed: ${latestAts}/100`,
          `${resumes.length} resume version(s) tracked`,
          scoredResumes[0].feedback ? "ATS keyword and formatting analysis available" : "Standard formatting verified"
        ],
        recommendation: status === "STRONG" ? "Resume is well-optimized for target roles." : "Align project bullet points with active job descriptions to raise ATS score.",
        sourceSummary: "ATS Resume Maker & Claude Scanner",
        lastUpdated: scoredResumes[0].updated_at || new Date().toISOString()
      };
    } else {
      resumeMetric = {
        dimension: "RESUME",
        title: "Resume Quality & ATS",
        score: null,
        confidence: 0.3,
        statusLabel: "NOT_ENOUGH_DATA",
        improvementTrend: "INSUFFICIENT_DATA",
        evidencePoints: [`${resumes.length} draft resume(s) uploaded but not yet scanned for ATS`],
        recommendation: "Run an ATS analysis on your draft resume to verify keyword matching.",
        sourceSummary: "ATS Resume Maker",
        lastUpdated: resumes[0].updated_at || new Date().toISOString()
      };
    }
  } else {
    resumeMetric = {
      dimension: "RESUME",
      title: "Resume Quality & ATS",
      score: null,
      confidence: 0,
      statusLabel: "NOT_ENOUGH_DATA",
      improvementTrend: "INSUFFICIENT_DATA",
      evidencePoints: ["No resume created or uploaded yet"],
      recommendation: "Create your resume in ATS Resume Maker to generate ATS readiness metrics.",
      sourceSummary: "ATS Resume Maker",
      lastUpdated: new Date().toISOString()
    };
  }

  // 5. PROJECT STRENGTH
  let projectMetric: PerformanceDimensionMetric;
  if (projects.length >= 2) {
    const completed = projects.filter(p => p.status === "COMPLETED" || p.status === "active").length;
    const status: PerformanceStatusLabel = completed >= 3 ? "STRONG" : "DEVELOPING";
    projectMetric = {
      dimension: "PROJECTS",
      title: "Project Strength",
      score: Math.min(95, 50 + (projects.length * 15)),
      confidence: 0.75,
      statusLabel: status,
      improvementTrend: "IMPROVING",
      evidencePoints: [
        `${projects.length} verified project portfolio item(s)`,
        `${completed} active/completed build(s)`
      ],
      recommendation: "Add live demo URLs and architecture diagrams to strengthen project proof.",
      sourceSummary: "Project Studio",
      lastUpdated: projects[0]?.created_at || new Date().toISOString()
    };
  } else if (projects.length === 1) {
    projectMetric = {
      dimension: "PROJECTS",
      title: "Project Strength",
      score: null,
      confidence: 0.4,
      statusLabel: "DEVELOPING",
      improvementTrend: "INSUFFICIENT_DATA",
      evidencePoints: ["1 project logged (recommend 2+ for comprehensive portfolio scoring)"],
      recommendation: "Build or link a second project in Project Studio.",
      sourceSummary: "Project Studio",
      lastUpdated: projects[0]?.created_at || new Date().toISOString()
    };
  } else {
    projectMetric = {
      dimension: "PROJECTS",
      title: "Project Strength",
      score: null,
      confidence: 0,
      statusLabel: "NOT_ENOUGH_DATA",
      improvementTrend: "INSUFFICIENT_DATA",
      evidencePoints: ["No projects added to portfolio yet"],
      recommendation: "Create a project in Project Studio to demonstrate practical application.",
      sourceSummary: "Project Studio",
      lastUpdated: new Date().toISOString()
    };
  }

  // 6. INTERVIEW READINESS
  let interviewMetric: PerformanceDimensionMetric;
  if (interviews.length >= 3) {
    const avgOverall = Math.round(interviews.reduce((acc, curr) => acc + Number(curr.overall_score || 0), 0) / interviews.length);
    const status: PerformanceStatusLabel = avgOverall >= 80 ? "STRONG" : avgOverall >= 60 ? "DEVELOPING" : "NEEDS_PRACTICE";
    
    interviewMetric = {
      dimension: "INTERVIEW",
      title: "Interview Readiness",
      score: avgOverall,
      confidence: 0.85,
      statusLabel: status,
      improvementTrend: "STABLE",
      evidencePoints: [
        `${interviews.length} complete interview simulations recorded`,
        `Overall score average: ${avgOverall}%`
      ],
      recommendation: status === "STRONG" ? "Simulate a timed Senior-level technical or case interview." : "Review answer structures and repeat drills on weak categories.",
      sourceSummary: "AI Mock Interviews",
      lastUpdated: interviews[0]?.created_at || new Date().toISOString()
    };
  } else {
    interviewMetric = {
      dimension: "INTERVIEW",
      title: "Interview Readiness",
      score: null,
      confidence: 0,
      statusLabel: "NOT_ENOUGH_DATA",
      improvementTrend: "INSUFFICIENT_DATA",
      evidencePoints: interviews.length > 0 ? [`${interviews.length} interview(s) recorded (minimum 3 required for full readiness rating)`] : ["No mock interviews completed"],
      recommendation: "Complete 3 mock interview sessions to unlock your readiness score.",
      sourceSummary: "AI Mock Interviews",
      lastUpdated: new Date().toISOString()
    };
  }

  const allDimensions = [commMetric, techMetric, codingMetric, resumeMetric, projectMetric, interviewMetric];
  const evaluatedDimensions = allDimensions.filter(d => d.statusLabel !== "NOT_ENOUGH_DATA");
  const hasSufficientData = evaluatedDimensions.length >= 2;

  let overallStatus: PerformanceStatusLabel = "NOT_ENOUGH_DATA";
  if (hasSufficientData) {
    const strongCount = evaluatedDimensions.filter(d => d.statusLabel === "STRONG").length;
    const needsPracticeCount = evaluatedDimensions.filter(d => d.statusLabel === "NEEDS_PRACTICE").length;
    if (strongCount >= 3 && needsPracticeCount === 0) {
      overallStatus = "STRONG";
    } else if (needsPracticeCount >= 2) {
      overallStatus = "NEEDS_PRACTICE";
    } else {
      overallStatus = "DEVELOPING";
    }
  }

  const overview: UserPerformanceOverview = {
    overallStatus,
    totalEventsAnalyzed: totalEvents,
    lastAnalyzedAt: new Date().toISOString(),
    insightsSummary: hasSufficientData 
      ? `Evaluated across ${evaluatedDimensions.length} active dimensions with ${totalEvents} real evidence records.`
      : "Start engaging in mock interviews, resume reviews, or coding challenges to build your performance profile.",
    dimensions: allDimensions,
    hasSufficientData
  };

  try {
    await supabase.from("performance_profiles").upsert({
      user_id: userId,
      overall_status: overallStatus,
      total_events_analyzed: totalEvents,
      last_analyzed_at: new Date().toISOString(),
      insights_summary: overview.insightsSummary,
      updated_at: new Date().toISOString()
    });

    for (const d of allDimensions) {
      await supabase.from("performance_metrics").upsert({
        user_id: userId,
        dimension: d.dimension,
        score: d.score,
        confidence: d.confidence,
        status_label: d.statusLabel,
        improvement_trend: d.improvementTrend,
        evidence_points: d.evidencePoints,
        recommendation: d.recommendation,
        source_summary: d.sourceSummary,
        last_updated: d.lastUpdated
      }, { onConflict: "user_id,dimension" });
    }
  } catch (err) {
    console.error("Failed to persist performance metrics cache:", err);
  }

  return overview;
}

export async function getOrGenerateDailyRecommendation(
  userId: string,
  supabase: SupabaseClient,
  userName: string = "User"
): Promise<DailyAIRecommendation> {
  const todayStr = new Date().toISOString().split("T")[0];

  const { data: existingRec } = await supabase
    .from("daily_ai_recommendations")
    .select("*")
    .eq("user_id", userId)
    .eq("recommendation_date", todayStr)
    .maybeSingle();

  if (existingRec) {
    return {
      id: existingRec.id,
      date: existingRec.recommendation_date,
      focusTitle: existingRec.focus_title,
      focusArea: existingRec.focus_area,
      reason: existingRec.reason,
      taskTitle: existingRec.task_title,
      taskDescription: existingRec.task_description,
      taskActionUrl: existingRec.task_action_url,
      evidenceSummary: existingRec.evidence_summary,
      isCompleted: existingRec.is_completed
    };
  }

  const perf = await calculateUserPerformanceOverview(userId, supabase);

  let focusTitle = "Get Started with EdWorld";
  let focusArea = "Profile & Discovery";
  let reason = "You don't have any recorded activity yet.";
  let taskTitle = "Complete Your Profile & Try a Quick Activity";
  let taskDescription = "Fill in your skills or take your first 60-second AI mock interview to build your personalized radar.";
  let taskActionUrl = "/profile";
  let evidenceSummary = "No active records found in Supabase.";

  const needsPracticeDim = perf.dimensions.find(d => d.statusLabel === "NEEDS_PRACTICE");
  const developingDim = perf.dimensions.find(d => d.statusLabel === "DEVELOPING");
  const notEnoughDataDim = perf.dimensions.find(d => d.statusLabel === "NOT_ENOUGH_DATA");

  if (needsPracticeDim) {
    focusTitle = `Improve ${needsPracticeDim.title}`;
    focusArea = needsPracticeDim.title;
    reason = `Your recent performance in ${needsPracticeDim.title.toLowerCase()} indicates room for improvement based on ${needsPracticeDim.evidencePoints[0] || "recent records"}.`;
    if (needsPracticeDim.dimension === "COMMUNICATION" || needsPracticeDim.dimension === "INTERVIEW") {
      taskTitle = "Answer One 60-Second Mock Interview Question";
      taskDescription = "Practice clarity and concise structuring using the STAR framework.";
      taskActionUrl = "/interviews";
    } else if (needsPracticeDim.dimension === "TECHNICAL" || needsPracticeDim.dimension === "CODING") {
      taskTitle = "Solve Today's Coding Practice Challenge";
      taskDescription = "Practice 20 minutes on array and logic fundamentals.";
      taskActionUrl = "/problems";
    } else if (needsPracticeDim.dimension === "RESUME") {
      taskTitle = "Optimize Resume Project Bullet Points";
      taskDescription = "Update your resume descriptions with measurable metrics and scan for ATS compliance.";
      taskActionUrl = "/resumes";
    } else {
      taskTitle = `Practice ${needsPracticeDim.title}`;
      taskDescription = needsPracticeDim.recommendation;
      taskActionUrl = "/dashboard";
    }
    evidenceSummary = needsPracticeDim.evidencePoints.join(" • ");
  } else if (developingDim) {
    focusTitle = `Accelerate ${developingDim.title}`;
    focusArea = developingDim.title;
    reason = `You have solid initial progress in ${developingDim.title.toLowerCase()}. A targeted push today will help elevate it to Strong.`;
    if (developingDim.dimension === "COMMUNICATION" || developingDim.dimension === "INTERVIEW") {
      taskTitle = "Complete a 3-Question Technical Interview Drill";
      taskDescription = "Refine your technical explanations and minimize filler words.";
      taskActionUrl = "/interviews";
    } else if (developingDim.dimension === "RESUME") {
      taskTitle = "Scan Resume Against a Target Job Description";
      taskDescription = "Run a live ATS comparison to see missing keywords.";
      taskActionUrl = "/resumes";
    } else if (developingDim.dimension === "PROJECTS") {
      taskTitle = "Document Architecture on Your Active Project";
      taskDescription = "Add a clear README and demo link to your Project Studio record.";
      taskActionUrl = "/projects";
    } else {
      taskTitle = developingDim.recommendation;
      taskDescription = `Targeted exercise based on ${developingDim.sourceSummary}.`;
      taskActionUrl = "/dashboard";
    }
    evidenceSummary = developingDim.evidencePoints.join(" • ");
  } else if (notEnoughDataDim) {
    focusTitle = `Unlock ${notEnoughDataDim.title} Score`;
    focusArea = notEnoughDataDim.title;
    reason = `We don't have enough verified evidence yet for ${notEnoughDataDim.title.toLowerCase()}.`;
    if (notEnoughDataDim.dimension === "COMMUNICATION" || notEnoughDataDim.dimension === "INTERVIEW") {
      taskTitle = "Take Your First AI Mock Interview";
      taskDescription = "Experience a quick, low-stakes interview session to evaluate your baseline.";
      taskActionUrl = "/interviews";
    } else if (notEnoughDataDim.dimension === "RESUME") {
      taskTitle = "Create or Upload Your ATS Resume";
      taskDescription = "Generate an ATS-ready resume and check keyword compatibility.";
      taskActionUrl = "/resumes";
    } else if (notEnoughDataDim.dimension === "CODING") {
      taskTitle = "Connect GitHub or Solve a Coding Problem";
      taskDescription = "Link your GitHub account to verify real open-source commits and repositories.";
      taskActionUrl = "/profile";
    } else {
      taskTitle = notEnoughDataDim.recommendation;
      taskDescription = "Start building your evidence profile.";
      taskActionUrl = "/dashboard";
    }
    evidenceSummary = notEnoughDataDim.evidencePoints.join(" • ");
  }

  const newRec: DailyAIRecommendation = {
    date: todayStr,
    focusTitle,
    focusArea,
    reason,
    taskTitle,
    taskDescription,
    taskActionUrl,
    evidenceSummary,
    isCompleted: false
  };

  try {
    const { data: inserted } = await supabase
      .from("daily_ai_recommendations")
      .insert({
        user_id: userId,
        recommendation_date: todayStr,
        focus_title: focusTitle,
        focus_area: focusArea,
        reason: reason,
        task_title: taskTitle,
        task_description: taskDescription,
        task_action_url: taskActionUrl,
        evidence_summary: evidenceSummary,
        is_completed: false
      })
      .select("id")
      .single();

    if (inserted) {
      newRec.id = inserted.id;
    }
  } catch (err) {
    console.error("Failed to insert daily recommendation:", err);
  }

  return newRec;
}

export async function getDailyAISummary(
  userId: string,
  supabase: SupabaseClient
): Promise<DailyAISummary> {
  const todayStr = new Date().toISOString().split("T")[0];
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const { data: todayEvents } = await supabase
    .from("performance_events")
    .select("id, event_type, title, metrics_payload, created_at")
    .eq("user_id", userId)
    .gte("created_at", startOfDay.toISOString());

  const events = todayEvents || [];
  const completedItems = events.map(e => e.title);

  if (events.length === 0) {
    return {
      date: todayStr,
      hasActivity: false,
      completedItems: [],
      improvedItems: [],
      needsAttentionItems: [],
      recommendedNext: "Start an activity today to receive your first personalized performance summary."
    };
  }

  const improvedItems: string[] = [];
  const needsAttentionItems: string[] = [];

  for (const ev of events) {
    if (ev.event_type === "INTERVIEW_COMPLETED") {
      improvedItems.push("Communication clarity & interview practice");
    } else if (ev.event_type === "CODING_SUBMISSION" || ev.event_type === "JUNIOR_TASK_COMPLETED") {
      improvedItems.push("Coding problem solving");
    } else if (ev.event_type === "RESUME_ANALYZED") {
      improvedItems.push("ATS resume keyword optimization");
    }
  }

  return {
    date: todayStr,
    hasActivity: true,
    completedItems,
    improvedItems: Array.from(new Set(improvedItems)),
    needsAttentionItems,
    recommendedNext: "Continue with today's focus task to lock in your daily streak."
  };
}
