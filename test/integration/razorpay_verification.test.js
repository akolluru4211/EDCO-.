const assert = require("assert");
const crypto = require("crypto");

/**
 * Integration Test: Razorpay Payment Signature & Webhook HMAC-SHA256 Verification
 */

function generateRazorpayPaymentSignature(orderId, paymentId, secret) {
  const body = `${orderId}|${paymentId}`;
  return crypto.createHmac("sha256", secret).update(body).digest("hex");
}

function verifyRazorpayPaymentSignature(orderId, paymentId, signature, secret) {
  if (!orderId || !paymentId || !signature || !secret) {
    return { valid: false, error: "MISSING_PARAMETERS" };
  }

  const expectedSignature = generateRazorpayPaymentSignature(orderId, paymentId, secret);
  const isValid = crypto.timingSafeEqual(
    Buffer.from(signature, "hex"),
    Buffer.from(expectedSignature, "hex")
  );

  return { valid: isValid };
}

function verifyRazorpayWebhookSignature(payloadBodyString, webhookSignature, webhookSecret) {
  if (!payloadBodyString || !webhookSignature || !webhookSecret) {
    return { valid: false, error: "MISSING_WEBHOOK_HEADERS" };
  }

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(payloadBodyString)
    .digest("hex");

  try {
    const isValid = crypto.timingSafeEqual(
      Buffer.from(webhookSignature, "hex"),
      Buffer.from(expectedSignature, "hex")
    );
    return { valid: isValid };
  } catch (e) {
    return { valid: false, error: "SIGNATURE_LENGTH_MISMATCH" };
  }
}

console.log("=== RUNNING RAZORPAY SIGNATURE VERIFICATION TESTS ===");

const TEST_SECRET = "test_razorpay_secret_key_2026";
const TEST_ORDER_ID = "order_O1234567890ABC";
const TEST_PAYMENT_ID = "pay_P9876543210XYZ";

// 1. Valid payment signature
const validSig = generateRazorpayPaymentSignature(TEST_ORDER_ID, TEST_PAYMENT_ID, TEST_SECRET);
const resultValid = verifyRazorpayPaymentSignature(TEST_ORDER_ID, TEST_PAYMENT_ID, validSig, TEST_SECRET);
assert.strictEqual(resultValid.valid, true, "Authentic signature must pass verification");
console.log("[PASS] Authentic payment signature verified successfully");

// 2. Forged / Tampered signature must be rejected
const forgedSig = validSig.substring(0, validSig.length - 4) + "abcd";
const resultForged = verifyRazorpayPaymentSignature(TEST_ORDER_ID, TEST_PAYMENT_ID, forgedSig, TEST_SECRET);
assert.strictEqual(resultForged.valid, false, "Forged signature must be rejected");
console.log("[PASS] Forged payment signature rejected strictly");

// 3. Tampered Order ID or Payment ID must be rejected
const resultTamperedOrder = verifyRazorpayPaymentSignature("order_TAMPERED_000", TEST_PAYMENT_ID, validSig, TEST_SECRET);
assert.strictEqual(resultTamperedOrder.valid, false, "Tampered order ID must fail verification");
console.log("[PASS] Tampered order ID rejected strictly");

// 4. Missing parameters must be rejected
const resultMissing = verifyRazorpayPaymentSignature("", TEST_PAYMENT_ID, validSig, TEST_SECRET);
assert.strictEqual(resultMissing.valid, false, "Missing order ID must fail verification");
assert.strictEqual(resultMissing.error, "MISSING_PARAMETERS", "Missing params error code asserted");
console.log("[PASS] Missing parameter rejection asserted");

// 5. Webhook Signature Verification
const WEBHOOK_SECRET = "whsec_edworld_production_secret_2026";
const webhookPayload = JSON.stringify({
  entity: "event",
  event: "subscription.charged",
  payload: { payment: { entity: { id: TEST_PAYMENT_ID, amount: 1900 } } }
});
const validWebhookSig = crypto.createHmac("sha256", WEBHOOK_SECRET).update(webhookPayload).digest("hex");

const whResultValid = verifyRazorpayWebhookSignature(webhookPayload, validWebhookSig, WEBHOOK_SECRET);
assert.strictEqual(whResultValid.valid, true, "Authentic webhook signature must pass");

// Tamper payload body by 1 character
const tamperedPayload = webhookPayload.replace("1900", "0000");
const whResultTampered = verifyRazorpayWebhookSignature(tamperedPayload, validWebhookSig, WEBHOOK_SECRET);
assert.strictEqual(whResultTampered.valid, false, "Tampered webhook payload must fail verification");
console.log("[PASS] Tampered webhook payload rejected strictly");

console.log("ALL RAZORPAY SIGNATURE VERIFICATION TESTS PASSED SUCCESSFULLY!\n");
