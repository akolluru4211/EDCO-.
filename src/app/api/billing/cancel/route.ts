import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

    const { data: subData, error: subErr } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (subErr || !subData) {
      return NextResponse.json({ error: "No active subscription found to cancel." }, { status: 404 });
    }

    const currentPeriodEnd = subData.current_period_end || new Date(Date.now() + 30 * 86400000).toISOString();

    // Set end-of-period cancellation
    await supabase
      .from("subscriptions")
      .update({
        cancel_at_period_end: true,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", userId);

    // Audit Log
    try {
      await supabase.from("audit_logs").insert({
        actor_id: userId,
        actor_role: "user",
        action: "subscription.cancel_scheduled",
        target_type: "subscription",
        target_id: userId,
        metadata: {
          effective_date: currentPeriodEnd,
          behavior: "end_of_period_cancellation"
        }
      });
    } catch (e) {
      console.warn("Audit log insert note:", e);
    }

    return NextResponse.json({
      success: true,
      data: {
        message: "Your subscription has been scheduled for cancellation at the end of your current billing period. You will retain full Pro access until then.",
        effectiveDate: currentPeriodEnd
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Cancellation error" }, { status: 500 });
  }
}
