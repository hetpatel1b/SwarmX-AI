import request from "supertest";
import { createApp } from "../app";

describe("Fact-check endpoint", () => {
  const app = createApp();

  it("validates claim payload", async () => {
    const response = await request(app).post("/api/fact-check").send({ claim: "" });
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("returns a structured fact-check report", async () => {
    const response = await request(app)
      .post("/api/fact-check")
      .send({ claim: "The Earth orbits the Sun." });

    expect(response.status).toBe(200);
    expect(response.body.data.success).toBe(true);
    expect(response.body.data).toHaveProperty("confidenceScore");
    expect(response.body.data).toHaveProperty("citations");
  });
});
