import crypto from "crypto";
import { azureOpenAIService } from "../services/azureOpenAI.service";
import { azureSearchService } from "../services/azureSearch.service";
import { cacheService } from "../cache/cache.service";
import { citationService } from "../services/citation.service";
import { confidenceService } from "../services/confidence.service";
import { riskService } from "../services/risk.service";
import { sourceCredibilityService } from "../services/sourceCredibility.service";
import { FactCheckRequest, FactCheckResponse, TrustedSource } from "../types/factCheck.types";
import { normalizeWhitespace } from "../helpers/text.helper";
import { logger } from "../utils/logger";

export class FactCheckerAgent {
  async run(request: FactCheckRequest): Promise<FactCheckResponse> {
    const startedAt = Date.now();
    const normalizedClaim = normalizeWhitespace(request.claim);
    const cacheKey = `fact-check:${crypto.createHash("sha256").update(JSON.stringify(request)).digest("hex")}`;

    const cached = await cacheService.get<FactCheckResponse>(cacheKey);
    if (cached) return cached;

    logger.info("Starting fact-check pipeline", { claim: normalizedClaim });

    const extractedClaims = await azureOpenAIService.extractClaims(
      request.context ? `${request.context}\n${normalizedClaim}` : normalizedClaim
    );
    const segmentedClaim = extractedClaims[0] || normalizedClaim;
    const sources = await azureSearchService.retrieveSources(segmentedClaim);
    const validatedSources = this.validateSources(sources);
    const evidence = this.compareSources(validatedSources);
    const aiVerification = await azureOpenAIService.verifyClaim(segmentedClaim, evidence);
    const sourceCredibility = sourceCredibilityService.rankSources(validatedSources);
    const citations = citationService.generateCitations(segmentedClaim, validatedSources);
    const confidenceScore = confidenceService.calculate(
      aiVerification.confidenceScore,
      sourceCredibility,
      aiVerification.hallucinationDetected
    );
    const riskLevel = riskService.analyze(
      confidenceScore,
      aiVerification.hallucinationDetected,
      aiVerification.verification
    );

    const response: FactCheckResponse = {
      success: true,
      claim: segmentedClaim,
      verification: aiVerification.verification,
      confidenceScore,
      riskLevel,
      hallucinationDetected: aiVerification.hallucinationDetected,
      analysis: aiVerification.analysis,
      sources: validatedSources,
      citations,
      sourceCredibility,
      processingTime: `${Date.now() - startedAt}ms`,
      timestamp: new Date().toISOString()
    };

    await cacheService.set(cacheKey, response, 900);
    return response;
  }

  private validateSources(sources: TrustedSource[]): TrustedSource[] {
    const seen = new Set<string>();
    return sources
      .filter((source) => source.url && source.snippet)
      .filter((source) => {
        if (seen.has(source.url)) return false;
        seen.add(source.url);
        return true;
      })
      .slice(0, 10);
  }

  private compareSources(sources: TrustedSource[]): string {
    return sources
      .map((source, index) => `[${index + 1}] ${source.title} (${source.url}): ${source.snippet}`)
      .join("\n\n");
  }
}

export const factCheckerAgent = new FactCheckerAgent();
