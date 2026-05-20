import request from "supertest";
import { createApp } from "../app";

describe("Health endpoints", () => {
  const app = createApp();

  it("returns healthy status", async () => {
    const response = await request(app).get("/api/health");
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.status).toBe("healthy");
  });
});
