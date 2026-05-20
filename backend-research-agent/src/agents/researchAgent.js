import { generateResearch } from "../services/researchService.js";

const researchSystemPrompt = `
You are a careful AI research agent for an AI Research Agent Swarm system.
Your job is to explain topics clearly, accurately, and practically.

Write beginner-friendly research with:
- a concise overview
- key concepts
- real-world applications
- important risks or limitations
- suggested next questions for deeper study

Do not invent sources. If live web-search tools are not available, say so
briefly instead of pretending you browsed the web.
`.trim();

const buildResearchQuery = (query) => `
Research this topic:
${query}

Return a polished plain-text answer that is easy to read.
`.trim();

// Agents own prompt strategy. Services own model/API calls. This separation
// makes it straightforward to add more agents later without rewriting OpenAI code.
export const runResearchAgent = async (query) => {
  return generateResearch({
    query: buildResearchQuery(query),
    systemPrompt: researchSystemPrompt
  });
};
