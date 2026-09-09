const crypto = require("crypto");
const assert = require("assert");

function verifyPaymentSignature({ orderId, paymentId, signature, secret }) {
  const generatedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return generatedSignature === signature;
}

function verifyWebhookSignature({ rawBody, signature, secret }) {
  const generatedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  return generatedSignature === signature;
}

console.log("Running Razorpay Signature Verification Unit Tests...");

const secret = "test_razorpay_secret_key_12345";
const orderId = "order_EDW123456789";
const paymentId = "pay_EDW987654321";

// 1. Valid Checkout Payment Signature
const validSignature = crypto
  .createHmac("sha256", secret)
  .update(`${orderId}|${paymentId}`)
  .digest("hex");

assert.strictEqual(
  verifyPaymentSignature({ orderId, paymentId, signature: validSignature, secret }),
  true,
  "Valid checkout signature must pass verification"
);

// 2. Tampered Checkout Payment Signature (Should Fail)
const tamperedSignature = validSignature.substring(0, validSignature.length - 2) + "ff";
assert.strictEqual(
  verifyPaymentSignature({ orderId, paymentId, signature: tamperedSignature, secret }),
  false,
  "Tampered signature must be rejected"
);

// 3. Valid Webhook Signature
const webhookBody = JSON.stringify({ event: "subscription.charged", payload: { id: "sub_123" } });
const validWebhookSignature = crypto
  .createHmac("sha256", secret)
  .update(webhookBody)
  .digest("hex");

assert.strictEqual(
  verifyWebhookSignature({ rawBody: webhookBody, signature: validWebhookSignature, secret }),
  true,
  "Valid webhook signature must pass verification"
);

// 4. Tampered Webhook Body (Should Fail)
const tamperedWebhookBody = webhookBody + " ";
assert.strictEqual(
  verifyWebhookSignature({ rawBody: tamperedWebhookBody, signature: validWebhookSignature, secret }),
  false,
  "Tampered webhook payload must be rejected"
);

console.log("✅ All Razorpay Signature unit tests passed!");
