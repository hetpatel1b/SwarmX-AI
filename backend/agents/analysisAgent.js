import { getGroqClient } from "../config/groq.js";
import { logger } from "../utils/logger.js";

const SYSTEM_PROMPT = `You are a Principal Analysis Agent. Your task is to analyze the provided research data to generate a highly detailed executive summary and profound strategic insights.
Your responses must be long and comprehensive. Return ONLY a valid JSON object with no additional text, markdown, or code fences.

Return this JSON shape exactly:
{
  "summary": "Detailed Executive Summary (minimum 300 words)",
  "keyInsights": ["deep insight 1", "deep insight 2", "deep insight 3", "deep insight 4", "deep insight 5"],
  "conclusion": "A powerful multi-sentence conclusion",
  "trends": ["trend1", "trend2", "trend3", "trend4", "trend5"],
  "predictions": ["prediction1", "prediction2", "prediction3"],
  "patterns": ["pattern1", "pattern2", "pattern3"],
  "recommendations": ["rec1", "rec2", "rec3"],
  "overallAnalysis": "Detailed holistic analysis"
}

Guidelines:
- Summary MUST be at least 300 words. Do not skip details.
- Provide a minimum of 5 key insights, 5 trends, 3 predictions, 3 patterns, 3 strategic recommendations.
- overallAnalysis must be at least 150 words.
Ensure all strings are properly escaped and valid JSON format.`;

const formatAnalysisOutput = ({ summary, keyInsights, conclusion, trends, predictions, patterns, recommendations, overallAnalysis }) => {
  const resultData = {
    summary: String(summary || "No summary provided.").trim(),
    keyInsights: Array.isArray(keyInsights) ? keyInsights.map(k => String(k).trim()).filter(Boolean) : [],
    conclusion: String(conclusion || "No conclusion provided.").trim(),
    trends: Array.isArray(trends) ? trends.map(t => String(t).trim()).filter(Boolean) : [],
    predictions: Array.isArray(predictions) ? predictions.map(p => String(p).trim()).filter(Boolean) : [],
    patterns: Array.isArray(patterns) ? patterns.map(p => String(p).trim()).filter(Boolean) : [],
    recommendations: Array.isArray(recommendations) ? recommendations.map(r => String(r).trim()).filter(Boolean) : [],
    overallAnalysis: String(overallAnalysis || "No overall analysis provided.").trim()
  };

  return {
    success: true,
    status: "completed",
    data: resultData,
    metadata: {}
  };
};

const validateAnalysisResponse = (data) => {
  if (!data || typeof data !== 'object') throw new Error("Invalid response format");
  return data;
};

const buildUserPrompt = (text) => `
Analyze the following research text and produce the required JSON:

${text}
`.trim();

const stripCodeFences = (value) => {
  if (!value) return "";
  return value.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
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

const normalizeInput = (rawText) => {
  if (typeof rawText === "string") return rawText.trim();
  if (rawText && typeof rawText === "object") {
    if (typeof rawText.rawData === "string") return rawText.rawData.trim();
    return JSON.stringify(rawText);
  }
  return "";
};

const callGitHubModel = async (text, signal) => {
  const endpoint = process.env.AZURE_ENDPOINT;
  const token = process.env.GITHUB_TOKEN;
  const model = "gpt-4o-mini";

  if (!endpoint || !token) throw new Error("GitHub Models credentials not set");

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
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(text) }
      ],
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: "json_object" }
    })
  });

  const payload = await response.text();
  if (!response.ok) throw new Error(`GitHub Models request failed: ${payload}`);

  const data = JSON.parse(payload);
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("GitHub Models returned an empty response");
  return content;
};

const callGroq = async (text, model, signal) => {
  const groq = getGroqClient();
  const response = await groq.chat.completions.create({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(text) }
    ],
    model: model,
    temperature: 0.7,
    max_tokens: 500,
    response_format: { type: "json_object" }
  }, { signal });
  const content = response.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("Groq returned an empty response");
  return content;
};

export async function runAnalysisAgent(rawText, signal) {
  const normalizedInput = normalizeInput(rawText);
  if (!normalizedInput) throw new Error("Raw text cannot be empty");

  try {
    logger.info("Analysis agent using GitHub Models (gpt-4o-mini)");
    const tStart = performance.now();
    const content = await callGitHubModel(normalizedInput, signal);
    const parsed = parseJson(content);
    const validated = validateAnalysisResponse(parsed);
    const result = formatAnalysisOutput(validated);
    result.metadata.processingTimeMs = performance.now() - tStart;
    result.metadata.model = "gpt-4o-mini";
    return result;
  } catch (error) {
    logger.warn("Analysis agent primary failed, switching to backup", {
      error: error.message
    });
  }

  try {
    logger.info("Analysis agent using Groq backup", {
      provider: "groq",
      model: "llama-3.1-8b-instant"
    });

    const tStart = performance.now();
    const fallbackContent = await callGroq(normalizedInput, "llama-3.1-8b-instant", signal);
    const fallbackParsed = parseJson(fallbackContent);
    const fallbackValidated = validateAnalysisResponse(fallbackParsed);
    const result = formatAnalysisOutput(fallbackValidated);
    result.metadata.processingTimeMs = performance.now() - tStart;
    result.metadata.model = "llama-3.1-8b-instant";
    return result;
  } catch (error) {
    logger.error("Analysis agent failed completely", { error: error.message });
    return {
      success: false,
      status: "failed",
      error: error.message,
      fallbackData: {
        summary: "Analysis failed to complete.",
        keyInsights: [],
        conclusion: "Analysis error.",
        trends: [],
        predictions: [],
        patterns: [],
        recommendations: [],
        overallAnalysis: "Analysis unavailable due to system error."
      }
    };
  }
}
