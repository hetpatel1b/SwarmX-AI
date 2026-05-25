const request = require("supertest");
const express = require("express");
const analyzeRouter = require("./analyze");
const axios = require("axios");

// Mock axios for Summarizer API calls
jest.mock("axios");

// Mock the generateInsights function
jest.mock("../agents/insightAgent", () => ({
  generateInsights: jest.fn(),
}));

const { generateInsights } = require("../agents/insightAgent");

// Create a test app
const app = express();
app.use(express.json());
app.use("/api", analyzeRouter);

// Mock data
const mockSummarizerResponse = {
  data: {
    success: true,
    data: {
      summary: "This is a test summary",
      keyInsights: ["insight1", "insight2", "insight3"],
      conclusion: "Test conclusion",
    },
  },
};

const mockInsightResponse = {
  trends: ["trend1", "trend2"],
  predictions: ["prediction1", "prediction2"],
  patterns: ["pattern1", "pattern2"],
  recommendations: ["rec1", "rec2"],
  overallAnalysis: "Deep analysis summary",
};

const validPayload = {
  rawText: "This is the raw text to analyze",
  verifiedFacts: ["fact1", "fact2"],
  trustScore: 0.85,
};

describe("Combined Analysis API - /api/analyze", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/analyze - Success Cases", () => {
    test("should successfully chain Summarizer and Insight agents", async () => {
      axios.post.mockResolvedValue(mockSummarizerResponse);
      generateInsights.mockResolvedValue(mockInsightResponse);

      const response = await request(app)
        .post("/api/analyze")
        .send(validPayload);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.summarizer).toBeDefined();
      expect(response.body.data.insights).toBeDefined();
      expect(response.body.data.metadata).toBeDefined();
    });

    test("should call Summarizer Agent first", async () => {
      axios.post.mockResolvedValue(mockSummarizerResponse);
      generateInsights.mockResolvedValue(mockInsightResponse);

      await request(app)
        .post("/api/analyze")
        .send(validPayload);

      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining("summarize"),
        { rawText: validPayload.rawText }
      );
    });

    test("should pass Summarizer output to Insight Agent", async () => {
      axios.post.mockResolvedValue(mockSummarizerResponse);
      generateInsights.mockResolvedValue(mockInsightResponse);

      await request(app)
        .post("/api/analyze")
        .send(validPayload);

      expect(generateInsights).toHaveBeenCalledWith({
        rawText: validPayload.rawText,
        summary: mockSummarizerResponse.data.data.summary,
        keyInsights: mockSummarizerResponse.data.data.keyInsights,
        conclusion: mockSummarizerResponse.data.data.conclusion,
        verifiedFacts: validPayload.verifiedFacts,
        trustScore: validPayload.trustScore,
      });
    });

    test("should include metadata in response", async () => {
      axios.post.mockResolvedValue(mockSummarizerResponse);
      generateInsights.mockResolvedValue(mockInsightResponse);

      const response = await request(app)
        .post("/api/analyze")
        .send(validPayload);

      expect(response.body.data.metadata).toEqual({
        trustScore: validPayload.trustScore,
        verifiedFactsCount: validPayload.verifiedFacts.length,
        processedAt: expect.any(String),
      });
    });
  });

  describe("POST /api/analyze - Validation Errors", () => {
    test("should return 400 when rawText is missing", async () => {
      const response = await request(app)
        .post("/api/analyze")
        .send({
          verifiedFacts: [],
          trustScore: 0.8,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("rawText");
    });

    test("should return 400 when rawText is not a string", async () => {
      const response = await request(app)
        .post("/api/analyze")
        .send({
          rawText: 123,
          verifiedFacts: [],
          trustScore: 0.8,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("rawText must be a string");
    });

    test("should return 400 when verifiedFacts is not an array", async () => {
      const response = await request(app)
        .post("/api/analyze")
        .send({
          rawText: "text",
          verifiedFacts: "not an array",
          trustScore: 0.8,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("verifiedFacts must be an array");
    });

    test("should return 400 when trustScore is not a number", async () => {
      const response = await request(app)
        .post("/api/analyze")
        .send({
          rawText: "text",
          verifiedFacts: [],
          trustScore: "high",
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("trustScore must be a number");
    });

    test("should return 400 when trustScore is missing", async () => {
      const response = await request(app)
        .post("/api/analyze")
        .send({
          rawText: "text",
          verifiedFacts: [],
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("trustScore");
    });
  });

  describe("POST /api/analyze - Summarizer Service Errors", () => {
    test("should return 500 when Summarizer service fails", async () => {
      axios.post.mockRejectedValue(new Error("Connection refused"));

      const response = await request(app)
        .post("/api/analyze")
        .send(validPayload);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("Summarizer service error");
    });

    test("should return 500 when Summarizer returns error response", async () => {
      axios.post.mockResolvedValue({
        data: {
          success: false,
          error: "Summarizer failed",
        },
      });

      const response = await request(app)
        .post("/api/analyze")
        .send(validPayload);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });

    test("should handle Summarizer timeout", async () => {
      axios.post.mockRejectedValue(new Error("Timeout"));

      const response = await request(app)
        .post("/api/analyze")
        .send(validPayload);

      expect(response.status).toBe(500);
      expect(response.body.error).toContain("Summarizer service error");
    });
  });

  describe("POST /api/analyze - Insight Agent Errors", () => {
    test("should return 500 when Insight generation fails", async () => {
      axios.post.mockResolvedValue(mockSummarizerResponse);
      generateInsights.mockRejectedValue(new Error("Azure API error"));

      const response = await request(app)
        .post("/api/analyze")
        .send(validPayload);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("Azure API error");
    });

    test("should propagate Insight Agent errors", async () => {
      axios.post.mockResolvedValue(mockSummarizerResponse);
      generateInsights.mockRejectedValue(
        new Error("Model processing failed")
      );

      const response = await request(app)
        .post("/api/analyze")
        .send(validPayload);

      expect(response.status).toBe(500);
      expect(response.body.error).toContain("Model processing failed");
    });
  });

  describe("POST /api/analyze - Response Structure", () => {
    test("should return properly structured response", async () => {
      axios.post.mockResolvedValue(mockSummarizerResponse);
      generateInsights.mockResolvedValue(mockInsightResponse);

      const response = await request(app)
        .post("/api/analyze")
        .send(validPayload);

      expect(response.body).toHaveProperty("success");
      expect(response.body).toHaveProperty("data");
      expect(response.body.data).toHaveProperty("summarizer");
      expect(response.body.data).toHaveProperty("insights");
      expect(response.body.data).toHaveProperty("metadata");
    });

    test("should include all Summarizer fields in response", async () => {
      axios.post.mockResolvedValue(mockSummarizerResponse);
      generateInsights.mockResolvedValue(mockInsightResponse);

      const response = await request(app)
        .post("/api/analyze")
        .send(validPayload);

      const { summarizer } = response.body.data;
      expect(summarizer).toHaveProperty("summary");
      expect(summarizer).toHaveProperty("keyInsights");
      expect(summarizer).toHaveProperty("conclusion");
    });

    test("should include all Insight fields in response", async () => {
      axios.post.mockResolvedValue(mockSummarizerResponse);
      generateInsights.mockResolvedValue(mockInsightResponse);

      const response = await request(app)
        .post("/api/analyze")
        .send(validPayload);

      const { insights } = response.body.data;
      expect(insights).toHaveProperty("trends");
      expect(insights).toHaveProperty("predictions");
      expect(insights).toHaveProperty("patterns");
      expect(insights).toHaveProperty("recommendations");
      expect(insights).toHaveProperty("overallAnalysis");
    });
  });

  describe("POST /api/analyze - Edge Cases", () => {
    test("should handle empty verifiedFacts array", async () => {
      axios.post.mockResolvedValue(mockSummarizerResponse);
      generateInsights.mockResolvedValue(mockInsightResponse);

      const response = await request(app)
        .post("/api/analyze")
        .send({
          ...validPayload,
          verifiedFacts: [],
        });

      expect(response.status).toBe(200);
      expect(response.body.data.metadata.verifiedFactsCount).toBe(0);
    });

    test("should handle maximum trustScore", async () => {
      axios.post.mockResolvedValue(mockSummarizerResponse);
      generateInsights.mockResolvedValue(mockInsightResponse);

      const response = await request(app)
        .post("/api/analyze")
        .send({
          ...validPayload,
          trustScore: 1.0,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test("should handle minimum trustScore", async () => {
      axios.post.mockResolvedValue(mockSummarizerResponse);
      generateInsights.mockResolvedValue(mockInsightResponse);

      const response = await request(app)
        .post("/api/analyze")
        .send({
          ...validPayload,
          trustScore: 0.0,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test("should handle large verifiedFacts array", async () => {
      axios.post.mockResolvedValue(mockSummarizerResponse);
      generateInsights.mockResolvedValue(mockInsightResponse);

      const largeFactsArray = Array(100).fill("fact");

      const response = await request(app)
        .post("/api/analyze")
        .send({
          ...validPayload,
          verifiedFacts: largeFactsArray,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.metadata.verifiedFactsCount).toBe(100);
    });
  });
});
