import { getGroqClient } from "../config/groq.js";
import { logger } from "../utils/logger.js";

const SYSTEM_PROMPT = `You are a Principal Presentation Strategist. Your task is to transform raw research data into a concise, high-quality presentation structure.
Return ONLY a valid JSON object with no additional text, markdown, or code fences. Fill ALL fields completely.

Return this JSON shape exactly:
{
  "title": "string",
  "executiveSummary": "string",
  "slides": [
    { "slideNumber": number, "title": "string", "bullets": ["string"], "speakerNotes": "string" }
  ],
  "keyFindings": ["finding1", "finding2", "finding3", "finding4", "finding5"],
  "conclusion": "string"
}

Guidelines:
- Create 7-10 high-quality slides. Do not generate placeholder slides.
- executiveSummary should be a strong 2-3 line summary.
- Each slide must have 3-5 bullets.
- speakerNotes should be detailed (2-4 sentences).
- Provide exactly 5 keyFindings.
Ensure all strings are properly escaped and valid JSON format.`;

const buildUserPrompt = (context) => `
Based on the following research data, extract the key points and create a professional presentation structure.
Return only valid JSON with the required fields.

${context}
`.trim();

const MAX_CONTEXT_CHARS = 900;

const truncateText = (value, maxLength = MAX_CONTEXT_CHARS) => {
  if (!value) return "";
  if (value.length <= maxLength) return value.trim();
  return `${value.slice(0, maxLength).trim()}...`;
};

const extractResearchSnapshot = (research) => {
  if (typeof research === "string") {
    return truncateText(research);
  }

  if (research && typeof research === "object") {
    if (typeof research.overview === "string") {
      return truncateText(research.overview);
    }

    if (typeof research.rawData === "string") {
      return truncateText(research.rawData);
    }

    if (Array.isArray(research.sections)) {
      const flattened = research.sections
        .map((section) => {
          if (!section || typeof section !== "object") return "";
          const heading = typeof section.heading === "string" ? section.heading : "Section";
          const content = typeof section.content === "string" ? section.content : "";
          return `${heading}: ${content}`.trim();
        })
        .filter(Boolean)
        .join("\n");
      return truncateText(flattened);
    }

    return truncateText(JSON.stringify(research));
  }

  return "";
};

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

const generateFallbackSlides = (input) => {
  const { query, research } = input;

  const getBulletsFromText = (text) => {
    if (!text || typeof text !== "string") return [];
    return text.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
  };

  const slides = [];

  // Slide 1: Overview
  const slide1Title = research?.title || query || "Overview";
  const slide1SummaryText = typeof research === "string" ? research : research?.overview || "";
  slides.push({
    slideNumber: 1,
    title: slide1Title,
    bullets: getBulletsFromText(slide1SummaryText).slice(0, 4),
    speakerNotes: `Overview of the research on: ${slide1Title}.`
  });

  // Slides 2-5: Generate from sections if available
  const sections = Array.isArray(research?.sections) ? research.sections : [];
  
  for (let i = 0; i < 4; i++) {
    const section = sections[i];
    if (section) {
      slides.push({
        slideNumber: i + 2,
        title: section.heading || `Key Finding ${i + 1}`,
        bullets: getBulletsFromText(section.content || "").slice(0, 4),
        speakerNotes: `Details regarding ${section.heading || 'this finding'}.`
      });
    } else {
      slides.push({
        slideNumber: i + 2,
        title: `Key Area ${i + 1}`,
        bullets: ["Analysis pending", "Further research required"],
        speakerNotes: "Supplemental slide."
      });
    }
  }

  return slides;
};

export const validateAndCleanSlides = (data, input) => {
  if (!data || typeof data !== "object") {
    data = {};
  }

  let slides = data.slides;

  // Ensure slides[] array is never empty
  if (!Array.isArray(slides) || slides.length === 0) {
    slides = generateFallbackSlides(input);
  }

  // Minimum 5 slides must always be generated
  if (slides.length < 5) {
    const fallback = generateFallbackSlides(input);
    while (slides.length < 5) {
      const idx = slides.length;
      const fallbackSlide = fallback[idx];
      if (fallbackSlide) {
        slides.push({
          ...fallbackSlide,
          slideNumber: idx + 1
        });
      } else {
        slides.push({
          slideNumber: idx + 1,
          title: "Supplementary Material",
          bullets: ["Additional findings from current research.", "Reference materials and support notes.", "Details compiled for business intelligence."],
          speakerNotes: "Supplementary notes for slide presentation context."
        });
      }
    }
  }

  // Every slide must have all fields populated
  slides = slides.map((slide, index) => {
    if (!slide || typeof slide !== "object") {
      slide = {};
    }

    const slideNumber = typeof slide.slideNumber === "number" ? slide.slideNumber : (index + 1);
    const title = (slide.title && typeof slide.title === "string" && slide.title.trim() !== "")
      ? slide.title.trim()
      : `Slide ${slideNumber}`;

    let bullets = Array.isArray(slide.bullets) ? slide.bullets.filter(b => typeof b === "string" && b.trim() !== "") : [];

    const speakerNotes = (slide.speakerNotes && typeof slide.speakerNotes === "string" && slide.speakerNotes.trim() !== "")
      ? slide.speakerNotes.trim()
      : "No speaker notes available for this slide.";

    return {
      slideNumber,
      title,
      bullets,
      speakerNotes
    };
  });

  const finalOutput = {
    title: data.title && typeof data.title === "string" ? data.title : (input.research?.title || input.query || "SwarmX Presentation"),
    executiveSummary: data.executiveSummary && typeof data.executiveSummary === "string" ? data.executiveSummary : (input.research?.overview?.slice(0, 150) || "Swarm presentation overview."),
    slides,
    keyFindings: Array.isArray(data.keyFindings) && data.keyFindings.length > 0 ? data.keyFindings : ["Finding 1", "Finding 2", "Finding 3", "Finding 4", "Finding 5"],
    conclusion: data.conclusion && typeof data.conclusion === "string" ? data.conclusion : "Mission complete."
  };

  return {
    success: true,
    status: "completed",
    data: finalOutput,
    metadata: {
      slideCount: slides.length
    }
  };
};

const callGitHubModel = async (context, signal) => {
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
        { role: "user", content: buildUserPrompt(context) }
      ],
      temperature: 0.6,
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

const callGroq = async (context, signal) => {
  const groq = getGroqClient();

  const response = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: SYSTEM_PROMPT
      },
      {
        role: "user",
        content: buildUserPrompt(context)
      }
    ],
    model: "llama-3.1-8b-instant",
    temperature: 0.6,
    max_tokens: 1500,
    response_format: { type: "json_object" }
  }, { signal });

  const content = response.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("Groq returned an empty response");
  }

  return content;
};

export async function generatePresentation(input, signal) {
  const { query, research } = input;
  if (!query || !research) {
    throw new Error("Missing required fields: query, research");
  }

  const researchSnapshot = extractResearchSnapshot(research);
  const context = `
Topic/Query: ${query}

Research Snapshot:
${researchSnapshot || "Not available."}
    `.trim();

    try {
      logger.info("Presentation agent using GitHub Models (gpt-4o-mini).");
      const tStart = performance.now();
      const content = await callGitHubModel(context, signal);
      const parsed = parseJson(content);
      const result = validateAndCleanSlides(parsed, input);
      result.metadata.processingTimeMs = performance.now() - tStart;
      result.metadata.model = "gpt-4o-mini";
      return result;
    } catch (error) {
      logger.error("Presentation agent failed completely", { error: error.message });
      return {
        success: false,
        status: "failed",
        error: error.message,
        data: {
          title: input.query || "Presentation Error",
          executiveSummary: "Presentation generation failed.",
          slides: [],
          keyFindings: [],
          conclusion: ""
        }
      };
    }
}
