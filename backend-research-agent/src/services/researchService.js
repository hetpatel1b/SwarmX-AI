import { appConfig, getOpenAIClient } from "../config/openai.js";
import { logger } from "../utils/logger.js";

export const generateResearch = async ({ query, systemPrompt }) => {
  const client = getOpenAIClient();

  try {
    const completion = await client.chat.completions.create({
      model: appConfig.openai.model,
      temperature: appConfig.openai.temperature,
      max_tokens: appConfig.openai.maxTokens,
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: query
        }
      ]
    });

    const content = completion.choices?.[0]?.message?.content?.trim();

    if (!content) {
      const error = new Error("OpenAI returned an empty response");
      error.statusCode = 502;
      throw error;
    }

    return content;
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }

    logger.error("OpenAI request failed", {
      message: error.message,
      status: error.status
    });

    const serviceError = new Error(
      error.message || "OpenAI research generation failed"
    );
    serviceError.name = "OpenAIServiceError";
    serviceError.statusCode = error.status || 502;
    throw serviceError;
  }
};
