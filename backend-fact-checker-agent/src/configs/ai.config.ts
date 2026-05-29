import Groq from "groq-sdk";
import { env } from "./env.config";

export const aiConfig = {
  groq: {
    apiKey: env.GROQ_API_KEY,
    model: env.GROQ_MODEL,
    temperature: env.GROQ_TEMPERATURE,
    maxTokens: env.GROQ_MAX_TOKENS
  }
};

export const isGroqConfigured = (): boolean => Boolean(aiConfig.groq.apiKey);

let groqClient: Groq | null = null;

export const createGroqClient = (): Groq | null => {
  if (!isGroqConfigured()) return null;

  if (!groqClient) {
    groqClient = new Groq({
      apiKey: aiConfig.groq.apiKey
    });
  }

  return groqClient;
};

