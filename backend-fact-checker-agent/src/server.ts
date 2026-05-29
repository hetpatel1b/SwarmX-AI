import app from "./app";
import { env } from "./configs/env.config";
import { connectRedis, disconnectRedis } from "./cache/redis.client";
import { initializeDatabase } from "./database/connection";
import { closeFactCheckQueue, startFactCheckWorker } from "./queues/factCheck.queue";
import { logger } from "./utils/logger";

const bootstrap = async (): Promise<void> => {
  await initializeDatabase();
  await connectRedis();
  const worker = startFactCheckWorker();

  const server = app.listen(env.PORT, () => {
    logger.info(`Fact Checker Agent listening on port ${env.PORT}`);
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`Received ${signal}; shutting down gracefully`);
    server.close(async () => {
      await worker?.close();
      await closeFactCheckQueue();
      await disconnectRedis();
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
};

void bootstrap().catch((error) => {
  logger.error("Fatal bootstrap failure", { error });
  process.exit(1);
});
