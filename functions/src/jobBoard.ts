import * as admin from "firebase-admin";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { JobType, ApplicationStatus, SkillLevel } from "./types";

interface CreateJobPayload {
  title: string;
  company: string;
  description: string;
  location: string;
  type: JobType;
  skillsRequired: string[];
  applicationDeadline: string; // ISO String
  salaryRange?: string;
  recommendedMinLevel?: SkillLevel;
}

interface ApplyJobPayload {
  jobId: string;
  resumeId: string;
  resumeTitle: string;
  resumeSnapshot?: any;
  coverNote?: string;
}

// -----------------------------------------------------------------------------
// 1. Create Job Posting (Employer-Only & Future Deadline Check)
// -----------------------------------------------------------------------------
export const createJobPosting = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated.");
  }

  const userId = request.auth.uid;
  const data = request.data as CreateJobPayload;

  if (!data.title || !data.company || !data.description || !data.applicationDeadline) {
    throw new HttpsError("invalid-argument", "Missing required job listing fields.");
  }

  // 1. Validate Deadline: Must be in the future
  const deadlineDate = new Date(data.applicationDeadline);
  if (isNaN(deadlineDate.getTime()) || deadlineDate.getTime() <= Date.now()) {
    throw new HttpsError(
      "invalid-argument",
      "Application deadline must be a valid future date and time."
    );
  }

  const db = admin.firestore();

  // 2. Verify Caller Role & Age (isEmployer & 18+)
  const userDoc = await db.collection("users").doc(userId).get();
  if (!userDoc.exists) {
    throw new HttpsError("not-found", "User account not found.");
  }

  const userData = userDoc.data();
  if (userData?.ageBand !== "18+") {
    throw new HttpsError("permission-denied", "Job posting is restricted to Career Track (18+) users.");
  }

  if (!userData?.isEmployer && !request.auth.token.isAdmin) {
    throw new HttpsError(
      "permission-denied",
      "Only registered Employer accounts are authorized to post job listings."
    );
  }

  const jobId = `job-${Date.now()}`;
  const isVerifiedEmployer = userData?.isVerifiedEmployer || request.auth.token.isAdmin || false;

  const jobDoc = {
    id: jobId,
    title: data.title.trim(),
    company: data.company.trim(),
    description: data.description.trim(),
    location: data.location?.trim() || "Remote",
    type: data.type || "full-time",
    skillsRequired: data.skillsRequired || [],
    postedBy: userId,
    postedByName: userData?.name || "Employer",
    applicationDeadline: data.applicationDeadline,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    isActive: true,
    moderationStatus: isVerifiedEmployer ? "approved" : "pending",
    salaryRange: data.salaryRange || "Competitive",
    recommendedMinLevel: data.recommendedMinLevel ?? 1,
  };

  await db.collection("jobs").doc(jobId).set(jobDoc);

  return {
    success: true,
    jobId,
    moderationStatus: jobDoc.moderationStatus,
    isLive: jobDoc.moderationStatus === "approved",
  };
});

// -----------------------------------------------------------------------------
// 2. Apply to Job (Active Check, Non-Expired Check, Duplicate & Resume Snapshot)
// -----------------------------------------------------------------------------
export const applyToJob = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated.");
  }

  const userId = request.auth.uid;
  const { jobId, resumeId, resumeTitle, resumeSnapshot, coverNote } = request.data as ApplyJobPayload;

  if (!jobId || !resumeId) {
    throw new HttpsError("invalid-argument", "Job ID and Resume ID are required.");
  }

  const db = admin.firestore();

  // 1. Verify User 18+ Access
  const userDoc = await db.collection("users").doc(userId).get();
  if (!userDoc.exists || userDoc.data()?.ageBand !== "18+") {
    throw new HttpsError("permission-denied", "Job applications are restricted to Career Track (18+) users.");
  }
  const userData = userDoc.data();

  // 2. Verify Job Exists, is Active, Approved, and Not Expired
  const jobDoc = await db.collection("jobs").doc(jobId).get();
  if (!jobDoc.exists) {
    throw new HttpsError("not-found", "Job listing not found.");
  }

  const jobData = jobDoc.data();
  if (!jobData?.isActive || jobData?.moderationStatus !== "approved") {
    throw new HttpsError(
      "failed-precondition",
      "This job listing is no longer active or accepting applications."
    );
  }

  const deadline = new Date(jobData.applicationDeadline).getTime();
  if (deadline <= Date.now()) {
    // Automatically set job inactive if deadline passed
    await db.collection("jobs").doc(jobId).update({ isActive: false }).catch(() => {});
    throw new HttpsError(
      "failed-precondition",
      "This job listing has expired. The application deadline has passed."
    );
  }

  // 3. Prevent Duplicate Applications
  const duplicateQuery = await db
    .collection("applications")
    .where("jobId", "==", jobId)
    .where("userId", "==", userId)
    .limit(1)
    .get();

  if (!duplicateQuery.empty) {
    throw new HttpsError(
      "already-exists",
      "You have already submitted an application for this position."
    );
  }

  // 4. Capture Full Resume Snapshot (Immutable record resilient to future deletion)
  let finalSnapshot = resumeSnapshot;
  if (!finalSnapshot) {
    try {
      const resumeSnap = await db
        .collection("users")
        .doc(userId)
        .collection("resumes")
        .doc(resumeId)
        .get();
      if (resumeSnap.exists) {
        finalSnapshot = resumeSnap.data()?.content || resumeSnap.data();
      }
    } catch (e) {
      console.warn("[Resume Snapshot Fetch Fallback]:", e);
    }
  }

  const applicationId = `app-${Date.now()}-${userId.slice(0, 5)}`;

  const applicationDoc = {
    id: applicationId,
    jobId,
    jobTitle: jobData.title,
    companyName: jobData.company,
    userId,
    applicantName: userData?.name || "Candidate",
    applicantEmail: userData?.email || "",
    resumeId,
    resumeTitle: resumeTitle || "Software Engineer Resume",
    resumeSnapshot: finalSnapshot || { summary: "Submitted Resume Snapshot" },
    coverNote: coverNote?.slice(0, 1000) || "",
    status: "applied" as ApplicationStatus,
    appliedAt: admin.firestore.FieldValue.serverTimestamp(),
    statusUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await db.collection("applications").doc(applicationId).set(applicationDoc);

  return {
    success: true,
    applicationId,
    status: "applied",
  };
});

// -----------------------------------------------------------------------------
// 3. Update Application Status (Employer-Only & Resend Notification)
// -----------------------------------------------------------------------------
export const updateApplicationStatus = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated.");
  }

  const callerId = request.auth.uid;
  const { applicationId, status, employerNotes } = request.data as {
    applicationId: string;
    status: ApplicationStatus;
    employerNotes?: string;
  };

  if (!applicationId || !status) {
    throw new HttpsError("invalid-argument", "ApplicationId and new status are required.");
  }

  const db = admin.firestore();
  const appRef = db.collection("applications").doc(applicationId);
  const appSnap = await appRef.get();

  if (!appSnap.exists) {
    throw new HttpsError("not-found", "Application not found.");
  }

  const appData = appSnap.data();

  // Verify Caller owns the Job Posting
  const jobSnap = await db.collection("jobs").doc(appData?.jobId).get();
  if (!jobSnap.exists) {
    throw new HttpsError("not-found", "Associated job posting not found.");
  }

  const jobData = jobSnap.data();
  if (jobData?.postedBy !== callerId && !request.auth.token.isAdmin) {
    throw new HttpsError(
      "permission-denied",
      "You are not authorized to update applications for another employer's job posting."
    );
  }

  await appRef.update({
    status,
    employerNotes: employerNotes || null,
    statusUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Dispatch Transactional Email Notification (Resend / Mail Provider)
  if (appData?.applicantEmail) {
    try {
      await db.collection("mailNotifications").add({
        to: appData.applicantEmail,
        recipientName: appData.applicantName || "Candidate",
        type: "application_status",
        subject: `Application Update: ${jobData?.title} at ${jobData?.company}`,
        details: {
          jobTitle: jobData?.title,
          companyName: jobData?.company,
          newStatus: status,
          notes: employerNotes || "",
        },
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        provider: "resend",
        status: "delivered",
      });
    } catch (emailErr) {
      console.warn("[Resend Status Email Notification Warning]:", emailErr);
    }
  }

  return {
    success: true,
    applicationId,
    newStatus: status,
  };
});

