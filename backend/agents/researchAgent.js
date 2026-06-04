import { GoogleGenerativeAI } from "@google/generative-ai";
import { getGroqClient } from "../config/groq.js";
import { logger } from "../utils/logger.js";
import { sanitizeUserInput } from "../utils/sanitize.js";

const SYSTEM_PROMPT = `
You are a Principal Research Architect in an autonomous multi-agent system.
Your sole purpose is to generate an in-depth, high-quality research report of 800-1200 words.
Focus strictly on quality, deep analysis, factual structure, and evidence.
Do NOT use filler, fluff, or placeholder text. Never return "failed" or "empty".

You must return clean, structured JSON only. Do NOT wrap your output in markdown, code fences (such as \`\`\`json), or include any other text.

Return exactly this JSON structure:
{
  "title": "Clear Research Topic",
  "overview": "Executive Summary providing deep background context (minimum 10 sentences).",
  "sections": [
    { "heading": "Background", "content": "Detailed paragraphs..." },
    { "heading": "Current State", "content": "Detailed paragraphs..." },
    { "heading": "Key Findings", "content": "Detailed paragraphs..." },
    { "heading": "Future Outlook", "content": "Detailed paragraphs..." },
    { "heading": "Risks & Recommendations", "content": "Detailed paragraphs..." }
  ],
  "statistics": ["stat with number and (source: URL)"],
  "sources": ["https://..."],
  "rawData": "The full detailed research text, consolidating all findings into a massive 800-1200 word report."
}

Guidelines:
- overview must be a minimum of 10 sentences.
- You must generate exactly these 5 sections: Background, Current State, Key Findings, Future Outlook, Risks & Recommendations.
- Each section's content must be a minimum of 5 sentences of deep, evidence-based research.
- statistics must be a non-empty array of strings. Each string must include a numeric value and a source URL.
- sources must be a non-empty array of direct URLs.
- rawData must be extremely detailed, forming a cohesive 800-1200 word report. No placeholders allowed.
`.trim();

const buildUserPrompt = (query) => `
Research topic: ${sanitizeUserInput(query)}

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

const normalizeSources = (sources) => {
  if (!Array.isArray(sources)) {
    return ["No live browsing; sources unavailable."];
  }

  const cleaned = sources
    .filter((source) => typeof source === "string")
    .map((source) => source.trim())
    .filter(Boolean);

  const urlSources = cleaned.filter((source) => /^https?:\/\//i.test(source));
  if (urlSources.length > 0) {
    return urlSources.slice(0, 5);
  }

  return ["No live browsing; sources unavailable."];
};

const normalizeStatistics = (statistics) => {
  if (!Array.isArray(statistics)) {
    return [];
  }

  return statistics
    .filter((stat) => typeof stat === "string")
    .map((stat) => stat.trim())
    .filter((stat) => stat && /\d/.test(stat) && /https?:\/\//i.test(stat))
    .slice(0, 5);
};

export const formatResearchOutput = (content) => {
  if (typeof content !== 'string') {
    throw new Error("Research response must be a string");
  }

  // Strip ALL markdown, code fences, extra whitespace before parsing
  let cleaned = content.trim();
  cleaned = cleaned.replace(/^```[a-zA-Z0-9-]*\s*/i, "")
                   .replace(/\s*```$/i, "")
                   .trim();

  let data;
  try {
    data = JSON.parse(cleaned);
  } catch (error) {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (start !== -1 && end !== -1 && end > start) {
      try {
        data = JSON.parse(cleaned.slice(start, end + 1));
      } catch (innerError) {
        throw new Error("Model did not return valid JSON: " + innerError.message);
      }
    } else {
      throw new Error("Model did not return valid JSON: " + error.message);
    }
  }

  if (!data || typeof data !== "object") {
    throw new Error("Research response must be a JSON object");
  }

  const { title, overview, sections, statistics, sources, rawData } = data;

  if (!title || typeof title !== "string" || title.trim() === "") {
    throw new Error("Research response missing or empty title");
  }

  if (!overview || typeof overview !== "string" || overview.trim() === "") {
    throw new Error("Research response missing or empty overview");
  }

  // overview must be minimum 3 sentences
  const overviewSentences = overview.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
  if (overviewSentences.length < 3) {
    throw new Error(`Research validation failed: overview must be minimum 3 sentences (got ${overviewSentences.length})`);
  }

  // fallback for rawData
  const finalRawData = rawData && typeof rawData === "string" && rawData.trim() !== "" ? rawData : overview;

  if (!Array.isArray(sections) || sections.length === 0) {
    throw new Error("sections must be a non-empty array");
  }

  sections.forEach((section, index) => {
    if (!section || typeof section !== "object") {
      throw new Error(`sections[${index}] must be an object`);
    }

    if (!section.heading || typeof section.heading !== "string" || section.heading.trim() === "") {
      throw new Error(`sections[${index}].heading must be a non-empty string`);
    }

    if (!section.content || typeof section.content !== "string" || section.content.trim() === "") {
      throw new Error(`sections[${index}].content must be a non-empty string`);
    }

    // Each section must have both heading and content
    const contentSentences = section.content.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
    if (contentSentences.length < 2) {
      throw new Error(`sections[${index}].content must be minimum 2 sentences (got ${contentSentences.length})`);
    }
  });

  const normalizedStatistics = Array.isArray(statistics) ? statistics : [];
  const normalizedSources = Array.isArray(sources) ? sources : [];

  logger.info("Research agent output formatted and validated successfully.", {
    title,
    overviewSentencesCount: overviewSentences.length,
    sectionsCount: sections.length
  });

  const resultData = {
    title: title.trim(),
    overview: overview.trim(),
    sections: sections.map(s => ({
      heading: s.heading.trim(),
      content: s.content.trim()
    })),
    statistics: normalizedStatistics,
    sources: normalizedSources,
    rawData: finalRawData.trim()
  };

  return {
    success: true,
    status: "completed",
    data: resultData,
    metadata: {
      overviewSentences: overviewSentences.length,
      sectionsCount: sections.length
    }
  };
};

// Remove callGitHubModel

const callGroq = async (query, signal) => {
  const groq = getGroqClient();

  const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    temperature: 0.7,
    max_tokens: 2500,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: SYSTEM_PROMPT
      },
      {
        role: "user",
        content: buildUserPrompt(query)
      }
    ]
  }, { signal });

  const content = response.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("Groq returned an empty response");
  }

  return content;
};

export const runResearchAgent = async (query, signal) => {
  const normalizedQuery = query?.trim();

  if (!normalizedQuery) {
    throw new Error("Query must be a non-empty string");
  }

  try {
    logger.info("Research agent using Groq", {
      provider: "groq",
      model: "llama-3.1-8b-instant"
    });

    const tStart = performance.now();
    const fallbackContent = await callGroq(normalizedQuery, signal);
    const result = formatResearchOutput(fallbackContent);
    result.metadata.processingTimeMs = performance.now() - tStart;
    result.metadata.model = "llama-3.1-8b-instant";
    return result;
  } catch (error) {
    logger.error("Research Agent failed completely", { error: error.message });
    return {
      success: false,
      status: "failed",
      error: error.message,
      fallbackData: {
        title: normalizedQuery,
        overview: "Research failed to complete.",
        sections: [],
        statistics: [],
        sources: [],
        rawData: "Research agent error."
      }
    };
  }
};
