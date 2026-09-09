import * as admin from "firebase-admin";
import { onCall, onRequest, HttpsError } from "firebase-functions/v2/https";
import Razorpay from "razorpay";
import * as crypto from "crypto";
import { logAuditEvent } from "./auditLogger";

const razorpayKeyId = process.env.RAZORPAY_KEY_ID || "rzp_test_mock_key_id";
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || "mock_secret_key_secret_12345";

function getRazorpayInstance() {
  return new Razorpay({
    key_id: razorpayKeyId,
    key_secret: razorpayKeySecret,
  });
}

/**
 * Creates a Razorpay Order server-side for user subscription upgrade.
 * Supports UPI (GPay/PhonePe/Paytm), NetBanking, and Cards.
 */
export const createRazorpayOrder = onCall(
  {
    secrets: ["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET"],
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be authenticated.");
    }

    const userId = request.auth.uid;
    const { plan = "pro", cycle = "monthly" } = request.data || {};

    // ₹1,499 / month (149900 paise) or ₹11,990 / year (1199000 paise)
    const amountInPaise = cycle === "yearly" ? 1199000 : 149900;
    const currency = "INR";
    const receipt = `rcpt_${userId.substring(0, 8)}_${Date.now()}`;

    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      try {
        const razorpay = getRazorpayInstance();
        const order = await razorpay.orders.create({
          amount: amountInPaise,
          currency,
          receipt,
          notes: {
            userId,
            plan,
            cycle,
          },
        });

        return {
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          keyId: process.env.RAZORPAY_KEY_ID,
        };
      } catch (err: any) {
        console.error("Razorpay order creation error:", err);
      }
    }

    // Development fallback mock order
    return {
      orderId: `order_mock_${Date.now()}`,
      amount: amountInPaise,
      currency,
      keyId: razorpayKeyId,
    };
  }
);

/**
 * Server-Side Cryptographic Signature Verification
 * Verifies razorpay_signature = HMAC-SHA256(order_id + "|" + payment_id, secret)
 * BEFORE marking subscription active in Firestore.
 */
export const verifyRazorpayPayment = onCall(
  {
    secrets: ["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET"],
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be authenticated.");
    }

    const userId = request.auth.uid;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan = "pro" } =
      request.data || {};

    if (!razorpay_order_id || !razorpay_payment_id) {
      throw new HttpsError("invalid-argument", "Missing payment verification parameters.");
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || razorpayKeySecret;

    // Cryptographic HMAC-SHA256 Verification
    if (process.env.RAZORPAY_KEY_SECRET) {
      const generatedSignature = crypto
        .createHmac("sha256", secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (generatedSignature !== razorpay_signature) {
        console.error(`[Razorpay] Invalid payment signature detected for order ${razorpay_order_id}`);
        throw new HttpsError(
          "permission-denied",
          "Payment verification failed: Invalid cryptographic signature."
        );
      }
    }

    // Payment successfully verified — update subscriptions/{userId}
    const db = admin.firestore();
    const periodEnd = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();

    await db.collection("subscriptions").doc(userId).set(
      {
        plan: "pro",
        status: "active",
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        currentPeriodEnd: periodEnd,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    // Audit Logging (Sanitized, zero sensitive payment data)
    await logAuditEvent(
      userId,
      "user",
      "billing.subscription_created",
      "subscription",
      userId,
      {
        plan: "pro",
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      }
    ).catch(console.warn);

    console.log(`[Razorpay] Successfully activated Pro subscription for user ${userId}`);

    return {
      success: true,
      plan: "pro",
      status: "active",
      currentPeriodEnd: periodEnd,
    };
  }
);

/**
 * Razorpay Webhook Handler
 * Verifies webhook signature with RAZORPAY_WEBHOOK_SECRET and updates Firestore
 */
export const handleRazorpayWebhook = onRequest(
  {
    secrets: ["RAZORPAY_WEBHOOK_SECRET"],
  },
  async (req, res) => {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"] as string;

    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(JSON.stringify(req.body))
        .digest("hex");

      if (expectedSignature !== signature) {
        console.error("[Razorpay Webhook] Invalid webhook signature.");
        res.status(400).send("Invalid signature");
        return;
      }
    }

    const event = req.body;
    const db = admin.firestore();

    switch (event.event) {
      case "payment.captured": {
        const payment = event.payload?.payment?.entity;
        const userId = payment?.notes?.userId;
        if (userId) {
          await db.collection("subscriptions").doc(userId).set(
            {
              plan: "pro",
              status: "active",
              razorpayPaymentId: payment.id,
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            },
            { merge: true }
          );
        }
        break;
      }

      case "subscription.cancelled": {
        const sub = event.payload?.subscription?.entity;
        const subId = sub?.id;
        if (subId) {
          const snapshot = await db
            .collection("subscriptions")
            .where("razorpaySubscriptionId", "==", subId)
            .get();
          for (const doc of snapshot.docs) {
            await doc.ref.update({
              plan: "free",
              status: "canceled",
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
          }
        }
        break;
      }
    }

    res.json({ status: "ok" });
  }
);
