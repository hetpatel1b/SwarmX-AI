import { Router } from "express";
import { runResearchAgent } from "../agents/researchAgent.js";
import { summarizeText } from "../agents/summaryAgent.js";
import { runFactCheckAgent } from "../agents/factCheckAgent.js";
import { generateInsights } from "../agents/insightAgent.js";
import { logger } from "../utils/logger.js";

const router = Router();

const validatePipelineRequest = (body) => {
  const query = body?.query;

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

  return query.trim();
};

export const runPipeline = async (req, res, next) => {
  try {
    const query = validatePipelineRequest(req.body);

    logger.info("Pipeline started", { query });

    // Step 1: Research Agent
    logger.info("Step 1: Running Research Agent");
    const research = await runResearchAgent(query);
    logger.info("Research completed");

    // Step 2: Summarize Agent
    logger.info("Step 2: Running Summarize Agent");
    const summary = await summarizeText(research);
    logger.info("Summarization completed");

    // Step 3: Fact Check Agent
    logger.info("Step 3: Running Fact Check Agent");
    const factCheck = await runFactCheckAgent(query);
    logger.info("Fact check completed");

    // Step 4: Insight Agent
    logger.info("Step 4: Running Insight Agent");
    const insights = await generateInsights({
      rawText: research,
      summary: summary.summary,
      keyInsights: summary.keyInsights,
      conclusion: summary.conclusion,
      verifiedFacts: Array.isArray(factCheck.verifiedFacts) 
        ? factCheck.verifiedFacts 
        : [factCheck.claim || "Claim analyzed"],
      trustScore: factCheck.trustScore || 0.5,
    });
    logger.info("Insights generated");

    const result = {
      query,
      pipeline: {
        research,
        summary,
        factCheck,
        insights,
      },
      timestamp: new Date().toISOString(),
    };

    logger.info("Pipeline completed successfully");

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error("Pipeline error", { error: error.message });
    return next(error);
  }
};

router.post("/", runPipeline);

export default router;
