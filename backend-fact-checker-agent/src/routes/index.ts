import { Router } from "express";
import { factCheckRouter } from "./factCheck.routes";
import { healthRouter } from "./health.routes";

export const apiRouter = Router();

apiRouter.use(healthRouter);
apiRouter.use(factCheckRouter);

