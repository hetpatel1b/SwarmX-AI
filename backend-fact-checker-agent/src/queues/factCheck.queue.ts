import { Queue, Worker, Job } from "bullmq";
import { redisClient } from "../cache/redis.client";
import { FactCheckRequest } from "../types/factCheck.types";
import { factCheckerAgent } from "../agents/factCheckerAgent";
import { logger } from "../utils/logger";

export const factCheckQueue = redisClient
  ? new Queue<FactCheckRequest>("fact-check-jobs", {
      connection: redisClient,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 1000 },
        removeOnComplete: 100,
        removeOnFail: 500
      }
    })
  : null;

export const addFactCheckJob = async (payload: FactCheckRequest): Promise<string | null> => {
  if (!factCheckQueue || redisClient?.status !== "ready") return null;
  const job = await factCheckQueue.add("verify-claim", payload);
  return job.id || null;
};

export const startFactCheckWorker = (): Worker<FactCheckRequest> | null => {
  if (!redisClient || redisClient.status !== "ready") {
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
  return worker;
};
