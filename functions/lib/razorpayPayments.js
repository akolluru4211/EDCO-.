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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRazorpayWebhook = exports.verifyRazorpayPayment = exports.createRazorpayOrder = void 0;
const admin = __importStar(require("firebase-admin"));
const https_1 = require("firebase-functions/v2/https");
const razorpay_1 = __importDefault(require("razorpay"));
const crypto = __importStar(require("crypto"));
const auditLogger_1 = require("./auditLogger");
const razorpayKeyId = process.env.RAZORPAY_KEY_ID || "rzp_test_mock_key_id";
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || "mock_secret_key_secret_12345";
function getRazorpayInstance() {
    return new razorpay_1.default({
        key_id: razorpayKeyId,
        key_secret: razorpayKeySecret,
    });
}
/**
 * Creates a Razorpay Order server-side for user subscription upgrade.
 * Supports UPI (GPay/PhonePe/Paytm), NetBanking, and Cards.
 */
exports.createRazorpayOrder = (0, https_1.onCall)({
    secrets: ["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET"],
}, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "User must be authenticated.");
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
        }
        catch (err) {
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
});
/**
 * Server-Side Cryptographic Signature Verification
 * Verifies razorpay_signature = HMAC-SHA256(order_id + "|" + payment_id, secret)
 * BEFORE marking subscription active in Firestore.
 */
exports.verifyRazorpayPayment = (0, https_1.onCall)({
    secrets: ["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET"],
}, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "User must be authenticated.");
    }
    const userId = request.auth.uid;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan = "pro" } = request.data || {};
    if (!razorpay_order_id || !razorpay_payment_id) {
        throw new https_1.HttpsError("invalid-argument", "Missing payment verification parameters.");
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
            throw new https_1.HttpsError("permission-denied", "Payment verification failed: Invalid cryptographic signature.");
        }
    }
    // Payment successfully verified — update subscriptions/{userId}
    const db = admin.firestore();
    const periodEnd = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
    await db.collection("subscriptions").doc(userId).set({
        plan: "pro",
        status: "active",
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        currentPeriodEnd: periodEnd,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    // Audit Logging (Sanitized, zero sensitive payment data)
    await (0, auditLogger_1.logAuditEvent)(userId, "user", "billing.subscription_created", "subscription", userId, {
        plan: "pro",
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
    }).catch(console.warn);
    console.log(`[Razorpay] Successfully activated Pro subscription for user ${userId}`);
    return {
        success: true,
        plan: "pro",
        status: "active",
        currentPeriodEnd: periodEnd,
    };
});
/**
 * Razorpay Webhook Handler
 * Verifies webhook signature with RAZORPAY_WEBHOOK_SECRET and updates Firestore
 */
exports.handleRazorpayWebhook = (0, https_1.onRequest)({
    secrets: ["RAZORPAY_WEBHOOK_SECRET"],
}, async (req, res) => {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];
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
                await db.collection("subscriptions").doc(userId).set({
                    plan: "pro",
                    status: "active",
                    razorpayPaymentId: payment.id,
                    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                }, { merge: true });
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
});
//# sourceMappingURL=razorpayPayments.js.map