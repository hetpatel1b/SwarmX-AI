import { extractDomain } from "../helpers/text.helper";
import { SourceCredibility, TrustedSource } from "../types/factCheck.types";

const authorityWeights: Record<string, number> = {
  "who.int": 96,
  "cdc.gov": 95,
  "nih.gov": 94,
  "reuters.com": 92,
  "apnews.com": 91,
  "bbc.com": 88,
  "nature.com": 90,
  "science.org": 90,
  "ourworldindata.org": 87,
  "worldbank.org": 88,
  "un.org": 88,
  "gov": 85,
  "edu": 82
};

export class SourceCredibilityService {
  rankSources(sources: TrustedSource[]): SourceCredibility[] {
    return sources
      .map((source) => {
        const domain = extractDomain(source.url);
        const credibilityScore = this.scoreDomain(domain, source);
        return {
          url: source.url,
          domain,
          credibilityScore,
          rationale: this.rationale(domain, credibilityScore)
        };
      })
      .sort((a, b) => b.credibilityScore - a.credibilityScore);
  }

  private scoreDomain(domain: string, source: TrustedSource): number {
    const exact = authorityWeights[domain];
    const suffix = Object.entries(authorityWeights).find(([key]) => domain.endsWith(`.${key}`) || domain === key);
    const base = exact ?? suffix?.[1] ?? 55;
    const searchBoost = Math.min(8, Math.max(0, source.score * 5));
    const publisherBoost = source.publisher ? 3 : 0;
    return Math.round(Math.min(100, base + searchBoost + publisherBoost));
  }

  private rationale(domain: string, score: number): string {
    if (score >= 90) return `${domain} is ranked as a highly authoritative primary or editorially reviewed source.`;
    if (score >= 75) return `${domain} has strong institutional or editorial credibility.`;
    if (score >= 60) return `${domain} has moderate credibility and should be corroborated.`;
    return `${domain} requires additional corroboration before being treated as reliable.`;
  }
}

export const sourceCredibilityService = new SourceCredibilityService();
