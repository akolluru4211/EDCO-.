import { NextRequest, NextResponse } from "next/server";
import * as crypto from "crypto";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      cycle = "monthly",
      plan: requestedPlan = "pro",
    } = await req.json();

    const plan = requestedPlan === "premium" ? "premium" : "pro";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "rzp_test_mock_secret_key_12345";

    // Strict constant-time HMAC-SHA256 signature verification (prevents timing side-channels)
    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const genBuf = Buffer.from(generatedSignature, "utf8");
    const sigBuf = Buffer.from(typeof razorpay_signature === "string" ? razorpay_signature : "", "utf8");

    if (genBuf.length !== sigBuf.length || !crypto.timingSafeEqual(genBuf, sigBuf)) {
      return NextResponse.json(
        { error: "Invalid payment signature. Payment verification failed." },
        { status: 400 }
      );
    }

    const periodDays = cycle === "yearly" ? 365 : 30;
    const currentPeriodEnd = new Date(Date.now() + periodDays * 24 * 3600 * 1000).toISOString();
    
    // Pro: ₹49/mo (₹490/yr) | Premium: ₹99/mo (₹990/yr)
    let amountInr = 49;
    if (plan === "premium") {
      amountInr = cycle === "yearly" ? 990 : 99;
    } else {
      amountInr = cycle === "yearly" ? 490 : 49;
    }

    // 1. Update Subscriptions table in Supabase
    const { error: subError } = await supabase
      .from("subscriptions")
      .upsert({
        user_id: user.id,
        plan,
        status: "active",
        razorpay_order_id,
        razorpay_payment_id,
        current_period_end: currentPeriodEnd,
        cancel_at_period_end: false,
        updated_at: new Date().toISOString(),
      });

    if (subError) {
      console.error("[Supabase Subscription Update Error]:", subError);
    }

    // 2. Insert into Payment History
    try {
      await supabase.from("payment_history").insert({
        user_id: user.id,
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
        amount_inr: amountInr,
        plan,
        status: "success",
        created_at: new Date().toISOString()
      });
    } catch (e) {
      console.warn("Payment history insert note:", e);
    }

    // 2. Audit Logging (Zero Sensitive Financial PII)
    try {
      await supabase
        .from("audit_logs")
        .insert({
          actor_id: user.id,
          actor_role: "user",
          action: "billing.subscription_created",
          target_type: "subscription",
          target_id: user.id,
          metadata: {
            plan,
            cycle,
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
          },
          created_at: new Date().toISOString(),
        });
    } catch (auditErr) {
      console.warn("[Audit Log Note]:", auditErr);
    }

    return NextResponse.json({
      success: true,
      plan,
      status: "active",
      currentPeriodEnd,
      subscription: {
        userId: user.id,
        plan,
        status: "active",
        currentPeriodEnd,
      },
    });
  } catch (error: any) {
    console.error("[Verify Payment Error]:", error);
    return NextResponse.json({ error: error.message || "Payment verification failed" }, { status: 500 });
  }
}
