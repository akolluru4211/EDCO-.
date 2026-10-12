/**
 * Myra AI Dataset Loader & Retrieval Layer
 * Consumes Hugging Face 'datasets' exported benchmarks and technical problem sets.
 */

import benchmarkData from "@/lib/ai/data/myra-benchmark-dataset.json";

export interface MyraBenchmarkRecord {
  id: string;
  category: string;
  topic: string;
  question: string;
  ideal_approach: string;
  difficulty: "junior" | "mid" | "senior";
  edge_cases: string[];
}

export interface MyraDatasetPayload {
  generator: string;
  datasets_version: string;
  record_count: number;
  updated_at: string;
  records: MyraBenchmarkRecord[];
}

export class MyraDatasetService {
  private static cachedRecords: MyraBenchmarkRecord[] = (benchmarkData as MyraDatasetPayload).records || [];

  /**
   * Retrieves all benchmark questions from Hugging Face datasets pipeline
   */
  public static getAllRecords(): MyraBenchmarkRecord[] {
    return this.cachedRecords;
  }

  /**
   * Searches benchmark questions by topic or category
   */
  public static findRelevantBenchmarks(query: string, limit: number = 3): MyraBenchmarkRecord[] {
    const q = query.toLowerCase();
    const scored = this.cachedRecords.map((r) => {
      let score = 0;
      if (r.topic.toLowerCase().includes(q)) score += 5;
      if (r.category.toLowerCase().includes(q)) score += 3;
      if (r.question.toLowerCase().includes(q)) score += 4;
      if (r.ideal_approach.toLowerCase().includes(q)) score += 2;
      return { record: r, score };
    });

    return scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((s) => s.record);
  }

  /**
   * Formats relevant dataset examples into prompt grounding block
   */
  public static formatDatasetGroundingPrompt(query: string): string {
    const matches = this.findRelevantBenchmarks(query, 2);
    if (matches.length === 0) return "";

    return `
HUGGING FACE DATASET BENCHMARK GROUNDING (via datasets v${(benchmarkData as MyraDatasetPayload).datasets_version}):
${matches
  .map(
    (m, i) => `[Reference ${i + 1}] Topic: ${m.topic} (${m.difficulty})
Question: ${m.question}
Ideal Technical Approach: ${m.ideal_approach}
Key Failure Modes & Edge Cases: ${m.edge_cases.join("; ")}`
  )
  .join("\n\n")}
`;
  }
}
