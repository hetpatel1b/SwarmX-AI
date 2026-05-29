import { SourceCredibility, TrustedSource } from "../types/factCheck.types";

const HIGH_TRUST_HOSTS = [
  "reuters.com",
  "apnews.com",
  "who.int",
  "nih.gov",
  "cdc.gov",
  "un.org",
  "worldbank.org",
  "nature.com",
  "science.org"
];

export class SourceCredibilityService {
  rankSources(sources: TrustedSource[]): SourceCredibility[] {
    return sources.map((source) => {
      const host = this.hostname(source.url);
      const trustBonus = HIGH_TRUST_HOSTS.some((trustedHost) => host.endsWith(trustedHost)) ? 0.15 : 0;
      const score = Math.min(1, Math.max(0, source.score + trustBonus));

      return {
        title: source.title,
        url: source.url,
        publisher: source.publisher,
        score: Math.round(score * 100),
        rating: score >= 0.75 ? "high" : score >= 0.5 ? "medium" : "low"
      };
    });
  }

  private hostname(url: string): string {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return "";
    }
  }
}

export const sourceCredibilityService = new SourceCredibilityService();

