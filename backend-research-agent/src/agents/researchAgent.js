const { createChatCompletion } = require("../services/aiService");
const { parseAndValidateResearchJSON } = require("../utils/validateJSON");

const buildResearchPrompt = (topic) => `
You are a professional research AI.
Perform deep research on the given topic.
Return structured output in JSON format with:
- overview
- key points
- applications
- challenges
- statistics
- sources

Ensure:
- clear and concise language
- realistic and credible information
- NO extra text outside JSON
- strictly valid JSON output

Required JSON schema:
{
  "topic": "string",
  "overview": "string",
  "key_points": ["string"],
  "applications": ["string"],
  "challenges": ["string"],
  "statistics": ["string"],
  "sources": ["string"]
}

Topic: ${topic}
`;

const runResearchAgent = async (topic) => {
  const messages = [
    {
      role: "system",
      content:
        "You are a precise research agent that returns only strict, valid JSON. Do not use markdown fences."
    },
    {
      role: "user",
      content: buildResearchPrompt(topic)
    }
  ];

  const aiText = await createChatCompletion(messages);
  const research = parseAndValidateResearchJSON(aiText);

  return {
    ...research,
    topic: research.topic || topic
  };
};

module.exports = {
  runResearchAgent
};
