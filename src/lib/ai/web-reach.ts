/**
 * Web & Repository Reach Engine for Myra AI
 * Dynamically resolves URLs, GitHub repositories (e.g. Panniantong/Agent-Reach),
 * and live Google / Web Search to provide grounded, real-time answers.
 */

export interface WebReachResult {
  url: string;
  sourceType: "github_repo" | "web_article" | "documentation" | "web_search";
  title?: string;
  content: string;
  isExtracted: boolean;
}

/**
 * Extract all HTTP/HTTPS URLs from a text prompt.
 */
export function extractUrlsFromText(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  const matches = text.match(urlRegex);
  if (!matches) return [];
  // Strip trailing punctuation like period, comma, closing parenthesis
  return matches.map((url) => url.replace(/[),.;!]+$/, ""));
}

/**
 * Parse a GitHub URL to extract owner and repository name.
 */
export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)/i);
  if (!match) return null;
  const owner = match[1];
  const repo = match[2].replace(/\.git$/i, "");
  return { owner, repo };
}

/**
 * Fetch raw README or code content for a GitHub repository.
 */
async function fetchGitHubRepoDetails(owner: string, repo: string): Promise<string | null> {
  const branches = ["main", "master"];
  for (const branch of branches) {
    try {
      const readmeUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/README.md`;
      const res = await fetch(readmeUrl, {
        headers: { "User-Agent": "EdworldCo-Myra-Tutor" },
        signal: AbortSignal.timeout(6000),
      });

      if (res.ok) {
        const text = await res.text();
        if (text && text.trim().length > 20) {
          // If the readme has an English translation link, try to check if docs/README_en.md exists
          if (text.includes("README_en.md")) {
            try {
              const enRes = await fetch(
                `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/docs/README_en.md`,
                { signal: AbortSignal.timeout(4000) }
              );
              if (enRes.ok) {
                const enText = await enRes.text();
                return `Repository: ${owner}/${repo}\n\n${enText}\n\n[Original README snippet]:\n${text.slice(0, 1000)}`;
              }
            } catch (e) {}
          }
          return `Repository: ${owner}/${repo}\n\n${text.slice(0, 10000)}`;
        }
      }
    } catch (e) {
      // Continue to next branch
    }
  }
  return null;
}

/**
 * Fetch live content using Jina Reader (https://r.jina.ai/{url})
 */
async function fetchViaJinaReader(url: string): Promise<string | null> {
  try {
    const jinaUrl = `https://r.jina.ai/${url}`;
    const res = await fetch(jinaUrl, {
      headers: {
        "User-Agent": "EdworldCo-Myra-Tutor",
        "Accept": "text/markdown",
      },
      signal: AbortSignal.timeout(6000),
    });

    if (res.ok) {
      const markdown = await res.text();
      return markdown.slice(0, 8000);
    }
  } catch (e) {
    // Ignore and fallback
  }
  return null;
}

/**
 * Execute live web search using Jina Search API (https://s.jina.ai/{query})
 */
async function searchWebQuery(query: string): Promise<string | null> {
  try {
    const cleanQuery = query
      .replace(/^(search|lookup|find|browse|google|tell me about|what is|how to)\s+/i, "")
      .trim();
    const searchUrl = `https://s.jina.ai/${encodeURIComponent(cleanQuery)}`;
    const res = await fetch(searchUrl, {
      headers: {
        "User-Agent": "EdworldCo-Myra-Tutor",
        "Accept": "text/markdown",
      },
      signal: AbortSignal.timeout(6500),
    });

    if (res.ok) {
      const searchMarkdown = await res.text();
      if (searchMarkdown && searchMarkdown.length > 50) {
        return searchMarkdown.slice(0, 6000);
      }
    }
  } catch (e) {
    // Graceful fallback
  }
  return null;
}

/**
 * Main Web Reach resolver: Extracts live content for any URL or executes live web search.
 */
export async function resolveWebReach(query: string): Promise<WebReachResult | null> {
  // 1. Check if user provided direct URLs
  const urls = extractUrlsFromText(query);
  if (urls.length > 0) {
    const targetUrl = urls[0];
    const github = parseGitHubUrl(targetUrl);

    if (github) {
      const repoContent = await fetchGitHubRepoDetails(github.owner, github.repo);
      if (repoContent) {
        return {
          url: targetUrl,
          sourceType: "github_repo",
          title: `${github.owner}/${github.repo} (GitHub)`,
          content: repoContent,
          isExtracted: true,
        };
      }
    }

    // Fallback to Jina Reader for general URLs
    const jinaContent = await fetchViaJinaReader(targetUrl);
    if (jinaContent) {
      return {
        url: targetUrl,
        sourceType: "web_article",
        title: targetUrl,
        content: jinaContent,
        isExtracted: true,
      };
    }
  }

  // 2. Check if the query is an explicit search or technical inquiry needing live knowledge
  const lower = query.toLowerCase();
  const isSearchIntent =
    lower.startsWith("search") ||
    lower.startsWith("lookup") ||
    lower.startsWith("browse") ||
    lower.startsWith("google") ||
    lower.includes("latest") ||
    lower.includes("news") ||
    lower.includes("documentation") ||
    lower.includes("trend") ||
    lower.includes("hiring for") ||
    lower.includes("salary for");

  if (isSearchIntent) {
    const searchResults = await searchWebQuery(query);
    if (searchResults) {
      return {
        url: "https://google.com/search?q=" + encodeURIComponent(query),
        sourceType: "web_search",
        title: `Live Search: "${query.slice(0, 40)}"`,
        content: searchResults,
        isExtracted: true,
      };
    }
  }

  return null;
}
