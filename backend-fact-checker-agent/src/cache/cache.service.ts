import { isRedisReady, redisClient } from "./redis.client";
import { logger } from "../utils/logger";

export class CacheService {
  async get<T>(key: string): Promise<T | null> {
    if (!redisClient || !isRedisReady()) return null;
    try {
      const cached = await redisClient.get(key);
      return cached ? (JSON.parse(cached) as T) : null;
    } catch (error) {
      logger.warn("Cache read failed", { key, error });
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds = 900): Promise<void> {
    if (!redisClient || !isRedisReady()) return;
    try {
      await redisClient.set(key, JSON.stringify(value), "EX", ttlSeconds);
    } catch (error) {
      logger.warn("Cache write failed", { key, error });
    }
  }
}

export const cacheService = new CacheService();
