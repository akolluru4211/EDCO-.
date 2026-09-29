import { NextRequest, NextResponse } from "next/server";
import { forwardContactInquiry } from "@/lib/email-service";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, category, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: "Please provide your name, email, and message." },
        { status: 400 }
      );
    }

    // Forward to edworld.eden@gmail.com
    await forwardContactInquiry({
      name: name.trim(),
      email: email.trim(),
      category: category || "General Support",
      message: message.trim(),
      ip: req.headers.get("x-forwarded-for") || undefined,
    });

    // Optionally record in database inquiries table if exists
    try {
      await supabase.from("support_inquiries").insert({
        name: name.trim(),
        email: email.trim(),
        category: category || "General Support",
        message: message.trim(),
        status: "NEW",
        destination_email: "edworld.eden@gmail.com",
      });
    } catch (dbErr) {
      // Non-blocking
    }

    return NextResponse.json({
      success: true,
      message: "Your message has been sent to our team at edworld.eden@gmail.com.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to submit inquiry" },
      { status: 500 }
    );
  }
}
