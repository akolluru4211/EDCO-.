-- ==============================================================================
-- EDWORLD CO — LIVE DATA TABLES, MCP ENGINE INTEGRATION & DATABASE SEEDING
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. INTERVIEW QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.interview_questions (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  text TEXT NOT NULL,
  difficulty_level INTEGER DEFAULT 0 CHECK (difficulty_level IN (0, 1, 2, 3)),
  key_points JSONB DEFAULT '[]'::jsonb,
  suggested_duration_seconds INTEGER DEFAULT 120,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.interview_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on active interview questions"
ON public.interview_questions FOR SELECT
TO anon, authenticated
USING (is_active = true);

CREATE POLICY "Allow admin manage on interview questions"
ON public.interview_questions FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = (SELECT auth.uid()) 
    AND (profiles.is_admin = true OR profiles.role IN ('ADMIN', 'SUPER_ADMIN'))
  )
);

-- 2. SEED LIVE INTERVIEW QUESTIONS
INSERT INTO public.interview_questions (id, category, text, difficulty_level, key_points, suggested_duration_seconds)
VALUES
  ('swe-0-1', 'Software Engineering', 'Can you explain the difference between synchronous and asynchronous programming, and give a real-world example of when you would use each?', 0, '["Blocking vs non-blocking I/O", "UI responsiveness", "API network requests", "Real-world web or app scenario"]'::jsonb, 120),
  ('swe-0-2', 'Software Engineering', 'What is the Document Object Model (DOM) in web development, and how does React Virtual DOM improve rendering performance?', 0, '["Tree representation of HTML", "Browser reflows", "Reconciliation algorithm", "Batched updates"]'::jsonb, 120),
  ('swe-1-1', 'Software Engineering', 'Walk me through how you would optimize a web application experiencing slow initial page load times and heavy main-thread CPU usage.', 1, '["Profiling & waterfalls", "Asset code-splitting", "Database indexing & caching", "Client re-render reduction"]'::jsonb, 180),
  ('swe-1-2', 'Software Engineering', 'How do you handle database concurrency and race conditions when multiple users attempt to purchase the last available seat on a flight simultaneously?', 1, '["Optimistic vs pessimistic locking", "ACID transactions", "Distributed locks with Redis", "Idempotency keys"]'::jsonb, 180),
  ('swe-2-1', 'Software Engineering', 'Design a globally distributed rate limiter that handles 100,000 requests per second with sub-millisecond latency constraints and high availability.', 2, '["Token bucket / sliding window", "Redis cluster vs local memory", "CAP theorem trade-offs", "Edge gateway rate limiting"]'::jsonb, 240),
  ('beh-0-1', 'General Behavioral & Leadership', 'Tell me about a time you had to learn a new tool, programming language, or technology quickly to complete a project. What steps did you take?', 0, '["Situation context", "Structured self-learning strategy", "Overcoming roadblocks", "Positive project outcome"]'::jsonb, 120),
  ('beh-1-1', 'General Behavioral & Leadership', 'Describe a high-pressure situation where a production incident occurred or a critical deadline was at risk. How did you prioritize and communicate?', 1, '["Triage & root cause analysis", "Blameless post-mortem", "Stakeholder updates", "Long-term preventative fixes"]'::jsonb, 180),
  ('beh-2-1', 'General Behavioral & Leadership', 'How do you navigate a strategic disagreement between engineering feasibility and aggressive product timelines when executive leadership is pushing for launch?', 2, '["Quantifying technical debt", "Phased MVP negotiation", "Data-driven communication", "Alignment on success metrics"]'::jsonb, 240),
  ('pm-1-1', 'Product Management', 'How would you measure the success of an AI-assisted job matching feature and prioritize candidate feedback loops?', 1, '["North star metric", "Retention & conversion", "A/B testing", "Qualitative feedback"]'::jsonb, 180),
  ('ds-1-1', 'Data Science & AI', 'How do you detect and mitigate embedding drift in a production semantic retrieval pipeline over time?', 1, '["Vector similarity thresholds", "Data distribution shift", "Model fine-tuning", "Continuous evaluation benchmarks"]'::jsonb, 180)
ON CONFLICT (id) DO UPDATE SET
  text = EXCLUDED.text,
  key_points = EXCLUDED.key_points,
  suggested_duration_seconds = EXCLUDED.suggested_duration_seconds,
  updated_at = NOW();

-- 3. SEED LIVE PROBLEMS
INSERT INTO public.problems (id, title, description, category, difficulty_level, min_age_band, interest_tags, is_active, created_at, last_reviewed_at)
VALUES
  ('prob-torchleet-lora', 'Implement LoRA (Low-Rank Adaptation) in PyTorch', 'Implement a custom nn.Module for LoRA linear layers with trainable A and B rank decomposition matrices, alpha scaling factor, and zero-init initialization.', 'ai', 2, '18+', '["pytorch", "deep-learning", "transformers", "lora", "meta", "openai", "anthropic"]'::jsonb, true, NOW(), NOW()),
  ('prob-torchleet-kvcache', 'Implement KV Cache for LLM Token Generation', 'Implement an efficient Key-Value cache in PyTorch that avoids quadratic re-computation of attention keys and values across autoregressive generation steps.', 'ai', 2, '18+', '["pytorch", "llm-inference", "kv-cache", "anthropic", "openai", "perplexity"]'::jsonb, true, NOW(), NOW()),
  ('prob-torchleet-dpo', 'Direct Preference Optimization (DPO) Loss', 'Implement the closed-form DPO loss function in PyTorch comparing policy model log-probabilities against reference model log-probabilities on chosen vs rejected pairs.', 'ai', 3, '18+', '["pytorch", "rlhf", "dpo", "alignment", "deepmind", "openai"]'::jsonb, true, NOW(), NOW()),
  ('prob-torchleet-grpo', 'GRPO (Group Relative Policy Optimization - DeepSeek-R1)', 'Implement group-relative policy optimization loss with group reward normalization and clipped surrogate objective for reasoning models.', 'ai', 4, '18+', '["pytorch", "reasoning", "deepseek", "grpo", "rl"]'::jsonb, true, NOW(), NOW()),
  ('prob-torchleet-triton-softmax', 'Fused Softmax Kernel in Triton', 'Write a high-performance fused softmax GPU kernel in OpenAI Triton with row-wise online normalization and SRAM shared memory caching.', 'engineering', 4, '18+', '["triton", "gpu-systems", "cuda", "nvidia", "xai"]'::jsonb, true, NOW(), NOW()),
  ('prob-junior-eco-tracker', 'Eco-Friendly Campus Energy Optimizer', 'Design an automated sensor dashboard to detect unnecessary classroom lighting and calculate daily kilowatt savings.', 'sustainability', 1, '13-15', '["sustainability", "climate", "iot"]'::jsonb, true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  interest_tags = EXCLUDED.interest_tags,
  last_reviewed_at = NOW();

-- 4. SEED LIVE VERIFIED JOBS
INSERT INTO public.jobs (id, title, company, description, location, type, skills_required, salary_range, is_active, moderation_status, created_at)
VALUES
  ('job-live-001', 'Full-Stack Software Engineer (Next.js & Supabase)', 'NexCorp Technologies', 'Join our core platform engineering team building scalable real-time applications with Next.js App Router, Supabase Postgres, and TypeScript.', 'Remote (India / Global)', 'full_time', '["React", "Next.js", "TypeScript", "PostgreSQL", "Supabase", "REST APIs"]'::jsonb, '?14,00,000 - ?22,00,000 / year', true, 'approved', NOW()),
  ('job-live-002', 'AI & Machine Learning Engineer', 'Aether Dynamics', 'Develop and optimize LLM fine-tuning, RAG retrieval pipelines, and high-throughput model inference infrastructure.', 'Bengaluru, India (Hybrid)', 'full_time', '["Python", "PyTorch", "Transformers", "RAG", "FastAPI", "Docker"]'::jsonb, '?18,00,000 - ?30,00,000 / year', true, 'approved', NOW()),
  ('job-live-003', 'Junior Frontend Developer Intern', 'PixelForge Interactive', 'Exciting 6-month paid engineering internship working on responsive UI components, Tailwind styling, and accessibility optimization.', 'Hyderabad, India (Remote Available)', 'internship', '["JavaScript", "React", "HTML5", "CSS3", "Tailwind CSS", "Git"]'::jsonb, '?35,000 - ?50,000 / month', true, 'approved', NOW()),
  ('job-live-004', 'Cloud Infrastructure & DevOps Engineer', 'ScaleGrid Systems', 'Maintain Kubernetes clusters, automate Terraform provisioning, and optimize CI/CD pipelines across AWS and GCP environments.', 'Pune, India (Hybrid)', 'full_time', '["Kubernetes", "Docker", "AWS", "Terraform", "CI/CD", "Linux"]'::jsonb, '?16,00,000 - ?26,00,000 / year', true, 'approved', NOW())
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  company = EXCLUDED.company,
  skills_required = EXCLUDED.skills_required,
  salary_range = EXCLUDED.salary_range,
  is_active = true,
  moderation_status = 'approved';
