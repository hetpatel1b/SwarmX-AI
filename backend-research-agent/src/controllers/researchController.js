const { runResearchAgent } = require("../agents/researchAgent");

const createResearch = async (req, res, next) => {
  try {
    const { topic } = req.body;

    if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
      return res.status(400).json({
        error: "BadRequest",
        message: "A non-empty topic string is required"
      });
    }

    if (topic.length > 300) {
      return res.status(400).json({
        error: "BadRequest",
        message: "Topic must be 300 characters or fewer"
      });
    }

    console.log(`[research-agent] Research requested for topic: ${topic}`);

    const research = await runResearchAgent(topic.trim());

    return res.status(200).json(research);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createResearch
};
