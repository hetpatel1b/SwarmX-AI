import Groq from "groq-sdk";

const SYSTEM_PROMPT = `You are an expert presentation strategist. Your task is to transform research, summary, insights, and fact-check results into a compelling presentation structure.

Return ONLY a valid JSON object with no additional text, markdown, or code fences. The JSON must have exactly these fields:
{
  "presentationTitle": "A compelling presentation title",
  "presentationSummary": "A 2-3 line executive summary",
  "slides": [
    {
      "slideNumber": 1,
      "layout": "title|section|bullets|two-column|quote|closing",
      "title": "Slide title",
      "bullets": ["point 1", "point 2", "point 3"],
      "speakerNotes": "Notes for the presenter"
    }
  ],
  "recommendations": ["recommendation 1", "recommendation 2"],
  "nextSteps": ["step 1", "step 2"]
}

Ensure all strings are properly escaped and valid JSON format.`;

export async function generatePresentation(input) {
  try {
    const {
      query,
      research,
      summary,
      factCheck,
      insights,
    } = input;

    // Validate required fields
    if (!query || !research || !summary || !insights) {
      throw new Error(
        "Missing required fields: query, research, summary, insights"
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("GROQ_API_KEY environment variable is not set");
    }

    // Build context from all previous agents
    const context = `
Topic/Query: ${query}

Research Summary:
${typeof research === 'string' ? research : JSON.stringify(research)}

Summary Agent Output:
${summary.summary}

Key Insights:
${summary.keyInsights.join("\n")}

Fact Check Results:
Trust Score: ${factCheck.trustScore || 0.5}
Verified Facts: ${factCheck.verifiedFacts ? factCheck.verifiedFacts.join("\n") : "N/A"}

Generated Insights:
${typeof insights === 'string' ? insights : JSON.stringify(insights)}
    `.trim();

    const userPrompt = `
Based on the following research, summary, fact-check, and insights data, create a professional presentation structure with compelling slides:

${context}

Create a presentation that:
1. Opens with a strong title slide
2. Includes section dividers for major topics
3. Uses bullet points for key findings
4. Incorporates insights and verified facts
5. Ends with recommendations and next steps
6. Includes speaker notes for each slide

Generate between 8-12 slides total.
    `.trim();

    const groq = new Groq({ apiKey });

    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      model: process.env.AI_MODEL || "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 2000,
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
      !parsedResponse.presentationTitle ||
      !parsedResponse.presentationSummary ||
      !Array.isArray(parsedResponse.slides)
    ) {
      throw new Error(
        "Response missing required fields: presentationTitle, presentationSummary, or slides"
      );
    }

    return {
      presentationTitle: parsedResponse.presentationTitle,
      presentationSummary: parsedResponse.presentationSummary,
      slides: parsedResponse.slides,
      recommendations: parsedResponse.recommendations || [],
      nextSteps: parsedResponse.nextSteps || [],
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(`Presentation agent error: ${error.message}`);
  }
}
