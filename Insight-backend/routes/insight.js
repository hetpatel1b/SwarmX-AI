const express = require("express");
const { generateInsights } = require("../agents/insightAgent");

const router = express.Router();

router.post("/insights", async (req, res) => {
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

    // Call insight agent
    const data = await generateInsights({
      rawText,
      summary,
      keyInsights,
      conclusion,
      verifiedFacts,
      trustScore,
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error in /insights route:", error.message);

    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

module.exports = router;
