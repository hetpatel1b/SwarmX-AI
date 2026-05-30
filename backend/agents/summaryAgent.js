import Groq from "groq-sdk";

const SYSTEM_PROMPT = `You are an expert AI summarizer. Your task is to analyze the provided text and create a comprehensive summary.

Return ONLY a valid JSON object with no additional text, markdown, or code fences. The JSON must have exactly these fields:
{
  "summary": "A 3-5 line comprehensive summary of the main points",
  "keyInsights": ["insight 1", "insight 2", "insight 3", "insight 4", "insight 5"],
  "conclusion": "A single line conclusion or key takeaway"
}

Ensure all strings are properly escaped and valid JSON format.`;

export async function summarizeText(rawText) {
  try {
    if (!rawText || rawText.trim().length === 0) {
      throw new Error("Raw text cannot be empty");
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("GROQ_API_KEY environment variable is not set");
    }

    const groq = new Groq({ apiKey });

    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: `Please summarize the following text:\n\n${rawText}`,
        },
      ],
      model: process.env.AI_MODEL || "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1000,
    });

    if (!response.choices || response.choices.length === 0) {
      throw new Error("No response from model");
    }

    let content = response.choices[0].message.content;

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
      !parsedResponse.summary ||
      !parsedResponse.keyInsights ||
      !parsedResponse.conclusion
    ) {
      throw new Error(
        "Response missing required fields: summary, keyInsights, or conclusion"
      );
    }

    if (!Array.isArray(parsedResponse.keyInsights)) {
      throw new Error("keyInsights must be an array");
    }

    return {
      summary: parsedResponse.summary,
      keyInsights: parsedResponse.keyInsights,
      conclusion: parsedResponse.conclusion,
    };
  } catch (error) {
    throw new Error(`Summary agent error: ${error.message}`);
  }
}


