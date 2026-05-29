export class RiskService {
  analyze(confidenceScore: number, hallucinationDetected: boolean, verification: string): "low" | "medium" | "high" {
    if (hallucinationDetected || confidenceScore < 40 || ["false", "mostly_false"].includes(verification)) {
      return "high";
    }

    if (confidenceScore < 70 || ["mixed", "unverified"].includes(verification)) {
      return "medium";
    }

    return "low";
  }
}

export const riskService = new RiskService();

