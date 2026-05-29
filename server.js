import "dotenv/config.js";
import app from "./app.js";
import { logger } from "./utils/logger.js";

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`Unified AI Agent Backend listening on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
  logger.info("Available services:");
  logger.info("  - Research Agent: POST /api/research");
  logger.info("  - Summarizer Agent: POST /api/summarize");
  logger.info("  - Insight Agent: POST /api/insights");
  logger.info("  - Fact Check Agent: POST /api/factcheck");
  logger.info("  - Pipeline (All Agents): POST /api/pipeline");
  logger.info("  - Health Check: GET /health");
});

// Graceful shutdown
const shutdown = async (signal) => {
  logger.info(`Received ${signal}; shutting down gracefully`);
  server.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error("Forced shutdown - timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection", { reason, promise });
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception", { error });
  process.exit(1);
});
