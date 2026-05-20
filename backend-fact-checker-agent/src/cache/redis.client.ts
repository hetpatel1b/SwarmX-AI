import Redis from "ioredis";
import { env, isTest } from "../configs/env.config";
import { logger } from "../utils/logger";

let redisWarningLogged = false;

const warnRedisUnavailable = (message: string): void => {
  if (redisWarningLogged) return;
  redisWarningLogged = true;
  logger.warn("Redis unavailable; continuing without distributed cache or queue workers", { message });
};

export const redisClient = isTest || !env.REDIS_ENABLED
  ? null
  : new Redis({
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      connectTimeout: env.REDIS_CONNECT_TIMEOUT_MS,
      lazyConnect: true,
      maxRetriesPerRequest: null,
      enableOfflineQueue: false
    });

redisClient?.on("error", (error) => {
  warnRedisUnavailable(error.message);
});

export const connectRedis = async (): Promise<void> => {
  if (!redisClient) {
    logger.info("Redis disabled; continuing without distributed cache or queue workers");
    return;
  }

  try {
    if (redisClient.status !== "ready") await redisClient.connect();
    logger.info("Redis connected");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    warnRedisUnavailable(message);

    if (env.REDIS_REQUIRED) {
      throw error;
    }
  }
};

export const disconnectRedis = async (): Promise<void> => {
  if (!redisClient) return;

  if (redisClient.status === "ready") {
    await redisClient.quit();
    return;
  }

  redisClient.disconnect();
};

export const isRedisReady = (): boolean => redisClient?.status === "ready";
