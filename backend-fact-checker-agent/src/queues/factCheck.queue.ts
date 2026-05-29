import { Queue, Worker, Job } from "bullmq";
import { isRedisReady, redisClient } from "../cache/redis.client";
import { FactCheckRequest } from "../types/factCheck.types";
import { factCheckerAgent } from "../agents/factCheckerAgent";
import { logger } from "../utils/logger";

let factCheckQueue: Queue<FactCheckRequest> | null = null;

const getFactCheckQueue = (): Queue<FactCheckRequest> | null => {
  if (!redisClient || !isRedisReady()) return null;

  if (!factCheckQueue) {
    factCheckQueue = new Queue<FactCheckRequest>("fact-check-jobs", {
      connection: redisClient,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 1000 },
        removeOnComplete: 100,
        removeOnFail: 500
      }
    });

    factCheckQueue.on("error", (error) => {
      logger.warn("Fact-check queue error; queueing is temporarily unavailable", {
        message: error.message
      });
    });
  }

  return factCheckQueue;
};

export const addFactCheckJob = async (payload: FactCheckRequest): Promise<string | null> => {
  const queue = getFactCheckQueue();
  if (!queue) return null;

  try {
    const job = await queue.add("verify-claim", payload);
    return job.id || null;
  } catch (error) {
    logger.warn("Unable to enqueue fact-check job; continuing with synchronous response", { error });
    return null;
  }
};

export const startFactCheckWorker = (): Worker<FactCheckRequest> | null => {
  if (!redisClient || !isRedisReady()) {
    logger.info("Fact-check worker disabled because Redis is not connected");
    return null;
  }
  const worker = new Worker<FactCheckRequest>(
    "fact-check-jobs",
    async (job: Job<FactCheckRequest>) => factCheckerAgent.run(job.data),
    { connection: redisClient, concurrency: 5 }
  );

  worker.on("completed", (job) => logger.info("Fact-check job completed", { jobId: job.id }));
  worker.on("failed", (job, error) => logger.error("Fact-check job failed", { jobId: job?.id, error }));
  worker.on("error", (error) => logger.warn("Fact-check worker Redis error", { message: error.message }));
  return worker;
};

export const closeFactCheckQueue = async (): Promise<void> => {
  if (!factCheckQueue) return;
  await factCheckQueue.close();
  factCheckQueue = null;
};
