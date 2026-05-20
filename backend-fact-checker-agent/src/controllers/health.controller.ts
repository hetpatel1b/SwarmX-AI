import { Request, Response } from "express";
import { env } from "../configs/env.config";
import { isAzureOpenAiConfigured, isAzureSearchConfigured } from "../configs/azure.config";
import { redisClient } from "../cache/redis.client";
import { HTTP_STATUS } from "../constants/http.constants";

export class HealthController {
  health(_req: Request, res: Response): void {
    res.status(HTTP_STATUS.OK).json({
      success: true,
      status: "healthy",
      timestamp: new Date().toISOString()
    });
  }

  status(_req: Request, res: Response): void {
    res.status(HTTP_STATUS.OK).json({
      success: true,
      service: "backend-fact-checker-agent",
      environment: env.NODE_ENV,
      uptimeSeconds: Math.round(process.uptime()),
      dependencies: {
        azureOpenAI: isAzureOpenAiConfigured() ? "configured" : "not_configured",
        azureAISearch: isAzureSearchConfigured() ? "configured" : "not_configured",
        redis: redisClient?.status || "disabled"
      },
      timestamp: new Date().toISOString()
    });
  }
}

export const healthController = new HealthController();
