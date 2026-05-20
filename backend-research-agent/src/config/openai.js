import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const toNumber = (value, fallback) => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : fallback;
};

export const appConfig = {
  port: toNumber(process.env.PORT, 5000),
  nodeEnv: process.env.NODE_ENV || "development",
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.AI_MODEL || "gpt-4o-mini",
    temperature: toNumber(process.env.AI_TEMPERATURE, 0.2),
    maxTokens: toNumber(process.env.AI_MAX_TOKENS, 1200)
  }
};

// Keep validation centralized so future agents, tools, and services share
// one predictable place for environment checks.
export const validateOpenAIConfig = () => {
  if (!appConfig.openai.apiKey) {
    const error = new Error("OPENAI_API_KEY is required");
    error.statusCode = 500;
    throw error;
  }
};

let openaiClient;

export const getOpenAIClient = () => {
  validateOpenAIConfig();

  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: appConfig.openai.apiKey
    });
  }

  return openaiClient;
};
