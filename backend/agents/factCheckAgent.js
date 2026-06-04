import { getGroqClient } from "../config/groq.js";
import { logger } from "../utils/logger.js";
import { sanitizeUserInput } from "../utils/sanitize.js";

const SYSTEM_PROMPT = `
You are a Principal Fact-Checker Agent.
Your mandate is to extract, verify, and grade all claims made in the provided research context.
You MUST generate a detailed verification report containing between 5 and 15 verified facts and flagged claims.
Never truncate, summarize, or be brief. Ensure extreme rigor.
Return ONLY valid JSON with no extra text, markdown, or code fences.
Fill ALL fields completely using the exact JSON shape below:
{
  "verifiedFacts": ["detailed fact 1", "detailed fact 2"],
  "flaggedClaims": ["flagged claim 1", "flagged claim 2"],
  "trustScore": number,
  "sourceCredibility": "high/medium/low",
  "breakdown": [
    { "claim": "string", "verdict": "true/false/unverified", "reason": "string (min 2 sentences)" }
  ]
}

Guidelines:
- Generate a minimum of 5 facts/claims combined. If context is long, extract up to 15.
- trustScore must be a number between 0 and 1.
- If evidence is insufficient, use verdict "unverified" and include the claim in flaggedClaims.
- Provide a detailed breakdown array with at least 5 items whenever possible.
Ensure all strings are properly escaped and valid JSON format.
`.trim();

const buildUserPrompt = (claim, contextText) => `
Fact-check the following claim using the provided context when available.

Claim:
${sanitizeUserInput(claim)}

Context:
${sanitizeUserInput(contextText, 5000)}

Return only valid JSON with the required fields.
`.trim();

const stripCodeFences = (value) => {
  if (!value) {
    return "";
  }

  return value
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
};

const parseJson = (content) => {
  const cleaned = stripCodeFences(content);

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1));
    }

    throw new Error("Model did not return valid JSON");
  }
};

const validateFactCheckResponse = (data) => {
  if (!data || typeof data !== "object") {
    throw new Error("Fact-check response must be a JSON object");
  }

  const {
    verifiedFacts,
    flaggedClaims,
    trustScore,
    sourceCredibility,
    breakdown
  } = data;

  if (!Array.isArray(verifiedFacts)) {
    throw new Error("verifiedFacts must be an array");
  }

  if (!Array.isArray(flaggedClaims)) {
    throw new Error("flaggedClaims must be an array");
  }

  if (typeof trustScore !== "number" || Number.isNaN(trustScore)) {
    throw new Error("trustScore must be a number");
  }

  if (!sourceCredibility || typeof sourceCredibility !== "string") {
    throw new Error("sourceCredibility must be a string");
  }

  if (!Array.isArray(breakdown)) {
    throw new Error("breakdown must be an array");
  }

  return {
    verifiedFacts,
    flaggedClaims,
    trustScore,
    sourceCredibility,
    breakdown
  };
};

const callGitHubModel = async (claim, contextText, signal) => {
  const endpoint = process.env.AZURE_ENDPOINT;
  const token = process.env.GITHUB_TOKEN;
  const model = process.env.PHI_MODEL || "gpt-4o-mini";

  if (!endpoint) {
    throw new Error("AZURE_ENDPOINT environment variable is not set");
  }

  if (!token) {
    throw new Error("GITHUB_TOKEN environment variable is not set");
  }

  const baseUrl = endpoint.replace(/\/+$/, "");
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    signal,
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT
        },
        {
          role: "user",
          content: buildUserPrompt(claim, contextText)
        }
      ],
      temperature: 0.4,
      max_tokens: 500
    })
  });

  const payload = await response.text();

  if (!response.ok) {
    throw new Error(`GitHub Models request failed (${response.status}): ${payload}`);
  }

  const data = JSON.parse(payload);
  const content = data.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("GitHub Models returned an empty response");
  }

  return content;
};

const callGroq = async (claim, contextText, signal) => {
  const groq = getGroqClient();

  const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    temperature: 0.4,
    max_tokens: 500,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: SYSTEM_PROMPT
      },
      {
        role: "user",
        content: buildUserPrompt(claim, contextText)
      }
    ]
  }, { signal });

  const content = response.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("Groq returned an empty response");
  }

  return content;
};

const constructFilteredOutput = (validated) => {
  const verifiedFacts = validated.verifiedFacts;
  const flaggedClaims = validated.flaggedClaims;
  const totalClaims = verifiedFacts.length + flaggedClaims.length;
  const verifiedPercentage = totalClaims > 0 ? (verifiedFacts.length / totalClaims) * 100 : 0;
  const trustScoreScaled = (validated.trustScore <= 1) ? validated.trustScore * 100 : validated.trustScore;

  const filteredContent = {
    verifiedFacts,
    flaggedClaims,
    trustScore: trustScoreScaled,
    verifiedPercentage,
    sourceCredibility: validated.sourceCredibility,
    breakdown: validated.breakdown,
    filteredForNextAgent: {
      content: verifiedFacts.join(" "),
      verifiedCount: verifiedFacts.length,
      totalCount: totalClaims,
      verifiedPercentage
    }
  };

  if (verifiedPercentage < 30) {
    filteredContent.warning = "Low verification rate — results may be unreliable";
    filteredContent.filteredForNextAgent.warning = "Low verification rate — results may be unreliable";
  }

  const resultData = {
    ...validated,
    filteredContent
  };

  return {
    success: true,
    status: "completed",
    data: resultData,
    metadata: {
      verifiedCount: verifiedFacts.length,
      totalCount: totalClaims,
      verifiedPercentage,
      trustScoreScaled,
      hasWarning: verifiedPercentage < 30
    }
  };
};

export async function runFactCheckAgent(claim, context = null, signal) {
  if (!claim || typeof claim !== "string") {
    throw new Error("Claim must be a non-empty string");
  }

  const normalizedClaim = claim.trim();
  const contextText = context
    ? typeof context === "string"
      ? context
      : JSON.stringify(context)
    : "No additional context provided.";



  try {
    logger.info("Fact-check agent using GitHub Models", {
      provider: "github",
      model: process.env.PHI_MODEL || "gpt-4o-mini"
    });

    const tStart = performance.now();
    const content = await callGitHubModel(normalizedClaim, contextText, signal);
    const parsed = parseJson(content);
    const validated = validateFactCheckResponse(parsed);
    const result = constructFilteredOutput(validated);
    result.metadata.processingTimeMs = performance.now() - tStart;
    result.metadata.model = "gpt-4o-mini";
    return result;
  } catch (error) {
    logger.warn("Fact-check primary failed, switching to backup", {
      error: error.message
    });
  }

  try {
    logger.info("Fact-check agent using Groq", {
      provider: "groq",
      model: "llama-3.1-8b-instant"
    });

    const tStart = performance.now();
    const fallbackContent = await callGroq(normalizedClaim, contextText, signal);
    const fallbackParsed = parseJson(fallbackContent);
    const fallbackValidated = validateFactCheckResponse(fallbackParsed);
    const result = constructFilteredOutput(fallbackValidated);
    result.metadata.processingTimeMs = performance.now() - tStart;
    result.metadata.model = "llama-3.1-8b-instant";
    return result;
  } catch (error) {
    logger.error("Fact-check agent failed completely", { error: error.message });
    return {
      success: false,
      status: "failed",
      error: error.message,
      fallbackData: {
        verifiedFacts: ["Fact checking unavailable."],
        flaggedClaims: [],
        trustScore: 50,
        sourceCredibility: "unknown",
        breakdown: []
      }
    };
  }
}
