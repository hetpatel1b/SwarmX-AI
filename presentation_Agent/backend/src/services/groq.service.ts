import Groq from "groq-sdk";
import { env } from "../config/env.js";
import { withRetry } from "../utils/retry.js";

const groq = new Groq({
  apiKey: env.GROQ_API_KEY,
  timeout: env.GROQ_TIMEOUT_MS
});

function isRetryable(error: unknown) {
  if (typeof error === "object" && error && "status" in error) {
    const status = Number((error as { status?: number }).status);
    return status === 429 || status >= 500;
  }
  return true;
}

export async function completeJson(systemPrompt: string, userPrompt: string) {
  return withRetry(
    async () => {
      const completion = await groq.chat.completions.create({
        model: env.GROQ_MODEL,
        temperature: 0.65,
        max_tokens: 6000,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      });

      return completion.choices[0]?.message?.content ?? "{}";
    },
    { attempts: env.GROQ_RETRY_ATTEMPTS, shouldRetry: isRetryable }
  );
}
