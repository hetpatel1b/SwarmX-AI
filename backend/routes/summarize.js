import express from "express";
import { summarizeText } from "../agents/summaryAgent.js";
import { logger } from "../utils/logger.js";

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const { rawText } = req.body;

    // Validate input
    if (!rawText) {
      return res.status(400).json({
        success: false,
        error: "rawText is required in request body",
      });
    }

    if (typeof rawText !== "string") {
      return res.status(400).json({
        success: false,
        error: "rawText must be a string",
      });
    }

    // Call summary agent
    const data = await summarizeText(rawText);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    logger.error("Error in /summarize route:", error);
    return next(error);
  }
});

export default router;
