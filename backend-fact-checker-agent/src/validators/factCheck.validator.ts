import { z } from "zod";

export const factCheckRequestSchema = z.object({
  claim: z.string().trim().min(3).max(5000),
  context: z.string().trim().max(10000).optional(),
  language: z.string().trim().min(2).max(16).optional(),
  includeQueue: z.boolean().optional()
});

export const verifyUrlRequestSchema = z.object({
  url: z.string().url(),
  claim: z.string().trim().min(3).max(5000).optional()
});

export const extractClaimsRequestSchema = z.object({
  text: z.string().trim().min(3).max(20000)
});

