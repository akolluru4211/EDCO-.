import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Server-Side Age-Band Enforcement: Career Track (18+) Only
    const { data: userProfile } = await supabase
      .from("users")
      .select("id, age_band")
      .eq("id", user.id)
      .maybeSingle();

    if (userProfile && userProfile.age_band !== "18+") {
      return NextResponse.json(
        { error: "Monetization and paid subscriptions are restricted to 18+ Career Track accounts per minor safety policies." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const cycle = body.cycle || "monthly";
    const plan = (body.plan || "pro").toLowerCase();

    // Pro Monthly: ₹49 (4900 paise) | Pro Annual: ₹490 (49000 paise)
    // Premium Monthly: ₹99 (9900 paise) | Premium Annual: ₹990 (99000 paise)
    let amount = 4900;
    if (plan === "premium") {
      amount = cycle === "yearly" ? 99000 : 9900;
    } else {
      amount = cycle === "yearly" ? 49000 : 4900;
    }

    const currency = "INR";
    const receipt = `rcpt_${user.id.substring(0, 8)}_${Date.now()}`;

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "rzp_test_mock_key_id";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "mock_secret_key_secret_12345";

    let orderId = `order_${Math.random().toString(36).substring(2, 12)}`;

    // If real Razorpay credentials are configured, create order via SDK
    if (keyId !== "rzp_test_mock_key_id" && process.env.RAZORPAY_KEY_SECRET) {
      try {
        const razorpay = new Razorpay({
          key_id: keyId,
          key_secret: keySecret,
        });

        const order = await razorpay.orders.create({
          amount,
          currency,
          receipt,
          notes: {
            userId: user.id,
            plan,
            cycle,
          },
        });
        orderId = order.id;
      } catch (err: any) {
        console.warn("[Razorpay SDK create order fallback]:", err?.message);
      }
    }

    return NextResponse.json({
      success: true,
      orderId,
      amount,
      currency,
      keyId,
    });
  } catch (error: any) {
    console.error("[Create Order Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to create order" }, { status: 500 });
  }
}
