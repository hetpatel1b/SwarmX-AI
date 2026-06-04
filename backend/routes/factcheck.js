import express from "express";
import { runFactCheckAgent } from "../agents/factCheckAgent.js";
import { logger } from "../utils/logger.js";

const router = express.Router();

/**
 * POST /factcheck
 * Fact-checking endpoint
 */
router.post("/", async (req, res, next) => {
  try {
    const { claim, context } = req.body;

    // Validate input
    if (!claim) {
      return res.status(400).json({
        success: false,
        error: "claim is required in request body",
      });
    }

    if (typeof claim !== "string") {
      return res.status(400).json({
        success: false,
        error: "claim must be a string",
      });
    }

    if (claim.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "claim cannot be empty",
      });
    }

    if (claim.length > 5_000) {
      return res.status(400).json({
        success: false,
        error: "claim must be 5,000 characters or fewer",
      });
    }

    if (context !== undefined && typeof context === "string" && context.length > 50_000) {
      return res.status(400).json({
        success: false,
        error: "context must be 50,000 characters or fewer",
      });
    }

    const data = await runFactCheckAgent(claim, context);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    logger.error("Error in fact-check route:", error);
    return next(error);
  }
});

export default router;
