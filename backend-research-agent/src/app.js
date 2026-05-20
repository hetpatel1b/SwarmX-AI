import cors from "cors";
import express from "express";
import { errorHandler, notFoundHandler } from "./middleware/errorMiddleware.js";
import researchRoutes from "./routes/researchRoutes.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      status: "ok",
      service: "backend-research-agent",
      timestamp: new Date().toISOString()
    }
  });
});

app.use("/api/research", researchRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
