import cors from "cors";
import express from "express";
import { errorHandler, notFoundHandler } from "./middleware/errorMiddleware.js";
import researchRoutes from "./routes/research.js";
import summarizeRoutes from "./routes/summarize.js";
import insightRoutes from "./routes/insight.js";
import factcheckRoutes from "./routes/factcheck.js";
import pipelineRoutes from "./routes/pipeline.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Health check endpoint
app.get("/health", (_req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      status: "ok",
      service: "unified-backend",
      timestamp: new Date().toISOString()
    }
  });
});

// Routes
app.use("/api/research", researchRoutes);
app.use("/api/summarize", summarizeRoutes);
app.use("/api/insights", insightRoutes);
app.use("/api/factcheck", factcheckRoutes);
app.use("/api/pipeline", pipelineRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
