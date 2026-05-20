export const FACT_CHECK_SYSTEM_PROMPT = `You are an enterprise fact-checking analyst. Return only valid JSON. Evaluate claims conservatively using supplied evidence. Prefer "unverified" when evidence is insufficient.`;

export const buildFactCheckPrompt = (claim: string, evidence: string): string => `
Claim:
${claim}

Evidence:
${evidence}

Return JSON with:
{
  "verification": "true|mostly_true|mixed|mostly_false|false|unverified",
  "confidenceScore": number from 0 to 100,
  "hallucinationDetected": boolean,
  "analysis": "concise evidence-based explanation",
  "riskLevel": "low|medium|high|critical"
}
`;
