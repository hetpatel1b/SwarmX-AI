import { appConfig, getGroqClient } from "../config/groq.js";
import { logger } from "../utils/logger.js";

export const generateResearch = async ({ query, systemPrompt }) => {
  const groq = getGroqClient();

  try {
    const response = await groq.chat.completions.create({
      model: appConfig.groq.model,
      temperature: appConfig.groq.temperature,
      max_tokens: appConfig.groq.maxTokens,
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

    const content = response.choices?.[0]?.message?.content?.trim();

    if (!content) {
      const error = new Error("Groq returned an empty response");
      error.statusCode = 502;
      throw error;
    }

    return content;
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }

    logger.error("Groq request failed", {
      message: error.message,
      status: error.status
    });

    const serviceError = new Error(
      error.message || "Groq research generation failed"
    );
    serviceError.name = "GroqServiceError";
    serviceError.statusCode = error.status || 502;
    throw serviceError;
  }
};
