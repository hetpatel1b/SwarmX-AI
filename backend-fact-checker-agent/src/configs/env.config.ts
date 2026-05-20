import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z
  .object({
    PORT: z.coerce.number().int().positive().default(8080),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    AZURE_OPENAI_API_KEY: z.string().optional().default(""),
    AZURE_OPENAI_ENDPOINT: z.string().url().optional().or(z.literal("")).default(""),
    AZURE_OPENAI_DEPLOYMENT: z.string().optional().default(""),
    AZURE_AI_SEARCH_ENDPOINT: z.string().url().optional().or(z.literal("")).default(""),
    AZURE_AI_SEARCH_API_KEY: z.string().optional().default(""),
    AZURE_AI_SEARCH_INDEX: z.string().optional().default(""),
    JWT_SECRET: z.string().min(12).default("change-me-in-production"),
    REDIS_HOST: z.string().default("localhost"),
    REDIS_PORT: z.coerce.number().int().positive().default(6379)
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV === "production") {
      const required = [
        "AZURE_OPENAI_API_KEY",
        "AZURE_OPENAI_ENDPOINT",
        "AZURE_OPENAI_DEPLOYMENT",
        "AZURE_AI_SEARCH_ENDPOINT",
        "AZURE_AI_SEARCH_API_KEY",
        "AZURE_AI_SEARCH_INDEX",
        "JWT_SECRET"
      ] as const;

      for (const key of required) {
        if (!env[key]) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${key} is required in production`,
            path: [key]
          });
        }
      }
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(`Environment validation failed: ${parsed.error.message}`);
}

export const env = parsed.data;
export const isProduction = env.NODE_ENV === "production";
export const isTest = env.NODE_ENV === "test";
