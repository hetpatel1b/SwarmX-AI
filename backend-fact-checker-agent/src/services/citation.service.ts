import { Citation, TrustedSource } from "../types/factCheck.types";

export class CitationService {
  generateCitations(_claim: string, sources: TrustedSource[]): Citation[] {
    return sources.slice(0, 8).map((source, index) => ({
      id: index + 1,
      title: source.title,
      url: source.url,
      publisher: source.publisher,
      excerpt: source.snippet.slice(0, 280)
    }));
  }
}

export const citationService = new CitationService();

