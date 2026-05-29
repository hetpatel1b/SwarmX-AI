import compression from "compression";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import fs from "fs";
import path from "path";
import swaggerUi from "swagger-ui-express";
import { apiRouter } from "./routes";
import { errorMiddleware, notFoundMiddleware } from "./middleware/error.middleware";
import { requestIdMiddleware } from "./middleware/requestId.middleware";
import { env, isProduction } from "./configs/env.config";
import { logger } from "./utils/logger";

const loadSwaggerDocument = (): Record<string, unknown> | null => {
  const swaggerPath = path.resolve(process.cwd(), "swagger.json");
  if (!fs.existsSync(swaggerPath)) return null;
  return JSON.parse(fs.readFileSync(swaggerPath, "utf8")) as Record<string, unknown>;
};

const app = express();
const swaggerDocument = loadSwaggerDocument();

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(requestIdMiddleware);
app.use(
  morgan(isProduction ? "combined" : "dev", {
    stream: {
      write: (message: string) => logger.info(message.trim())
    }
  })
);
app.use(
  rateLimit({
    windowMs: 60_000,
    limit: env.NODE_ENV === "test" ? 1000 : 120,
    standardHeaders: true,
    legacyHeaders: false
  })
);

if (swaggerDocument) {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

app.get("/", (_req, res) => {
  res.json({
    success: true,
    service: "backend-fact-checker-agent",
    docs: swaggerDocument ? "/docs" : null,
    health: "/api/health",
    timestamp: new Date().toISOString()
  });
});

app.use("/api", apiRouter);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;

