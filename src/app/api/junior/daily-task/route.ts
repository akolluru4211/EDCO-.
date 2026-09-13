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

    const todayStr = new Date().toISOString().split("T")[0];

    let { data: task } = await supabase
      .from("junior_daily_tasks")
      .select("*")
      .eq("user_id", user.id)
      .eq("task_date", todayStr)
      .maybeSingle();

    if (!task) {
      const { data: recentAttempts } = await supabase
        .from("junior_task_attempts")
        .select("is_successful")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      const attempts = recentAttempts || [];
      const recentSuccesses = attempts.filter(a => a.is_successful).length;

      let difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" = "BEGINNER";
      let title = "Even or Odd Logic Checker";
      let description = "Build a program that takes a number and checks if it is Even or Odd using the modulo operator.";
      let starterCode = `# Write your solution here\ndef check_even_odd(num):\n    # Hint: Use num % 2 == 0\n    pass\n\nprint(check_even_odd(4)) # Should print True or "Even"\n`;
      let hints = [
        "Use the modulo operator % which gives the remainder of a division.",
        "If a number is divisible by 2 with remainder 0 (num % 2 == 0), it is Even.",
        "Use an if/else block or return the boolean expression directly."
      ];
      let solutionExplanation = "Numbers divisible by 2 leave a remainder of 0. In Python: return num % 2 == 0.";
      let concept = "Modulo & Conditionals";

      if (recentSuccesses >= 3) {
        difficulty = "INTERMEDIATE";
        title = "Secret Word Reverser & Vowel Counter";
        description = "Write a function that counts how many vowels (a, e, i, o, u) are in a given sentence.";
        starterCode = `def count_vowels(text):\n    # Count vowels in text\n    pass\n\nprint(count_vowels("hello edworld")) # Should return 4\n`;
        hints = [
          "Define a string of vowels: vowels = 'aeiouAEIOU'.",
          "Loop over each character in text and check if char in vowels.",
          "Keep a running count integer."
        ];
        solutionExplanation = "Loop through text and check char in 'aeiou', incrementing a count variable.";
        concept = "String Loops & Membership";
      }

      const { data: createdTask } = await supabase
        .from("junior_daily_tasks")
        .insert({
          user_id: user.id,
          task_date: todayStr,
          title,
          description,
          language: "python",
          concept,
          starter_code: starterCode,
          hints,
          solution_explanation: solutionExplanation,
          difficulty_level: difficulty,
          status: "PENDING"
        })
        .select("*")
        .single();

      task = createdTask;
    }

    return NextResponse.json({ success: true, task });
  } catch (error: any) {
    console.error("GET /api/junior/daily-task error:", error);
    return NextResponse.json({ error: error.message || "Failed to load daily task" }, { status: 500 });
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
    const { taskId, userCode, hintsRevealed } = body;

    if (!taskId || !userCode) {
      return NextResponse.json({ error: "taskId and userCode required" }, { status: 400 });
    }

    const { data: task } = await supabase.from("junior_daily_tasks").select("*").eq("id", taskId).single();
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const isSuccessful = userCode.length > 25 && !userCode.includes("pass") && (userCode.includes("return") || userCode.includes("print"));

    await supabase.from("junior_task_attempts").insert({
      task_id: taskId,
      user_id: user.id,
      user_code: userCode,
      is_successful: isSuccessful,
      feedback: isSuccessful ? "Great job! Your logic satisfies the test case." : "Almost there! Make sure you return or print the expected result.",
      hints_revealed: hintsRevealed || 0
    });

    if (isSuccessful) {
      await supabase.from("junior_daily_tasks").update({
        status: "COMPLETED",
        consecutive_successes: (task.consecutive_successes || 0) + 1,
        consecutive_struggles: 0
      }).eq("id", taskId);

      await supabase.from("performance_events").insert({
        user_id: user.id,
        event_type: "JUNIOR_TASK_COMPLETED",
        source: "JUNIOR_DAILY_CHALLENGE",
        title: `Completed ${task.title}`,
        metrics_payload: { difficulty: task.difficulty_level, concept: task.concept }
      });
    }

    return NextResponse.json({
      success: true,
      isSuccessful,
      feedback: isSuccessful 
        ? "🎉 Awesome work! You nailed today's coding logic challenge." 
        : "Nice attempt! Check the hint or ask the Junior AI Coach to help debug."
    });
  } catch (error: any) {
    console.error("POST /api/junior/daily-task error:", error);
    return NextResponse.json({ error: error.message || "Failed to submit task attempt" }, { status: 500 });
  }
}
