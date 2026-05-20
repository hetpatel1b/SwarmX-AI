import cors from "cors";
import helmet from "helmet";
import { Request, Response, NextFunction } from "express";

export const helmetMiddleware = helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
});

export const corsMiddleware = cors({
  origin: process.env.CORS_ORIGIN?.split(",") || "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-request-id"]
});

export const sanitizeRequest = (req: Request, _res: Response, next: NextFunction): void => {
  const sanitize = (input: unknown): unknown => {
    if (typeof input === "string") {
      return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "").trim();
    }
    if (Array.isArray(input)) return input.map(sanitize);
    if (input && typeof input === "object") {
      return Object.fromEntries(Object.entries(input).map(([key, value]) => [key, sanitize(value)]));
    }
    return input;
  };

  req.body = sanitize(req.body);
  req.query = sanitize(req.query) as typeof req.query;
  next();
};
