import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const category = searchParams.get("category");
    const ageBand = searchParams.get("ageBand") || "18+";

    // 1. Fetch user profile for interest-based personalization if userId provided
    let userInterests: string[] = [];
    let userEffectiveLevel = 0;
    let actualAgeBand = ageBand;

    if (userId) {
      const { data: userRec } = await supabase
        .from("users")
        .select("age_band")
        .eq("id", userId)
        .maybeSingle();
      if (userRec?.age_band) {
        actualAgeBand = userRec.age_band;
      }

      const { data: profRec } = await supabase
        .from("profiles")
        .select("interests")
        .eq("id", userId)
        .maybeSingle();

      if (profRec?.interests && Array.isArray(profRec.interests)) {
        userInterests = profRec.interests.map((i: any) => (typeof i === "string" ? i.toLowerCase() : i.name?.toLowerCase() || ""));
        userEffectiveLevel = profRec.interests[0]?.effectiveLevel || 0;
      }
    }

    // 2. Query Active Problems
    let query = supabase
      .from("problems")
      .select("*")
      .eq("is_active", true);

    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    // 3. Strict Track & Age-Band Gating
    if (actualAgeBand === "13-15") {
      query = query.eq("min_age_band", "13-15");
    } else if (actualAgeBand === "16-18") {
      query = query.in("min_age_band", ["13-15", "16-18"]);
    }

    const { data: problemsData, error } = await query;

    let list = problemsData || [];
    
    // Fallback to high-yield problems including TorchLeet ML/PyTorch questions
    if (list.length === 0) {
      list = [
        {
          id: "prob-torchleet-lora",
          title: "Implement LoRA (Low-Rank Adaptation) in PyTorch",
          description: "Implement a custom nn.Module for LoRA linear layers with trainable A and B rank decomposition matrices, alpha scaling factor, and zero-init initialization.",
          category: "ai",
          difficulty_level: 2,
          min_age_band: "18+",
          interest_tags: ["pytorch", "deep-learning", "transformers", "lora", "meta", "openai", "anthropic"],
          companies: ["Meta", "Google", "Anthropic", "OpenAI", "Databricks"],
          source: "TorchLeet (v3/alignment-training)",
          is_active: true,
          created_at: new Date().toISOString()
        },
        {
          id: "prob-torchleet-kvcache",
          title: "Implement KV Cache for LLM Token Generation",
          description: "Implement an efficient Key-Value cache in PyTorch that avoids quadratic re-computation of attention keys and values across autoregressive generation steps.",
          category: "ai",
          difficulty_level: 2,
          min_age_band: "18+",
          interest_tags: ["pytorch", "llm-inference", "kv-cache", "anthropic", "openai", "perplexity"],
          companies: ["Anthropic", "OpenAI", "Meta", "Perplexity"],
          source: "TorchLeet (v3/llm-inference)",
          is_active: true,
          created_at: new Date().toISOString()
        },
        {
          id: "prob-torchleet-dpo",
          title: "Direct Preference Optimization (DPO) Loss",
          description: "Implement the closed-form DPO loss function in PyTorch comparing policy model log-probabilities against reference model log-probabilities on chosen vs rejected pairs.",
          category: "ai",
          difficulty_level: 3,
          min_age_band: "18+",
          interest_tags: ["pytorch", "rlhf", "dpo", "alignment", "deepmind", "openai"],
          companies: ["Anthropic", "OpenAI", "DeepMind", "Meta"],
          source: "TorchLeet (v3/alignment-training)",
          is_active: true,
          created_at: new Date().toISOString()
        },
        {
          id: "prob-torchleet-grpo",
          title: "GRPO (Group Relative Policy Optimization - DeepSeek-R1)",
          description: "Implement group-relative policy optimization loss with group reward normalization and clipped surrogate objective for reasoning models.",
          category: "ai",
          difficulty_level: 4,
          min_age_band: "18+",
          interest_tags: ["pytorch", "reasoning", "deepseek", "grpo", "rl"],
          companies: ["DeepMind", "Anthropic", "OpenAI"],
          source: "TorchLeet (v3/alignment-training)",
          is_active: true,
          created_at: new Date().toISOString()
        },
        {
          id: "prob-torchleet-triton-softmax",
          title: "Fused Softmax Kernel in Triton",
          description: "Write a high-performance fused softmax GPU kernel in OpenAI Triton with row-wise online normalization and SRAM shared memory caching.",
          category: "engineering",
          difficulty_level: 4,
          min_age_band: "18+",
          interest_tags: ["triton", "gpu-systems", "cuda", "nvidia", "xai"],
          companies: ["NVIDIA", "Meta", "Google", "xAI", "Tesla"],
          source: "TorchLeet (v3/gpu-systems)",
          is_active: true,
          created_at: new Date().toISOString()
        },
        {
          id: "prob-junior-eco-tracker",
          title: "Eco-Friendly Campus Energy Optimizer",
          description: "Design an automated sensor dashboard to detect unnecessary classroom lighting and calculate daily kilowatt savings.",
          category: "sustainability",
          difficulty_level: 1,
          min_age_band: "13-15",
          interest_tags: ["sustainability", "climate", "iot"],
          companies: ["Edworld Community"],
          is_active: true,
          created_at: new Date().toISOString()
        }
      ];

      // Filter fallbacks by category and age-band if needed
      if (category && category !== "all") {
        list = list.filter((p: any) => p.category === category);
      }
      if (actualAgeBand === "13-15") {
        list = list.filter((p: any) => p.min_age_band === "13-15");
      } else if (actualAgeBand === "16-18") {
        list = list.filter((p: any) => p.min_age_band === "13-15" || p.min_age_band === "16-18");
      }
    }

    const now = new Date().getTime();
    const STALE_THRESHOLD_MS = 90 * 24 * 60 * 60 * 1000; // 90 days

    // 4. Personalize Problem Scoring & Sort Order
    const scoredList = list.map((prob) => {
      const lastReviewed = prob.last_reviewed_at ? new Date(prob.last_reviewed_at).getTime() : now;
      const isStale = (now - lastReviewed) > STALE_THRESHOLD_MS;

      let score = 0;
      // Match Interest Tags
      if (prob.interest_tags && Array.isArray(prob.interest_tags)) {
        const matches = prob.interest_tags.filter((tag: string) => userInterests.includes(tag.toLowerCase()));
        score += matches.length * 20;
      }

      // Proximity to user's effective level
      if (prob.difficulty_level === userEffectiveLevel) {
        score += 15;
      }

      return {
        ...prob,
        needs_review: isStale,
        relevance_score: score
      };
    });

    // Sort by personalized relevance desc, then created_at desc
    scoredList.sort((a, b) => b.relevance_score - a.relevance_score || new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json({
      success: true,
      count: scoredList.length,
      problems: scoredList
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, category, interest_tags = [], difficulty_level = 0, min_age_band = "13-15", created_by } = body;

    if (!title || !description || !category) {
      return NextResponse.json({ error: "title, description, and category are required." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("problems")
      .insert({
        title,
        description,
        category,
        interest_tags,
        difficulty_level,
        min_age_band,
        created_by: created_by || null,
        last_reviewed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, problem: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
