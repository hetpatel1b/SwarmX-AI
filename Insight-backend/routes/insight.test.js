const request = require("supertest");
const express = require("express");
const insightRouter = require("./insight");

// Mock the generateInsights function
jest.mock("../agents/insightAgent", () => ({
  generateInsights: jest.fn(),
}));

const { generateInsights } = require("../agents/insightAgent");

// Create a test app
const app = express();
app.use(express.json());
app.use("/api", insightRouter);

// Valid test data
const validPayload = {
  rawText: "This is the raw text content",
  summary: "This is a summary",
  keyInsights: ["insight1", "insight2"],
  conclusion: "This is the conclusion",
  verifiedFacts: ["fact1", "fact2"],
  trustScore: 0.85,
};

describe("Insight API - /api/insights", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/insights - Success Cases", () => {
    test("should return 200 with valid payload", async () => {
      const mockResponse = {
        generatedInsights: "AI-generated insights",
        metadata: { processed: true },
      };

      generateInsights.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post("/api/insights")
        .send(validPayload);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockResponse);
      expect(generateInsights).toHaveBeenCalledWith(validPayload);
    });

    test("should accept valid trustScore values", async () => {
      generateInsights.mockResolvedValue({ insights: "test" });

      const response = await request(app)
        .post("/api/insights")
        .send({
          ...validPayload,
          trustScore: 0,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test("should accept trustScore as high decimal", async () => {
      generateInsights.mockResolvedValue({ insights: "test" });

      const response = await request(app)
        .post("/api/insights")
        .send({
          ...validPayload,
          trustScore: 0.99,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("POST /api/insights - Missing Fields", () => {
    test("should return 400 when rawText is missing", async () => {
      const payload = { ...validPayload };
      delete payload.rawText;

      const response = await request(app)
        .post("/api/insights")
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("Missing required fields");
    });

    test("should return 400 when summary is missing", async () => {
      const payload = { ...validPayload };
      delete payload.summary;

      const response = await request(app)
        .post("/api/insights")
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("Missing required fields");
    });

    test("should return 400 when keyInsights is missing", async () => {
      const payload = { ...validPayload };
      delete payload.keyInsights;

      const response = await request(app)
        .post("/api/insights")
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should return 400 when conclusion is missing", async () => {
      const payload = { ...validPayload };
      delete payload.conclusion;

      const response = await request(app)
        .post("/api/insights")
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should return 400 when verifiedFacts is missing", async () => {
      const payload = { ...validPayload };
      delete payload.verifiedFacts;

      const response = await request(app)
        .post("/api/insights")
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should return 400 when trustScore is missing", async () => {
      const payload = { ...validPayload };
      delete payload.trustScore;

      const response = await request(app)
        .post("/api/insights")
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/insights - Type Validation", () => {
    test("should return 400 when rawText is not a string", async () => {
      const response = await request(app)
        .post("/api/insights")
        .send({
          ...validPayload,
          rawText: 123,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("rawText must be a string");
    });

    test("should return 400 when rawText is an array", async () => {
      const response = await request(app)
        .post("/api/insights")
        .send({
          ...validPayload,
          rawText: ["array"],
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("rawText must be a string");
    });

    test("should return 400 when summary is not a string", async () => {
      const response = await request(app)
        .post("/api/insights")
        .send({
          ...validPayload,
          summary: { object: "value" },
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("summary must be a string");
    });

    test("should return 400 when keyInsights is not an array", async () => {
      const response = await request(app)
        .post("/api/insights")
        .send({
          ...validPayload,
          keyInsights: "not an array",
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("keyInsights must be an array");
    });

    test("should return 400 when conclusion is not a string", async () => {
      const response = await request(app)
        .post("/api/insights")
        .send({
          ...validPayload,
          conclusion: 123,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("conclusion must be a string");
    });

    test("should return 400 when verifiedFacts is not an array", async () => {
      const response = await request(app)
        .post("/api/insights")
        .send({
          ...validPayload,
          verifiedFacts: "not an array",
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("verifiedFacts must be an array");
    });
  });

  describe("POST /api/insights - Error Handling", () => {
    test("should return 500 when generateInsights throws an error", async () => {
      generateInsights.mockRejectedValue(new Error("Azure API error"));

      const response = await request(app)
        .post("/api/insights")
        .send(validPayload);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("Azure API error");
    });

    test("should handle generic errors", async () => {
      generateInsights.mockRejectedValue(new Error("Unknown error"));

      const response = await request(app)
        .post("/api/insights")
        .send(validPayload);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/insights - Edge Cases", () => {
    test("should accept empty arrays", async () => {
      generateInsights.mockResolvedValue({ insights: "test" });

      const response = await request(app)
        .post("/api/insights")
        .send({
          ...validPayload,
          keyInsights: [],
          verifiedFacts: [],
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test("should reject empty strings for text fields", async () => {
      const response = await request(app)
        .post("/api/insights")
        .send({
          ...validPayload,
          rawText: "",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should handle reasonably long text fields", async () => {
      generateInsights.mockResolvedValue({ insights: "test" });

      const longText = "word ".repeat(500);

      const response = await request(app)
        .post("/api/insights")
        .send({
          ...validPayload,
          rawText: longText,
          summary: longText,
          conclusion: longText,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test("should handle special characters", async () => {
      generateInsights.mockResolvedValue({ insights: "test" });

      const response = await request(app)
        .post("/api/insights")
        .send({
          ...validPayload,
          rawText: "Special: @#$%^&*()",
          keyInsights: ["insight with 中文", "emoji 🎉"],
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("POST /api/insights - Integration", () => {
    test("should pass all data to generateInsights function", async () => {
      generateInsights.mockResolvedValue({ result: "success" });

      const testPayload = {
        rawText: "test raw text",
        summary: "test summary",
        keyInsights: ["a", "b"],
        conclusion: "test conclusion",
        verifiedFacts: ["fact1", "fact2", "fact3"],
        trustScore: 0.75,
      };

      await request(app)
        .post("/api/insights")
        .send(testPayload);

      expect(generateInsights).toHaveBeenCalledWith(testPayload);
      expect(generateInsights).toHaveBeenCalledTimes(1);
    });
  });
});
