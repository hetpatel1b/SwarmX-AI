import { aiConfig, createGroqClient } from "../configs/ai.config";
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

export class GroqService {
  private readonly client = createGroqClient();

  async verifyClaim(claim: string, evidence: string): Promise<AiVerificationResult> {
    if (!this.client) {
      return this.localHeuristicVerification(claim, evidence);
    }

    try {
      const response = await retry(async () =>
        this.client!.chat.completions.create({
          model: aiConfig.groq.model,
          temperature: aiConfig.groq.temperature,
          max_tokens: aiConfig.groq.maxTokens,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: FACT_CHECK_SYSTEM_PROMPT },
            { role: "user", content: buildFactCheckPrompt(claim, evidence) }
          ]
        })
      );

      const raw = response.choices[0]?.message?.content || "{}";
      return this.parseAiJson(raw);
    } catch (error) {
      logger.warn("Groq verification failed; using heuristic fallback", { error });
      return this.localHeuristicVerification(claim, evidence);
    }
  }

  async extractClaims(text: string): Promise<string[]> {
    if (!this.client) return this.localClaimExtraction(text);

    try {
      const response = await retry(async () =>
        this.client!.chat.completions.create({
          model: aiConfig.groq.model,
          temperature: 0,
          max_tokens: 800,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: 'Extract factual claims. Return JSON with a "claims" string array only.'
            },
            { role: "user", content: text }
          ]
        })
      );

      const raw = response.choices[0]?.message?.content || "{}";
      const parsed = JSON.parse(this.stripCodeFence(raw)) as { claims?: unknown };
      return Array.isArray(parsed.claims) ? parsed.claims.filter((item) => typeof item === "string") : [];
    } catch (error) {
      logger.warn("Groq claim extraction failed; using local extraction", { error });
      return this.localClaimExtraction(text);
    }
  }

  private parseAiJson(raw: string): AiVerificationResult {
    const parsed = JSON.parse(this.stripCodeFence(raw)) as Partial<AiVerificationResult>;
    return {
      verification: parsed.verification || "unverified",
      confidenceScore: Number(parsed.confidenceScore ?? 50),
      hallucinationDetected: Boolean(parsed.hallucinationDetected),
      analysis: parsed.analysis || "Groq returned limited analysis.",
      riskLevel: parsed.riskLevel || "medium"
    };
  }

  private stripCodeFence(raw: string): string {
    return raw.replace(/^```(?:json)?\s*/i, "").replace(/```$/g, "").trim();
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
          ? "Available evidence overlaps with key claim terms, but Groq is not configured for deeper reasoning."
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

export const groqService = new GroqService();

