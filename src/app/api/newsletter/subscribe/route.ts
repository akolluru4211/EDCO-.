import { NextRequest, NextResponse } from "next/server";
import { addNewsletterSubscriber } from "@/lib/email-service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, interests, source } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const result = await addNewsletterSubscriber({
      email,
      name: name || undefined,
      interests: Array.isArray(interests) ? interests : undefined,
      source: source || "website_form",
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to subscribe." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Subscribed successfully! Check your inbox for confirmation.",
      subscriber: result.subscriber,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Internal subscription error" },
      { status: 500 }
    );
  }
}
