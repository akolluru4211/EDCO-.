import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { requesterId, connectionId, company, jobLink, message } = body;

    if (!requesterId || !connectionId || !company || !jobLink || !message) {
      return NextResponse.json({ error: "requesterId, connectionId, company, jobLink, and message are required." }, { status: 400 });
    }

    const { data: referral, error } = await supabase
      .from("referral_requests")
      .insert({
        requester_id: requesterId,
        connection_id: connectionId,
        company: company.trim(),
        job_link: jobLink.trim(),
        message: message.trim(),
        status: "pending"
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      referral,
      disclaimer: "Structured peer referral request. Edworld Co does not verify or guarantee any connection's ability to provide a referral or influence hiring decisions."
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Referral error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "userId is required." }, { status: 400 });
    }

    const { data: sentReferrals } = await supabase
      .from("referral_requests")
      .select("*")
      .eq("requester_id", userId);

    const { data: receivedReferrals } = await supabase
      .from("referral_requests")
      .select("*")
      .eq("connection_id", userId);

    return NextResponse.json({
      sent: sentReferrals || [],
      received: receivedReferrals || []
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
