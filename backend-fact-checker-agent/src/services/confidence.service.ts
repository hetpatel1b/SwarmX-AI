import { SourceCredibility } from "../types/factCheck.types";

export class ConfidenceService {
  calculate(aiConfidence: number, sourceCredibility: SourceCredibility[], hallucinationDetected: boolean): number {
    const boundedAiConfidence = Math.min(100, Math.max(0, aiConfidence));
    const averageSourceScore = sourceCredibility.length
      ? sourceCredibility.reduce((total, source) => total + source.score, 0) / sourceCredibility.length
      : 35;
    const hallucinationPenalty = hallucinationDetected ? 20 : 0;
    const confidence = boundedAiConfidence * 0.65 + averageSourceScore * 0.35 - hallucinationPenalty;

    return Math.round(Math.min(100, Math.max(0, confidence)));
  }
}

export const confidenceService = new ConfidenceService();

