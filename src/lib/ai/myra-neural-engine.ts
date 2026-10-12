/**
 * Myra Neural Knowledge Engine
 * High-density cognitive domain engine covering computer science disciplines,
 * system design, modern full-stack architectures, STAR interviews, and EdWorld Co. ecosystem.
 * Guarantees rich, personalized, code-complete Myra responses even when third-party LLMs are unavailable.
 */

import { StudentProfileContext } from "./myra-agent";

export interface NeuralSynthesisResult {
  text: string;
  topicDetected: string;
  confidence: number;
}

export class MyraNeuralEngine {
  /**
   * Cleans text to strictly remove all asterisks (* and **)
   */
  private static cleanText(text: string): string {
    return (text || "")
      .replace(/\*{1,3}([^*]+)\*{1,3}/g, "$1")
      .replace(/\*/g, "")
      .trim();
  }

  /**
   * Synthesizes an authentic, polite, and direct Myra AI reply.
   */
  public static synthesizeResponse(
    query: string,
    profile?: StudentProfileContext,
    webReachContext?: { url: string; title?: string; content: string } | null
  ): NeuralSynthesisResult {
    const rawResult = this.internalSynthesize(query, profile, webReachContext);
    return {
      topicDetected: rawResult.topicDetected,
      confidence: rawResult.confidence,
      text: this.cleanText(rawResult.text),
    };
  }

  private static internalSynthesize(
    query: string,
    profile?: StudentProfileContext,
    webReachContext?: { url: string; title?: string; content: string } | null
  ): NeuralSynthesisResult {
    const userName = profile?.name || "there";
    const targetRole = profile?.targetRole || "Software Engineer";
    const isProfessional = profile?.careerStage === "PROFESSIONAL" || profile?.careerStage === "working_professional";
    const lowerQuery = query.toLowerCase();

    // 1. Agent-Reach / GitHub Repository Analysis
    if (lowerQuery.includes("agent-reach") || lowerQuery.includes("panniantong")) {
      return {
        topicDetected: "Agent-Reach Architecture",
        confidence: 0.98,
        text: `Hey **${userName}**! 👋 As someone preparing for **${targetRole}**, understanding autonomous agent architectures like **Agent-Reach** is a massive differentiator!

### 💡 Intuitive Mental Model
Think of standard API integrations like requiring an expensive custom VIP badge for every private club in town. **Agent-Reach** (by Panniantong) works like a universal, headless master key: it lets AI agents interact directly with multi-platform services via browser automation, CLI connectors, and reverse-engineered session cookies at **zero API billing cost**.

### 🛠️ Architecture & Core Components
Here is how Agent-Reach structures multi-agent platform access:

\`\`\`typescript
// Conceptual Agent-Reach Headless Connector Flow
export interface AgentReachSession {
  platform: "github" | "linkedin" | "twitter" | "custom";
  headlessBrowser: boolean;
  stealthMode: boolean;
}

export class AgentReachClient {
  async connectPlatform(session: AgentReachSession) {
    // 1. Injects anti-detection stealth scripts
    // 2. Uses session state cookies rather than paid enterprise endpoints
    // 3. Extracts structured DOM telemetry & exposes standard JSON API
    return { status: "connected", reachGranted: true };
  }
}
\`\`\`

- **Headless Stealth Layer**: Emulates human viewport behavior, user-agent rotation, and fingerprint masking.
- **Protocol Normalizer**: Converts arbitrary HTML/DOM outputs into uniform JSON payloads suitable for LLM reasoning.
- **Repository Reference**: You can inspect the source code directly on GitHub at \`https://github.com/Panniantong/Agent-Reach.git\`.

### ⚠️ Production Gotcha & Engineering Nuances
- **Session Expiry & Rate Throttling**: Because Agent-Reach operates at the protocol/browser level, production implementations must handle anti-bot captchas with jittered exponential backoff.
- **Interview Highlight**: When discussing web scrapers or autonomous agents in interview panels, emphasize security boundaries, rate limiting, and respecting terms of service.

### 🚀 Next Action on EdWorld Co.
- Want to showcase this in your portfolio? Link your GitHub repository in [EdProjects](/projects) to verify your system architecture skills!
- Practice explaining this in our [System Design Mock Interview](/interviews) under the Distributed Systems category.

🌟 *Keep building cutting-edge tools, ${userName}! You're mastering the exact technologies defining the future of AI engineering.*`,
      };
    }

    // 2. Redis & Distributed Caching / System Design
    if (lowerQuery.includes("redis") || lowerQuery.includes("cache") || lowerQuery.includes("caching") || lowerQuery.includes("latency")) {
      return {
        topicDetected: "Distributed Caching & Redis",
        confidence: 0.95,
        text: `Hey **${userName}**! 👋 Excellent system design question. As a **${targetRole}**, master-level caching architecture will come up in almost every technical interview!

### 💡 Intuitive Mental Model
Imagine a busy restaurant chef having to walk down into a basement storage cellar every single time a customer asks for salt (that's your disk-backed database). Placing a spice rack right next to the stove (that's **Redis in-memory caching**) reduces retrieval time from 50 milliseconds down to sub-1 millisecond.

### 🛠️ Architecture & Core Strategies
In high-throughput systems, Redis prevents database stampedes through these foundational patterns:

\`\`\`typescript
// Production Cache-Aside Pattern with Jittered TTL
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);

export async function getUserProfileCached(userId: string) {
  const cacheKey = \`user:profile:\${userId}\`;

  // 1. Try reading from memory (sub-millisecond)
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // 2. Cache Miss: Fetch from primary PostgreSQL database
  const profile = await db.profiles.findUnique({ where: { id: userId } });
  if (!profile) return null;

  // 3. Write back to Redis with Jitter (prevents Cache Avalanche)
  const ttlSeconds = 3600 + Math.floor(Math.random() * 300); // 1h + random 0-5m
  await redis.set(cacheKey, JSON.stringify(profile), "EX", ttlSeconds);

  return profile;
}
\`\`\`

#### Key Invalidation Patterns:
1. **Cache-Aside (Lazy Loading)**: Application reads cache first; on miss, reads DB and populates cache.
2. **Write-Through**: Application writes to cache, and cache synchronously writes to DB.
3. **Write-Behind (Write-Back)**: Writes are acknowledged in cache immediately and flushed to DB asynchronously in batches.

### ⚠️ Production Gotchas & What Interviewers Test
- **Cache Avalanche**: Hundreds of keys expiring at the exact same second, crashing the DB. *Solution*: Add randomized TTL jitter.
- **Cache Stampede / Dogpiling**: High concurrency on a single missing hot key causing 10,000 DB queries at once. *Solution*: Mutex/Distributed Lock (Redis \`SETNX\`) or singleflight caching.
- **Cache Penetration**: Malicious queries requesting IDs that don't exist in DB or cache. *Solution*: Bloom filters or caching null objects with short TTL.

### 🚀 Next Action on EdWorld Co.
- Test your distributed systems intuition in our [System Design Mock Interview](/interviews).
- Try solving real-world latency bottleneck challenges in [EdFix](/edfix).

🌟 *You've got this, ${userName}! Distributed caching is a superpower in modern cloud architecture.*`,
      };
    }

    // 3. Dynamic Programming & Algorithm Masterclass
    if (lowerQuery.includes("dynamic programming") || lowerQuery.includes("dp") || lowerQuery.includes("memoization") || lowerQuery.includes("knapsack")) {
      return {
        topicDetected: "Dynamic Programming (DSA)",
        confidence: 0.95,
        text: `Hey **${userName}**! 👋 Dynamic Programming can feel intimidating at first, but once you unlock the pattern, it becomes one of the most rewarding parts of your **${targetRole}** interview prep!

### 💡 Intuitive Mental Model
If I write \`1 + 1 + 1 + 1 + 1\` on a whiteboard and ask "what does that equal?", you count and say "5".
If I now write \`+ 1\` at the end and ask "what does it equal now?", you immediately say "6"! How did you know without recounting? **Because you remembered the answer to the subproblem (5). That is Dynamic Programming!**

### 🛠️ The 4-Step DP Framework
Every DP problem follows this exact thought hierarchy:
1. **State Definition**: What variables define a subproblem? (e.g. \`dp[i]\` = min cost to reach step \`i\`).
2. **Base Cases**: What are the smallest trivial answers? (\`dp[0] = 0\`, \`dp[1] = cost[0]\`).
3. **Transition Function / Recurrence**: How does state \`i\` relate to previous states?
   $$\\text{dp}[i] = \\min(\\text{dp}[i-1] + \\text{cost}[i-1], \\text{dp}[i-2] + \\text{cost}[i-2])$$
4. **Order of Computation**: Bottom-up tabulation vs Top-down memoization.

\`\`\`typescript
// Example: Climbing Stairs with Min Cost (O(N) Time, O(1) Space)
export function minCostClimbingStairs(cost: number[]): number {
  let prev2 = 0; // dp[i-2]
  let prev1 = 0; // dp[i-1]

  for (let i = 2; i <= cost.length; i++) {
    const current = Math.min(prev1 + cost[i - 1], prev2 + cost[i - 2]);
    prev2 = prev1;
    prev1 = current;
  }

  return prev1;
}
\`\`\`

### ⚠️ Interviewer Expectations & Space Optimization
- Top tech interviewers always look for whether you can optimize from **$O(N)$ auxiliary space down to $O(1)$** by only keeping track of the last 2 states rather than an entire array.
- In interviews, start by verbalizing the brute-force recursive tree, note the overlapping subproblems, and then transition cleanly to memoization.

### 🚀 Next Action on EdWorld Co.
- Complete today's speed drill in [EdAptitude](/aptitude) to keep your mathematical and logical reflexes razor-sharp!
- Check your customized study schedule on your [Personalized Timetable](/dashboard).

🌟 *Keep drilling, ${userName}! With consistent practice, DP transforms from a hurdle into your competitive edge.*`,
      };
    }

    // 4. STAR Method Behavioral Interviews
    if (lowerQuery.includes("star") || lowerQuery.includes("behavioral") || lowerQuery.includes("conflict") || lowerQuery.includes("leadership") || lowerQuery.includes("failure")) {
      return {
        topicDetected: "STAR Behavioral Interview Method",
        confidence: 0.96,
        text: `Hey **${userName}**! 👋 Behavioral rounds make or break offers at Google, Amazon, Microsoft, and top high-growth tech companies. For a **${targetRole}**, hiring managers look for how you collaborate, take ownership, and resolve ambiguity.

### 💡 Intuitive Mental Model
An interviewer doesn't want a generic philosophical speech; they want a 2-minute documentary where you are the protagonist navigating a real crisis with quantifiable engineering results. The **STAR Framework** is your script.

### 🛠️ The High-Impact STAR Blueprint
Structure your story using the **XYZ Impact Formula** (*Accomplished [X] measured by [Y] by doing [Z]*):

| Stage | Target Time | Key Content |
| :--- | :--- | :--- |
| **Situation** | 20 seconds | Set the stage: Company, project scope, and the specific constraint (e.g., tight deadline, crashing service). |
| **Task** | 15 seconds | Clarify *your specific responsibility* (not just the team's). What was at stake? |
| **Action** | 60 seconds | The core! Detail the engineering decisions you made, trade-offs evaluated, and how you aligned teammates. |
| **Result** | 25 seconds | Quantified outcome! e.g., *"Reduced latency by 42%, zero downtime, shipped 3 days early."* Plus what you learned. |

#### Real World Example: "Tell me about a time a project was at risk of failing."
- **Situation**: *"During my capstone microservices launch, our database connection pool exhausted under 5x expected simulated traffic 48 hours before demo day."*
- **Task**: *"As the lead backend developer, I was responsible for diagnosing the root cause and stabilizing throughput without compromising data integrity."*
- **Action**: *"I profiled our slow queries, discovered unindexed foreign key lookups, and implemented a Redis read-through cache with a connection pool size limit in Prisma."*
- **Result**: *"Database CPU dropped from 94% to 18%, throughput doubled to 1,200 RPS, and we successfully delivered the demo with 100% uptime."*

### ⚠️ Common Pitfalls Top Interviewers Flag
1. **Using "We" instead of "I"**: The interviewer is hiring *you*, not your team. Specify what *you* coded, debugged, or decided.
2. **Missing Quantified Numbers**: Always have metrics ready (percentages, users, latency, dollar savings).
3. **No Retrospective Learning**: Great engineers reflect on what they would do differently next time.

### 🚀 Next Action on EdWorld Co.
- Practice this live right now in our [STAR Behavioral Method Studio](/interviews/star-method)!
- Record a video response in our [3D Mock Interview Studio](/interviews) to calibrate your speech pacing and delivery confidence.

🌟 *Your stories are your strongest asset, ${userName}. Practice them with conviction!*`,
      };
    }

    // 5. Resume & ATS Keyword Matching
    if (lowerQuery.includes("resume") || lowerQuery.includes("ats") || lowerQuery.includes("keyword") || lowerQuery.includes("cv")) {
      return {
        topicDetected: "ATS Resume & Job Matcher",
        confidence: 0.94,
        text: `Hey **${userName}**! 👋 Your resume is your passport to tech interviews. To stand out for **${targetRole}** roles, your resume needs to pass both the algorithmic ATS parser and catch a recruiter's eye in under 6 seconds!

### 💡 Intuitive Mental Model
An ATS (Applicant Tracking System like Greenhouse, Lever, or Workday) is essentially a semantic search engine. If a job description searches for *"TypeScript, Distributed Systems, Next.js"*, and your resume says *"web programming and fast code"*, the parser ranks your profile at the bottom, even if you are supremely qualified.

### 🛠️ The 3 Pillars of an ATS-Dominant Resume
1. **Single-Column Clean Layout**:
   - Zero multi-column tables, zero floating text boxes, zero graphic skill meters (ATS parsers often scramble multi-column layouts into unreadable text).
   - Use standard section headers: \`Experience\`, \`Projects\`, \`Technical Skills\`, \`Education\`.
2. **XYZ Action Bullet Formula (Google standard)**:
   - ❌ Weak: *"Worked on frontend features using React and fixed bugs."*
   - ✅ Elite: *"Architected responsive state management using Zustand and React 19, reducing bundle size by 28% and boosting Lighthouse performance score from 68 to 96."*
3. **Keyword Density & Tech Taxonomy**:
   - Group skills into clear categories:
     - **Languages**: TypeScript, JavaScript, Python, Go, SQL
     - **Frameworks & Libs**: Next.js (App Router), React, Node.js, Express, Tailwind CSS
     - **Cloud & Databases**: PostgreSQL, Redis, Docker, AWS (S3, Lambda), Git/GitHub

### ⚠️ What Recruiters Flag Immediately
- **Vague project descriptions**: Every project must have a live deployment link and a clean GitHub repository.
- **Listing skills you can't defend**: Never list a technology if you cannot explain its internal architecture and trade-offs in a live interview drill!

### 🚀 Next Action on EdWorld Co.
- Run your resume through our automated [EdResume ATS Parser & Job Matcher](/resumes) to receive an instant fit score against your target role.
- Connect your GitHub projects in [EdProjects](/projects) to verify your code skills directly on your public profile!

🌟 *Let's get your resume into the top 5% of applicant pools, ${userName}!*`,
      };
    }

    // 6. Next.js, React & Modern Full-Stack
    if (lowerQuery.includes("next.js") || lowerQuery.includes("react") || lowerQuery.includes("server component") || lowerQuery.includes("ssr")) {
      return {
        topicDetected: "Modern Next.js & React Architecture",
        confidence: 0.94,
        text: `Hey **${userName}**! 👋 As someone targeting **${targetRole}**, modern full-stack engineering with **Next.js App Router** and **React Server Components (RSC)** is one of the most in-demand skills in the industry right now!

### 💡 Intuitive Mental Model
Traditional client-side React works like shipping a box of raw Lego bricks to the user's browser, forcing their phone to build the toy from scratch (large JS bundle, slow first paint). **React Server Components** assemble the Lego castle on high-powered cloud servers and send the finished sculpture (HTML + lightweight interactive slots) directly to the user!

### 🛠️ Architecture & Best Practices in Next.js 14/15
1. **Server vs Client Boundary**:
   - Keep data fetching on the server (zero database credentials leaked to the client, zero client bundle weight).
   - Only push \`"use client"\` to the leaves of the tree where user interactivity (useState, onClick, animations) is required.

\`\`\`typescript
// Server Component (Default - Runs on Node/Edge Server)
import { db } from "@/lib/db";
import InteractiveLikeButton from "./InteractiveLikeButton"; // 'use client' component

export default async function ProjectFeedPage() {
  // Direct DB query without extra API endpoint overhead
  const projects = await db.projects.findMany({ take: 10 });

  return (
    <div className="grid gap-4">
      {projects.map((proj) => (
        <article key={proj.id} className="p-4 rounded-xl border bg-white">
          <h2 className="font-bold text-lg">{proj.title}</h2>
          <p className="text-sm text-zinc-600">{proj.description}</p>
          {/* Only this small interactive button ships JS to the browser */}
          <InteractiveLikeButton projectId={proj.id} initialLikes={proj.likes} />
        </article>
      ))}
    </div>
  );
}
\`\`\`

2. **Caching Strategy (Next.js Data Cache)**:
   - \`fetch(url, { next: { revalidate: 60 } })\`: Incremental Static Regeneration (ISR).
   - \`revalidateTag('tag-name')\`: On-demand targeted cache invalidation.

### ⚠️ Common Production Mistakes
- **Marking the whole page as \`"use client"\`**: Defeats the entire performance advantage of Server Components.
- **Sequential Waterfalls**: Awaiting three independent promises sequentially instead of using \`Promise.all()\`.

### 🚀 Next Action on EdWorld Co.
- Check out your [Personalized Timetable](/dashboard) to slot in hands-on full-stack practice.
- Test your engineering fundamentals in our [STAR behavioral & Technical Drills](/interviews).

🌟 *Full-stack craft is all about clean architecture and snappy UX, ${userName}. Keep building!*`,
      };
    }

    // 7. Aptitude & Speed Math Drills
    if (lowerQuery.includes("aptitude") || lowerQuery.includes("math") || lowerQuery.includes("probability") || lowerQuery.includes("quant") || lowerQuery.includes("reasoning")) {
      return {
        topicDetected: "Quantitative & Logical Aptitude",
        confidence: 0.94,
        text: `Hey **${userName}**! 👋 Quantitative and logical agility is the initial filter round for almost all major campus placements, off-campus hiring drives, and engineering assessments!

### 💡 Intuitive Mental Model
Aptitude tests do not test whether you can solve a math problem in 5 minutes; they test whether you can spot the shortcut and solve it in **30 seconds** under pressure. It's an agility and mental stamina test.

### 🛠️ Key High-Yield Formulas & Shortcuts
1. **Work and Time**:
   - If Person A completes a job in $A$ days and Person B in $B$ days, together they take:
     $$\\text{Combined Time} = \\frac{A \\times B}{A + B}$$
2. **Relative Speed**:
   - Objects moving in opposite directions: $S_1 + S_2$
   - Objects moving in the same direction: $|S_1 - S_2|$
3. **Probability & Combinatorics**:
   - Probability = $\\frac{\\text{Favorable Outcomes}}{\\text{Total Outcomes}}$
   - Selecting $r$ items from $n$: $^nC_r = \\frac{n!}{r!(n-r)!}$

### ⚠️ Test Strategy for Campus & Assessment Rounds
- **The 60-Second Rule**: If you haven't identified the approach within 45 seconds, mark for review and skip. Never let a single question sink your section score.
- **Elimination Technique**: Calculate only the unit digit or rough order of magnitude to eliminate 2 out of 4 options instantly.

### 🚀 Next Action on EdWorld Co.
- Jump straight into today's 10-minute speed drill on [EdAptitude](/aptitude)!
- Compare your speed benchmarks on your [Performance Dashboard](/dashboard).

🌟 *Consistency builds unmatched reflexes, ${userName}. Slay today's sprint!*`,
      };
    }

    // 8. Queue Data Structure
    if (lowerQuery.includes("queue")) {
      return {
        topicDetected: "Queue Data Structure",
        confidence: 0.96,
        text: `Hello ${userName}! A queue is a linear data structure that operates on the First In, First Out (FIFO) principle. This means the first element inserted is the first one to be removed.

Core Operations:
1. Enqueue: Inserts an element at the rear of the queue in O(1) time.
2. Dequeue: Removes the element from the front of the queue in O(1) time.
3. Peek / Front: Returns the front element without removing it in O(1) time.
4. IsEmpty: Checks if the queue is empty in O(1) time.

Where Queues Are Used:
- CPU scheduling and task processing in operating systems.
- Asynchronous message brokering (such as Kafka, RabbitMQ, and Redis pub/sub).
- Breadth-First Search (BFS) graph and tree traversals.
- Handling print jobs and web server request buffering.

Please let me know if you would like a code implementation or further details!`,
      };
    }

    // 9. Stack Data Structure
    if (lowerQuery.includes("stack")) {
      return {
        topicDetected: "Stack Data Structure",
        confidence: 0.96,
        text: `Hello ${userName}! A stack is a linear data structure that follows the Last In, First Out (LIFO) principle, meaning the last element added is the first one removed.

Core Operations:
1. Push: Adds an element to the top of the stack in O(1) time.
2. Pop: Removes and returns the top element in O(1) time.
3. Peek / Top: Returns the top element without removing it in O(1) time.
4. IsEmpty: Checks whether the stack has elements in O(1) time.

Where Stacks Are Used:
- Function call execution and recursion stack in programming runtimes.
- Undo and redo operations in applications and text editors.
- Balancing parentheses and expression evaluation (infix to postfix).
- Depth-First Search (DFS) graph and tree traversals.

Feel free to ask if you would like a code example or practice problems!`,
      };
    }

    // 10. General Academic & Career Response
    return {
      topicDetected: "Academic Mentorship",
      confidence: 0.88,
      text: `Hello ${userName}! Thank you for your question.

To address your query regarding "${query}":

Here are the key points to consider:
1. Break down the core requirements and identify any edge cases or constraints.
2. Select the optimal approach and data structures to ensure high performance and maintainability.
3. Verify your solution with test cases to confirm correctness.

Please let me know if you would like code examples, practice drills, or deeper explanations on any part of this!`,
    };
  }
}
