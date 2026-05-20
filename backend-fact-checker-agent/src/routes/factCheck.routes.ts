import { Router } from "express";
import { factCheckController } from "../controllers/factCheck.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { validateBody } from "../middleware/validate.middleware";
import { extractClaimsSchema, factCheckSchema, verifyUrlSchema } from "../validators/factCheck.validator";
import { factCheckRateLimiter } from "../middleware/rateLimit.middleware";
import { optionalJwt } from "../middleware/auth.middleware";

const router = Router();

/**
 * @openapi
 * /api/fact-check:
 *   post:
 *     summary: Verify a factual claim and return a structured fact-check report.
 */
router.post(
  "/fact-check",
  optionalJwt,
  factCheckRateLimiter,
  validateBody(factCheckSchema),
  asyncHandler(factCheckController.factCheck.bind(factCheckController))
);

/**
 * @openapi
 * /api/verify-url:
 *   post:
 *     summary: Validate a URL and optionally fact-check a claim against it.
 */
router.post(
  "/verify-url",
  optionalJwt,
  validateBody(verifyUrlSchema),
  asyncHandler(factCheckController.verifyUrl.bind(factCheckController))
);

/**
 * @openapi
 * /api/extract-claims:
 *   post:
 *     summary: Extract fact-checkable claims from long text.
 */
router.post(
  "/extract-claims",
  optionalJwt,
  validateBody(extractClaimsSchema),
  asyncHandler(factCheckController.extractClaims.bind(factCheckController))
);

export default router;
