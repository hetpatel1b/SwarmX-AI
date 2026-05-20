import { SourceCredibility } from "../types/factCheck.types";

export class ConfidenceService {
  calculate(aiScore: number, credibility: SourceCredibility[], hallucinationDetected: boolean): number {
    const averageCredibility =
      credibility.length === 0
        ? 40
        : credibility.reduce((sum, source) => sum + source.credibilityScore, 0) / credibility.length;
    const hallucinationPenalty = hallucinationDetected ? 18 : 0;
    const score = aiScore * 0.65 + averageCredibility * 0.35 - hallucinationPenalty;
    return Math.round(Math.max(0, Math.min(100, score)));
  }
}

export const confidenceService = new ConfidenceService();
