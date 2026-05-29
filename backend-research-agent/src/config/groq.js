import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const toNumber = (value, fallback) => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : fallback;
};

export const appConfig = {
  port: toNumber(process.env.PORT, 5003),
  nodeEnv: process.env.NODE_ENV || "development",
  groq: {
    apiKey: process.env.GROQ_API_KEY,
    model: process.env.AI_MODEL,
    temperature: toNumber(process.env.AI_TEMPERATURE, 0.2),
    maxTokens: toNumber(process.env.AI_MAX_TOKENS, 1200)
  }
};

// Central validation keeps startup and request failures easy to understand.
export const validateGroqConfig = () => {
  if (!appConfig.groq.apiKey) {
    const error = new Error("GROQ_API_KEY is required");
    error.statusCode = 500;
    throw error;
  }

  if (!appConfig.groq.model) {
    const error = new Error("AI_MODEL is required");
    error.statusCode = 500;
    throw error;
  }
};

let groqClient;

export const getGroqClient = () => {
  validateGroqConfig();

  if (!groqClient) {
    groqClient = new Groq({
      apiKey: appConfig.groq.apiKey
    });
  }

  return groqClient;
};
