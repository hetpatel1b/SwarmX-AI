const dotenv = require("dotenv");

dotenv.config();

const requiredEnv = [
  "AZURE_OPENAI_ENDPOINT",
  "AZURE_OPENAI_API_KEY",
  "AZURE_OPENAI_DEPLOYMENT_NAME"
];

const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
  console.warn(
    `[research-agent] Missing environment variables: ${missingEnv.join(", ")}`
  );
}

module.exports = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  azureOpenAI: {
    endpoint: process.env.AZURE_OPENAI_ENDPOINT,
    apiKey: process.env.AZURE_OPENAI_API_KEY,
    deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
    apiVersion: process.env.AZURE_OPENAI_API_VERSION || "2024-02-15-preview"
  },
  ai: {
    temperature: Number(process.env.AI_TEMPERATURE ?? 0.2),
    maxTokens: Number(process.env.AI_MAX_TOKENS ?? 1200)
  }
};
