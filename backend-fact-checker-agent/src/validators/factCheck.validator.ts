import { z } from "zod";

export const factCheckSchema = z.object({
  claim: z.string().min(3).max(5000),
  context: z.string().max(10000).optional(),
  language: z.string().max(32).optional(),
  includeQueue: z.boolean().optional()
});

export const verifyUrlSchema = z.object({
  url: z.string().url(),
  claim: z.string().min(3).max(5000).optional()
});

export const extractClaimsSchema = z.object({
  text: z.string().min(10).max(20000)
});

export type FactCheckPayload = z.infer<typeof factCheckSchema>;
export type VerifyUrlPayload = z.infer<typeof verifyUrlSchema>;
export type ExtractClaimsPayload = z.infer<typeof extractClaimsSchema>;
