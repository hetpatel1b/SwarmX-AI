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
