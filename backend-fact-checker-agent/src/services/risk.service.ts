import { RiskLevel } from "../types/factCheck.types";

export class RiskService {
  analyze(confidenceScore: number, hallucinationDetected: boolean, verification: string): RiskLevel {
    if (hallucinationDetected && confidenceScore < 45) return "critical";
    if (["false", "mostly_false"].includes(verification) && confidenceScore > 65) return "high";
    if (confidenceScore < 40) return "high";
    if (confidenceScore < 70 || verification === "mixed" || verification === "unverified") return "medium";
    return "low";
  }
}

export const riskService = new RiskService();
