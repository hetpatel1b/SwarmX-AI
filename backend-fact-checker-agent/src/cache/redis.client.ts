import Redis from "ioredis";
import { env, isTest } from "../configs/env.config";
import { logger } from "../utils/logger";

export const redisClient = isTest
  ? null
  : new Redis({
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      lazyConnect: true,
      maxRetriesPerRequest: 2,
      enableOfflineQueue: false
    });

export const connectRedis = async (): Promise<void> => {
  if (!redisClient) return;
  try {
    if (redisClient.status !== "ready") await redisClient.connect();
    logger.info("Redis connected");
  } catch (error) {
    logger.warn("Redis unavailable; continuing without distributed cache", { error });
  }
};

export const disconnectRedis = async (): Promise<void> => {
  if (redisClient?.status === "ready") await redisClient.quit();
};
