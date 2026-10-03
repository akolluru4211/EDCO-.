import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendEmailNotification } from "@/lib/email-service";
import { renderBrandedEmailHtml } from "@/lib/email-templates";

export const dynamic = "force-dynamic";

/**
 * POST /api/cron/myra-birthday-wishes
 * Scheduled backend job that sends an on-brand, warm birthday email and in-app greeting
 * from Myra AI & the Edworld Co. team on the user's birthday.
 * 
 * Safety & Privacy:
 * - Internal comparison only: raw DOB is never exposed.
 * - Idempotency: Records year in `birthday_system_wishes` to ensure exactly 1 dispatch per user per year.
 * - Strictly one-directional transactional email — no reply-to inbox.
 */
export async function POST(req: NextRequest) {
  return handleBirthdayCron(req);
}

export async function GET(req: NextRequest) {
  return handleBirthdayCron(req);
}

async function handleBirthdayCron(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // Optional CRON_SECRET security check
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      const url = new URL(req.url);
      const queryKey = url.searchParams.get("key");
      if (queryKey !== cronSecret) {
        // Allow in development, restrict in production if secret configured
        if (process.env.NODE_ENV === "production") {
          return NextResponse.json({ error: "Unauthorized cron execution" }, { status: 401 });
        }
      }
    }

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentDay = now.getDate();
    const currentYear = now.getFullYear();

    // 1. Fetch profiles with birthdays on this month & day
    // Query profiles where dob is not null
    const { data: profiles, error: profErr } = await supabase
      .from("profiles")
      .select("id, name, email, dob")
      .not("dob", "is", null);

    if (profErr || !profiles) {
      console.error("[Myra Birthday Cron]: Failed to fetch profiles", profErr);
      return NextResponse.json({ error: "Failed to query profiles" }, { status: 500 });
    }

    // Filter matching users
    const todayBirthdayUsers = profiles.filter((p) => {
      if (!p.dob) return false;
      const d = new Date(p.dob);
      return (d.getUTCMonth() + 1 === currentMonth && d.getUTCDate() === currentDay);
    });

    if (todayBirthdayUsers.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No user birthdays today",
        dispatched: 0,
      });
    }

    // 2. Filter out users who already received a system birthday wish this year
    const userIds = todayBirthdayUsers.map((u) => u.id);
    const { data: existingWishes } = await supabase
      .from("birthday_system_wishes")
      .select("user_id")
      .in("user_id", userIds)
      .eq("year", currentYear);

    const alreadyWished = new Set((existingWishes || []).map((w) => w.user_id));
    const eligibleUsers = todayBirthdayUsers.filter((u) => !alreadyWished.has(u.id));

    let dispatchCount = 0;
    const errors: string[] = [];

    for (const user of eligibleUsers) {
      try {
        const firstName = user.name ? user.name.split(" ")[0] : "Learner";
        const emailHtml = renderBrandedEmailHtml({
          previewText: `Happy Birthday from Myra & EdWorld Co., ${firstName}! 🎂`,
          title: `Happy Birthday, ${firstName}! 🎂`,
          contentHtml: `
            <p>Dear <strong>${firstName}</strong>,</p>
            <p>
              On behalf of <strong>Myra AI</strong> and the entire <strong>EdWorld Co.</strong> team, we wish you a fantastic Birthday and an inspiring year ahead!
            </p>
            <p>
              Whether you are preparing for high-stakes interviews, mastering skills, or reaching your dream engineering career milestones, we're proud to be with you every step of the journey.
            </p>
            <p style="margin-top: 24px; font-style: italic; color: #13141B;">
              &ldquo;May your day be filled with joy and your year with breakthroughs.&rdquo; — Myra AI
            </p>
          `,
          ctaText: "Visit Your Dashboard",
          ctaUrl: process.env.NEXT_PUBLIC_APP_URL || "https://edworldco.in/dashboard",
          footerNote: "This is an automated birthday greeting from Myra & EdWorld Co. No reply is required.",
        });

        // Dispatch email via Resend
        if (user.email) {
          await sendEmailNotification({
            to: user.email,
            subject: `Happy Birthday from Myra & the EdWorld Co. Team! 🎂`,
            html: emailHtml,
            category: "system",
            metadata: {
              type: "MYRA_AUTOMATED_BIRTHDAY_WISH",
              year: currentYear,
              userId: user.id,
            },
          });
        }

        // Insert in-app notification
        try {
          await supabase.from("notifications").insert({
            user_id: user.id,
            actor_id: user.id,
            type: "MYRA_BIRTHDAY_WISH",
            title: "Happy Birthday from Myra! 🎂",
            body: `Happy Birthday, ${firstName}! Wishing you an incredible year of learning and career milestones.`,
            data: {
              year: currentYear,
              from: "Myra AI & EdWorld Co.",
            },
            read: false,
          });
        } catch (notifErr) {
          console.warn("[Myra Birthday Notif Warning]:", notifErr);
        }

        // Log in birthday_system_wishes for idempotency
        try {
          await supabase.from("birthday_system_wishes").insert({
            user_id: user.id,
            year: currentYear,
          });
        } catch (dbErr) {
          console.warn("[Myra Birthday Log Warning]:", dbErr);
        }

        dispatchCount++;
      } catch (userErr: any) {
        console.error(`[Myra Birthday Dispatch Failed for ${user.id}]:`, userErr);
        errors.push(`User ${user.id}: ${userErr.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Dispatched Myra birthday greetings to ${dispatchCount} user(s)`,
      dispatched: dispatchCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err: any) {
    console.error("[Myra Birthday Cron Global Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to execute birthday cron" }, { status: 500 });
  }
}
