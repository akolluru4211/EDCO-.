import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: userProjects } = await supabase
      .from("junior_projects")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const catalog = [
      { id: "calc", title: "CLI Smart Calculator", category: "Python", difficulty: "BEGINNER", description: "Build a multi-operation calculator with memory." },
      { id: "guess", title: "Number Guessing Game", category: "Game Dev", difficulty: "BEGINNER", description: "Random number generator with hot/cold hints." },
      { id: "weather", title: "Mini Weather Dashboard", category: "Web Dev", difficulty: "INTERMEDIATE", description: "Fetch live temperature from open APIs." },
      { id: "chatbot", title: "Rule-Based AI Assistant", category: "AI", difficulty: "ADVANCED", description: "Context-aware conversational agent." }
    ];

    return NextResponse.json({
      success: true,
      userProjects: userProjects || [],
      catalog
    });
  } catch (error: any) {
    console.error("GET /api/junior/projects error:", error);
    return NextResponse.json({ error: error.message || "Failed to load projects" }, { status: 500 });
  }
}
