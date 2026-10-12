import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body.email?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ success: false, error: "Email address is required" }, { status: 400 });
    }

    // Update status to UNSUBSCRIBED in database
    const { error } = await supabase
      .from("newsletter_subscribers")
      .update({ status: "UNSUBSCRIBED" })
      .eq("email", email);

    if (error) {
      console.warn("[Unsubscribe API Note]:", error.message);
    }

    return NextResponse.json({
      success: true,
      message: "You have been successfully unsubscribed from EdWorld Co. emails."
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email")?.trim().toLowerCase();

  if (email) {
    try {
      await supabase
        .from("newsletter_subscribers")
        .update({ status: "UNSUBSCRIBED" })
        .eq("email", email);
    } catch (e) {
      console.warn("[Unsubscribe GET Notice]:", e);
    }
  }

  // Redirect to friendly confirmation page
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  return NextResponse.redirect(`${appUrl}/newsletter/unsubscribe?status=done&email=${encodeURIComponent(email || "")}`);
}
