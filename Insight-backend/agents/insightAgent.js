const ModelClient = require("@azure-rest/ai-inference").default;
const { AzureKeyCredential } = require("@azure/core-auth");

const SYSTEM_PROMPT = `You are an expert AI insight analyst. Your task is to analyze the provided research summary, key insights, verified facts, and conclusions to generate deep insights and predictions.

Return ONLY a valid JSON object with no additional text, markdown, or code fences. The JSON must have exactly these fields:
{
  "trends": ["trend 1", "trend 2", "trend 3", "trend 4", "trend 5"],
  "predictions": ["prediction 1", "prediction 2", "prediction 3"],
  "patterns": ["pattern 1", "pattern 2", "pattern 3"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "overallAnalysis": "A 2-3 line deep analysis synthesizing all findings"
}

Ensure all strings are properly escaped and valid JSON format.`;

async function generateInsights(input) {
  try {
    const {
      rawText,
      summary,
      keyInsights,
      conclusion,
      verifiedFacts,
      trustScore,
    } = input;

    // Validate required fields
    if (
      !rawText ||
      !summary ||
      !keyInsights ||
      !conclusion ||
      !verifiedFacts ||
      trustScore === undefined
    ) {
      throw new Error(
        "Missing required fields: rawText, summary, keyInsights, conclusion, verifiedFacts, trustScore"
      );
    }

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      throw new Error("GITHUB_TOKEN environment variable is not set");
    }

    // Combine context from previous agents
    const context = `
Summary from Summarizer Agent:
${summary}

Key Insights from Summarizer Agent:
${keyInsights.join("\n")}

Conclusion from Summarizer Agent:
${conclusion}

Verified Facts from Fact Checker Agent:
${verifiedFacts.join("\n")}

Trust Score: ${trustScore}

Original Text:
${rawText}
    `.trim();

    const client = new ModelClient(
      process.env.AZURE_ENDPOINT,
      new AzureKeyCredential(token)
    );

    const response = await client.path("/chat/completions").post({
      body: {
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: `Analyze the following research data and generate insights:\n\n${context}`,
          },
        ],
        model: process.env.PHI_MODEL,
        temperature: 0.7,
        max_tokens: 1500,
      },
    });

    if (!response.body.choices || response.body.choices.length === 0) {
      throw new Error("No response from model");
    }

    let content = response.body.choices[0].message.content;

    // Strip markdown code fences if present
    content = content
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    // Parse JSON response
    const parsedResponse = JSON.parse(content);

    // Validate response structure
    if (
      !parsedResponse.trends ||
      !parsedResponse.predictions ||
      !parsedResponse.patterns ||
      !parsedResponse.recommendations ||
      !parsedResponse.overallAnalysis
    ) {
      throw new Error(
        "Response missing required fields: trends, predictions, patterns, recommendations, or overallAnalysis"
      );
    }

    if (
      !Array.isArray(parsedResponse.trends) ||
      !Array.isArray(parsedResponse.predictions) ||
      !Array.isArray(parsedResponse.patterns) ||
      !Array.isArray(parsedResponse.recommendations)
    ) {
      throw new Error(
        "trends, predictions, patterns, and recommendations must be arrays"
      );
    }

    return {
      trends: parsedResponse.trends,
      predictions: parsedResponse.predictions,
      patterns: parsedResponse.patterns,
      recommendations: parsedResponse.recommendations,
      overallAnalysis: parsedResponse.overallAnalysis,
    };
  } catch (error) {
    throw new Error(`Insight agent error: ${error.message}`);
  }
}

module.exports = { generateInsights };
