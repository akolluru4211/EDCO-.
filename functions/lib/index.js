"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAuditEvent = exports.cleanupAuditLogsDaily = exports.queryAuditLogs = exports.updateApplicationStatus = exports.applyToJob = exports.createJobPosting = exports.submitReport = exports.blockUser = exports.sendMessage = exports.removeConnection = exports.respondConnectionRequest = exports.sendConnectionRequest = exports.claimOrUpdateUsername = exports.completeDailyTask = exports.getOrGenerateDailyPlan = exports.importGitHubRepository = exports.verifyGuardianConsentToken = exports.requestGuardianConsent = exports.getDashboardFunnelMetrics = exports.logAnalyticsEvent = exports.triggerJobAggregation = exports.aggregateJobsScheduled = exports.resolveReport = exports.moderateJobPosting = exports.getPlatformStats = exports.handleResendWebhook = exports.sendTransactionalEmail = exports.handleRazorpayWebhook = exports.verifyRazorpayPayment = exports.createRazorpayOrder = exports.seedInterviewQuestions = exports.scoreInterviewSession = exports.generateResumePdf = exports.analyzeResumeJD = exports.recalculateAgeBandsDaily = exports.syncUserAgeBand = void 0;
const admin = __importStar(require("firebase-admin"));
admin.initializeApp();
var ageBand_1 = require("./ageBand");
Object.defineProperty(exports, "syncUserAgeBand", { enumerable: true, get: function () { return ageBand_1.syncUserAgeBand; } });
Object.defineProperty(exports, "recalculateAgeBandsDaily", { enumerable: true, get: function () { return ageBand_1.recalculateAgeBandsDaily; } });
var resumeJDMatcher_1 = require("./resumeJDMatcher");
Object.defineProperty(exports, "analyzeResumeJD", { enumerable: true, get: function () { return resumeJDMatcher_1.analyzeResumeJD; } });
var resumePdfGenerator_1 = require("./resumePdfGenerator");
Object.defineProperty(exports, "generateResumePdf", { enumerable: true, get: function () { return resumePdfGenerator_1.generateResumePdf; } });
var interviewScorer_1 = require("./interviewScorer");
Object.defineProperty(exports, "scoreInterviewSession", { enumerable: true, get: function () { return interviewScorer_1.scoreInterviewSession; } });
var seedQuestions_1 = require("./seedQuestions");
Object.defineProperty(exports, "seedInterviewQuestions", { enumerable: true, get: function () { return seedQuestions_1.seedInterviewQuestions; } });
var razorpayPayments_1 = require("./razorpayPayments");
Object.defineProperty(exports, "createRazorpayOrder", { enumerable: true, get: function () { return razorpayPayments_1.createRazorpayOrder; } });
Object.defineProperty(exports, "verifyRazorpayPayment", { enumerable: true, get: function () { return razorpayPayments_1.verifyRazorpayPayment; } });
Object.defineProperty(exports, "handleRazorpayWebhook", { enumerable: true, get: function () { return razorpayPayments_1.handleRazorpayWebhook; } });
var resendEmail_1 = require("./resendEmail");
Object.defineProperty(exports, "sendTransactionalEmail", { enumerable: true, get: function () { return resendEmail_1.sendTransactionalEmail; } });
Object.defineProperty(exports, "handleResendWebhook", { enumerable: true, get: function () { return resendEmail_1.handleResendWebhook; } });
var adminManagement_1 = require("./adminManagement");
Object.defineProperty(exports, "getPlatformStats", { enumerable: true, get: function () { return adminManagement_1.getPlatformStats; } });
Object.defineProperty(exports, "moderateJobPosting", { enumerable: true, get: function () { return adminManagement_1.moderateJobPosting; } });
Object.defineProperty(exports, "resolveReport", { enumerable: true, get: function () { return adminManagement_1.resolveReport; } });
var jobAggregator_1 = require("./jobAggregator");
Object.defineProperty(exports, "aggregateJobsScheduled", { enumerable: true, get: function () { return jobAggregator_1.aggregateJobsScheduled; } });
Object.defineProperty(exports, "triggerJobAggregation", { enumerable: true, get: function () { return jobAggregator_1.triggerJobAggregation; } });
var analyticsCollector_1 = require("./analyticsCollector");
Object.defineProperty(exports, "logAnalyticsEvent", { enumerable: true, get: function () { return analyticsCollector_1.logAnalyticsEvent; } });
Object.defineProperty(exports, "getDashboardFunnelMetrics", { enumerable: true, get: function () { return analyticsCollector_1.getDashboardFunnelMetrics; } });
var guardianConsent_1 = require("./guardianConsent");
Object.defineProperty(exports, "requestGuardianConsent", { enumerable: true, get: function () { return guardianConsent_1.requestGuardianConsent; } });
Object.defineProperty(exports, "verifyGuardianConsentToken", { enumerable: true, get: function () { return guardianConsent_1.verifyGuardianConsentToken; } });
var projectStudio_1 = require("./projectStudio");
Object.defineProperty(exports, "importGitHubRepository", { enumerable: true, get: function () { return projectStudio_1.importGitHubRepository; } });
var dailyTaskGenerator_1 = require("./dailyTaskGenerator");
Object.defineProperty(exports, "getOrGenerateDailyPlan", { enumerable: true, get: function () { return dailyTaskGenerator_1.getOrGenerateDailyPlan; } });
Object.defineProperty(exports, "completeDailyTask", { enumerable: true, get: function () { return dailyTaskGenerator_1.completeDailyTask; } });
var networking_1 = require("./networking");
Object.defineProperty(exports, "claimOrUpdateUsername", { enumerable: true, get: function () { return networking_1.claimOrUpdateUsername; } });
Object.defineProperty(exports, "sendConnectionRequest", { enumerable: true, get: function () { return networking_1.sendConnectionRequest; } });
Object.defineProperty(exports, "respondConnectionRequest", { enumerable: true, get: function () { return networking_1.respondConnectionRequest; } });
Object.defineProperty(exports, "removeConnection", { enumerable: true, get: function () { return networking_1.removeConnection; } });
Object.defineProperty(exports, "sendMessage", { enumerable: true, get: function () { return networking_1.sendMessage; } });
Object.defineProperty(exports, "blockUser", { enumerable: true, get: function () { return networking_1.blockUser; } });
Object.defineProperty(exports, "submitReport", { enumerable: true, get: function () { return networking_1.submitReport; } });
var jobBoard_1 = require("./jobBoard");
Object.defineProperty(exports, "createJobPosting", { enumerable: true, get: function () { return jobBoard_1.createJobPosting; } });
Object.defineProperty(exports, "applyToJob", { enumerable: true, get: function () { return jobBoard_1.applyToJob; } });
Object.defineProperty(exports, "updateApplicationStatus", { enumerable: true, get: function () { return jobBoard_1.updateApplicationStatus; } });
var auditLogger_1 = require("./auditLogger");
Object.defineProperty(exports, "queryAuditLogs", { enumerable: true, get: function () { return auditLogger_1.queryAuditLogs; } });
Object.defineProperty(exports, "cleanupAuditLogsDaily", { enumerable: true, get: function () { return auditLogger_1.cleanupAuditLogsDaily; } });
Object.defineProperty(exports, "logAuditEvent", { enumerable: true, get: function () { return auditLogger_1.logAuditEvent; } });
//# sourceMappingURL=index.js.map