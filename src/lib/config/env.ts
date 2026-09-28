/**
 * Central Server-Side Environment Validation Layer
 * Enforces production security, prevents secret leakage, and guards against placeholder credentials.
 */

export interface ServerEnvConfig {
  NODE_ENV: "development" | "production" | "test";
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  ANTHROPIC_API_KEY?: string;
  OPENROUTER_API_KEY?: string;
  GEMINI_API_KEY?: string;
  RAZORPAY_KEY_ID?: string;
  RAZORPAY_KEY_SECRET?: string;
  RESEND_API_KEY?: string;
  NEXT_PUBLIC_APP_DOMAIN: string;
}

const FORBIDDEN_PLACEHOLDER_SUBSTRINGS = [
  "placeholder",
  "fake",
  "demo-key",
  "test-secret",
  "default-key",
  "your-key-here",
  "123456789"
];

export function isInvalidPlaceholder(val?: string): boolean {
  if (!val) return false;
  const lower = val.toLowerCase().trim();
  return FORBIDDEN_PLACEHOLDER_SUBSTRINGS.some(p => lower.includes(p));
}

export const isPlaceholder = isInvalidPlaceholder;


export function validateServerEnv(): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const isProd = process.env.NODE_ENV === "production";

  // 1. Core Supabase Config
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    errors.push("Missing NEXT_PUBLIC_SUPABASE_URL.");
  } else if (isInvalidPlaceholder(supabaseUrl)) {
    errors.push("NEXT_PUBLIC_SUPABASE_URL contains an invalid placeholder value.");
  }

  if (!supabaseAnon) {
    errors.push("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  } else if (isInvalidPlaceholder(supabaseAnon)) {
    errors.push("NEXT_PUBLIC_SUPABASE_ANON_KEY contains an invalid placeholder value.");
  }

  // 2. Service Role Key (Server-only)
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (isProd && !serviceKey) {
    warnings.push("SUPABASE_SERVICE_ROLE_KEY not configured. Administrative elevated bypass tasks will be constrained.");
  } else if (isInvalidPlaceholder(serviceKey)) {
    errors.push("SUPABASE_SERVICE_ROLE_KEY contains an insecure placeholder value.");
  }

  // 3. AI Providers (At least one primary LLM key in production)
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (isInvalidPlaceholder(anthropicKey)) errors.push("ANTHROPIC_API_KEY is an invalid placeholder.");
  if (isInvalidPlaceholder(openrouterKey)) errors.push("OPENROUTER_API_KEY is an invalid placeholder.");
  if (isInvalidPlaceholder(geminiKey)) errors.push("GEMINI_API_KEY is an invalid placeholder.");

  if (isProd && !anthropicKey && !openrouterKey && !geminiKey) {
    warnings.push("No external AI inference API key found (ANTHROPIC_API_KEY / OPENROUTER_API_KEY / GEMINI_API_KEY). Deterministic rule-based evaluation will be used.");
  }

  // 4. Payment Credentials
  const rzpKey = process.env.RAZORPAY_KEY_ID;
  const rzpSecret = process.env.RAZORPAY_KEY_SECRET;
  if (isInvalidPlaceholder(rzpKey)) errors.push("RAZORPAY_KEY_ID contains an invalid placeholder.");
  if (isInvalidPlaceholder(rzpSecret)) errors.push("RAZORPAY_KEY_SECRET contains an invalid placeholder.");

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function getServerEnv(): ServerEnvConfig {
  const validation = validateServerEnv();
  if (!validation.isValid && process.env.NODE_ENV === "production") {
    console.error("[CRITICAL ENV CONFIGURATION FAILURE]:", validation.errors.join("; "));
  }

  return {
    NODE_ENV: (process.env.NODE_ENV as any) || "development",
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    NEXT_PUBLIC_APP_DOMAIN: process.env.NEXT_PUBLIC_APP_DOMAIN || "edworldco.in"
  };
}
