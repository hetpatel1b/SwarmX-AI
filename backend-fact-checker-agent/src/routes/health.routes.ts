import { Router } from "express";
import { healthController } from "../controllers/health.controller";

const router = Router();

router.get("/health", healthController.health.bind(healthController));
router.get("/status", healthController.status.bind(healthController));

export default router;
