export const FACT_CHECK_SYSTEM_PROMPT = [
  "You are a careful fact-checking assistant.",
  "Use only the provided evidence when making a determination.",
  "Return valid JSON with verification, confidenceScore, hallucinationDetected, analysis, and riskLevel.",
  "verification must be one of true, mostly_true, mixed, mostly_false, false, or unverified."
].join(" ");

export const buildFactCheckPrompt = (claim: string, evidence: string): string => {
  return JSON.stringify(
    {
      task: "Verify the claim using the evidence.",
      claim,
      evidence: evidence || "No external evidence was found.",
      outputSchema: {
        verification: "string",
        confidenceScore: "number from 0 to 100",
        hallucinationDetected: "boolean",
        analysis: "short evidence-grounded explanation",
        riskLevel: "low | medium | high"
      }
    },
    null,
    2
  );
};

