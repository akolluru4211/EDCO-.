import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/dashboard";
  const origin = requestUrl.origin;

  if (code) {
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.error("[OAuth Callback Exchange Error]:", error.message);
        return NextResponse.redirect(
          new URL(`/auth/login?error=${encodeURIComponent(error.message)}`, origin)
        );
      }

      if (data?.session && data.user) {
        const user = data.user;
        const meta = user.user_metadata || {};
        const userName = meta.full_name || meta.name || user.email?.split("@")[0] || "Learner";

        // Check if profile exists in Supabase
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id, onboarding_completed, role")
          .eq("id", user.id)
          .maybeSingle();

        let onboardingCompleted = existingProfile?.onboarding_completed;

        if (!existingProfile) {
          // Initialize new profile for Google user
          try {
            await supabase.from("profiles").upsert({
              id: user.id,
              name: userName,
              email: user.email,
              age_band: "18+",
              role: "CLIENT",
              onboarding_completed: false,
              interests: [
                { id: "swe", name: "Software Engineering", category: "Engineering", selfLevel: 0, effectiveLevel: 0 },
                { id: "fullstack", name: "Full Stack Development", category: "Engineering", selfLevel: 0, effectiveLevel: 0 },
              ],
              updated_at: new Date().toISOString(),
            });
            onboardingCompleted = false;
          } catch (profileErr) {
            console.warn("[OAuth Profile Insert Note]:", profileErr);
          }
        }

        // Determine destination
        const destination = onboardingCompleted === false ? "/onboarding" : next.startsWith("/auth") ? "/dashboard" : next;
        const response = NextResponse.redirect(new URL(destination, origin));

        // Set session cookies
        const maxAge = 60 * 60 * 24 * 7; // 7 days
        response.cookies.set("edworld_session", data.session.access_token, {
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge,
        });

        response.cookies.set("sb-access-token", data.session.access_token, {
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge,
        });

        response.cookies.set("edworld_auth", "true", {
          path: "/",
          httpOnly: false,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge,
        });

        return response;
      }
    } catch (err: any) {
      console.error("[OAuth Callback Exception]:", err);
      return NextResponse.redirect(
        new URL(`/auth/login?error=${encodeURIComponent("Authentication failed. Please try again.")}`, origin)
      );
    }
  }

  // Fallback if no code received
  return NextResponse.redirect(new URL("/auth/login", origin));
}
