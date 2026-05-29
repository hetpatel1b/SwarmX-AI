import { Router } from "express";
import { healthController } from "../controllers/health.controller";

export const healthRouter = Router();

healthRouter.get("/health", healthController.health.bind(healthController));
healthRouter.get("/status", healthController.status.bind(healthController));

