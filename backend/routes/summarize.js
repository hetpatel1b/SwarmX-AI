const express = require("express");
const { summarizeText } = require("../agents/summaryAgent");

const router = express.Router();

router.post("/summarize", async (req, res) => {
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
    console.error("Error in /summarize route:", error.message);

    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

module.exports = router;
