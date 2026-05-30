import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { env } from "./config/env.js";
import { apiRateLimiter } from "./middleware/rateLimit.middleware.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { presentationRouter } from "./routes/presentation.routes.js";
import { logger } from "./utils/logger.js";

export function buildApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(
    cors({
      origin: env.FRONTEND_ORIGIN,
      credentials: false
    })
  );
  app.use(compression());
  app.use(express.json({ limit: env.REQUEST_BODY_LIMIT }));
  app.use(pinoHttp({ logger }));
  app.use(apiRateLimiter);

  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      service: "presentation-agent-backend",
      storage: "none",
      database: "none"
    });
  });

  app.use("/api", presentationRouter);
  app.use(errorMiddleware);

  return app;
}
