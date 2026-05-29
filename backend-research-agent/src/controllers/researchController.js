import { runResearchAgent } from "../agents/researchAgent.js";
import { logger } from "../utils/logger.js";

const validateResearchRequest = (body) => {
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

export const createResearch = async (req, res, next) => {
  try {
    const query = validateResearchRequest(req.body);

    logger.info("Research requested", { query });

    const research = await runResearchAgent(query);

    return res.status(200).json({
      success: true,
      data: research
    });
  } catch (error) {
    return next(error);
  }
};
