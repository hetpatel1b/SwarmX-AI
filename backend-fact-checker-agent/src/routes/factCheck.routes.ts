import { Router } from "express";
import { factCheckController } from "../controllers/factCheck.controller";
import { validateBody } from "../middleware/validate.middleware";
import {
  extractClaimsRequestSchema,
  factCheckRequestSchema,
  verifyUrlRequestSchema
} from "../validators/factCheck.validator";

export const factCheckRouter = Router();

factCheckRouter.post(
  "/fact-check",
  validateBody(factCheckRequestSchema),
  factCheckController.factCheck.bind(factCheckController)
);
factCheckRouter.post(
  "/verify-url",
  validateBody(verifyUrlRequestSchema),
  factCheckController.verifyUrl.bind(factCheckController)
);
factCheckRouter.post(
  "/extract-claims",
  validateBody(extractClaimsRequestSchema),
  factCheckController.extractClaims.bind(factCheckController)
);

