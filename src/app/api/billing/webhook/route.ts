import { NextRequest, NextResponse } from "next/server";
import * as crypto from "crypto";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("x-razorpay-signature");
    const rawBody = await req.text();
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "rzp_test_mock_webhook_secret_12345";

    // Strict constant-time Webhook HMAC-SHA256 signature verification
    if (signature) {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      const expBuf = Buffer.from(expectedSignature, "utf8");
      const sigBuf = Buffer.from(signature, "utf8");
      if (expBuf.length !== sigBuf.length || !crypto.timingSafeEqual(expBuf, sigBuf)) {
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
      }
    } else if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Missing webhook signature header" }, { status: 400 });
    }

    const payload = JSON.parse(rawBody || "{}");
    const event = payload.event;
    const supabase = createClient();

    if (event === "payment.captured" || event === "subscription.charged") {
      const payment = payload.payload?.payment?.entity;
      const userId = payment?.notes?.userId;
      if (userId) {
        await supabase
          .from("subscriptions")
          .upsert({
            user_id: userId,
            plan: "pro",
            status: "active",
            razorpay_payment_id: payment.id,
            cancel_at_period_end: false,
            updated_at: new Date().toISOString(),
          });
      }
    } else if (event === "payment.failed") {
      const payment = payload.payload?.payment?.entity;
      const userId = payment?.notes?.userId;
      if (userId) {
        // Set 3-day grace period
        const gracePeriodEnd = new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString();
        await supabase
          .from("subscriptions")
          .update({
            status: "past_due",
            grace_period_until: gracePeriodEnd,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);
      }
    } else if (event === "subscription.cancelled" || event === "subscription.halted") {
      const subEntity = payload.payload?.subscription?.entity;
      const userId = subEntity?.notes?.userId;
      if (userId) {
        await supabase
          .from("subscriptions")
          .update({
            plan: "free",
            status: "cancelled",
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);
      }
    }

    // Write audit log entry for every webhook lifecycle event
    try {
      await supabase.from("audit_logs").insert({
        actor_id: payload.payload?.payment?.entity?.notes?.userId || null,
        actor_role: "system_webhook",
        action: `webhook.${event}`,
        target_type: "subscription",
        target_id: payload.payload?.payment?.entity?.id || event,
        metadata: {
          event,
          received_at: new Date().toISOString()
        }
      });
    } catch (e) {
      console.warn("Webhook audit log insert note:", e);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("[Razorpay Webhook Error]:", error);
    return NextResponse.json({ error: error.message || "Webhook processing failed" }, { status: 500 });
  }
}
