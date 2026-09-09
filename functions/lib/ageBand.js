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
exports.recalculateAgeBandsDaily = exports.syncUserAgeBand = void 0;
exports.computeAgeFromDob = computeAgeFromDob;
exports.computeAgeBand = computeAgeBand;
exports.resolveProtectiveAgeBand = resolveProtectiveAgeBand;
const admin = __importStar(require("firebase-admin"));
const scheduler_1 = require("firebase-functions/v2/scheduler");
const https_1 = require("firebase-functions/v2/https");
function computeAgeFromDob(dobString) {
    if (!dobString)
        return null;
    const dob = new Date(dobString);
    if (isNaN(dob.getTime()))
        return null;
    const now = new Date();
    let age = now.getFullYear() - dob.getFullYear();
    const m = now.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) {
        age--;
    }
    return age;
}
function computeAgeBand(dobString) {
    const age = computeAgeFromDob(dobString);
    if (age === null)
        return null;
    if (age < 13) {
        return null; // Under 13 is rejected per DPDP / COPPA policy
    }
    else if (age < 16) {
        return "13-15";
    }
    else if (age < 18) {
        return "16-18";
    }
    else {
        return "18+";
    }
}
/**
 * Evaluates whether grade strongly mismatches DOB age-band,
 * and always resolves to the MORE RESTRICTIVE / PROTECTIVE safety band.
 */
function resolveProtectiveAgeBand(ageBand, grade) {
    if (!grade)
        return { resolvedBand: ageBand, isMismatch: false };
    const isMinorGrade = grade === "Class 9" || grade === "Class 10" || grade === "Class 11" || grade === "Class 12/Inter" || grade === "Class 9-10" || grade === "Class 11-12";
    const isAdultGrade = grade === "College" || grade === "Working Professional" || grade === "College / University";
    // Mismatch Case 1: DOB indicates minor (13-15 or 16-18) but Grade indicates adult (College/Professional)
    if (ageBand !== "18+" && isAdultGrade) {
        return { resolvedBand: ageBand, isMismatch: true }; // Enforce minor safety (more protective)
    }
    // Mismatch Case 2: DOB indicates adult (18+) but Grade indicates younger minor (Class 9-10)
    if (ageBand === "18+" && (grade === "Class 9" || grade === "Class 10" || grade === "Class 9-10")) {
        return { resolvedBand: "16-18", isMismatch: true }; // Enforce safety protection (more protective)
    }
    return { resolvedBand: ageBand, isMismatch: false };
}
/**
 * Callable function to securely set a user's date of birth,
 * compute the ageBand, update the user record, and ensure minor flags are sanitized.
 */
exports.syncUserAgeBand = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "Authentication required.");
    }
    const { dob, grade } = request.data;
    if (!dob) {
        throw new https_1.HttpsError("invalid-argument", "Date of birth (dob) is required.");
    }
    const calculatedAgeBand = computeAgeBand(dob);
    if (!calculatedAgeBand) {
        throw new https_1.HttpsError("failed-precondition", "Edworld Co requires users to be at least 13 years of age.");
    }
    const { resolvedBand, isMismatch } = resolveProtectiveAgeBand(calculatedAgeBand, grade);
    const userId = request.auth.uid;
    const db = admin.firestore();
    const userRef = db.collection("users").doc(userId);
    const profileRef = db.collection("users").doc(userId).collection("profile").doc("main");
    const consentRef = db.collection("consents").doc(userId);
    const batch = db.batch();
    // Store dob, grade, and derived ageBand on user doc (dob restricted from client queries)
    batch.set(userRef, {
        dob,
        grade: grade || null,
        ageBand: resolvedBand,
        rawAgeBand: calculatedAgeBand,
        visualMode: resolvedBand === "18+" ? "career" : "maximalist",
        hasMismatch: isMismatch,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    // Initialize consent tracking doc if missing
    batch.set(consentRef, {
        userId,
        tosVersion: "2026.1",
        privacyVersion: "2026.1",
        acceptedAt: admin.firestore.FieldValue.serverTimestamp(),
        guardianConsentConfirmed: resolvedBand === "18+",
    }, { merge: true });
    // If the user is a minor, strictly lock public discovery and mentor status
    if (resolvedBand !== "18+") {
        batch.set(profileRef, {
            isPublic: false,
            isMentor: false,
            mentorTags: [],
        }, { merge: true });
    }
    // If mismatch detected, log to audit log for manual review
    if (isMismatch) {
        const mismatchLogRef = db.collection("auditLogs").doc();
        batch.set(mismatchLogRef, {
            type: "dob_grade_mismatch",
            userId,
            dob,
            grade,
            calculatedAgeBand,
            resolvedBand,
            loggedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    }
    await batch.commit();
    return { success: true, ageBand: resolvedBand, visualMode: resolvedBand === "18+" ? "career" : "maximalist", isMismatch };
});
/**
 * Scheduled job running daily to recalculate ageBand for all users.
 * When an age-band transition occurs (15->16 or 17->18), updates user doc and
 * dispatches a transition celebration notification.
 */
exports.recalculateAgeBandsDaily = (0, scheduler_1.onSchedule)("every 24 hours", async (event) => {
    const db = admin.firestore();
    const usersSnapshot = await db.collection("users").get();
    let updateCount = 0;
    for (const userDoc of usersSnapshot.docs) {
        const data = userDoc.data();
        if (data.dob) {
            const currentAgeBand = data.ageBand;
            const freshlyComputed = computeAgeBand(data.dob);
            if (freshlyComputed && currentAgeBand !== freshlyComputed) {
                const { resolvedBand } = resolveProtectiveAgeBand(freshlyComputed, data.grade);
                const batch = db.batch();
                batch.update(userDoc.ref, {
                    ageBand: resolvedBand,
                    visualMode: resolvedBand === "18+" ? "career" : "maximalist",
                    lastAgeRecalculatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });
                // Trigger in-app graduation notification
                const notifRef = userDoc.ref.collection("notifications").doc();
                batch.set(notifRef, {
                    type: "age_band_transition",
                    title: resolvedBand === "18+" ? "🎉 Welcome to Career Mode!" : `🚀 Welcome to Age Track ${resolvedBand}!`,
                    message: resolvedBand === "18+"
                        ? "You have transitioned to the adult career track. Public portfolio discovery, mentor networking, and direct employer applications are now unlocked."
                        : `Your personalized career preparation tracks have upgraded to the ${resolvedBand} Explorer level.`,
                    newAgeBand: resolvedBand,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    read: false,
                });
                await batch.commit();
                updateCount++;
            }
        }
    }
    console.log(`[Scheduled Age Check]: Recalculated ageBand and transitions for ${updateCount} users.`);
});
//# sourceMappingURL=ageBand.js.map