import * as admin from "firebase-admin";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { AgeBand } from "./types";

const DENYLIST_TERMS = [
  "threat",
  "kill",
  "dox",
  "ssn",
  "credit card",
  "cvv",
  "exploit",
  "illegal",
];

function containsSevereAbuse(text: string): boolean {
  const lower = text.toLowerCase();
  return DENYLIST_TERMS.some((term) => lower.includes(term));
}

// -----------------------------------------------------------------------------
// 1. Claim or Update Username (Server-Side Unique Reservation)
// -----------------------------------------------------------------------------
export const claimOrUpdateUsername = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated.");
  }

  const userId = request.auth.uid;
  const { username } = request.data as { username: string };

  if (!username || typeof username !== "string") {
    throw new HttpsError("invalid-argument", "Username is required.");
  }

  const cleanUsername = username.trim().toLowerCase();
  const validPattern = /^[a-zA-Z0-9_-]{3,24}$/;
  if (!validPattern.test(cleanUsername)) {
    throw new HttpsError(
      "invalid-argument",
      "Username must be 3-24 characters long and contain only letters, numbers, hyphens, and underscores."
    );
  }

  const db = admin.firestore();

  // Verify AgeBand: Only 18+ accounts can hold public usernames
  const userDoc = await db.collection("users").doc(userId).get();
  if (!userDoc.exists) {
    throw new HttpsError("not-found", "User account not found.");
  }
  const userData = userDoc.data();
  if (userData?.ageBand !== "18+") {
    throw new HttpsError(
      "permission-denied",
      "Public networking usernames are restricted to Career Track (18+) users."
    );
  }

  const usernameRef = db.collection("usernames").doc(cleanUsername);

  await db.runTransaction(async (transaction) => {
    const usernameSnap = await transaction.get(usernameRef);
    if (usernameSnap.exists && usernameSnap.data()?.userId !== userId) {
      throw new HttpsError("already-exists", "This username is already taken by another user.");
    }

    transaction.set(usernameRef, {
      userId,
      username: cleanUsername,
      ageBand: "18+",
      isPublic: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const profileRef = db.collection("users").doc(userId).collection("profile").doc("main");
    transaction.set(
      profileRef,
      {
        username: cleanUsername,
        isPublic: true,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  });

  return { success: true, username: cleanUsername };
});

// -----------------------------------------------------------------------------
// 2. Send Connection Request (with Duplication, Block & Age Checks)
// -----------------------------------------------------------------------------
export const sendConnectionRequest = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated.");
  }

  const requesterId = request.auth.uid;
  const { recipientId, requestType = "connection", message = "" } = request.data as {
    recipientId: string;
    requestType?: "connection" | "mentorship";
    message?: string;
  };

  if (!recipientId || requesterId === recipientId) {
    throw new HttpsError("invalid-argument", "Invalid recipient specified.");
  }

  const db = admin.firestore();

  // 1. Verify AgeBand for both parties (Career Track 18+ Only)
  const [requesterDoc, recipientDoc] = await Promise.all([
    db.collection("users").doc(requesterId).get(),
    db.collection("users").doc(recipientId).get(),
  ]);

  if (!requesterDoc.exists || !recipientDoc.exists) {
    throw new HttpsError("not-found", "One or both user accounts not found.");
  }

  if (requesterDoc.data()?.ageBand !== "18+" || recipientDoc.data()?.ageBand !== "18+") {
    throw new HttpsError(
      "permission-denied",
      "Networking connections are restricted to Career Track (18+) users."
    );
  }

  // 2. Check Blocking state
  const blockCheck1 = await db.collection("blocks").doc(`${requesterId}_${recipientId}`).get();
  const blockCheck2 = await db.collection("blocks").doc(`${recipientId}_${requesterId}`).get();
  if (blockCheck1.exists || blockCheck2.exists) {
    throw new HttpsError("permission-denied", "Unable to send connection request.");
  }

  // 3. Prevent duplicate requests
  const connectionId1 = `${requesterId}_${recipientId}`;
  const connectionId2 = `${recipientId}_${requesterId}`;

  const [existing1, existing2] = await Promise.all([
    db.collection("connections").doc(connectionId1).get(),
    db.collection("connections").doc(connectionId2).get(),
  ]);

  if (existing1.exists) {
    const status = existing1.data()?.status;
    if (status === "accepted") throw new HttpsError("already-exists", "You are already connected with this user.");
    if (status === "pending") throw new HttpsError("already-exists", "A pending connection request already exists.");
  }

  if (existing2.exists) {
    const status = existing2.data()?.status;
    if (status === "accepted") throw new HttpsError("already-exists", "You are already connected with this user.");
    if (status === "pending") throw new HttpsError("already-exists", "This user has already sent you a connection request. Check your received requests.");
  }

  const requesterData = requesterDoc.data();
  const recipientData = recipientDoc.data();

  const connectionDoc = {
    id: connectionId1,
    requesterId,
    requesterName: requesterData?.name || "Candidate",
    recipientId,
    recipientName: recipientData?.name || "Professional",
    status: "pending",
    requestType,
    message: message.slice(0, 500),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await db.collection("connections").doc(connectionId1).set(connectionDoc);

  return { success: true, connectionId: connectionId1, connection: connectionDoc };
});

// -----------------------------------------------------------------------------
// 3. Respond to Connection Request (Accept / Decline)
// -----------------------------------------------------------------------------
export const respondConnectionRequest = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated.");
  }

  const userId = request.auth.uid;
  const { connectionId, action } = request.data as {
    connectionId: string;
    action: "accept" | "decline";
  };

  if (!connectionId || (action !== "accept" && action !== "decline")) {
    throw new HttpsError("invalid-argument", "ConnectionId and valid action are required.");
  }

  const db = admin.firestore();
  const connRef = db.collection("connections").doc(connectionId);
  const connSnap = await connRef.get();

  if (!connSnap.exists) {
    throw new HttpsError("not-found", "Connection request not found.");
  }

  const connData = connSnap.data();
  if (connData?.recipientId !== userId) {
    throw new HttpsError("permission-denied", "Only the recipient can accept or decline this request.");
  }

  const newStatus = action === "accept" ? "accepted" : "declined";

  await connRef.update({
    status: newStatus,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  let conversationId = "";

  if (action === "accept") {
    // Initialize 1:1 Conversation
    conversationId = [connData.requesterId, userId].sort().join("_");
    const convRef = db.collection("conversations").doc(conversationId);

    await convRef.set(
      {
        id: conversationId,
        participantIds: [connData.requesterId, userId],
        participantDetails: {
          [connData.requesterId]: { name: connData.requesterName },
          [userId]: { name: connData.recipientName },
        },
        lastMessageText: "Connection accepted! You can now message each other.",
        lastMessageAt: new Date().toISOString(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  }

  return { success: true, status: newStatus, conversationId };
});

// -----------------------------------------------------------------------------
// 4. Remove Existing Connection (Disconnect)
// -----------------------------------------------------------------------------
export const removeConnection = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated.");
  }

  const userId = request.auth.uid;
  const { targetUserId } = request.data as { targetUserId: string };

  if (!targetUserId) {
    throw new HttpsError("invalid-argument", "Target user ID is required.");
  }

  const db = admin.firestore();
  const connId1 = `${userId}_${targetUserId}`;
  const connId2 = `${targetUserId}_${userId}`;

  await Promise.all([
    db.collection("connections").doc(connId1).delete().catch(() => {}),
    db.collection("connections").doc(connId2).delete().catch(() => {}),
  ]);

  return { success: true, disconnectedUser: targetUserId };
});

// -----------------------------------------------------------------------------
// 5. Send Direct Message (HARD SERVER-SIDE CONNECTION ENFORCEMENT)
// -----------------------------------------------------------------------------
export const sendMessage = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated.");
  }

  const senderId = request.auth.uid;
  const { conversationId, text } = request.data as { conversationId: string; text: string };

  if (!conversationId || !text || !text.trim()) {
    throw new HttpsError("invalid-argument", "ConversationId and non-empty text are required.");
  }

  if (text.length > 2000) {
    throw new HttpsError("invalid-argument", "Message exceeds 2000 characters maximum length.");
  }

  if (containsSevereAbuse(text)) {
    throw new HttpsError(
      "invalid-argument",
      "Message violates safety guidelines and was blocked by automated content inspection."
    );
  }

  const db = admin.firestore();

  // 1. Verify Sender AgeBand (18+ only)
  const senderDoc = await db.collection("users").doc(senderId).get();
  if (!senderDoc.exists || senderDoc.data()?.ageBand !== "18+") {
    throw new HttpsError("permission-denied", "Messaging is restricted to Career Track (18+) users.");
  }

  // 2. Fetch Conversation and Participants
  const convRef = db.collection("conversations").doc(conversationId);
  const convSnap = await convRef.get();

  if (!convSnap.exists) {
    throw new HttpsError("not-found", "Conversation not found.");
  }

  const convData = convSnap.data();
  const participants = convData?.participantIds || [];

  if (!participants.includes(senderId)) {
    throw new HttpsError("permission-denied", "You are not a participant in this conversation.");
  }

  const recipientId = participants.find((p: string) => p !== senderId);
  if (!recipientId) {
    throw new HttpsError("invalid-argument", "Invalid conversation recipient.");
  }

  // 3. HARD SERVER-SIDE CONNECTION CHECK: Must have status == 'accepted'
  const connId1 = `${senderId}_${recipientId}`;
  const connId2 = `${recipientId}_${senderId}`;

  const [connSnap1, connSnap2] = await Promise.all([
    db.collection("connections").doc(connId1).get(),
    db.collection("connections").doc(connId2).get(),
  ]);

  const isConnected =
    (connSnap1.exists && connSnap1.data()?.status === "accepted") ||
    (connSnap2.exists && connSnap2.data()?.status === "accepted");

  if (!isConnected) {
    throw new HttpsError(
      "permission-denied",
      "Server-side security check failed: You can only message users you are actively connected with."
    );
  }

  // 4. Check Block status
  const blockCheck1 = await db.collection("blocks").doc(`${senderId}_${recipientId}`).get();
  const blockCheck2 = await db.collection("blocks").doc(`${recipientId}_${senderId}`).get();
  if (blockCheck1.exists || blockCheck2.exists) {
    throw new HttpsError("permission-denied", "Cannot deliver message to a blocked user.");
  }

  const messageId = `msg-${Date.now()}`;
  const messageDoc = {
    id: messageId,
    conversationId,
    senderId,
    senderName: senderDoc.data()?.name || "User",
    text: text.trim(),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await convRef.collection("messages").doc(messageId).set(messageDoc);

  await convRef.update({
    lastMessageText: text.trim().slice(0, 100),
    lastMessageAt: new Date().toISOString(),
    lastSenderId: senderId,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return {
    success: true,
    messageId,
    createdAt: new Date().toISOString(),
  };
});

// -----------------------------------------------------------------------------
// 6. Block User (Severs Connection & Blocks Future Contact)
// -----------------------------------------------------------------------------
export const blockUser = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated.");
  }

  const blockerId = request.auth.uid;
  const { targetUserId } = request.data as { targetUserId: string };

  if (!targetUserId || blockerId === targetUserId) {
    throw new HttpsError("invalid-argument", "Invalid target user to block.");
  }

  const db = admin.firestore();
  const blockId = `${blockerId}_${targetUserId}`;

  // 1. Create Block Record
  await db.collection("blocks").doc(blockId).set({
    id: blockId,
    blockerId,
    blockedId: targetUserId,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // 2. Immediately dissolve any active connections
  const connId1 = `${blockerId}_${targetUserId}`;
  const connId2 = `${targetUserId}_${blockerId}`;

  await Promise.all([
    db.collection("connections").doc(connId1).delete().catch(() => {}),
    db.collection("connections").doc(connId2).delete().catch(() => {}),
  ]);

  return { success: true, blockedUser: targetUserId };
});

// -----------------------------------------------------------------------------
// 7. Submit Report (Target Profile, Message, or Connection)
// -----------------------------------------------------------------------------
export const submitReport = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated.");
  }

  const reportedBy = request.auth.uid;
  const { type, targetId, targetName = "", reason } = request.data as {
    type: "profile" | "message" | "connection";
    targetId: string;
    targetName?: string;
    reason: string;
  };

  if (!type || !targetId || !reason || !reason.trim()) {
    throw new HttpsError("invalid-argument", "Report type, target ID, and reason are required.");
  }

  const db = admin.firestore();
  const reportId = `rep-${Date.now()}-${reportedBy.slice(0, 5)}`;

  const reporterDoc = await db.collection("users").doc(reportedBy).get();

  const reportDoc = {
    id: reportId,
    type,
    targetId,
    targetName,
    reportedBy,
    reporterName: reporterDoc.data()?.name || "User",
    reason: reason.trim(),
    status: "pending",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await db.collection("reports").doc(reportId).set(reportDoc);

  return { success: true, reportId, report: reportDoc };
});
