import express from "express";
import { generateInsights } from "../agents/insightAgent.js";
import { logger } from "../utils/logger.js";

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const {
      rawText,
      summary,
      keyInsights,
      conclusion,
      verifiedFacts,
      trustScore,
    } = req.body;

    // Validate input
    if (
      !rawText ||
      !summary ||
      !keyInsights ||
      !conclusion ||
      !verifiedFacts ||
      trustScore === undefined
    ) {
      return res.status(400).json({
        success: false,
        error:
          "Missing required fields: rawText, summary, keyInsights, conclusion, verifiedFacts, trustScore",
      });
    }

    if (typeof rawText !== "string") {
      return res.status(400).json({
        success: false,
        error: "rawText must be a string",
      });
    }

    if (typeof summary !== "string") {
      return res.status(400).json({
        success: false,
        error: "summary must be a string",
      });
    }

    if (!Array.isArray(keyInsights)) {
      return res.status(400).json({
        success: false,
        error: "keyInsights must be an array",
      });
    }

    if (typeof conclusion !== "string") {
      return res.status(400).json({
        success: false,
        error: "conclusion must be a string",
      });
    }

    if (!Array.isArray(verifiedFacts)) {
      return res.status(400).json({
        success: false,
        error: "verifiedFacts must be an array",
      });
    }

    if (typeof trustScore !== "number") {
      return res.status(400).json({
        success: false,
        error: "trustScore must be a number",
      });
    }

    // Call insight agent
    const insightData = await generateInsights({
      rawText,
      summary,
      keyInsights,
      conclusion,
      verifiedFacts,
      trustScore,
    });

    return res.status(200).json({
      success: true,
      data: insightData,
    });
  } catch (error) {
    logger.error("Error in /insights route:", error);
    return next(error);
  }
});

export default router;
