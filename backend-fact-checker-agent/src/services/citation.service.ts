import crypto from "crypto";
import { truncate } from "../helpers/text.helper";
import { Citation, TrustedSource } from "../types/factCheck.types";

export class CitationService {
  generateCitations(claim: string, sources: TrustedSource[]): Citation[] {
    const terms = claim.toLowerCase().split(/\W+/).filter((term) => term.length > 4);

    return sources
      .filter((source) => source.url && source.snippet)
      .map((source) => {
        const overlap = terms.filter((term) => source.snippet.toLowerCase().includes(term)).length;
        return {
          id: crypto.createHash("sha1").update(source.url).digest("hex").slice(0, 10),
          title: source.title,
          url: source.url,
          quote: truncate(source.snippet, 280),
          relevanceScore: Math.min(100, Math.round(source.score * 50 + overlap * 10))
        };
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 6);
  }
}

export const citationService = new CitationService();
