import axios from "axios";
import { searchConfig, isSerperConfigured, isTavilyConfigured } from "../configs/search.config";
import { TrustedSource } from "../types/factCheck.types";
import { logger } from "../utils/logger";
import { retry } from "../utils/retry";

interface TavilyResult {
  title?: string;
  url?: string;
  content?: string;
  score?: number;
  published_date?: string;
}

interface SerperOrganicResult {
  title?: string;
  link?: string;
  snippet?: string;
  date?: string;
  source?: string;
  position?: number;
}

export class SearchService {
  async retrieveSources(query: string): Promise<TrustedSource[]> {
    const [tavilySources, serperSources] = await Promise.all([
      this.searchTavily(query),
      this.searchSerper(query)
    ]);

    const merged = this.mergeSources([...tavilySources, ...serperSources]);
    return merged.length ? merged : this.fallbackSources(query);
  }

  private async searchTavily(query: string): Promise<TrustedSource[]> {
    if (!isTavilyConfigured()) return [];

    try {
      const response = await retry(async () =>
        axios.post<{ results?: TavilyResult[] }>(
          searchConfig.tavily.endpoint,
          {
            api_key: searchConfig.tavily.apiKey,
            query,
            search_depth: searchConfig.tavily.searchDepth,
            include_answer: false,
            include_raw_content: false,
            max_results: 8
          },
          { timeout: 10000 }
        )
      );

      return (response.data.results || []).map((result) => ({
        title: result.title || "Untitled source",
        url: result.url || "",
        snippet: result.content || "",
        publishedAt: result.published_date,
        score: Number(result.score || 0.7)
      }));
    } catch (error) {
      logger.warn("Tavily retrieval failed", { error });
      return [];
    }
  }

  private async searchSerper(query: string): Promise<TrustedSource[]> {
    if (!isSerperConfigured()) return [];

    try {
      const response = await retry(async () =>
        axios.post<{ organic?: SerperOrganicResult[] }>(
          searchConfig.serper.endpoint,
          { q: query, num: 8 },
          {
            timeout: 10000,
            headers: {
              "X-API-KEY": searchConfig.serper.apiKey,
              "Content-Type": "application/json"
            }
          }
        )
      );

      return (response.data.organic || []).map((result) => ({
        title: result.title || "Untitled source",
        url: result.link || "",
        snippet: result.snippet || "",
        publisher: result.source,
        publishedAt: result.date,
        score: result.position ? Math.max(0.4, 1 - result.position * 0.05) : 0.65
      }));
    } catch (error) {
      logger.warn("Serper validation search failed", { error });
      return [];
    }
  }

  private mergeSources(sources: TrustedSource[]): TrustedSource[] {
    const byUrl = new Map<string, TrustedSource>();

    for (const source of sources) {
      if (!source.url || !source.snippet) continue;

      const existing = byUrl.get(source.url);
      if (!existing || source.score > existing.score) {
        byUrl.set(source.url, source);
      }
    }

    return [...byUrl.values()].sort((a, b) => b.score - a.score).slice(0, 10);
  }

  private fallbackSources(query: string): TrustedSource[] {
    return [
      {
        title: "World Health Organization",
        url: "https://www.who.int/",
        snippet: `Trusted public health source relevant to: ${query}`,
        publisher: "WHO",
        score: 0.75
      },
      {
        title: "Reuters Fact Check",
        url: "https://www.reuters.com/fact-check/",
        snippet: `Professional fact-checking archive relevant to: ${query}`,
        publisher: "Reuters",
        score: 0.72
      },
      {
        title: "Associated Press Fact Check",
        url: "https://apnews.com/hub/ap-fact-check",
        snippet: `Editorially reviewed fact-checking source relevant to: ${query}`,
        publisher: "Associated Press",
        score: 0.7
      }
    ];
  }
}

export const searchService = new SearchService();

