import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { createAzureChatModel } from "../configs/azure.config";
import { buildFactCheckPrompt, FACT_CHECK_SYSTEM_PROMPT } from "../prompts/factCheck.prompt";
import { logger } from "../utils/logger";
import { retry } from "../utils/retry";

export interface AiVerificationResult {
  verification: string;
  confidenceScore: number;
  hallucinationDetected: boolean;
  analysis: string;
  riskLevel: string;
}

export class AzureOpenAIService {
  private readonly model = createAzureChatModel();

  async verifyClaim(claim: string, evidence: string): Promise<AiVerificationResult> {
    if (!this.model) {
      return this.localHeuristicVerification(claim, evidence);
    }

    try {
      const response = await retry(async () =>
        this.model!.invoke([
          new SystemMessage(FACT_CHECK_SYSTEM_PROMPT),
          new HumanMessage(buildFactCheckPrompt(claim, evidence))
        ])
      );

      const raw = typeof response.content === "string" ? response.content : JSON.stringify(response.content);
      return this.parseAiJson(raw);
    } catch (error) {
      logger.warn("Azure OpenAI verification failed; using heuristic fallback", { error });
      return this.localHeuristicVerification(claim, evidence);
    }
  }

  async extractClaims(text: string): Promise<string[]> {
    if (!this.model) return this.localClaimExtraction(text);

    try {
      const response = await retry(async () =>
        this.model!.invoke([
          new SystemMessage("Extract factual claims. Return only a JSON string array."),
          new HumanMessage(text)
        ])
      );
      const raw = typeof response.content === "string" ? response.content : JSON.stringify(response.content);
      const parsed = JSON.parse(raw.replace(/^```json|```$/g, "").trim());
      return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
    } catch (error) {
      logger.warn("AI claim extraction failed; using local extraction", { error });
      return this.localClaimExtraction(text);
    }
  }

  private parseAiJson(raw: string): AiVerificationResult {
    const cleaned = raw.replace(/^```json|```$/g, "").trim();
    const parsed = JSON.parse(cleaned) as Partial<AiVerificationResult>;
    return {
      verification: parsed.verification || "unverified",
      confidenceScore: Number(parsed.confidenceScore ?? 50),
      hallucinationDetected: Boolean(parsed.hallucinationDetected),
      analysis: parsed.analysis || "AI returned limited analysis.",
      riskLevel: parsed.riskLevel || "medium"
    };
  }

  private localHeuristicVerification(claim: string, evidence: string): AiVerificationResult {
    const evidenceHits = claim
      .toLowerCase()
      .split(/\W+/)
      .filter((token) => token.length > 4 && evidence.toLowerCase().includes(token)).length;
    const confidenceScore = Math.min(85, Math.max(25, evidenceHits * 12));

    return {
      verification: evidenceHits >= 5 ? "mostly_true" : evidenceHits >= 2 ? "mixed" : "unverified",
      confidenceScore,
      hallucinationDetected: evidenceHits < 2,
      analysis:
        evidenceHits >= 2
          ? "Available evidence overlaps with key claim terms, but Azure OpenAI is not configured for deeper reasoning."
          : "Insufficient corroborating evidence was available in the configured sources.",
      riskLevel: confidenceScore < 40 ? "high" : confidenceScore < 70 ? "medium" : "low"
    };
  }

  private localClaimExtraction(text: string): string[] {
    return text
      .split(/(?<=[.!?])\s+/)
      .map((sentence) => sentence.trim())
      .filter((sentence) => sentence.length > 10 && /\b(is|are|was|were|has|have|will|causes|shows|proves)\b/i.test(sentence))
      .slice(0, 12);
  }
}

export const azureOpenAIService = new AzureOpenAIService();
