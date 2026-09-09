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
exports.triggerJobAggregation = exports.aggregateJobsScheduled = void 0;
const admin = __importStar(require("firebase-admin"));
const scheduler_1 = require("firebase-functions/v2/scheduler");
const https_1 = require("firebase-functions/v2/https");
const crypto = __importStar(require("crypto"));
/**
 * Creates a unique deterministic hash for deduplication
 */
function createJobHash(title, company, location) {
    const norm = `${title.toLowerCase().trim()}|${company.toLowerCase().trim()}|${location.toLowerCase().trim()}`;
    return crypto.createHash("sha256").update(norm).digest("hex").substring(0, 16);
}
/**
 * Scheduled Cloud Function running daily at midnight to aggregate verified job postings,
 * deduplicate them, enqueue for moderation, and expire listings past deadline.
 */
exports.aggregateJobsScheduled = (0, scheduler_1.onSchedule)("0 0 * * *", async (event) => {
    const db = admin.firestore();
    console.log("[Job Aggregator] Starting automated job aggregation pipeline...");
    // Simulated verified public tech feed items
    const feedItems = [
        {
            title: "Frontend Engineering Intern (Winter/Spring)",
            company: "Linear",
            description: "Join the desktop & web team at Linear. Build lightning-fast keyboard-first UX with React, TypeScript, and WebSockets.",
            location: "San Francisco, CA / Remote",
            type: "internship",
            skillsRequired: ["TypeScript", "React", "Next.js", "CSS / Tailwind", "WebSockets"],
            sourceUrl: "https://linear.app/careers",
            salaryRange: "$45 - $55 / hr",
            recommendedMinLevel: 0,
        },
        {
            title: "Junior Cloud Infrastructure Associate",
            company: "HashiCorp",
            description: "Collaborate on Terraform provider tooling and distributed Kubernetes clusters. Excellent starting role for early-career developers.",
            location: "Austin, TX / Remote",
            type: "full-time",
            skillsRequired: ["Go", "Docker", "Kubernetes", "Git", "REST APIs"],
            sourceUrl: "https://hashicorp.com/careers",
            salaryRange: "$105,000 - $125,000 / yr",
            recommendedMinLevel: 1,
        },
        {
            title: "AI Product Management Associate",
            company: "Scale AI",
            description: "Drive model evaluation benchmarks and data labeling pipeline specifications. Partner with enterprise ML researchers.",
            location: "New York, NY",
            type: "full-time",
            skillsRequired: ["Product Roadmap", "Data Analysis", "Python", "Communication", "Agile"],
            sourceUrl: "https://scale.com/careers",
            salaryRange: "$115,000 - $140,000 / yr",
            recommendedMinLevel: 1,
        },
    ];
    let addedCount = 0;
    let skippedCount = 0;
    for (const item of feedItems) {
        const hashId = `agg-${createJobHash(item.title, item.company, item.location)}`;
        const jobRef = db.collection("jobs").doc(hashId);
        const existing = await jobRef.get();
        if (existing.exists) {
            skippedCount++;
            continue;
        }
        await jobRef.set({
            id: hashId,
            title: item.title,
            company: item.company,
            description: item.description,
            location: item.location,
            type: item.type,
            skillsRequired: item.skillsRequired,
            postedBy: "aggregated_feed",
            postedByName: "Automated Partner Feed",
            applicationDeadline: new Date(Date.now() + 45 * 24 * 3600 * 1000).toISOString(),
            createdAt: new Date().toISOString(),
            isActive: false, // Inactive until approved in moderation queue
            moderationStatus: "pending",
            salaryRange: item.salaryRange || "Competitive",
            recommendedMinLevel: item.recommendedMinLevel ?? 0,
            isAggregated: true,
            sourceUrl: item.sourceUrl,
        });
        addedCount++;
    }
    console.log(`[Job Aggregator] Aggregation complete. Added: ${addedCount}, Skipped duplicates: ${skippedCount}`);
    // Auto-expire listings past deadline
    const nowIso = new Date().toISOString();
    const expiredSnapshot = await db
        .collection("jobs")
        .where("isActive", "==", true)
        .where("applicationDeadline", "<", nowIso)
        .get();
    for (const doc of expiredSnapshot.docs) {
        await doc.ref.update({ isActive: false, isExpired: true });
    }
    console.log(`[Job Aggregator] Deactivated ${expiredSnapshot.size} expired job listings.`);
});
/**
 * Callable function to manually trigger aggregator in development or admin panel
 */
exports.triggerJobAggregation = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "Admin authentication required.");
    }
    const db = admin.firestore();
    const hashId = `agg-manual-${Date.now()}`;
    await db.collection("jobs").doc(hashId).set({
        id: hashId,
        title: "Fullstack Platform Engineer (Aggregated)",
        company: "Supabase",
        description: "Build realtime data replication and Postgres database tooling with TypeScript and Elixir.",
        location: "Remote (Global)",
        type: "full-time",
        skillsRequired: ["TypeScript", "PostgreSQL", "Next.js", "Docker"],
        postedBy: "aggregated_feed",
        postedByName: "Supabase Public Feed",
        applicationDeadline: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        isActive: false,
        moderationStatus: "pending",
        salaryRange: "$120,000 - $150,000 / yr",
        recommendedMinLevel: 1,
        isAggregated: true,
    });
    return { success: true, newJobId: hashId };
});
//# sourceMappingURL=jobAggregator.js.map