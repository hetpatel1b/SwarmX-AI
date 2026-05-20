import { createSearchClient } from "../configs/azure.config";
import { TrustedSource } from "../types/factCheck.types";
import { logger } from "../utils/logger";
import { retry } from "../utils/retry";

export class AzureSearchService {
  private readonly client = createSearchClient();

  async retrieveSources(query: string): Promise<TrustedSource[]> {
    if (!this.client) return this.fallbackSources(query);

    try {
      const results = await retry(async () =>
        this.client!.search(query, {
          top: 8,
          includeTotalCount: false
        })
      );

      const sources: TrustedSource[] = [];
      for await (const result of results.results) {
        const doc = result.document as Record<string, unknown>;
        sources.push({
          title: String(doc.title || doc.name || "Untitled source"),
          url: String(doc.url || doc.sourceUrl || ""),
          snippet: String(doc.content || doc.summary || doc.snippet || ""),
          publisher: doc.publisher ? String(doc.publisher) : undefined,
          publishedAt: doc.publishedAt ? String(doc.publishedAt) : undefined,
          score: Number(result.score || 0)
        });
      }
      return sources;
    } catch (error) {
      logger.warn("Azure AI Search retrieval failed; using curated fallback sources", { error });
      return this.fallbackSources(query);
    }
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

export const azureSearchService = new AzureSearchService();
