import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envBoolean = (defaultValue: boolean) =>
  z.preprocess((value) => {
    if (typeof value === "boolean") return value;
    if (typeof value !== "string" || value.trim() === "") return defaultValue;
    return value.trim().toLowerCase() === "true";
  }, z.boolean());

const envSchema = z
  .object({
    PORT: z.coerce.number().int().positive().default(5004),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    GROQ_API_KEY: z.string().optional().default(""),
    GROQ_MODEL: z.string().default("llama-3.3-70b-versatile"),
    GROQ_TEMPERATURE: z.coerce.number().min(0).max(2).default(0.1),
    GROQ_MAX_TOKENS: z.coerce.number().int().positive().default(1200),
    TAVILY_API_KEY: z.string().optional().default(""),
    TAVILY_SEARCH_DEPTH: z.enum(["basic", "advanced"]).default("advanced"),
    SERPER_API_KEY: z.string().optional().default(""),
    JWT_SECRET: z.string().min(12).default("change-me-in-production"),
    REDIS_ENABLED: envBoolean(true),
    REDIS_REQUIRED: envBoolean(false),
    REDIS_HOST: z.string().default("localhost"),
    REDIS_PORT: z.coerce.number().int().positive().default(6379),
    REDIS_CONNECT_TIMEOUT_MS: z.coerce.number().int().positive().default(1500)
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV === "production") {
      const required = [
        "GROQ_API_KEY",
        "TAVILY_API_KEY",
        "SERPER_API_KEY",
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
