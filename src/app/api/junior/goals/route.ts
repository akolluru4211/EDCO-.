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

    const { data: goals } = await supabase
      .from("junior_goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    return NextResponse.json({ success: true, goals: goals || [] });
  } catch (error: any) {
    console.error("GET /api/junior/goals error:", error);
    return NextResponse.json({ error: error.message || "Failed to load goals" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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

    const body = await req.json().catch(() => ({}));
    const { goalText } = body;

    if (!goalText) {
      return NextResponse.json({ error: "goalText is required" }, { status: 400 });
    }

    const lower = goalText.toLowerCase();
    let targetDomain = "PYTHON";
    let milestones = [
      { order: 1, title: "Learn Variables & Output", concept: "Storing text and numbers", completed: false },
      { order: 2, title: "Conditional Statements", concept: "if, else decisions", completed: false },
      { order: 3, title: "Loops & Repetition", concept: "for and while iterations", completed: false },
      { order: 4, title: "Functions & Logic", concept: "Reusable code blocks", completed: false },
      { order: 5, title: "Build Your First Project", concept: "Putting it all together", completed: false }
    ];

    if (lower.includes("game")) {
      targetDomain = "GAME_DEV";
      milestones = [
        { order: 1, title: "Learn Game Variables", concept: "Player score and position", completed: false },
        { order: 2, title: "Player Input & Controls", concept: "Keyboard events", completed: false },
        { order: 3, title: "Collision & Rules", concept: "Hit tests and bounds", completed: false },
        { order: 4, title: "Game Loop & Timing", concept: "Continuous frame update", completed: false },
        { order: 5, title: "Publish Mini Game", concept: "Playable browser game", completed: false }
      ];
    } else if (lower.includes("website") || lower.includes("web")) {
      targetDomain = "WEB_DEV";
      milestones = [
        { order: 1, title: "HTML Page Structure", concept: "Headings, text and layout", completed: false },
        { order: 2, title: "CSS Colors & Styles", concept: "Quixel styling and buttons", completed: false },
        { order: 3, title: "Interactive Buttons", concept: "JavaScript click events", completed: false },
        { order: 4, title: "Responsive Layouts", concept: "Mobile and desktop sizing", completed: false },
        { order: 5, title: "Deploy Live Web Page", concept: "Shareable public link", completed: false }
      ];
    } else if (lower.includes("ai") || lower.includes("robot")) {
      targetDomain = "AI";
      milestones = [
        { order: 1, title: "What is AI & Machine Learning?", concept: "Inputs, patterns and outputs", completed: false },
        { order: 2, title: "Prompt Engineering Lab", concept: "Structuring clear instructions", completed: false },
        { order: 3, title: "Rule-Based Chatbot", concept: "Keyword matching logic", completed: false },
        { order: 4, title: "AI Image & Speech Recognition", concept: "Classifying visual and audio signals", completed: false },
        { order: 5, title: "Build Smart Assistant", concept: "Interactive AI project", completed: false }
      ];
    }

    const { data: newGoal, error: insertErr } = await supabase
      .from("junior_goals")
      .insert({
        user_id: user.id,
        goal_text: goalText,
        target_domain: targetDomain,
        milestones: milestones,
        current_milestone_index: 0,
        status: "IN_PROGRESS"
      })
      .select("*")
      .single();

    if (insertErr) throw insertErr;

    return NextResponse.json({ success: true, goal: newGoal });
  } catch (error: any) {
    console.error("POST /api/junior/goals error:", error);
    return NextResponse.json({ error: error.message || "Failed to create goal" }, { status: 500 });
  }
}
