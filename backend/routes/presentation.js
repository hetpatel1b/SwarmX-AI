import { Router } from "express";
import { generatePresentation } from "../agents/presentationAgent.js";
import { logger } from "../utils/logger.js";

const router = Router();

const validatePresentationRequest = (body) => {
  const query = body?.query;
  const research = body?.research;
  const summary = body?.summary;
  const insights = body?.insights;
  const factCheck = body?.factCheck;

  if (!query || typeof query !== "string" || query.trim().length === 0) {
    const error = new Error("A non-empty query string is required");
    error.statusCode = 400;
    throw error;
  }

  if (query.trim().length > 500) {
    const error = new Error("Query must be 500 characters or fewer");
    error.statusCode = 400;
    throw error;
  }

  if (!research || typeof research !== "string" || research.trim().length === 0) {
    const error = new Error("A non-empty research string is required");
    error.statusCode = 400;
    throw error;
  }

  if (!summary || typeof summary !== "object") {
    const error = new Error("summary is required and must be an object");
    error.statusCode = 400;
    throw error;
  }

  if (!summary.summary || typeof summary.summary !== "string") {
    const error = new Error("summary.summary must be a non-empty string");
    error.statusCode = 400;
    throw error;
  }

  if (!Array.isArray(summary.keyInsights)) {
    const error = new Error("summary.keyInsights must be an array");
    error.statusCode = 400;
    throw error;
  }

  if (!summary.conclusion || typeof summary.conclusion !== "string") {
    const error = new Error("summary.conclusion must be a non-empty string");
    error.statusCode = 400;
    throw error;
  }

  if (!insights) {
    const error = new Error("insights are required");
    error.statusCode = 400;
    throw error;
  }

  if (!factCheck || typeof factCheck !== "object") {
    const error = new Error("factCheck is required and must be an object");
    error.statusCode = 400;
    throw error;
  }

  return {
    query: query.trim(),
    research: research.trim(),
    summary,
    factCheck,
    insights
  };
};

router.post("/", async (req, res, next) => {
  try {
    const input = validatePresentationRequest(req.body);

    logger.info("Presentation requested", { query: input.query });

    const presentation = await generatePresentation(input);

    return res.status(200).json({
      success: true,
      data: presentation
    });
  } catch (error) {
    logger.error("Error in /presentation route", { error: error.message });
    return next(error);
  }
});

export default router;
