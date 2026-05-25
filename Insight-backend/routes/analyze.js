const express = require("express");
const { generateInsights } = require("../agents/insightAgent");
const axios = require("axios");

const router = express.Router();

// Get summarizer backend URL from environment or use default
const SUMMARIZER_URL =
  process.env.SUMMARIZER_URL || "http://localhost:5001";

/**
 * POST /api/analyze
 * Combined endpoint that:
 * 1. Calls summarizer to get summary, keyInsights, conclusion
 * 2. Calls insight agent with all data
 * 3. Returns both results
 */
router.post("/analyze", async (req, res) => {
  try {
    const { rawText, verifiedFacts, trustScore } = req.body;

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

    if (!Array.isArray(verifiedFacts)) {
      return res.status(400).json({
        success: false,
        error: "verifiedFacts must be an array",
      });
    }

    if (trustScore === undefined || typeof trustScore !== "number") {
      return res.status(400).json({
        success: false,
        error: "trustScore must be a number",
      });
    }

    console.log("Step 1: Calling Summarizer Agent...");

    // Step 1: Call summarizer to get summary, keyInsights, conclusion
    let summarizerResponse;
    try {
      summarizerResponse = await axios.post(`${SUMMARIZER_URL}/api/summarize`, {
        rawText,
      });

      if (!summarizerResponse.data.success) {
        throw new Error(
          summarizerResponse.data.error || "Summarizer failed"
        );
      }
    } catch (error) {
      console.error("Summarizer error:", error.message);
      return res.status(500).json({
        success: false,
        error: `Summarizer service error: ${error.message}`,
      });
    }

    const { summary, keyInsights, conclusion } =
      summarizerResponse.data.data;

    console.log("Step 2: Calling Insight Agent with summarized data...");

    // Step 2: Call insight agent with summarized data
    const insightData = await generateInsights({
      rawText,
      summary,
      keyInsights,
      conclusion,
      verifiedFacts,
      trustScore,
    });

    console.log("Step 3: Returning combined results...");

    // Return both summarizer and insight results
    return res.status(200).json({
      success: true,
      data: {
        summarizer: {
          summary,
          keyInsights,
          conclusion,
        },
        insights: insightData,
        metadata: {
          trustScore,
          verifiedFactsCount: verifiedFacts.length,
          processedAt: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("Error in /analyze route:", error.message);

    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

module.exports = router;
