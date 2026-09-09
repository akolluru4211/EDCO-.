import * as admin from "firebase-admin";

admin.initializeApp();

export { syncUserAgeBand, recalculateAgeBandsDaily } from "./ageBand";
export { analyzeResumeJD } from "./resumeJDMatcher";
export { generateResumePdf } from "./resumePdfGenerator";
export { scoreInterviewSession } from "./interviewScorer";
export { seedInterviewQuestions } from "./seedQuestions";
export { createRazorpayOrder, verifyRazorpayPayment, handleRazorpayWebhook } from "./razorpayPayments";
export { sendTransactionalEmail, handleResendWebhook } from "./resendEmail";
export { getPlatformStats, moderateJobPosting, resolveReport } from "./adminManagement";
export { aggregateJobsScheduled, triggerJobAggregation } from "./jobAggregator";
export { logAnalyticsEvent, getDashboardFunnelMetrics } from "./analyticsCollector";
export { requestGuardianConsent, verifyGuardianConsentToken } from "./guardianConsent";
export { importGitHubRepository } from "./projectStudio";
export { getOrGenerateDailyPlan, completeDailyTask } from "./dailyTaskGenerator";
export {
  claimOrUpdateUsername,
  sendConnectionRequest,
  respondConnectionRequest,
  removeConnection,
  sendMessage,
  blockUser,
  submitReport,
} from "./networking";
export { createJobPosting, applyToJob, updateApplicationStatus } from "./jobBoard";
export { queryAuditLogs, cleanupAuditLogsDaily, logAuditEvent } from "./auditLogger";

