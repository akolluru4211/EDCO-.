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
exports.handleStripeWebhook = exports.createCustomerPortalSession = exports.createCheckoutSession = void 0;
const admin = __importStar(require("firebase-admin"));
const https_1 = require("firebase-functions/v2/https");
const stripe_1 = __importDefault(require("stripe"));
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "sk_test_mock_secret_key_12345";
const stripe = new stripe_1.default(stripeSecretKey, {
    apiVersion: "2024-06-20",
});
/**
 * Creates a Stripe Checkout Session for upgrading to Edworld Co Pro
 */
exports.createCheckoutSession = (0, https_1.onCall)({
    secrets: ["STRIPE_SECRET_KEY"],
}, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "User must be authenticated.");
    }
    const userId = request.auth.uid;
    const userEmail = request.auth.token.email || "user@example.com";
    const { priceId = "price_pro_monthly", returnUrl = "http://localhost:3000/billing" } = request.data || {};
    const db = admin.firestore();
    const subDoc = await db.collection("subscriptions").doc(userId).get();
    let customerId = subDoc.data()?.stripeCustomerId;
    if (process.env.STRIPE_SECRET_KEY) {
        try {
            if (!customerId) {
                const customer = await stripe.customers.create({
                    email: userEmail,
                    metadata: { firebaseUserId: userId },
                });
                customerId = customer.id;
                await db.collection("subscriptions").doc(userId).set({ stripeCustomerId: customerId }, { merge: true });
            }
            const session = await stripe.checkout.sessions.create({
                customer: customerId,
                payment_method_types: ["card"],
                line_items: [
                    {
                        price_data: {
                            currency: "usd",
                            product_data: {
                                name: "Edworld Co Pro Plan",
                                description: "Unlimited AI mock interviews, unlimited ATS resumes, job applications, & mentor matching",
                            },
                            unit_amount: 1900, // $19.00 / month
                            recurring: { interval: "month" },
                        },
                        quantity: 1,
                    },
                ],
                mode: "subscription",
                success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}&success=true`,
                cancel_url: `${returnUrl}?canceled=true`,
                metadata: { userId },
            });
            return { checkoutUrl: session.url, sessionId: session.id };
        }
        catch (err) {
            console.error("Stripe error, falling back to simulated sandbox session:", err);
        }
    }
    // Simulated sandbox checkout url for development without live keys
    return {
        checkoutUrl: `${returnUrl}?simulated_checkout=true&plan=pro`,
        sessionId: "sim_cs_" + Date.now(),
    };
});
/**
 * Creates a Stripe Customer Portal Session for managing payment methods & cancellations
 */
exports.createCustomerPortalSession = (0, https_1.onCall)({
    secrets: ["STRIPE_SECRET_KEY"],
}, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "User must be authenticated.");
    }
    const userId = request.auth.uid;
    const { returnUrl = "http://localhost:3000/billing" } = request.data || {};
    const db = admin.firestore();
    const subDoc = await db.collection("subscriptions").doc(userId).get();
    const customerId = subDoc.data()?.stripeCustomerId;
    if (customerId && process.env.STRIPE_SECRET_KEY) {
        try {
            const session = await stripe.billingPortal.sessions.create({
                customer: customerId,
                return_url: returnUrl,
            });
            return { portalUrl: session.url };
        }
        catch (e) {
            console.error("Portal error:", e);
        }
    }
    return { portalUrl: `${returnUrl}?simulated_portal=true` };
});
/**
 * Stripe Webhook Handler to update subscriptions/{userId} in Firestore
 */
exports.handleStripeWebhook = (0, https_1.onRequest)({
    secrets: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"],
}, async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;
    try {
        if (webhookSecret && sig) {
            event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
        }
        else {
            event = req.body;
        }
    }
    catch (err) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }
    const db = admin.firestore();
    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object;
            const userId = session.metadata?.userId;
            if (userId) {
                await db.collection("subscriptions").doc(userId).set({
                    plan: "pro",
                    status: "active",
                    stripeCustomerId: session.customer,
                    stripeSubscriptionId: session.subscription,
                    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                }, { merge: true });
            }
            break;
        }
        case "customer.subscription.deleted": {
            const subscription = event.data.object;
            const customerId = subscription.customer;
            const snapshot = await db.collection("subscriptions").where("stripeCustomerId", "==", customerId).get();
            for (const doc of snapshot.docs) {
                await doc.ref.update({
                    plan: "free",
                    status: "canceled",
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });
            }
            break;
        }
    }
    res.json({ received: true });
});
//# sourceMappingURL=stripePayments.js.map