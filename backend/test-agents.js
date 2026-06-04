import assert from "node:assert/strict";
import test from "node:test";
import { formatResearchOutput } from "./agents/researchAgent.js";
import { runFactCheckAgent } from "./agents/factCheckAgent.js";
import { generateInsights } from "./agents/insightAgent.js";
import { generatePresentation } from "./agents/presentationAgent.js";

// Helper to create sentences
const createSentences = (count) => {
  return Array.from({ length: count }, (_, i) => `Sentence number ${i + 1}.`).join(" ");
};

test("Research Agent - formatResearchOutput validation", async (t) => {
  await t.test("formats clean valid JSON structure", () => {
    const rawContent = `
      {
        "title": "Quantum Computing",
        "overview": "${createSentences(10)}",
        "sections": [
          { "heading": "Qubits", "content": "${createSentences(3)}" },
          { "heading": "Superposition", "content": "${createSentences(4)}" }
        ],
        "statistics": ["100 qubits developed by IBM in 2023 (source: https://ibm.com)"],
        "sources": ["https://ibm.com"],
        "rawData": "This is raw data text about quantum computing."
      }
    `;

    const result = formatResearchOutput(rawContent);
    assert.equal(result.title, "Quantum Computing");
    assert.equal(result.sections.length, 2);
    assert.equal(result.sections[0].heading, "Qubits");
    assert.equal(result.sources[0], "https://ibm.com");
  });

  await t.test("strips markdown code fences", () => {
    const rawContent = `\`\`\`json
      {
        "title": "Quantum Computing",
        "overview": "${createSentences(10)}",
        "sections": [
          { "heading": "Qubits", "content": "${createSentences(3)}" }
        ],
        "statistics": ["100 qubits developed by IBM in 2023 (source: https://ibm.com)"],
        "sources": ["https://ibm.com"],
        "rawData": "This is raw data text."
      }
    \`\`\``;

    const result = formatResearchOutput(rawContent);
    assert.equal(result.title, "Quantum Computing");
  });

  await t.test("throws error if overview has less than 10 sentences", () => {
    const invalidContent = JSON.stringify({
      title: "Quantum Computing",
      overview: createSentences(9), // 9 sentences
      sections: [{ heading: "Qubits", content: createSentences(3) }],
      statistics: ["10 qubits (source: https://ibm.com)"],
      sources: ["https://ibm.com"],
      rawData: "Raw text."
    });

    assert.throws(() => {
      formatResearchOutput(invalidContent);
    }, /overview must be minimum 10 sentences/);
  });

  await t.test("throws error if a section has less than 3 sentences", () => {
    const invalidContent = JSON.stringify({
      title: "Quantum Computing",
      overview: createSentences(10),
      sections: [{ heading: "Qubits", content: createSentences(2) }], // 2 sentences
      statistics: ["10 qubits (source: https://ibm.com)"],
      sources: ["https://ibm.com"],
      rawData: "Raw text."
    });

    assert.throws(() => {
      formatResearchOutput(invalidContent);
    }, /content must be minimum 3 sentences/);
  });

  await t.test("throws error if any field is missing", () => {
    const invalidContent = JSON.stringify({
      title: "Quantum Computing",
      overview: createSentences(10),
      sections: [{ heading: "Qubits", content: createSentences(3) }]
      // statistics, sources, rawData missing
    });

    assert.throws(() => {
      formatResearchOutput(invalidContent);
    });
  });
});

test("Fact Checker - runFactCheckAgent output filtering & warnings", async (t) => {
  const originalFetch = globalThis.fetch;
  const mockFactCheckResponse = {
    verifiedFacts: ["AI is cool", "Machine learning is a subset of AI"],
    flaggedClaims: ["AI will take over the world by tomorrow"],
    trustScore: 0.85,
    sourceCredibility: "high",
    breakdown: [
      { claim: "AI is cool", verdict: "true", reason: "Universally agreed" },
      { claim: "AI will take over tomorrow", verdict: "false", reason: "No evidence" }
    ]
  };

  await t.test("returns correct filtered output structures, scales trust score, and returns filtered content", async () => {
    process.env.AZURE_ENDPOINT = "http://mock-endpoint";
    process.env.GITHUB_TOKEN = "mock-token";

    globalThis.fetch = async (url, options) => {
      return {
        ok: true,
        text: async () => JSON.stringify({
          choices: [{ message: { content: JSON.stringify(mockFactCheckResponse) } }]
        })
      };
    };

    try {
      const result = await runFactCheckAgent("Test claim", "Test context");
      
      assert.ok(result.filteredContent);
      assert.equal(result.filteredContent.trustScore, 85); // 0.85 * 100
      assert.equal(result.filteredContent.verifiedPercentage, 2 / 3 * 100);
      assert.equal(result.filteredContent.filteredForNextAgent.content, "AI is cool Machine learning is a subset of AI");
      assert.equal(result.filteredContent.filteredForNextAgent.verifiedCount, 2);
      assert.equal(result.filteredContent.filteredForNextAgent.totalCount, 3);
      assert.equal(result.filteredContent.warning, undefined);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  await t.test("adds low verification warning when verified percentage is below 30%", async () => {
    const lowVerificationResponse = {
      verifiedFacts: ["AI exists"],
      flaggedClaims: ["Claim 1", "Claim 2", "Claim 3"], // 1 verified out of 4 claims (25%)
      trustScore: 0.2,
      sourceCredibility: "low",
      breakdown: [
        { claim: "AI exists", verdict: "true", reason: "Facts" },
        { claim: "Claim 1", verdict: "false", reason: "Fake" },
        { claim: "Claim 2", verdict: "false", reason: "Fake" },
        { claim: "Claim 3", verdict: "false", reason: "Fake" }
      ]
    };

    globalThis.fetch = async (url, options) => {
      return {
        ok: true,
        text: async () => JSON.stringify({
          choices: [{ message: { content: JSON.stringify(lowVerificationResponse) } }]
        })
      };
    };

    try {
      const result = await runFactCheckAgent("Test claim", "Test context");
      
      assert.ok(result.filteredContent);
      assert.equal(result.filteredContent.verifiedPercentage, 25);
      assert.equal(result.filteredContent.warning, "Low verification rate — results may be unreliable");
      assert.equal(result.filteredContent.filteredForNextAgent.warning, "Low verification rate — results may be unreliable");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

test("Insight Agent - generateInsights input routing", async (t) => {
  const originalFetch = globalThis.fetch;
  const mockInsightResponse = {
    trends: ["t1", "t2", "t3", "t4", "t5"],
    predictions: ["p1", "p2", "p3"],
    patterns: ["pa1", "pa2", "pa3"],
    recommendations: ["r1", "r2", "r3"],
    overallAnalysis: "Analysis paragraph 1\nAnalysis paragraph 2\nAnalysis paragraph 3\nAnalysis paragraph 4\nAnalysis paragraph 5",
    visualData: {
      trendChart: [{ label: "A", growth: 10 }],
      impactMatrix: [{ factor: "B", impact: "high" }]
    }
  };

  await t.test("prioritizes filteredForNextAgent.content if provided", async () => {
    let capturedBody = null;
    process.env.GROQ_API_KEY = "mock-groq-key";

    globalThis.fetch = async (url, options) => {
      if (options && options.body) {
        try {
          capturedBody = JSON.parse(options.body);
        } catch {}
      }
      return {
        ok: true,
        text: async () => JSON.stringify({
          choices: [{ message: { content: JSON.stringify(mockInsightResponse) } }]
        })
      };
    };

    try {
      const input = {
        rawText: "This is raw unverified text.",
        summary: "This is a summary.",
        keyInsights: ["Insight 1"],
        conclusion: "Conclusion.",
        verifiedFacts: ["Fact 1"],
        trustScore: 0.9,
        filteredForNextAgent: {
          content: "Only verified fact content is here.",
          verifiedCount: 1,
          totalCount: 1,
          verifiedPercentage: 100
        }
      };

      const result = await generateInsights(input);
      assert.ok(result);
      
      // Verify the prompt content sent to the model
      const userMessage = capturedBody?.messages?.find(m => m.role === "user")?.content || "";
      assert.ok(userMessage.includes("Only verified fact content is here."));
      assert.ok(!userMessage.includes("This is raw unverified text."));
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

test("Presentation Agent - fallback & validation", async (t) => {
  const originalFetch = globalThis.fetch;
  const inputData = {
    query: "Clean Energy",
    research: {
      title: "Clean Energy Research",
      overview: createSentences(10),
      rawData: "Detailed raw content."
    },
    summary: {
      summary: "Clean energy is good.",
      keyInsights: ["Insight A", "Insight B"],
      conclusion: "Let's use solar energy."
    },
    factCheck: {
      verifiedFacts: ["Solar works", "Wind works"],
      trustScore: 0.9
    },
    insights: {
      trends: ["Solar growth", "Battery storage"],
      predictions: ["Lower costs"],
      recommendations: ["Invest in solar"],
      overallAnalysis: "Detailed analysis."
    }
  };

  await t.test("recovers and generates fallbacks when the presentation model generation fails", async () => {
    process.env.GROQ_API_KEY = "mock-groq-key";

    // Simulate failure by returning non-OK fetch status
    globalThis.fetch = async (url, options) => {
      return {
        ok: false,
        status: 500,
        text: async () => "Internal Server Error"
      };
    };

    try {
      const result = await generatePresentation(inputData);
      
      assert.equal(result.title, "Clean Energy Research");
      assert.ok(result.slides.length >= 5);
      
      const keyInsightsSlide = result.slides.find(s => s.title === "Key Insights");
      assert.ok(keyInsightsSlide);
      assert.equal(keyInsightsSlide.bullets.length, 3); // 2 insights + 1 padded "No content available"
      assert.equal(keyInsightsSlide.bullets[2], "No content available");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
