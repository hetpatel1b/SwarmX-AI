import { Router } from "express";
import factCheckRoutes from "./factCheck.routes";
import healthRoutes from "./health.routes";

const router = Router();

router.use(healthRoutes);
router.use(factCheckRoutes);

export default router;
