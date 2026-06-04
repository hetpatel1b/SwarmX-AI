import { logger } from "../utils/logger.js";

const REQUIRED_VARS = [
  "GROQ_API_KEY",
  "GEMINI_API_KEY",
  "GITHUB_TOKEN",
  "AZURE_ENDPOINT"
];

const getMissingVars = () =>
  REQUIRED_VARS.filter((key) => {
    const value = process.env[key];
    return !value || value.trim().length === 0;
  });

export const validateRuntimeEnv = () => {
  const missing = getMissingVars();

  if (missing.length === 0) {
    return;
  }

  const message = `Missing required environment variables: ${missing.join(", ")}`;

  if (process.env.NODE_ENV === "production") {
    const error = new Error(message);
    error.statusCode = 500;
    throw error;
  }

  logger.warn(message);
};
